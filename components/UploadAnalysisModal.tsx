import React, { useState, useRef } from 'react';

interface UploadAnalysisModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAnalyze: (file: File) => void;
    isAnalyzing: boolean;
}

const UploadAnalysisModal: React.FC<UploadAnalysisModalProps> = ({ isOpen, onClose, onAnalyze, isAnalyzing }) => {
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreviewUrl(URL.createObjectURL(selectedFile));
        }
    };

    const handleAnalyzeClick = () => {
        if (file) {
            onAnalyze(file);
        }
    };
    
    const handleClose = () => {
        setFile(null);
        setPreviewUrl(null);
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="card modal-content upload-modal-content" onClick={(e) => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ color: 'var(--primary-color)', margin: 0, fontSize: '22px' }}>Analyseer je Samenvatting</h2>
                    <button onClick={handleClose} className="chat-close-btn" style={{color: 'var(--subtle-text)', fontSize: '28px'}} aria-label="Sluiten">&times;</button>
                </div>

                <div style={{margin: '24px 0'}}>
                    <input 
                        type="file" 
                        accept="image/jpeg, image/png, image/webp"
                        onChange={handleFileChange}
                        ref={fileInputRef}
                        id="file-upload"
                    />
                    <label htmlFor="file-upload">
                        {previewUrl ? (
                             <img src={previewUrl} alt="Voorbeeld van upload" className="upload-preview" />
                        ) : (
                            <div>
                                <span style={{fontSize: '32px'}}>📄</span>
                                <p style={{fontWeight: 500, margin: '8px 0 0 0'}}>Klik om een foto te uploaden</p>
                                <p style={{fontSize: '14px', color: 'var(--subtle-text)', margin: '4px 0 0 0'}}>JPG, PNG, of WEBP</p>
                            </div>
                        )}
                    </label>
                </div>
                
                <button 
                    className="button" 
                    onClick={handleAnalyzeClick} 
                    disabled={!file || isAnalyzing}
                >
                    {isAnalyzing ? <div className="button-spinner"></div> : <>Start AI Analyse <span className="pro-badge">PRO</span></>}
                </button>
            </div>
        </div>
    );
};

export default UploadAnalysisModal;