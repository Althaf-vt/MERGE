import React from 'react';
import { useConnectionsTabs } from '../hooks/use-connections-tabs.hook';
import { CONNECTIONS_TABS_CONFIG } from '../constants/connections.constants';

export const ConnectionsPage: React.FC = () => {
    const {
        activeTab,
        setActiveTab,
        connections,
        privateList,
        isLoading,
        total,
    } = useConnectionsTabs();

    return (
        <div data-testid="connections-page-root">
            <nav role="tablist">
                {CONNECTIONS_TABS_CONFIG.map((tab) => (
                    <button
                        key={tab.key}
                        type="button"
                        role="tab"
                        aria-selected={activeTab === tab.key}
                        onClick={() => setActiveTab(tab.key)}
                    >
                        {tab.label}
                    </button>
                ))}
            </nav>
            <main>
                {isLoading ? (
                    <p>Loading...</p>
                ) : (
                    <div>
                        <p>Total items: {total}</p>
                        <p>Active Tab: {activeTab}</p>
                        <p>Connections loaded: {connections.length}</p>
                        <p>Private list loaded: {privateList.length}</p>
                    </div>
                )}
            </main>
        </div>
    );
};

