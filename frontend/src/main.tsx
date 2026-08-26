import React from "react";
import ReactDom from 'react-dom/client';
import { Provider } from "react-redux";
import { store } from "./app/store";
import { App } from "./app";

ReactDom.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        {/* The provider gives every component inside <App/>  access to Redux and RTK Query*/}
        <Provider store={store}>
            <App/>
        </Provider>
    </React.StrictMode>
)