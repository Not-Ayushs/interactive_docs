import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Editor from '../components/Editor.jsx';
import CapsuleButton from '../components/CapsuleButton.jsx';
import ShareModal from '../components/ShareModal.jsx';
import CollaboratorsBar from '../components/CollaboratorsBar.jsx';
import { FiX, FiCheck, FiFolder, FiMousePointer, FiPlus, FiExternalLink, FiTrash2, FiBookOpen } from 'react-icons/fi';
import { getApiBaseUrl } from '../utils/api.js';
import { getSocket, joinDocumentRoom, leaveDocumentRoom, emitDocChange, emitDocTyping } from '../utils/socket.js';

export default function DocEditor() {
    const { docId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const [doc, setDoc] = useState(null);
    const [currentContent, setCurrentContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [savedStatus, setSavedStatus] = useState('');
    const [activeUsers, setActiveUsers] = useState([]);
    const [typingUsers, setTypingUsers] = useState({});
    const [showShareModal, setShowShareModal] = useState(false);
    const [clickyOn, setClickyOn] = useState(false);
    const [researchOpen, setResearchOpen] = useState(false);
    const [clickyExtensionReady, setClickyExtensionReady] = useState(false);
    const [sourceUrl, setSourceUrl] = useState('');
    const [sourceNote, setSourceNote] = useState('');
    const [researchItems, setResearchItems] = useState([]);
    const [researchSaving, setResearchSaving] = useState(false);
    const editorRef = useRef(null);
    const researchItemsRef = useRef([]);
    const clickyOnRef = useRef(false);
    const sourceGroupRef = useRef(null);

    // Track if update is from remote to avoid bounce loop
    const isRemoteUpdateRef = useRef(false);
    const typingTimeoutRef = useRef(null);

    const returnCollection = location.state?.fromCollection || doc?.collectionName;

    // Load initial document data
    useEffect(() => {
        const apiBaseUrl = getApiBaseUrl();
        const token = localStorage.getItem('token');
        fetch(`${apiBaseUrl}/api/documents/${docId}`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })
            .then(res => {
                if (!res.ok) throw new Error("Document not found");
                return res.json();
            })
            .then(data => {
                setDoc(data);
                setCurrentContent(data.desc || '');
                setResearchItems(Array.isArray(data.researchItems) ? data.researchItems : []);
                researchItemsRef.current = Array.isArray(data.researchItems) ? data.researchItems : [];
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching document:", err);
                setLoading(false);
            });
    }, [docId]);

    // WebSocket Real-Time Communication
    useEffect(() => {
        if (!docId) return;

        joinDocumentRoom(docId);
        const socket = getSocket();

        const handleDocChanged = (data) => {
            if (data && data.content !== undefined) {
                isRemoteUpdateRef.current = true;
                setCurrentContent(data.content);
                const editorName = data.updatedBy?.name || 'Partner';
                setSavedStatus(`Edited in real-time by ${editorName}`);
                setTimeout(() => setSavedStatus('All changes synced'), 2000);
            }
        };

        const handleActiveUsers = (users) => {
            if (Array.isArray(users)) {
                setActiveUsers(users);
            }
        };

        const handleTypingStatus = (data) => {
            if (data && data.userId) {
                if (data.isTyping) {
                    setTypingUsers(prev => ({
                        ...prev,
                        [data.userId]: { name: data.name, color: data.color, timestamp: Date.now() }
                    }));
                } else {
                    setTypingUsers(prev => {
                        const copy = { ...prev };
                        delete copy[data.userId];
                        return copy;
                    });
                }
            }
        };

        socket.on("doc-changed", handleDocChanged);
        socket.on("active-users", handleActiveUsers);
        socket.on("doc-typing-status", handleTypingStatus);

        return () => {
            socket.off("doc-changed", handleDocChanged);
            socket.off("active-users", handleActiveUsers);
            socket.off("doc-typing-status", handleTypingStatus);
            leaveDocumentRoom(docId);
        };
    }, [docId]);

    const handleContentChange = (newHTML) => {
        if (isRemoteUpdateRef.current) {
            isRemoteUpdateRef.current = false;
            return;
        }

        setCurrentContent(newHTML);
        // Emit live update to all collaborating partners via WebSockets
        emitDocChange(docId, newHTML);
        setSavedStatus('Syncing live...');
        setTimeout(() => setSavedStatus('All changes synced'), 1500);

        // Broadcast typing status (Google Docs-style)
        emitDocTyping(docId, true);
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
        typingTimeoutRef.current = setTimeout(() => {
            emitDocTyping(docId, false);
        }, 1500);
    };

    const handleClose = async () => {
        const contentWithSources = flushClickySources();
        if (contentWithSources) {
            try {
                await fetch(`${getApiBaseUrl()}/api/documents/${docId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
                    body: JSON.stringify({ desc: contentWithSources }),
                });
            } catch (error) {
                console.error('Could not save the final Clicky source list:', error);
            }
        }
        if (returnCollection && returnCollection !== 'General') {
            navigate(`/app/collections/${encodeURIComponent(returnCollection)}`);
        } else {
            navigate('/app/dashboard');
        }
    };

    const handleSave = () => {
        if (!docId) return;
        const contentToSave = flushClickySources() || currentContent;

        setSaving(true);
        setSavedStatus('Saving changes...');

        const apiBaseUrl = getApiBaseUrl();
        fetch(`${apiBaseUrl}/api/documents/${docId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                "Authorization": `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ desc: contentToSave })
        })
            .then(res => {
                if (!res.ok) throw new Error("Failed to save");
                return res.json();
            })
            .then(updated => {
                setDoc(updated);
                setSaving(false);
                setSavedStatus('All changes saved to database');
                setTimeout(() => setSavedStatus(''), 3000);
            })
            .catch(err => {
                console.error("Error saving document:", err);
                setSaving(false);
                setSavedStatus('Error saving document');
            });
    };

    const persistResearch = useCallback(async (items) => {
        setResearchSaving(true);
        try {
            const response = await fetch(`${getApiBaseUrl()}/api/documents/${docId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
                body: JSON.stringify({ researchItems: items }),
            });
            if (!response.ok) throw new Error('Could not save research');
            setDoc(await response.json());
            setSavedStatus('Research saved');
            setTimeout(() => setSavedStatus(''), 1800);
        } catch (error) {
            console.error('Error saving research:', error);
            setSavedStatus('Could not save research');
        } finally {
            setResearchSaving(false);
        }
    }, [docId]);

    const addResearchItem = (text, kind = 'quote') => {
        const item = { id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, kind, text: text.trim(), url: sourceUrl.trim(), note: sourceNote.trim(), createdAt: new Date().toISOString() };
        if (!item.text && !item.url) return;
        const next = [item, ...researchItems];
        setResearchItems(next);
        researchItemsRef.current = next;
        setSourceUrl('');
        setSourceNote('');
        setResearchOpen(true);
        persistResearch(next);
    };

    const insertResearchItem = (item) => {
        const content = [item.text, item.note ? `Note: ${item.note}` : '', item.url ? `Source: ${item.url}` : ''].filter(Boolean).join('\n');
        editorRef.current?.insertText(content);
    };

    const removeResearchItem = (id) => {
        const next = researchItems.filter((item) => item.id !== id);
        setResearchItems(next);
        researchItemsRef.current = next;
        persistResearch(next);
    };

    const flushClickySources = () => {
        const group = sourceGroupRef.current;
        if (!group?.sources?.length) return null;
        editorRef.current?.insertSources(group.sources);
        sourceGroupRef.current = null;
        return editorRef.current?.getHTML() || null;
    };

    const captureFromBrowser = useCallback((capture) => {
        if (!clickyOnRef.current || !capture?.text?.trim() || !capture?.url) return;
        const text = capture.text.trim();
        const url = capture.url;
        const parsedUrl = new URL(url);
        const siteKey = parsedUrl.hostname.toLowerCase().replace(/^www\./, '');
        if (sourceGroupRef.current && sourceGroupRef.current.siteKey !== siteKey) {
            flushClickySources();
        }
        if (!sourceGroupRef.current) sourceGroupRef.current = { siteKey, sources: [] };
        if (!sourceGroupRef.current.sources.some((source) => source.url === url)) {
            sourceGroupRef.current.sources.push({ url, title: capture.title || '' });
        }
        const item = {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            kind: 'quote',
            text,
            url,
            title: capture.title || '',
            note: '',
            createdAt: new Date().toISOString(),
        };
        const next = [item, ...researchItemsRef.current];
        researchItemsRef.current = next;
        setResearchItems(next);
        persistResearch(next);
        editorRef.current?.insertText(text);
        setResearchOpen(true);
        setSavedStatus('Clipped and inserted from browser');
        setTimeout(() => setSavedStatus(''), 2500);
    }, [persistResearch]);

    useEffect(() => {
        const handleClickyMessage = (event) => {
            if (event.source !== window || event.origin !== window.location.origin) return;
            if (event.data?.source !== 'idocs-clicky-extension') return;
            if (event.data.type === 'ready') setClickyExtensionReady(true);
            if (event.data.type === 'state' && event.data.docId === docId) {
                clickyOnRef.current = Boolean(event.data.active);
                setClickyOn(Boolean(event.data.active));
            }
            if (event.data.type === 'capture') captureFromBrowser(event.data.capture);
        };

        window.addEventListener('message', handleClickyMessage);
        window.postMessage({ source: 'idocs-clicky-app', type: 'ping' }, window.location.origin);
        return () => {
            window.removeEventListener('message', handleClickyMessage);
            window.postMessage({ source: 'idocs-clicky-app', type: 'set-active', active: false, docId }, window.location.origin);
            clickyOnRef.current = false;
        };
    }, [docId, captureFromBrowser]);

    const toggleClicky = () => {
        const next = !clickyOn;
        if (next && !clickyExtensionReady) {
            setResearchOpen(true);
            setSavedStatus('Install the Clicky browser extension, then reload this document.');
            return;
        }
        if (!next) flushClickySources();
        clickyOnRef.current = next;
        setClickyOn(next);
        setResearchOpen(true);
        window.postMessage({ source: 'idocs-clicky-app', type: 'set-active', active: next, docId }, window.location.origin);
        setSavedStatus(next ? 'Clicky is listening for selections in your other tabs' : 'Clicky paused');
    };

    if (loading) {
        return (
            <div className="w-full h-screen bg-[#0A0E15] flex items-center justify-center text-zinc-400">
                <div className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full bg-indigo-500 animate-ping" />
                    <span>Loading collaborative document...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-screen bg-[#0A0E15] flex flex-col overflow-hidden text-white">
            {/* Top Google Docs-Style Header Bar */}
            <header className="w-full h-16 bg-zinc-900/90 backdrop-blur-md border-b border-zinc-800 px-6 flex items-center justify-between z-40">
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleClose}
                        title="Close Editor (Return)"
                        className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                    >
                        <FiX className="text-xl" />
                    </button>

                    <div className="h-6 w-[1px] bg-zinc-800" />

                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="font-bold text-base text-white tracking-wide">
                                {doc?.title || doc?.tag?.tagTitle || "Document Notes"}
                            </h1>
                            {doc?.collectionName && (
                                <span className="flex items-center gap-1 text-[11px] bg-zinc-800 text-amber-300 px-2 py-0.5 rounded-full font-medium">
                                    <FiFolder className="text-xs" />
                                    {doc.collectionName}
                                </span>
                            )}
                        </div>
                        {savedStatus ? (
                            <p className="text-[11px] text-zinc-400 font-medium flex items-center gap-1">
                                <FiCheck className="text-emerald-400 text-xs" /> {savedStatus}
                            </p>
                        ) : (
                            <p className="text-[10px] text-zinc-500 font-medium flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Real-time sync enabled
                            </p>
                        )}
                    </div>
                </div>

                {/* Right Action & Collaboration Header Section */}
                <div className="flex items-center gap-3">
                    <button type="button" onClick={toggleClicky} aria-pressed={clickyOn} className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold transition-colors ${clickyOn ? 'border-amber-400/60 bg-amber-400/15 text-amber-200' : 'border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700'}`}>
                        <FiMousePointer /> Clicky {clickyOn ? 'On' : 'Off'}
                    </button>
                    {/* Google Docs-style live typing indicator */}
                    {Object.values(typingUsers).length > 0 && (
                        <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
                            <span className="font-medium text-[11px]">
                                {Object.values(typingUsers).map(u => u.name).join(', ')} is typing...
                            </span>
                        </div>
                    )}

                    {/* Live Presence and Collaboration Bar */}
                    <CollaboratorsBar
                        doc={doc}
                        activeUsers={activeUsers}
                        onOpenShare={() => setShowShareModal(true)}
                    />

                    <div className="h-6 w-[1px] bg-zinc-800 hidden sm:block" />

                    <CapsuleButton
                        type="outline"
                        onClick={handleClose}
                    >
                        Close
                    </CapsuleButton>

                    <CapsuleButton
                        type="active"
                        onClick={handleSave}
                        disabled={saving}
                    >
                        {saving ? 'Saving...' : 'Save'}
                    </CapsuleButton>
                </div>
            </header>

            <main className="flex-1 min-h-0 flex overflow-hidden bg-[#0A0E15]">
                <section className="flex-1 overflow-y-auto pt-10 pb-20 px-4">
                    <div className="w-full max-w-[816px] min-h-[1056px] bg-zinc-900 border border-zinc-800/80 shadow-[0_0_40px_rgba(0,0,0,0.5)] p-6 md:p-12 flex flex-col mx-auto mb-10 rounded-sm">
                        {clickyOn && <div className="mb-4 rounded-xl border border-amber-400/25 bg-amber-400/5 px-4 py-3 text-sm text-amber-100">Clicky is listening. Select text in another tab; clips from the same site are grouped, with clickable sources added when you switch sites or turn Clicky off.</div>}
                        <Editor ref={editorRef} title={currentContent} onChange={handleContentChange} />
                    </div>
                </section>
                {researchOpen && <aside className="w-full max-w-sm shrink-0 overflow-y-auto border-l border-zinc-800 bg-zinc-950/90 p-5">
                    <div className="mb-5 flex items-center justify-between">
                        <div><h2 className="flex items-center gap-2 text-lg font-bold"><FiBookOpen className="text-amber-300" /> Clicky research</h2><p className="mt-1 text-xs text-zinc-500">Sources saved with this document</p></div>
                        <button aria-label="Close research panel" onClick={() => setResearchOpen(false)} className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white"><FiX /></button>
                    </div>
                    <div className="mb-5 space-y-2 rounded-xl border border-zinc-800 bg-zinc-900/70 p-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Add a source</p>
                        <input value={sourceUrl} onChange={(event) => setSourceUrl(event.target.value)} placeholder="Paste a URL (optional)" className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-amber-400" />
                        <textarea value={sourceNote} onChange={(event) => setSourceNote(event.target.value)} placeholder="Why is this useful? (optional)" rows={2} className="w-full resize-y rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-amber-400" />
                        <button disabled={!sourceUrl.trim() || researchSaving} onClick={() => addResearchItem('', 'link')} className="flex w-full items-center justify-center gap-2 rounded-lg bg-amber-300 px-3 py-2 text-sm font-semibold text-zinc-950 disabled:opacity-40"><FiPlus /> Save link</button>
                        {!clickyExtensionReady && <p className="text-xs leading-5 text-amber-200/80">Install the Clicky extension from the project’s <code>BrowserExtension/Clicky</code> folder, then reload this page to capture text from other tabs.</p>}
                    </div>
                    <div className="mb-3 flex items-center justify-between text-xs text-zinc-500"><span>{researchItems.length} saved {researchItems.length === 1 ? 'item' : 'items'}</span><span>{researchSaving ? 'Saving…' : ''}</span></div>
                    <div className="space-y-3">
                        {researchItems.length === 0 && <div className="rounded-xl border border-dashed border-zinc-800 p-5 text-center text-sm text-zinc-500">Save a selected passage or add a link to start your source trail.</div>}
                        {researchItems.map((item) => <article key={item.id} className="rounded-xl border border-zinc-800 bg-zinc-900 p-3">
                            {item.text && <p className="whitespace-pre-wrap break-words text-sm leading-6 text-zinc-200">{item.text}</p>}
                            {item.note && <p className="mt-2 text-xs leading-5 text-zinc-400">{item.note}</p>}
                            {item.url && <a href={item.url} target="_blank" rel="noreferrer" className="mt-2 flex items-center gap-1 break-all text-xs text-sky-300 hover:text-sky-200"><FiExternalLink className="shrink-0" />{item.url}</a>}
                            <div className="mt-3 flex items-center justify-between border-t border-zinc-800 pt-2"><span className="text-[10px] uppercase tracking-wider text-zinc-600">{item.kind === 'quote' ? 'Clipped text' : 'Source link'}</span><div className="flex gap-1"><button title="Insert into document" onClick={() => insertResearchItem(item)} className="rounded-md px-2 py-1 text-xs text-amber-200 hover:bg-zinc-800"><FiPlus className="inline" /> Insert</button><button title="Remove item" onClick={() => removeResearchItem(item.id)} className="rounded-md p-1.5 text-zinc-500 hover:bg-zinc-800 hover:text-rose-300"><FiTrash2 /></button></div></div>
                        </article>)}
                    </div>
                </aside>}
            </main>

            {/* Share & Collaboration Modal */}
            <ShareModal
                isOpen={showShareModal}
                onClose={() => setShowShareModal(false)}
                doc={doc}
                onUpdate={(updatedDoc) => setDoc(updatedDoc)}
            />
        </div>
    );
}
