import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from '@google/genai';
import { ai } from '../api/gemini.ts';
import { encode } from '../utils/audio.ts';
import type { Question } from '../data/data.ts';

interface OralPracticeModalProps {
    isOpen: boolean;
    onClose: () => void;
    question: Question | null;
    onSubmit: (transcribedText: string) => void;
}

type RecordingStatus = 'idle' | 'permission' | 'recording' | 'processing' | 'finished' | 'error';

const MicIcon = ({ recording }: { recording: boolean }) => (
    <div className={`mic-icon ${recording ? 'recording' : ''}`}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
    </div>
);


const OralPracticeModal: React.FC<OralPracticeModalProps> = ({ isOpen, onClose, question, onSubmit }) => {
    const [status, setStatus] = useState<RecordingStatus>('idle');
    const [transcribedText, setTranscribedText] = useState('');
    const [error, setError] = useState('');
    
    const sessionPromise = useRef<ReturnType<typeof ai.live.connect> | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);

    const cleanup = () => {
        if (sessionPromise.current) {
            sessionPromise.current.then(session => session.close());
            sessionPromise.current = null;
        }
        if (scriptProcessorRef.current) {
            scriptProcessorRef.current.disconnect();
            scriptProcessorRef.current = null;
        }
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
            mediaStreamRef.current = null;
        }
         if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }
        setStatus('idle');
        setTranscribedText('');
    };
    
    useEffect(() => {
        return () => {
            cleanup();
        };
    }, []);

    const startRecording = async () => {
        if (status !== 'idle' && status !== 'error') return;
        setStatus('permission');
        setTranscribedText('');
        setError('');

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;
            
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            
            sessionPromise.current = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                callbacks: {
                    onopen: () => {
                        const source = audioContextRef.current!.createMediaStreamSource(stream);
                        const scriptProcessor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
                        scriptProcessorRef.current = scriptProcessor;
                        
                        scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                            const pcmBlob: Blob = {
                                data: encode(new Uint8Array(new Int16Array(inputData.map(x => x * 32768)).buffer)),
                                mimeType: 'audio/pcm;rate=16000',
                            };

                            if (sessionPromise.current) {
                                sessionPromise.current.then((session) => {
                                    session.sendRealtimeInput({ media: pcmBlob });
                                });
                            }
                        };
                        source.connect(scriptProcessor);
                        scriptProcessor.connect(audioContextRef.current!.destination);
                        setStatus('recording');
                    },
                    onmessage: (message: LiveServerMessage) => {
                        if (message.serverContent?.inputTranscription) {
                            const text = message.serverContent.inputTranscription.text;
                            setTranscribedText(prev => prev + text);
                        }
                        if (message.serverContent?.turnComplete) {
                           setStatus('processing');
                        }
                    },
                    onerror: (e: ErrorEvent) => {
                        console.error('Live session error:', e);
                        setError('Er is een fout opgetreden. Probeer het opnieuw.');
                        cleanup();
                    },
                    onclose: (e: CloseEvent) => {
                        console.log('Live session closed.');
                    },
                },
                config: {
                    inputAudioTranscription: {},
                    responseModalities: [Modality.AUDIO], // Required for audio processing pipeline
                },
            });

        } catch (err) {
            console.error('Error getting user media:', err);
            setError('Geen toegang tot microfoon. Controleer je browserinstellingen.');
            setStatus('error');
        }
    };
    
    const stopRecording = () => {
        if(status !== 'recording' && status !== 'processing') return;
        setStatus('finished');
        cleanup();
    };
    
    const handleSubmit = () => {
        onSubmit(transcribedText);
    };

    const handleClose = () => {
        cleanup();
        onClose();
    };

    const getStatusText = () => {
        switch(status) {
            case 'idle': return 'Begin met spreken om je antwoord op te nemen.';
            case 'permission': return 'Geef toestemming om je microfoon te gebruiken...';
            case 'recording': return 'Je wordt opgenomen... spreek duidelijk.';
            case 'processing': return 'De AI verwerkt je antwoord...';
            case 'finished': return 'Opname voltooid. Controleer de transcriptie hieronder.';
            case 'error': return error;
            default: return '';
        }
    };

    if (!isOpen || !question) return null;

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="card modal-content" onClick={e => e.stopPropagation()}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ color: 'var(--primary-color)', margin: 0 }}>Antwoord Mondeling</h2>
                    <button onClick={handleClose} className="chat-close-btn" aria-label="Sluiten">&times;</button>
                </div>

                <div className="review-section" style={{border: 'none', padding: 0, margin: '16px 0'}}>
                    <p className="question-text" style={{fontSize: '16px', marginBottom: 0}}>{question.vraag_tekst}</p>
                </div>
                
                <div style={{textAlign: 'center', margin: '24px 0'}}>
                    <button onClick={status === 'recording' ? stopRecording : startRecording} className="button-tertiary">
                         <MicIcon recording={status === 'recording'} />
                    </button>
                    <p style={{color: 'var(--subtle-text)', minHeight: '24px'}}>{getStatusText()}</p>
                </div>

                <textarea
                    value={transcribedText}
                    readOnly
                    placeholder="Hier verschijnt je gesproken antwoord..."
                    rows={5}
                    style={{backgroundColor: 'var(--background-color)'}}
                />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '24px' }}>
                    <button className="button" onClick={handleSubmit} disabled={!transcribedText.trim() || status === 'recording'}>
                        Verstuur Getranscribeerd Antwoord
                    </button>
                </div>

            </div>
            <style>{`
                .mic-icon.recording svg {
                    color: var(--incorrect-color);
                    animation: pulse-mic 1.5s infinite ease-in-out;
                }
                @keyframes pulse-mic {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                    100% { transform: scale(1); }
                }
            `}</style>
        </div>
    );
};

export default OralPracticeModal;
