import React, { useState, useEffect, useRef } from 'react';
import { Modality } from "@google/genai";
import { ai } from '../api/gemini.ts';
import { decode, decodeAudioData } from '../utils/audio.ts';
import type { Question, User } from '../data/data.ts';

const SpeakerIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
);

const MicIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
);

const StopIcon = () => (
     <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" ><rect x="6" y="6" width="12" height="12"></rect></svg>
);

const LoadingIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21.5 2v6h-6"></path><path d="M2.5 22v-6h6"></path>
        <path d="M2 11.5a10 10 0 0 1 18.8-4.3l-2.8 1.1"></path>
        <path d="M22 12.5a10 10 0 0 1-18.8 4.3l2.8-1.1"></path>
    </svg>
);


const QuestionCard: React.FC<{ question: Question; allQuestions: Question[]; onSubmit: (answer: string) => void; onGetHint: () => Promise<string>; onOralPractice: () => void; user: User | null; }> = ({ question, allQuestions, onSubmit, onGetHint, onOralPractice, user }) => {
  const [answer, setAnswer] = useState('');
  const [hint, setHint] = useState('');
  const [isHintLoading, setIsHintLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes per question
  
  const [audioState, setAudioState] = useState<'idle' | 'loading' | 'playing'>('idle');
  const [activeSpeechId, setActiveSpeechId] = useState<string | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  // Timer effect
  useEffect(() => {
    setTimeLeft(180); // Reset timer for each new question
    if (!question) return;

    const timerId = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timerId);
          onSubmit(''); // Auto-submit when time runs out
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timerId); // Cleanup interval on component unmount or question change
  }, [question, onSubmit]);

  useEffect(() => {
    // Initialize AudioContext lazily or on mount
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
        audioContextRef.current = new AudioContextClass({ sampleRate: 24000 });
    }
    
    return () => {
        if (audioSourceRef.current) {
            try { audioSourceRef.current.stop(); } catch(e) {}
        }
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close();
        }
    };
  }, []);

  const handleToggleSpeech = async (textToSpeak: string, id: string) => {
      // 1. Stop if playing
      if (audioState === 'playing' && activeSpeechId === id) {
          if (audioSourceRef.current) {
              try { audioSourceRef.current.stop(); } catch(e) {}
          }
          setAudioState('idle');
          setActiveSpeechId(null);
          return;
      }
      
      // 2. Cleanup previous
      if (audioSourceRef.current) {
         try { audioSourceRef.current.stop(); } catch(e) {}
      }

      // 3. Ensure AudioContext is running (CRITICAL FIX for browsers blocking autoplay)
      if (audioContextRef.current) {
          if (audioContextRef.current.state === 'suspended') {
              await audioContextRef.current.resume();
          }
      } else {
          // Re-init if missing
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioContextClass) {
            audioContextRef.current = new AudioContextClass({ sampleRate: 24000 });
          }
      }

      setActiveSpeechId(id);
      setAudioState('loading');
      
      try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: textToSpeak }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
            },
        });
        
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (base64Audio && audioContextRef.current) {
            const audioBuffer = await decodeAudioData(decode(base64Audio), audioContextRef.current, 24000, 1);
            const source = audioContextRef.current.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioContextRef.current.destination);
            source.onended = () => {
                setAudioState('idle');
                setActiveSpeechId(null);
            };
            source.start();
            audioSourceRef.current = source;
            setAudioState('playing');
        } else {
            throw new Error("No audio data received");
        }
      } catch(error) {
        console.error("Error generating or playing speech:", error);
        setAudioState('idle');
        setActiveSpeechId(null);
        alert("Kon de audio niet afspelen. Controleer of je geluid aan staat en probeer het opnieuw.");
      }
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (answer.trim()) {
      if (audioSourceRef.current) try { audioSourceRef.current.stop(); } catch(e) {}
      setAudioState('idle');
      setActiveSpeechId(null);
      onSubmit(answer);
    }
  };

  const handleGetHint = async () => {
      setIsHintLoading(true);
      const hintText = await onGetHint();
      setHint(hintText);
      setIsHintLoading(false);
  }


  let passageToShow = question.vraag_passage;
  if (!passageToShow && question.context_id) {
    const contextQuestion = allQuestions.find(q => q.id === question.context_id);
    if (contextQuestion) {
      passageToShow = contextQuestion.vraag_passage;
    }
  }

  const renderSpeechIcon = (id: string) => {
      if (activeSpeechId === id) {
        if (audioState === 'loading') return <LoadingIcon />;
        if (audioState === 'playing') return <StopIcon />;
      }
      return <SpeakerIcon />;
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  return (
    <div className="card">
      <div className={`question-timer ${timeLeft < 30 ? 'low-time' : ''}`}>
        {formatTime(timeLeft)}
      </div>
      <div style={{color: 'var(--subtle-text)', fontSize: '14px', marginBottom: '16px'}}>
        {question.examen_id} / Vraag {question.vraag_nummer}
      </div>
      {passageToShow && (
        <div className="passage readable-content">
            {passageToShow}
            <button
                onClick={() => handleToggleSpeech(passageToShow!, 'passage')}
                className={`speech-button ${activeSpeechId === 'passage' ? 'active' : ''}`}
                aria-label={audioState === 'playing' && activeSpeechId === 'passage' ? "Stop met voorlezen" : "Lees passage voor"}
                disabled={audioState === 'loading' || (audioState === 'playing' && activeSpeechId !== 'passage')}
            >
               {renderSpeechIcon('passage')}
            </button>
        </div>
      )}
      <div className="readable-content">
          <p className="question-text">{question.vraag_tekst}</p>
           <button
                onClick={() => handleToggleSpeech(question.vraag_tekst, 'question')}
                className={`speech-button ${activeSpeechId === 'question' ? 'active' : ''}`}
                aria-label={audioState === 'playing' && activeSpeechId === 'question' ? "Stop met voorlezen" : "Lees vraag voor"}
                disabled={audioState === 'loading' || (audioState === 'playing' && activeSpeechId !== 'question')}
            >
               {renderSpeechIcon('question')}
            </button>
      </div>
      
      <form onSubmit={handleSubmit}>
        {question.options ? (
            <div className="mcq-options">
                {question.options.map((option, index) => (
                    <div key={index}>
                        <input 
                            type="radio" 
                            id={`option-${index}`} 
                            name="mcq" 
                            value={option} 
                            checked={answer === option}
                            onChange={(e) => setAnswer(e.target.value)}
                            className="mcq-input"
                        />
                        <label htmlFor={`option-${index}`} className="mcq-label">{option}</label>
                    </div>
                ))}
            </div>
        ) : (
            <textarea 
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Typ hier je antwoord..."
              aria-label="Antwoord invoerveld"
            />
        )}
        
        <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
             <button type="submit" className="button" disabled={!answer.trim()}>
                Antwoord insturen
            </button>
            <div className="button-grid" style={{marginTop: '0'}}>
                {!hint && (
                     <button type="button" className="button-tertiary" onClick={handleGetHint} disabled={isHintLoading} style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'}}>
                        {isHintLoading && <div className="spinner" style={{width: '16px', height: '16px', borderWidth: '2px', borderTopColor: 'var(--primary-color)'}}></div>}
                        {isHintLoading ? 'Hint wordt opgehaald...' : 'Krijg een hint'}
                    </button>
                )}
                {!question.options && (
                     <button type="button" className="button-tertiary" onClick={onOralPractice} style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'}}>
                        <MicIcon /> Beantwoord Mondeling
                    </button>
                )}
            </div>
        </div>
      </form>
       {hint && <div className="hint-box">{hint}</div>}
    </div>
  );
};

export default QuestionCard;