import React from 'react';
import { useNavigate } from 'react-router-dom';

export const V2PlaceholderPage: React.FC<{ title: string; subtitle: string }> = ({ title, subtitle }) => {
    const navigate = useNavigate();
    
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', animation: 'fadeIn 0.3s ease' }}>
            <header style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#111827', margin: 0 }}>{title}</h1>
                <p style={{ fontSize: '0.95rem', color: '#4b5563', margin: 0 }}>{subtitle}</p>
            </header>

            <div style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: '4rem 2rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                gap: '1rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
            }}>
                <div style={{
                    backgroundColor: '#f5f3ff',
                    width: '64px',
                    height: '64px',
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#6D28D9',
                    marginBottom: '0.5rem'
                }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                </div>
                <h3 style={{ fontSize: '1.25rem', color: '#111827', margin: 0 }}>Coming in Version 2.0</h3>
                <p style={{ fontSize: '0.95rem', color: '#6b7280', maxWidth: '400px', margin: 0, lineHeight: 1.5 }}>
                    We are actively building the data pipeline for this feature. Deep insights and analytics require the discovery engine to be fully online.
                </p>
                <button 
                    onClick={() => navigate('/profile/activity')}
                    style={{
                        marginTop: '1rem',
                        padding: '0.6rem 1.25rem',
                        backgroundColor: '#f9fafb',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontWeight: '600',
                        color: '#374151',
                        cursor: 'pointer'
                    }}
                >
                    Return to Activity
                </button>
            </div>
        </div>
    );
};