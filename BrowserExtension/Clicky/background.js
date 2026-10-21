const recentClips = new Map();

function isIDocsUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol.startsWith('http') && (
      url.hostname === 'localhost' ||
      url.hostname === '127.0.0.1' ||
      url.hostname === 'interactive-docs.vercel.app'
    );
  } catch {
    return false;
  }
}

function docIdFromUrl(value) {
  try {
    return new URL(value).pathname.match(/^\/app\/editor\/([^/]+)/)?.[1] || null;
  } catch {
    return null;
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const senderTabId = sender.tab?.id;
  const senderUrl = sender.tab?.url || '';

  if (message?.type === 'clicky:set-active') {
    const currentDocId = docIdFromUrl(senderUrl);
    if (!isIDocsUrl(senderUrl) || !currentDocId || currentDocId !== message.docId) {
      sendResponse({ ok: false });
      return false;
    }

    chrome.storage.session.get('activeDocument').then(({ activeDocument }) => {
      if (message.active) {
        activeDocument = { tabId: senderTabId, docId: currentDocId };
        return chrome.storage.session.set({ activeDocument }).then(() => {
          sendResponse({ ok: true, active: true });
        });
      }
      if (activeDocument?.tabId === senderTabId) {
        return chrome.storage.session.remove('activeDocument').then(() => sendResponse({ ok: true, active: false }));
      }
      sendResponse({ ok: true, active: false });
    });
    return true;
  }

  if (message?.type === 'clicky:get-state') {
    const currentDocId = docIdFromUrl(senderUrl);
    chrome.storage.session.get('activeDocument').then(({ activeDocument }) => {
      const active = Boolean(isIDocsUrl(senderUrl) && activeDocument?.tabId === senderTabId && activeDocument?.docId === currentDocId);
      sendResponse({ active, docId: currentDocId });
    });
    return true;
  }

  if (message?.type === 'clicky:capture') {
    const text = String(message.text || '').trim().slice(0, 12000);
    const url = String(message.url || '');
    if (!text || !/^https?:\/\//i.test(url)) return false;

    chrome.storage.session.get('activeDocument').then(({ activeDocument }) => {
      if (!activeDocument || senderTabId === activeDocument.tabId) return;
      const clipKey = `${url}\n${text}`;
      const lastCapturedAt = recentClips.get(clipKey) || 0;
      if (Date.now() - lastCapturedAt < 1200) return;
      recentClips.set(clipKey, Date.now());

      chrome.tabs.sendMessage(activeDocument.tabId, {
        type: 'clicky:capture',
        capture: { text, url, title: String(message.title || '').slice(0, 500) },
      }).catch(() => {
        chrome.storage.session.remove('activeDocument');
      });
    });
    return false;
  }

  return false;
});

chrome.tabs.onRemoved.addListener((tabId) => {
  chrome.storage.session.get('activeDocument').then(({ activeDocument }) => {
    if (activeDocument?.tabId === tabId) chrome.storage.session.remove('activeDocument');
  });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (!changeInfo.url) return;
  chrome.storage.session.get('activeDocument').then(({ activeDocument }) => {
    if (activeDocument?.tabId === tabId && (docIdFromUrl(changeInfo.url) !== activeDocument.docId || !isIDocsUrl(changeInfo.url))) {
      chrome.storage.session.remove('activeDocument');
    }
  });
});
