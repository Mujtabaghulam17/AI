
import React from 'react';

const GlobalStyles = () => {
    const css = `
    :root {
      /* GLOW 2026 PALETTE - BRIGHTER & MORE VIBRANT */
      --bg-deep: #12121f;
      --bg-elevated: #1a1a2e;
      
      --cyan: #22d3ee;
      --purple: #a855f7;
      --pink: #ec4899;
      --orange: #f97316;
      
      --text-main: #FFFFFF;
      --text-muted: #b4c0d4; /* Brighter muted text */
      
      /* Glass Vars - More visible */
      --glass-bg: rgba(255, 255, 255, 0.05);
      --glass-border: rgba(255, 255, 255, 0.12);
      --glass-border-hover: rgba(255, 255, 255, 0.25);
      --glass-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.25);
      --blur-strength: 20px;
      
      --radius-md: 24px;
      --radius-sm: 16px;
      
      /* Semantic Colors */
      --primary-color: var(--cyan);
      --correct-color: #34d399;
      --incorrect-color: #f87171;
      --xp-color: var(--pink);

      --font-headline: 'Poppins', sans-serif;
      --font-body: 'Inter', sans-serif;
      --font-accent: 'Space Grotesk', monospace;
    }

    /* Reset & Base */
    html, body {
      height: 100%;
      margin: 0;
      padding: 0;
      background-color: var(--bg-deep);
      color: var(--text-main);
      font-family: var(--font-body);
      overflow-x: hidden;
      -webkit-font-smoothing: antialiased;
    }

    /* ANIMATED MESH BACKGROUND - VIBRANT */
    body {
        background-color: var(--bg-deep);
        background-image: 
            radial-gradient(at 0% 0%, rgba(168, 85, 247, 0.25) 0px, transparent 55%),
            radial-gradient(at 100% 0%, rgba(34, 211, 238, 0.20) 0px, transparent 55%),
            radial-gradient(at 100% 100%, rgba(236, 72, 153, 0.18) 0px, transparent 55%),
            radial-gradient(at 0% 100%, rgba(249, 115, 22, 0.15) 0px, transparent 55%),
            radial-gradient(at 50% 50%, rgba(18, 18, 31, 0.9) 0px, transparent 100%);
        background-attachment: fixed;
        background-size: 120% 120%;
        animation: meshBreath 12s ease-in-out infinite alternate;
    }

    @keyframes meshBreath {
        0% { background-position: 0% 0%; }
        25% { background-position: 100% 0%; }
        50% { background-position: 100% 100%; }
        75% { background-position: 0% 100%; }
        100% { background-position: 0% 0%; }
    }

    #root {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }

    .app-wrapper {
      flex: 1;
      display: flex;
      flex-direction: column;
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
      padding: 24px;
      position: relative;
      z-index: 1;
    }

    .app-wrapper.focus-mode {
      max-width: 800px;
      padding-top: 60px;
    }

    /* GLASS CARDS */
    .card {
      background: var(--glass-bg);
      backdrop-filter: blur(var(--blur-strength));
      -webkit-backdrop-filter: blur(var(--blur-strength));
      border: 1px solid var(--glass-border);
      border-radius: var(--radius-md);
      padding: 32px;
      box-shadow: var(--glass-shadow);
      transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
      position: relative;
      overflow: hidden;
    }

    /* Subtle Border on Hover - Premium feel */
    .card:hover {
        border-color: rgba(255, 255, 255, 0.08);
        box-shadow: 
            0 12px 40px 0 rgba(0, 0, 0, 0.35),
            0 0 0 1px rgba(34, 211, 238, 0.05);
        transform: translateY(-2px);
    }

    /* TYPOGRAPHY & GRADIENTS */
    h1, h2, h3, h4 {
      font-family: var(--font-headline);
      color: var(--text-main);
      margin-top: 0;
      letter-spacing: -0.02em;
    }

    h1 {
        font-size: 3rem;
        font-weight: 800;
        line-height: 1.1;
        margin-bottom: 24px;
    }

    /* Animated Text Gradient Class */
    .text-gradient {
        background: linear-gradient(to right, var(--cyan), var(--purple), var(--pink));
        background-size: 200% auto;
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
        animation: gradientFlow 4s linear infinite;
        display: inline-block;
    }

    @keyframes gradientFlow {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
    }

    p {
        line-height: 1.7;
        color: var(--text-muted);
        font-size: 1.05rem;
    }

    /* BUTTONS */
    .button {
        background: var(--cyan);
        color: #0f0f1a; /* Dark text for contrast on Cyan */
        font-family: var(--font-headline);
        font-weight: 700;
        border: none;
        border-radius: var(--radius-sm);
        padding: 14px 28px;
        font-size: 16px;
        cursor: pointer;
        transition: all 0.2s ease;
        box-shadow: 0 4px 15px rgba(34, 211, 238, 0.3);
        width: 100%;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        text-decoration: none;
    }

    .button:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(34, 211, 238, 0.4);
        background: linear-gradient(135deg, #67e8f9 0%, #22d3ee 100%);
    }

    .button:disabled {
        background: rgba(255, 255, 255, 0.1);
        color: rgba(255, 255, 255, 0.3);
        box-shadow: none;
        cursor: not-allowed;
    }

    .button-secondary {
        background: rgba(255, 255, 255, 0.05);
        color: var(--text-main);
        border: 1px solid var(--glass-border);
        box-shadow: none;
    }

    .button-secondary:hover:not(:disabled) {
        background: rgba(255, 255, 255, 0.1);
        border-color: var(--cyan);
        color: var(--cyan);
    }

    .button-tertiary {
        background: transparent;
        color: var(--text-muted);
        border: none;
        padding: 8px 16px;
        font-weight: 500;
        cursor: pointer;
        transition: color 0.2s;
    }
    
    .button-tertiary:hover {
        color: var(--cyan);
        background: transparent;
    }
    
    /* Interactive Links in Planner */
    .button-link-style {
        background: none;
        border: none;
        padding: 0;
        color: var(--cyan);
        text-decoration: underline;
        text-decoration-thickness: 2px;
        text-underline-offset: 4px;
        cursor: pointer;
        font-weight: 600;
        font-size: inherit;
        display: inline;
        transition: all 0.2s ease;
    }
    .button-link-style:hover {
        color: var(--pink);
        text-decoration-color: var(--pink);
    }

    /* INPUTS */
    input, textarea, .text-input, .chat-input {
        background: rgba(0, 0, 0, 0.3);
        border: 1px solid var(--glass-border);
        border-radius: var(--radius-sm);
        padding: 16px;
        color: white;
        font-family: var(--font-body);
        font-size: 16px;
        width: 100%;
        transition: border-color 0.2s, background 0.2s;
        outline: none;
    }

    input:focus, textarea:focus, .text-input:focus {
        border-color: var(--cyan);
        background: rgba(0, 0, 0, 0.5);
        box-shadow: 0 0 0 1px var(--cyan);
    }

    /* HEADER */
    .app-header {
        background: rgba(15, 15, 26, 0.7);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border-bottom: 1px solid var(--glass-border);
        position: sticky;
        top: 0;
        z-index: 100;
        padding: 12px 24px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin: -24px -24px 32px -24px; /* Pull to edges */
    }
    
    .header-left {
        flex: 1;
        display: flex;
        align-items: center;
    }
    
    .dashboard-logo-container {
        height: 32px;
        width: auto;
        display: flex;
        align-items: center;
        gap: 8px;
    }
    
    .premium-badge {
        background: linear-gradient(90deg, var(--cyan), var(--purple));
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 10px;
        font-weight: 800;
        color: #0f0f1a;
    }

    .header-center-nav {
        flex: 2;
        display: flex;
        justify-content: center;
        gap: 2px;
        overflow-x: auto;
    }
    
    .header-center-nav button {
        background: transparent;
        border: none;
        color: var(--text-muted);
        font-weight: 600;
        font-size: 12px;
        padding: 6px 14px;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s;
        white-space: nowrap;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2px;
        border-bottom: 2px solid transparent;
    }

    .header-center-nav button .nav-icon {
        font-size: 18px;
        line-height: 1;
    }

    .header-center-nav button .nav-label {
        font-size: 11px;
        letter-spacing: 0.3px;
    }
    
    .header-center-nav button:hover {
        color: white;
        background: rgba(255, 255, 255, 0.05);
    }
    
    .header-center-nav button.active {
        color: var(--cyan);
        background: rgba(34, 211, 238, 0.08);
        border-bottom-color: var(--cyan);
    }

    .level-badge {
        font-size: 10px;
        font-weight: 800;
        background: linear-gradient(90deg, var(--cyan), var(--purple));
        color: #0f0f1a;
        padding: 1px 6px;
        border-radius: 4px;
        letter-spacing: 0.5px;
    }
    
    .header-right {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 16px;
    }

    /* HEADER ELEMENTS */
    .header-xp-progress {
        display: flex;
        flex-direction: column;
        width: 140px;
        min-width: 100px;
    }
    
    .header-xp-info {
        display: flex;
        justify-content: space-between;
        font-size: 11px;
        margin-bottom: 4px;
        font-weight: 600;
        color: var(--text-muted);
    }

    .study-streak {
        display: flex;
        align-items: center;
        gap: 6px;
        color: var(--orange);
        font-weight: 700;
        font-size: 14px;
    }

    /* USER PROFILE */
    .user-profile {
        position: relative;
    }

    .user-profile-trigger {
        background: transparent;
        border: none;
        cursor: pointer;
        padding: 0;
        display: flex;
        align-items: center;
    }

    .user-avatar {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        object-fit: cover;
        border: 2px solid var(--glass-border);
        transition: border-color 0.2s;
        background: var(--purple); /* Fallback bg color */
    }
    
    .user-profile-trigger:hover .user-avatar {
        border-color: var(--cyan);
    }

    .profile-dropdown {
        position: absolute;
        top: calc(100% + 10px);
        right: 0;
        background: #151520;
        border: 1px solid var(--glass-border);
        border-radius: 16px;
        padding: 16px;
        width: 220px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.5);
        z-index: 200;
    }
    
    .profile-dropdown-header {
        border-bottom: 1px solid rgba(255,255,255,0.1);
        padding-bottom: 12px;
        margin-bottom: 12px;
    }
    
    .profile-dropdown-email {
        display: block;
        font-size: 12px;
        color: var(--text-muted);
        margin-top: 4px;
    }
    
    .profile-dropdown-button {
        background: rgba(255,255,255,0.05);
        color: white;
        border: none;
        padding: 10px;
        width: 100%;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 500;
        transition: background 0.2s;
    }
    
    .profile-dropdown-button:hover {
        background: rgba(255, 100, 100, 0.2);
        color: #ff6b6b;
    }

    /* PROGRESS BARS */
    .progress-bar {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 100px;
        height: 8px;
        overflow: hidden;
    }
    
    .progress-fill {
        height: 100%;
        border-radius: 100px;
        transition: width 0.5s ease;
    }
    
    .skill-progress-fill { background: var(--cyan); box-shadow: 0 0 10px var(--cyan); }
    .xp-progress-fill { background: var(--pink); box-shadow: 0 0 10px var(--pink); }

    /* SUBJECT PICKER */
    .subject-picker-container {
        position: relative;
    }

    .subject-picker-trigger {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid var(--glass-border);
        color: white;
        border-radius: 12px;
        padding: 8px 12px;
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 600;
        cursor: pointer;
        font-size: 13px;
    }
    
    .subject-picker-dropdown {
        position: absolute;
        top: calc(100% + 10px);
        right: 0;
        background: #151520;
        border: 1px solid var(--glass-border);
        border-radius: 16px;
        padding: 8px;
        width: 240px;
        z-index: 200;
        box-shadow: 0 20px 40px rgba(0,0,0,0.5);
    }
    
    .subject-picker-item {
        width: 100%;
        text-align: left;
        background: transparent;
        border: none;
        color: var(--text-muted);
        padding: 10px 12px;
        border-radius: 8px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 10px;
        font-weight: 500;
    }
    
    .subject-picker-item:hover {
        background: rgba(255, 255, 255, 0.05);
        color: white;
    }
    
    .subject-picker-item.active {
        background: rgba(34, 211, 238, 0.1);
        color: var(--cyan);
    }

    /* DASHBOARD HERO */
    .dashboard-hero {
        background: linear-gradient(180deg, rgba(34, 211, 238, 0.05) 0%, transparent 100%);
        border: 1px solid rgba(34, 211, 238, 0.2);
    }

    /* QUESTS */
    .quest-item {
        background: rgba(255, 255, 255, 0.02);
        border: 1px solid transparent;
        padding: 16px;
        border-radius: 16px;
        margin-bottom: 12px;
        display: flex;
        align-items: center;
        gap: 16px;
        transition: background 0.2s;
    }
    
    .quest-item:hover {
        background: rgba(255, 255, 255, 0.05);
        border-color: rgba(255, 255, 255, 0.1);
    }
    
    .quest-icon {
        background: rgba(0,0,0,0.3);
        width: 48px; height: 48px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        border: 1px solid var(--glass-border);
    }

    /* MODALS */
    .modal-overlay {
        position: fixed;
        top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0, 0, 0, 0.88);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        z-index: 1000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        animation: modalFadeIn 0.25s ease-out;
    }

    @keyframes modalFadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }

    @keyframes modalSlideUp {
        from { opacity: 0; transform: translateY(24px) scale(0.97); }
        to { opacity: 1; transform: translateY(0) scale(1); }
    }
    
    .modal-content {
        background: linear-gradient(180deg, #16162a 0%, #12121a 100%);
        border: 1px solid rgba(255, 255, 255, 0.1);
        box-shadow: 
            0 0 60px rgba(0, 0, 0, 0.7),
            0 0 0 1px rgba(34, 211, 238, 0.05);
        max-height: 90vh;
        overflow-y: auto;
        margin: 0;
        animation: modalSlideUp 0.3s ease-out;
    }

    /* ZEN ZONE */
    .zen-zone-content {
        display: flex;
        flex-direction: column;
        gap: 0;
    }

    /* BREATHING EXERCISE */
    .breathing-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 20px;
        padding: 24px 0;
    }

    .breathing-circle {
        width: 120px;
        height: 120px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(34, 211, 238, 0.3) 0%, rgba(168, 85, 247, 0.15) 60%, transparent 80%);
        box-shadow: 
            0 0 40px rgba(34, 211, 238, 0.2),
            0 0 80px rgba(168, 85, 247, 0.1),
            inset 0 0 30px rgba(34, 211, 238, 0.15);
        transition: transform 0.3s ease;
    }

    .breathing-text {
        font-size: 1.1rem;
        font-weight: 600;
        color: var(--text-main);
        text-align: center;
        min-height: 1.5em;
    }

    @keyframes breath-inhale {
        from { transform: scale(0.6); opacity: 0.5; box-shadow: 0 0 20px rgba(34, 211, 238, 0.1); }
        to { transform: scale(1.3); opacity: 1; box-shadow: 0 0 60px rgba(34, 211, 238, 0.4), 0 0 120px rgba(168, 85, 247, 0.2); }
    }

    @keyframes breath-hold {
        from { transform: scale(1.3); opacity: 1; box-shadow: 0 0 60px rgba(34, 211, 238, 0.4); }
        to { transform: scale(1.3); opacity: 0.9; box-shadow: 0 0 50px rgba(168, 85, 247, 0.3); }
    }

    @keyframes breath-exhale {
        from { transform: scale(1.3); opacity: 1; box-shadow: 0 0 60px rgba(34, 211, 238, 0.4); }
        to { transform: scale(0.6); opacity: 0.5; box-shadow: 0 0 20px rgba(34, 211, 238, 0.1); }
    }

    /* CHAT MODAL */
    .chat-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-bottom: 16px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        margin-bottom: 0;
    }

    .chat-header h3 {
        margin: 0;
        background: linear-gradient(90deg, var(--cyan), var(--purple));
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
        font-weight: 800;
    }

    .chat-close-btn {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: var(--text-muted);
        width: 36px;
        height: 36px;
        border-radius: 10px;
        font-size: 20px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
    }

    .chat-close-btn:hover {
        background: rgba(255, 100, 100, 0.15);
        border-color: rgba(255, 100, 100, 0.3);
        color: #ff6b6b;
    }

    .chat-message {
        padding: 12px 16px;
        border-radius: 16px;
        margin-bottom: 10px;
        max-width: 85%;
        line-height: 1.6;
        font-size: 0.95rem;
    }

    .chat-message.user {
        background: linear-gradient(135deg, rgba(34, 211, 238, 0.15) 0%, rgba(168, 85, 247, 0.1) 100%);
        border: 1px solid rgba(34, 211, 238, 0.2);
        margin-left: auto;
        color: var(--text-main);
    }

    .chat-message.model {
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.06);
        margin-right: auto;
        color: var(--text-muted);
    }

    .chat-form {
        display: flex;
        gap: 10px;
        padding-top: 16px;
        border-top: 1px solid rgba(255, 255, 255, 0.08);
    }

    .chat-input {
        flex: 1;
    }

    .typing-cursor {
        display: inline-block;
        width: 2px;
        height: 1em;
        background: var(--cyan);
        margin-left: 2px;
        animation: blink 0.8s infinite;
        vertical-align: text-bottom;
    }

    @keyframes blink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0; }
    }

    /* MISC */
    .spinner {
        width: 32px;
        height: 32px;
        border: 3px solid rgba(255, 255, 255, 0.1);
        border-top-color: var(--cyan);
        border-right-color: var(--purple);
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
        to { transform: rotate(360deg); }
    }

    .button-spinner {
        width: 20px;
        height: 20px;
        border: 2px solid rgba(15, 15, 26, 0.2);
        border-top-color: #0f0f1a;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
        margin-right: 8px;
    }
    
    .pro-badge {
        background: linear-gradient(90deg, var(--cyan), var(--purple), var(--pink), var(--cyan));
        background-size: 300% 100%;
        padding: 3px 10px;
        border-radius: 6px;
        color: #0f0f1a;
        font-weight: 800;
        font-size: 10px;
        letter-spacing: 0.5px;
        animation: shimmer 3s ease-in-out infinite;
        text-transform: uppercase;
    }

    @keyframes shimmer {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
    }
    
    .theme-toggle { 
        background: transparent;
        border: none;
        color: var(--text-muted);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 8px;
        transition: all 0.2s;
    }
    .theme-toggle:hover { color: white; transform: rotate(15deg); }

    /* RESPONSIVE */
    @media (max-width: 900px) {
        .app-header {
            flex-direction: column;
            gap: 12px;
            padding-bottom: 16px;
        }
        .header-left, .header-center-nav, .header-right {
            width: 100%;
            justify-content: center;
        }
        .header-right {
            gap: 24px;
        }
    }

    @media (max-width: 768px) {
        .app-wrapper { padding: 16px; }
        h1 { font-size: 2rem; }
        .app-header {
            margin: -16px -16px 24px -16px;
        }
        .header-center-nav {
            justify-content: flex-start;
            padding-bottom: 4px;
        }
    }
    
    /* Scrollbar */
    ::-webkit-scrollbar { width: 8px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
    ::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.2); }
  `;
    return <style>{css}</style>;
};

export default GlobalStyles;
