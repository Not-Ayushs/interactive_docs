function isIDocsPage() {
  return location.protocol.startsWith('http') && (
    location.hostname === 'localhost' ||
    location.hostname === '127.0.0.1' ||
    location.hostname === 'interactive-docs.vercel.app'
  );
}

function postToPage(type, details = {}) {
  window.postMessage({ source: 'idocs-clicky-extension', type, ...details }, location.origin);
}

if (isIDocsPage()) {
  window.addEventListener('message', (event) => {
    if (event.source !== window || event.origin !== location.origin) return;
    if (event.data?.source !== 'idocs-clicky-app') return;

    if (event.data.type === 'ping') {
      postToPage('ready');
      chrome.runtime.sendMessage({ type: 'clicky:get-state' }, (state) => {
        if (chrome.runtime.lastError || !state) return;
        postToPage('state', state);
      });
    }

    if (event.data.type === 'set-active') {
      chrome.runtime.sendMessage({
        type: 'clicky:set-active',
        active: Boolean(event.data.active),
        docId: String(event.data.docId || ''),
      });
    }
  });

  chrome.runtime.onMessage.addListener((message) => {
    if (message?.type === 'clicky:capture') postToPage('capture', { capture: message.capture });
  });
} else {
  document.addEventListener('mouseup', () => {
    const text = window.getSelection()?.toString().trim();
    if (!text || text.length < 2) return;

    chrome.runtime.sendMessage({
      type: 'clicky:capture',
      text,
      url: location.href,
      title: document.title,
    });
  });
}
