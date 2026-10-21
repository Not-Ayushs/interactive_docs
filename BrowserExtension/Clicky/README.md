# Clicky for iDOCS (Chrome/Edge prototype)

Clicky uses a browser extension because a regular website cannot read text selected in other tabs. With Clicky enabled in an iDOCS document, select text on another web page; the extension sends the text, page title, and URL to that document. iDOCS inserts the clip at the editor's last cursor position and saves a source card in the research panel.

## Install locally

1. Open `chrome://extensions` in Chrome or `edge://extensions` in Edge.
2. Turn on **Developer mode**.
3. Choose **Load unpacked** and select this `Clicky` folder.
4. Open or reload iDOCS at `http://localhost:5173` or `https://interactive-docs.vercel.app`.
5. Open a text document, turn on **Clicky**, then select text on another browser tab.

The first prototype asks the browser for access to pages so it can detect selected text. Capturing is only forwarded to iDOCS while Clicky is enabled for an open document. The extension does not capture passwords, form values, or page content beyond the text selection, page title, and URL.

To use another deployed iDOCS domain, add that exact hostname to the app-host checks in `content.js` and `background.js`, then reload the unpacked extension.
