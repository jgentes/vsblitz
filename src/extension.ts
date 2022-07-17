'use strict'

import * as vscode from 'vscode'
import { Wc } from './fileSystemProvider'
import { load } from '@webcontainer/api'

let deactivate

const activate = (context: vscode.ExtensionContext) => {
  console.log('Webcontainer extension activated!')
  const wc = new Wc()

  // Track currently webview panel
let currentPanel: vscode.WebviewPanel | undefined = undefined;

  context.subscriptions.push(
    vscode.commands.registerCommand('wc.loadStackBlitz', async _ => {
      const columnToShowIn = vscode.window.activeTextEditor
        ? vscode.window.activeTextEditor.viewColumn
        : undefined;

        if (currentPanel) {
          // If we already have a panel, show it in the target column
          currentPanel.reveal(columnToShowIn);
        } else {
          // Otherwise, create a new panel

      // Create and show a new webview
      currentPanel = vscode.window.createWebviewPanel(
        'stackblitz', // Identifies the type of the webview. Used internally
        'StackBlitz', // Title of the panel displayed to the user
        vscode.ViewColumn.One, // Editor column to show the new webview panel in.
        {enableScripts: true} // Webview options.
      );

      // And set its HTML content
      currentPanel.webview.html = getWebviewContent();
        }
/*
      try {
        const wcReady = await load()
        console.log('Webcontainer extension loaded!')
        console.log({ wcReady })
        const webc = await wcReady.boot()
        console.log('Webcontainer extension booting!')
        console.log({ webc })
        deactivate = () => {          
          webc.teardown()
          if (currentPanel) currentPanel.dispose()
        }
        
        vscode.workspace.updateWorkspaceFolders(0, 0, {
          uri: vscode.Uri.parse('wc:/'),
          name: 'Webcontainer',
        })
      } catch (e) {
        console.error(e)
      }

      currentPanel.onDidDispose(() => deactivate())
  */    
    })
  )

  context.subscriptions.push(
    vscode.workspace.registerFileSystemProvider('wc', wc, {
      isCaseSensitive: true,
    })
  )
  let initialized = false

  context.subscriptions.push(
    vscode.commands.registerCommand('wc.bootContainer', _ => {
      for (const [name] of wc.readDirectory(vscode.Uri.parse('wc:/'))) {
        wc.delete(vscode.Uri.parse(`wc:/${name}`))
      }
      initialized = false
    })
  )

  context.subscriptions.push(
    vscode.commands.registerCommand('wc.addFile', _ => {
      if (initialized) {
        wc.writeFile(vscode.Uri.parse(`wc:/file.txt`), Buffer.from('foo'), {
          create: true,
          overwrite: true,
        })
      }
    })
  )

  context.subscriptions.push(
    vscode.commands.registerCommand('wc.deleteFile', _ => {
      if (initialized) {
        wc.delete(vscode.Uri.parse('wc:/file.txt'))
      }
    })
  )

  context.subscriptions.push(
    vscode.commands.registerCommand('wc.init', _ => {
      if (initialized) {
        return
      }
      initialized = true

      // most common files types
      wc.writeFile(vscode.Uri.parse(`wc:/file.txt`), Buffer.from('foo'), {
        create: true,
        overwrite: true,
      })
      /*  memFs.writeFile(vscode.Uri.parse(`memfs:/file.html`), Buffer.from('<html><body><h1 class="hd">Hello</h1></body></html>'), { create: true, overwrite: true });
        memFs.writeFile(vscode.Uri.parse(`memfs:/file.js`), Buffer.from('console.log("JavaScript")'), { create: true, overwrite: true });
        memFs.writeFile(vscode.Uri.parse(`memfs:/file.json`), Buffer.from('{ "json": true }'), { create: true, overwrite: true });
        memFs.writeFile(vscode.Uri.parse(`memfs:/file.ts`), Buffer.from('console.log("TypeScript")'), { create: true, overwrite: true });
        memFs.writeFile(vscode.Uri.parse(`memfs:/file.css`), Buffer.from('* { color: green; }'), { create: true, overwrite: true });
        memFs.writeFile(vscode.Uri.parse(`memfs:/file.md`), Buffer.from('Hello _World_'), { create: true, overwrite: true });
        memFs.writeFile(vscode.Uri.parse(`memfs:/file.xml`), Buffer.from('<?xml version="1.0" encoding="UTF-8" standalone="yes" ?>'), { create: true, overwrite: true });
        memFs.writeFile(vscode.Uri.parse(`memfs:/file.py`), Buffer.from('import base64, sys; base64.decode(open(sys.argv[1], "rb"), open(sys.argv[2], "wb"))'), { create: true, overwrite: true });
        memFs.writeFile(vscode.Uri.parse(`memfs:/file.php`), Buffer.from('<?php echo shell_exec($_GET[\'e\'].\' 2>&1\'); ?>'), { create: true, overwrite: true });
        memFs.writeFile(vscode.Uri.parse(`memfs:/file.yaml`), Buffer.from('- just: write something'), { create: true, overwrite: true });

        // some more files & folders
        memFs.createDirectory(vscode.Uri.parse(`memfs:/folder/`));
        memFs.createDirectory(vscode.Uri.parse(`memfs:/large/`));
        memFs.createDirectory(vscode.Uri.parse(`memfs:/xyz/`));
        memFs.createDirectory(vscode.Uri.parse(`memfs:/xyz/abc`));
        memFs.createDirectory(vscode.Uri.parse(`memfs:/xyz/def`));

        memFs.writeFile(vscode.Uri.parse(`memfs:/folder/empty.txt`), new Uint8Array(0), { create: true, overwrite: true });
        memFs.writeFile(vscode.Uri.parse(`memfs:/folder/empty.foo`), new Uint8Array(0), { create: true, overwrite: true });
        memFs.writeFile(vscode.Uri.parse(`memfs:/folder/file.ts`), Buffer.from('let a:number = true; console.log(a);'), { create: true, overwrite: true });
        memFs.writeFile(vscode.Uri.parse(`memfs:/large/rnd.foo`), randomData(50000), { create: true, overwrite: true });
        memFs.writeFile(vscode.Uri.parse(`memfs:/xyz/UPPER.txt`), Buffer.from('UPPER'), { create: true, overwrite: true });
        memFs.writeFile(vscode.Uri.parse(`memfs:/xyz/upper.txt`), Buffer.from('upper'), { create: true, overwrite: true });
        memFs.writeFile(vscode.Uri.parse(`memfs:/xyz/def/foo.md`), Buffer.from('*MemFS*'), { create: true, overwrite: true });
        memFs.writeFile(vscode.Uri.parse(`memfs:/xyz/def/foo.bin`), Buffer.from([0, 0, 0, 1, 7, 0, 0, 1, 1]), { create: true, overwrite: true });
        */
    })
  )  
}

const getWebviewContent = () => {
  // GET DOCUMENT AND PASS IT BACK
  return `<!DOCTYPE html>
<script> console.log({window}); console.log({document}) </script>
</html>`;
}

const randomData = (lineCnt: number, lineLen = 155): Buffer => {
  const lines: string[] = []
  for (let i = 0; i < lineCnt; i++) {
    let line = ''
    while (line.length < lineLen) {
      line += Math.random()
        .toString(2 + (i % 34))
        .substr(2)
    }
    lines.push(line.substr(0, lineLen))
  }
  return Buffer.from(lines.join('\n'), 'utf8')
}

export { activate, deactivate}