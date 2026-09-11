import React from "react";
import ReactDom from 'react-dom/client';
import { Provider } from "react-redux";
import { store } from "./app/store";
import { App } from "./app";
import { GoogleOAuthProvider } from "@react-oauth/google";

ReactDom.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        {/* The provider gives every component inside <App/>  access to Redux and RTK Query*/}
        <Provider store={store}>
            <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ''}>
                <App/>
            </GoogleOAuthProvider>
        </Provider>
    </React.StrictMode>
)