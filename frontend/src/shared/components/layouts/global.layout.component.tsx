import { Outlet } from 'react-router-dom';
import { TopNav } from '../../navigation/top-nav.component';

export const GlobalLayout = () => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <TopNav />
            {/* The Outlet renders whatever the current route matches */}
            <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Outlet />
            </main>
        </div>
    );
};