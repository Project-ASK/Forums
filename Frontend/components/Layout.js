// components/Layout.js

import React from 'react';

const Layout = ({ children }) => {
    React.useEffect(() => {
        if (!document.querySelector('script[src="https://cdn.botpress.cloud/webchat/v1/inject.js"]')) {
            const script = document.createElement('script');
            script.src = "https://cdn.botpress.cloud/webchat/v1/inject.js";
            script.async = true;
            script.onload = () => {
                window.botpressWebChat.init({
                    "composerPlaceholder": "Chat with Forums Bot",
                    "botConversationDescription": "A simple bot solving doubts in forums website.",
                    "botId": "4b485822-773c-4577-893d-dbbd03bf1396",
                    "hostUrl": "https://cdn.botpress.cloud/webchat/v1",
                    "messagingUrl": "https://messaging.botpress.cloud",
                    "clientId": "4b485822-773c-4577-893d-dbbd03bf1396",
                    "webhookId": "6b1e6d1b-e0db-44b4-b79c-08cb664c330f",
                    "lazySocket": true,
                    "themeName": "prism",
                    "botName": "Forums Bot",
                    "frontendVersion": "v1",
                    "useSessionStorage": true,
                    "enableConversationDeletion": true,
                    "theme": "prism",
                    "themeColor": "#2563eb"
                });
            };
            document.body.appendChild(script);
        }
    }, []);

    return <div>{children}</div>;
};

export default Layout;
