import React, { useState } from 'react';
import { getAuth, deleteUser, EmailAuthProvider, reauthenticateWithCredential, GoogleAuthProvider, reauthenticateWithPopup } from 'firebase/auth';
import { getFirestore, doc, deleteDoc } from 'firebase/firestore';
import { captureError } from '../utils/sentry';

interface DeleteAccountModalProps {
    isOpen: boolean;
    onClose: () => void;
    onDeleted: () => void;
}

const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({ isOpen, onClose, onDeleted }) => {
    const [step, setStep] = useState<'confirm' | 'reauth' | 'deleting' | 'done' | 'error'>('confirm');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    if (!isOpen) return null;

    const handleDelete = async () => {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) {
            setErrorMsg('Je bent niet ingelogd.');
            setStep('error');
            return;
        }

        // Bepaal of re-authenticatie nodig is
        const isGoogle = user.providerData.some(p => p.providerId === 'google.com');
        const isEmail = user.providerData.some(p => p.providerId === 'password');

        // Stap 1: Re-authenticatie
        try {
            if (isGoogle) {
                const provider = new GoogleAuthProvider();
                await reauthenticateWithPopup(user, provider);
            } else if (isEmail && password) {
                const credential = EmailAuthProvider.credential(user.email!, password);
                await reauthenticateWithCredential(user, credential);
            } else if (isEmail && !password) {
                setStep('reauth');
                return;
            }
        } catch (err: any) {
            if (err?.code === 'auth/wrong-password' || err?.code === 'auth/invalid-credential') {
                setErrorMsg('Wachtwoord is onjuist. Probeer het opnieuw.');
            } else if (err?.code === 'auth/popup-closed-by-user') {
                setErrorMsg('Google verificatie geannuleerd. Probeer het opnieuw.');
            } else {
                setErrorMsg('Verificatie mislukt. Probeer het opnieuw.');
                captureError(err, { context: 'deleteAccount_reauth' });
            }
            setStep('error');
            return;
        }

        // Stap 2: Verwijder data
        setStep('deleting');
        try {
            const db = getFirestore();
            // Verwijder Firestore gebruikersdata
            await deleteDoc(doc(db, 'users', user.uid));
        } catch (err) {
            // Niet fataal — account gaat toch weg
            captureError(err, { context: 'deleteAccount_firestoreCleanup', uid: user.uid });
        }

        // Stap 3: Verwijder Firebase Auth account
        try {
            await deleteUser(user);
        } catch (err: any) {
            setErrorMsg('Account verwijderen mislukt. Neem contact op met support@glowexamen.nl');
            setStep('error');
            captureError(err, { context: 'deleteAccount_authDelete', uid: user.uid });
            return;
        }

        // Stap 4: Wis lokale data
        try {
            const keysToRemove = Object.keys(localStorage).filter(k => k.startsWith('glowexamen'));
            keysToRemove.forEach(k => localStorage.removeItem(k));
        } catch { /* non-critical */ }

        setStep('done');
    };

    const handleClose = () => {
        setStep('confirm');
        setPassword('');
        setErrorMsg('');
        if (step === 'done') {
            onDeleted();
        } else {
            onClose();
        }
    };

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-label="Account verwijderen"
            style={{
                position: 'fixed', inset: 0, zIndex: 99999,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
                padding: '20px',
            }}
            onClick={(e) => e.target === e.currentTarget && step !== 'deleting' && handleClose()}
        >
            <div style={{
                background: '#1a1a2e', borderRadius: '20px', padding: '32px 28px',
                maxWidth: '420px', width: '100%',
                border: '1px solid rgba(248, 113, 113, 0.2)',
            }}>
                {step === 'confirm' && (
                    <>
                        <div style={{ fontSize: '2.5rem', textAlign: 'center', marginBottom: '16px' }}>&#9888;&#65039;</div>
                        <h2 style={{ textAlign: 'center', margin: '0 0 12px', fontSize: '1.2rem', color: '#f87171' }}>
                            Account permanent verwijderen?
                        </h2>
                        <p style={{ color: '#b4c0d4', fontSize: '0.85rem', lineHeight: 1.6, textAlign: 'center', margin: '0 0 8px' }}>
                            Dit verwijdert permanent:
                        </p>
                        <ul style={{ color: '#b4c0d4', fontSize: '0.82rem', lineHeight: 1.8, paddingLeft: '20px', margin: '0 0 24px' }}>
                            <li>Alle voortgang en scores</li>
                            <li>Studieplannen en statistieken</li>
                            <li>Je account en inloggegevens</li>
                            <li>Eventueel actief abonnement</li>
                        </ul>
                        <p style={{ color: '#f87171', fontSize: '0.8rem', fontWeight: 600, textAlign: 'center', margin: '0 0 20px' }}>
                            Dit kan niet ongedaan worden gemaakt.
                        </p>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={handleClose} style={{
                                flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)',
                                background: 'rgba(255,255,255,0.06)', color: '#b4c0d4', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem',
                            }}>
                                Annuleren
                            </button>
                            <button onClick={handleDelete} style={{
                                flex: 1, padding: '12px', borderRadius: '12px', border: 'none',
                                background: '#f87171', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem',
                            }}>
                                Ja, verwijder alles
                            </button>
                        </div>
                    </>
                )}

                {step === 'reauth' && (
                    <>
                        <h2 style={{ textAlign: 'center', margin: '0 0 16px', fontSize: '1.1rem', color: '#fff' }}>
                            Bevestig met je wachtwoord
                        </h2>
                        <p style={{ color: '#b4c0d4', fontSize: '0.83rem', textAlign: 'center', margin: '0 0 16px' }}>
                            Voor de veiligheid vragen we je wachtwoord nog een keer.
                        </p>
                        <input
                            type="password"
                            placeholder="Je wachtwoord"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            autoFocus
                            style={{
                                width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.15)',
                                background: 'rgba(255,255,255,0.06)', color: '#fff', fontSize: '0.9rem', outline: 'none',
                                marginBottom: '16px',
                            }}
                            onKeyDown={e => e.key === 'Enter' && password && handleDelete()}
                        />
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={handleClose} style={{
                                flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)',
                                background: 'transparent', color: '#b4c0d4', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem',
                            }}>
                                Annuleren
                            </button>
                            <button onClick={handleDelete} disabled={!password} style={{
                                flex: 1, padding: '12px', borderRadius: '12px', border: 'none',
                                background: password ? '#f87171' : 'rgba(248,113,113,0.3)', color: '#fff',
                                fontWeight: 700, cursor: password ? 'pointer' : 'not-allowed', fontSize: '0.85rem',
                            }}>
                                Verwijderen
                            </button>
                        </div>
                    </>
                )}

                {step === 'deleting' && (
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                        <div className="spinner" style={{ width: '36px', height: '36px', margin: '0 auto 16px' }}></div>
                        <p style={{ color: '#b4c0d4', fontSize: '0.9rem' }}>Account wordt verwijderd...</p>
                    </div>
                )}

                {step === 'done' && (
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>&#128075;</div>
                        <h2 style={{ margin: '0 0 12px', fontSize: '1.1rem', color: '#fff' }}>Account verwijderd</h2>
                        <p style={{ color: '#b4c0d4', fontSize: '0.85rem', margin: '0 0 20px' }}>
                            Je account en alle data zijn permanent verwijderd. We vinden het jammer je te zien gaan.
                        </p>
                        <button onClick={handleClose} style={{
                            padding: '12px 32px', borderRadius: '12px', border: 'none',
                            background: '#22d3ee', color: '#0f0f1a', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem',
                        }}>
                            Sluiten
                        </button>
                    </div>
                )}

                {step === 'error' && (
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>&#10060;</div>
                        <h2 style={{ margin: '0 0 12px', fontSize: '1.1rem', color: '#f87171' }}>Fout</h2>
                        <p style={{ color: '#b4c0d4', fontSize: '0.85rem', margin: '0 0 20px' }}>{errorMsg}</p>
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                            <button onClick={handleClose} style={{
                                padding: '12px 24px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)',
                                background: 'transparent', color: '#b4c0d4', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem',
                            }}>
                                Sluiten
                            </button>
                            <button onClick={() => { setStep('confirm'); setErrorMsg(''); setPassword(''); }} style={{
                                padding: '12px 24px', borderRadius: '12px', border: 'none',
                                background: '#f87171', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem',
                            }}>
                                Opnieuw proberen
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DeleteAccountModal;
