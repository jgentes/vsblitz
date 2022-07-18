import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.commands.registerCommand('wc.loadWebContainer', () => {
			WebContainerPanel.createOrShow(context.extensionUri);
		})
	);

    context.subscriptions.push(
		vscode.commands.registerCommand('wc.bootWebContainer', () => {
            console.log('bootWebContainer');
            WebContainerPanel.currentPanel && WebContainerPanel.currentPanel.sendMessage('boot');
		})
	);
/*
	if (vscode.window.registerWebviewPanelSerializer) {
		// Make sure we register a serializer in activation event
		vscode.window.registerWebviewPanelSerializer(WebContainerPanel.viewType, {
			async deserializeWebviewPanel(webviewPanel: vscode.WebviewPanel, state: any) {
				console.log(`Got state: ${state}`);
				// Reset the webview options so we use latest uri for `localResourceRoots`.
				webviewPanel.webview.options = getWebviewOptions(context.extensionUri);
				WebContainerPanel.revive(webviewPanel, context.extensionUri);
			}
		});
	}
    */
}

function getWebviewOptions(extensionUri: vscode.Uri): vscode.WebviewOptions {
	return {
		// Enable javascript in the webview
		enableScripts: true,

		// And restrict the webview to only loading content from the `dist` directory.
		localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'dist')]
	};
}

/**
 * Manages WebContainer webview panels
 */
class WebContainerPanel {
	/**
	 * Track the currently panel. Only allow a single panel to exist at a time.
	 */
	public static currentPanel: WebContainerPanel | undefined;

	public static readonly viewType = 'WebContainer';

	private readonly _panel: vscode.WebviewPanel;
	private readonly _extensionUri: vscode.Uri;
	private _disposables: vscode.Disposable[] = [];

	public static createOrShow(extensionUri: vscode.Uri) {
        
		const column = vscode.window.activeTextEditor
			? vscode.window.activeTextEditor.viewColumn
			: undefined;
            
		// If we already have a panel, show it.
		if (WebContainerPanel.currentPanel) {
			WebContainerPanel.currentPanel._panel.reveal(column);
			return;
		}
        
		// Otherwise, create a new panel.
		const panel = vscode.window.createWebviewPanel(
			WebContainerPanel.viewType,
			'StackBlitz',
			column || vscode.ViewColumn.One,
			getWebviewOptions(extensionUri),
		);
     
		WebContainerPanel.currentPanel = new WebContainerPanel(panel, extensionUri);
	}
/*
	public static revive(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
		WebContainerPanel.currentPanel = new WebContainerPanel(panel, extensionUri);
	}
*/
    public sendMessage(message: string) {
		// Send a message to the webview webview.
		// You can send any JSON serializable data.
		this._panel.webview.postMessage({message});
	}

	private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
        console.log('new panel')
		this._panel = panel;
		this._extensionUri = extensionUri;

		// Set the webview's initial html content
		const webview = this._panel.webview;

		// Listen for when the panel is disposed
		// This happens when the user closes the panel or when the panel is closed programmatically
		this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

		// Handle messages from the webview
		this._panel.webview.onDidReceiveMessage(
			message => {
				switch (message.command) {
					case 'alert':
						vscode.window.showErrorMessage(message.text);
						return;
				}
			},
			null,
			this._disposables
		);
        
		this._panel.webview.html = this._getHtmlForWebview(webview);
	}

	public dispose() {
		WebContainerPanel.currentPanel = undefined;

		// Clean up our resources
		this._panel.dispose();

		while (this._disposables.length) {
			const x = this._disposables.pop();
			if (x) {
				x.dispose();
			}
		}
	}

	private _getHtmlForWebview(webview: vscode.Webview) {
		// Local path to script to run in the webview
		const mainScriptPath = vscode.Uri.joinPath(this._extensionUri, 'dist', 'main.js');        

		// And the uri we use to load this script in the webview
		const mainScriptUri = webview.asWebviewUri(mainScriptPath);

		return `<!DOCTYPE html>
                    <body>
				        <script src="${mainScriptUri}"></script>
			        </body>
                </html>`;
	}
}