// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.
import { load } from '@webcontainer/api';

(async function () {
    let WebContainer
    const vscode = acquireVsCodeApi();

    const oldState = vscode.getState();

    //console.log('Initial state', oldState);
    console.log('crossOriginIsolated', crossOriginIsolated)

    // Handle messages sent from the extension to the webview
    window.addEventListener('message', async event => {
        const {message} = event.data; // The json data that the extension sent
        console.log('webview received message:', message)
        if (message == 'boot') {
            // only a single instance of WebContainer can be created
            try {
                console.log('booting container')
                await WebContainer.boot();
                console.log('we have webcontainer')
                } catch(e) {
                    console.error('webcontainer error:', e);
                }
        }
    });

    window.addEventListener('error', event => {
        console.log('webview received error:', event)
    });

    WebContainer = await load();
    
    console.log('webcontainer loaded!')
    
    
}());