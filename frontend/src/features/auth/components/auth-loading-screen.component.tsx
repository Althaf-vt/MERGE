/** Full-screen session initialization spinner styled for the User Platform. */
export const AuthLoadingScreen = () => {
    return (
        <div
            style={{
                display: 'flex',
                height: '100vh',
                background: 'radial-gradient(circle at 50% 0%, #ffffff 0%, #fafafa 100%)',
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            <style>{'@keyframes authSpin { to { transform: rotate(360deg); } }'}</style>
            <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#6D28D9"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ animation: 'authSpin 1s linear infinite' }}
            >
                <line x1="12" y1="2" x2="12" y2="6"></line>
                <line x1="12" y1="18" x2="12" y2="22"></line>
                <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
                <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
                <line x1="2" y1="12" x2="6" y2="12"></line>
                <line x1="18" y1="12" x2="22" y2="12"></line>
                <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
                <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
            </svg>
        </div>
    );
};
