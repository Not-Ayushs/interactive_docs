import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import CapsuleButton from '../components/CapsuleButton.jsx';
import ShareModal from '../components/ShareModal.jsx';
import CollaboratorsBar from '../components/CollaboratorsBar.jsx';
import { FiX, FiCheck, FiFolder, FiEdit2, FiMove, FiTrash2, FiSquare, FiCircle, FiType, FiCornerDownLeft } from 'react-icons/fi';
import { getApiBaseUrl } from '../utils/api.js';
import { getSocket, joinDocumentRoom, leaveDocumentRoom, emitCanvasChange, emitCanvasCursor } from '../utils/socket.js';

const PRESET_COLORS = ['#ffffff', '#ff4d4d', '#4dff4d', '#4d4dff', '#ffff4d'];

export default function CanvasEditor() {
    const { docId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const canvasRef = useRef(null);
    const gridCanvasRef = useRef(null);
    const containerRef = useRef(null);
    const textInputRef = useRef(null);

    const [doc, setDoc] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [savedStatus, setSavedStatus] = useState('');
    const [activeUsers, setActiveUsers] = useState([]);
    const [remoteCursors, setRemoteCursors] = useState({});
    const [showShareModal, setShowShareModal] = useState(false);

    const isRemoteCanvasUpdateRef = useRef(false);
    const hasLoadedInitialRef = useRef(false);
    const lastCursorEmitRef = useRef(0);

    // --- Canvas State ---
    const [elements, setElements] = useState([]);
    const [camera, setCamera] = useState({ x: 0, y: 0, zoom: 1 });
    const [tool, setTool] = useState('pen'); // 'pen', 'rectangle', 'circle', 'text', 'eraser', 'pan'
    const [color, setColor] = useState('#ffffff');
    const [strokeWidth, setStrokeWidth] = useState(5);

    // Interaction State
    const [isDrawing, setIsDrawing] = useState(false);
    const [isPanning, setIsPanning] = useState(false);
    const [lastPointerPosition, setLastPointerPosition] = useState(null);

    // Text Dialog State: { canvasX, canvasY, value }
    const [textDialog, setTextDialog] = useState(null);

    const returnCollection = location.state?.fromCollection || doc?.collectionName;

    // Load Document
    useEffect(() => {
        const apiBaseUrl = getApiBaseUrl();
        const token = localStorage.getItem('token');
        fetch(`${apiBaseUrl}/api/documents/${docId}`, {
            headers: { "Authorization": `Bearer ${token}` }
        })
            .then(res => {
                if (!res.ok) throw new Error("Document not found");
                return res.json();
            })
            .then(data => {
                setDoc(data);
                if (data.canvasData) {
                    try {
                        const parsed = typeof data.canvasData === 'string'
                            ? JSON.parse(data.canvasData)
                            : data.canvasData;
                        
                        let loadedElements = [];
                        if (Array.isArray(parsed.elements)) {
                            loadedElements = parsed.elements;
                        } else if (Array.isArray(parsed.lines)) {
                            loadedElements = parsed.lines.map(line => ({ ...line, type: 'path', id: Date.now() + Math.random() }));
                        }
                        
                        if (loadedElements.length > 0) {
                            setElements(loadedElements.map(el => ({ ...el, id: el.id || Date.now() + Math.random() })));
                            if (parsed.camera) setCamera(parsed.camera);
                        }
                    } catch (e) {
                        console.error("Failed to load canvas data", e);
                        setElements([]);
                    }
                }
                setLoading(false);
                setTimeout(() => {
                    hasLoadedInitialRef.current = true;
                }, 300);
            })
            .catch(err => {
                console.error("Error fetching document:", err);
                setLoading(false);
            });
    }, [docId]);

    // WebSocket Real-Time Sync
    useEffect(() => {
        if (!docId) return;

        joinDocumentRoom(docId);
        const socket = getSocket();

        const handleCanvasChanged = (data) => {
            if (data && data.elements) {
                isRemoteCanvasUpdateRef.current = true;
                setElements(data.elements);
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

        const handleCursorMoved = (cursor) => {
            if (cursor && cursor.userId) {
                setRemoteCursors(prev => ({
                    ...prev,
                    [cursor.userId]: cursor
                }));
            }
        };

        socket.on("canvas-changed", handleCanvasChanged);
        socket.on("active-users", handleActiveUsers);
        socket.on("canvas-cursor-moved", handleCursorMoved);

        return () => {
            socket.off("canvas-changed", handleCanvasChanged);
            socket.off("active-users", handleActiveUsers);
            socket.off("canvas-cursor-moved", handleCursorMoved);
            leaveDocumentRoom(docId);
        };
    }, [docId]);

    // Emit canvas changes when modified locally
    useEffect(() => {
        if (!hasLoadedInitialRef.current || isRemoteCanvasUpdateRef.current) {
            isRemoteCanvasUpdateRef.current = false;
            return;
        }
        emitCanvasChange(docId, elements, camera);
        setSavedStatus('Syncing canvas live...');
        setTimeout(() => setSavedStatus('All changes synced'), 2000);
    }, [elements]);

    const handleClose = () => {
        if (returnCollection && returnCollection !== 'General') {
            navigate(`/app/collections/${encodeURIComponent(returnCollection)}`);
        } else {
            navigate('/app/dashboard');
        }
    };

    const handleSave = () => {
        if (!docId) return;
        setSaving(true);
        setSavedStatus('Saving changes...');

        const canvasDataToSave = { elements, camera };
        const apiBaseUrl = getApiBaseUrl();
        fetch(`${apiBaseUrl}/api/documents/${docId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                "Authorization": `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ canvasData: JSON.stringify(canvasDataToSave) })
        })
            .then(res => {
                if (!res.ok) throw new Error("Failed to save");
                return res.json();
            })
            .then(updated => {
                setDoc(updated);
                setSaving(false);
                setSavedStatus('All changes saved');
                setTimeout(() => setSavedStatus(''), 3000);
            })
            .catch(err => {
                console.error("Error saving document:", err);
                setSaving(false);
                setSavedStatus('Error saving document');
            });
    };

    // Helper: Bounding Box
    const getElementBounds = (element) => {
        if (element.type === 'path') {
            if (!element.points || element.points.length === 0) return null;
            let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
            element.points.forEach(p => {
                if (p.x < minX) minX = p.x;
                if (p.y < minY) minY = p.y;
                if (p.x > maxX) maxX = p.x;
                if (p.y > maxY) maxY = p.y;
            });
            return { minX, minY, maxX, maxY };
        } else if (element.type === 'rectangle' || element.type === 'circle') {
            const minX = Math.min(element.x, element.x + element.w);
            const maxX = Math.max(element.x, element.x + element.w);
            const minY = Math.min(element.y, element.y + element.h);
            const maxY = Math.max(element.y, element.y + element.h);
            return { minX, minY, maxX, maxY };
        } else if (element.type === 'text') {
            const fontSize = Math.max(16, (element.width || 5) * 3);
            const textWidth = Math.max(24, (element.text?.length || 1) * fontSize * 0.65);
            return { minX: element.x, minY: element.y, maxX: element.x + textWidth, maxY: element.y + fontSize + 6 };
        }
        return null;
    };

    const isPointInBounds = (pos, bounds, pad = 12) => {
        if (!bounds) return false;
        return pos.x >= bounds.minX - pad && pos.x <= bounds.maxX + pad &&
               pos.y >= bounds.minY - pad && pos.y <= bounds.maxY + pad;
    };

    // Rendering Engine - Grid
    const renderGrid = useCallback(() => {
        const canvas = gridCanvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.fillStyle = '#0F131A';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.setTransform(camera.zoom, 0, 0, camera.zoom, camera.x, camera.y);

        const gridSize = 40;
        const dotRadius = 1.5;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
        
        const startX = -camera.x / camera.zoom;
        const startY = -camera.y / camera.zoom;
        const endX = startX + (canvas.width / camera.zoom);
        const endY = startY + (canvas.height / camera.zoom);

        const firstGridX = startX - (startX % gridSize) - gridSize;
        const firstGridY = startY - (startY % gridSize) - gridSize;

        for (let x = firstGridX; x < endX + gridSize; x += gridSize) {
            for (let y = firstGridY; y < endY + gridSize; y += gridSize) {
                ctx.beginPath();
                ctx.arc(x, y, dotRadius / camera.zoom, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }, [camera]);

    // Rendering Engine - Elements
    const renderCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.setTransform(camera.zoom, 0, 0, camera.zoom, camera.x, camera.y);

        elements.forEach(element => {
            ctx.beginPath();
            ctx.strokeStyle = element.color || '#ffffff';
            ctx.fillStyle = element.color || '#ffffff';
            ctx.lineWidth = element.width || 5;
            
            if (element.tool === 'eraser') {
                ctx.globalCompositeOperation = 'destination-out';
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
            } else {
                ctx.globalCompositeOperation = 'source-over';
            }

            if (element.type === 'path') {
                if (!element.points || element.points.length === 0) return;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                ctx.moveTo(element.points[0].x, element.points[0].y);
                for (let i = 1; i < element.points.length; i++) {
                    ctx.lineTo(element.points[i].x, element.points[i].y);
                }
                ctx.stroke();
            } else if (element.type === 'rectangle') {
                ctx.lineJoin = 'miter';
                ctx.rect(element.x, element.y, element.w, element.h);
                ctx.stroke();
            } else if (element.type === 'circle') {
                const rx = Math.abs(element.w / 2);
                const ry = Math.abs(element.h / 2);
                const cx = element.x + element.w / 2;
                const cy = element.y + element.h / 2;
                ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
                ctx.stroke();
            } else if (element.type === 'text') {
                const fontSize = Math.max(16, (element.width || 5) * 3);
                ctx.font = `600 ${fontSize}px sans-serif`;
                ctx.textBaseline = 'top';
                ctx.fillText(element.text || '', element.x, element.y);
            }
        });

        ctx.globalCompositeOperation = 'source-over';
    }, [elements, camera]);

    useEffect(() => {
        renderGrid();
        renderCanvas();
    }, [renderGrid, renderCanvas]);

    // Canvas Size Setup on Mount & Resize
    useEffect(() => {
        if (loading) return;

        const updateSize = () => {
            if (canvasRef.current && gridCanvasRef.current && containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                if (rect.width > 0 && rect.height > 0) {
                    canvasRef.current.width = rect.width;
                    canvasRef.current.height = rect.height;
                    gridCanvasRef.current.width = rect.width;
                    gridCanvasRef.current.height = rect.height;
                    renderGrid();
                    renderCanvas();
                }
            }
        };

        updateSize();
        requestAnimationFrame(updateSize);

        const resizeObserver = new ResizeObserver(() => {
            updateSize();
        });

        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }

        window.addEventListener('resize', updateSize);
        return () => {
            resizeObserver.disconnect();
            window.removeEventListener('resize', updateSize);
        };
    }, [loading, renderCanvas, renderGrid]);

    const getPointerPos = (e) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        
        let clientX = e.clientX;
        let clientY = e.clientY;

        if (e.touches && e.touches.length > 0) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else if (e.changedTouches && e.changedTouches.length > 0) {
            clientX = e.changedTouches[0].clientX;
            clientY = e.changedTouches[0].clientY;
        }

        return {
            x: (clientX !== undefined ? clientX : 0) - rect.left,
            y: (clientY !== undefined ? clientY : 0) - rect.top
        };
    };

    const getCanvasPos = (pos) => {
        return {
            x: (pos.x - camera.x) / camera.zoom,
            y: (pos.y - camera.y) / camera.zoom
        };
    };

    // Text Submission
    const handleAddText = (textValue) => {
        if (!textDialog) return;
        const val = (textValue !== undefined ? textValue : textDialog.value || '').trim();
        if (val) {
            setElements(prev => [
                ...prev,
                {
                    id: Date.now() + Math.random(),
                    type: 'text',
                    tool: 'text',
                    color: color,
                    width: strokeWidth,
                    x: textDialog.canvasX,
                    y: textDialog.canvasY,
                    text: val
                }
            ]);
        }
        setTextDialog(null);
    };

    // Double-click to edit existing text
    const handleDoubleClick = (e) => {
        const pos = getPointerPos(e);
        const canvasPos = getCanvasPos(pos);

        const clickedText = elements.find(el => {
            if (el.type === 'text') {
                const bounds = getElementBounds(el);
                return isPointInBounds(canvasPos, bounds, 20);
            }
            return false;
        });

        if (clickedText) {
            setTool('text');
            setElements(prev => prev.filter(el => el.id !== clickedText.id));
            setTextDialog({
                canvasX: clickedText.x,
                canvasY: clickedText.y,
                value: clickedText.text || ''
            });
        }
    };

    // Pointer / Mouse / Touch Events
    const handlePointerDown = (e) => {
        if (!canvasRef.current) return;

        const pos = getPointerPos(e);
        const canvasPos = getCanvasPos(pos);

        // Middle mouse, Space, or Pan tool
        if (e.button === 1 || tool === 'pan' || e.shiftKey) {
            if (e.target.setPointerCapture && e.pointerId !== undefined) {
                try { e.target.setPointerCapture(e.pointerId); } catch {}
            }
            setIsPanning(true);
            setLastPointerPosition(pos);
            return;
        }

        if (e.button === 0 || e.button === undefined) {
            // Text tool
            if (tool === 'text') {
                if (textDialog && textDialog.value && textDialog.value.trim() !== '') {
                    handleAddText(textDialog.value);
                }

                // Check if user clicked on existing text to edit it
                const clickedText = elements.find(el => {
                    if (el.type === 'text') {
                        const bounds = getElementBounds(el);
                        return isPointInBounds(canvasPos, bounds, 20);
                    }
                    return false;
                });

                if (clickedText) {
                    setElements(prev => prev.filter(el => el.id !== clickedText.id));
                    setTextDialog({
                        canvasX: clickedText.x,
                        canvasY: clickedText.y,
                        value: clickedText.text || ''
                    });
                    return;
                }

                setTextDialog({
                    canvasX: canvasPos.x,
                    canvasY: canvasPos.y,
                    value: ''
                });
                return;
            }

            // Eraser tool - check if clicked on text/shapes to delete
            if (tool === 'eraser') {
                const clickedElement = elements.find(el => {
                    const bounds = getElementBounds(el);
                    return isPointInBounds(canvasPos, bounds, 15);
                });

                if (clickedElement && (clickedElement.type === 'text' || clickedElement.type === 'rectangle' || clickedElement.type === 'circle')) {
                    setElements(prev => prev.filter(el => el.id !== clickedElement.id));
                    return;
                }
            }

            // Drawing tools
            if (e.target.setPointerCapture && e.pointerId !== undefined) {
                try { e.target.setPointerCapture(e.pointerId); } catch {}
            }
            setIsDrawing(true);

            if (tool === 'pen' || tool === 'eraser') {
                setElements(prev => [
                    ...prev,
                    { id: Date.now() + Math.random(), type: 'path', tool, color, width: strokeWidth, points: [canvasPos] }
                ]);
            } else if (tool === 'rectangle' || tool === 'circle') {
                setElements(prev => [
                    ...prev,
                    { id: Date.now() + Math.random(), type: tool, tool, color, width: strokeWidth, x: canvasPos.x, y: canvasPos.y, w: 0, h: 0 }
                ]);
            }
        }
    };

    const handlePointerMove = (e) => {
        const pos = getPointerPos(e);

        if (isPanning && lastPointerPosition) {
            const dx = pos.x - lastPointerPosition.x;
            const dy = pos.y - lastPointerPosition.y;
            setCamera(prev => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
            setLastPointerPosition(pos);
            return;
        }

        const canvasPos = getCanvasPos(pos);

        // Broadcast cursor position to partners (throttled)
        if (Date.now() - lastCursorEmitRef.current > 50) {
            lastCursorEmitRef.current = Date.now();
            emitCanvasCursor(docId, canvasPos.x, canvasPos.y);
        }

        if (isDrawing) {
            // Eraser dragging over shapes/text
            if (tool === 'eraser') {
                const hit = elements.find(el => {
                    if (el.type === 'text' || el.type === 'rectangle' || el.type === 'circle') {
                        const bounds = getElementBounds(el);
                        return isPointInBounds(canvasPos, bounds, 15);
                    }
                    return false;
                });
                if (hit) {
                    setElements(prev => prev.filter(el => el.id !== hit.id));
                }
            }

            setElements(prev => {
                const lastEl = prev[prev.length - 1];
                if (!lastEl) return prev;
                
                if (lastEl.type === 'path') {
                    const newEl = { ...lastEl, points: [...lastEl.points, canvasPos] };
                    return [...prev.slice(0, -1), newEl];
                } else if (lastEl.type === 'rectangle' || lastEl.type === 'circle') {
                    const newEl = { ...lastEl, w: canvasPos.x - lastEl.x, h: canvasPos.y - lastEl.y };
                    return [...prev.slice(0, -1), newEl];
                }
                return prev;
            });
        }
    };

    const handlePointerUp = (e) => {
        setIsDrawing(false);
        setIsPanning(false);
        setLastPointerPosition(null);
        if (canvasRef.current && e.pointerId !== undefined) {
            try {
                canvasRef.current.releasePointerCapture(e.pointerId);
            } catch {}
        }
    };

    // Zoom on wheel
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const handleWheelNative = (e) => {
            e.preventDefault();

            if (e.ctrlKey || e.metaKey) {
                const zoomAmount = e.deltaY > 0 ? 0.9 : 1.1;
                const rect = canvas.getBoundingClientRect();
                const pos = {
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.top
                };

                setCamera(prev => {
                    const mousePointTo = {
                        x: (pos.x - prev.x) / prev.zoom,
                        y: (pos.y - prev.y) / prev.zoom,
                    };
                    const newZoom = Math.max(0.1, Math.min(prev.zoom * zoomAmount, 10));
                    return {
                        zoom: newZoom,
                        x: pos.x - mousePointTo.x * newZoom,
                        y: pos.y - mousePointTo.y * newZoom,
                    };
                });
            } else {
                setCamera(prev => ({
                    ...prev,
                    x: prev.x - e.deltaX,
                    y: prev.y - e.deltaY
                }));
            }
        };

        canvas.addEventListener('wheel', handleWheelNative, { passive: false });
        return () => canvas.removeEventListener('wheel', handleWheelNative);
    }, []);

    const clearCanvas = () => {
        if (window.confirm("Are you sure you want to clear the canvas?")) {
            setElements([]);
            setTextDialog(null);
        }
    };

    // Auto focus text input when dialog opens
    useEffect(() => {
        if (textDialog && textInputRef.current) {
            textInputRef.current.focus();
            textInputRef.current.select?.();
        }
    }, [textDialog]);

    if (loading) {
        return (
            <div className="w-full h-screen bg-[#0A0E15] flex items-center justify-center text-zinc-400">
                Loading canvas...
            </div>
        );
    }

    return (
        <div className="w-full h-screen bg-[#0A0E15] flex flex-col overflow-hidden text-white select-none">
            {/* Header */}
            <header className="w-full h-16 bg-zinc-900/95 backdrop-blur border-b border-zinc-800 px-6 flex items-center justify-between z-30">
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleClose}
                        title="Close Canvas (Return)"
                        className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                    >
                        <FiX className="text-xl" />
                    </button>

                    <div className="h-6 w-[1px] bg-zinc-800" />

                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="font-bold text-base text-white tracking-wide">
                                {doc?.tag?.tagTitle || "Infinite Canvas"}
                            </h1>
                            {doc?.collectionName && (
                                <span className="flex items-center gap-1 text-[11px] bg-zinc-800 text-amber-300 px-2 py-0.5 rounded-full font-medium">
                                    <FiFolder className="text-xs" />
                                    {doc.collectionName}
                                </span>
                            )}
                        </div>
                        {savedStatus && (
                            <p className="text-[11px] text-zinc-400 font-medium flex items-center gap-1">
                                <FiCheck className="text-white text-xs" /> {savedStatus}
                            </p>
                        )}
                    </div>
                </div>

                {/* Main Toolbar */}
                <div className="flex items-center gap-2 bg-zinc-800/80 px-4 py-1.5 rounded-full border border-zinc-700/60 shadow-lg">
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => { setTool('pen'); setTextDialog(null); }}
                            className={`p-2 rounded-md transition-colors ${tool === 'pen' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-700'}`}
                            title="Pen / Brush"
                        >
                            <FiEdit2 className="text-base" />
                        </button>
                        <button
                            onClick={() => { setTool('rectangle'); setTextDialog(null); }}
                            className={`p-2 rounded-md transition-colors ${tool === 'rectangle' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-700'}`}
                            title="Rectangle"
                        >
                            <FiSquare className="text-base" />
                        </button>
                        <button
                            onClick={() => { setTool('circle'); setTextDialog(null); }}
                            className={`p-2 rounded-md transition-colors ${tool === 'circle' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-700'}`}
                            title="Circle"
                        >
                            <FiCircle className="text-base" />
                        </button>
                        <button
                            onClick={() => setTool('text')}
                            className={`p-2 rounded-md transition-colors ${tool === 'text' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-700'}`}
                            title="Text Tool (Click anywhere on canvas to type, or click existing text to edit)"
                        >
                            <FiType className="text-base" />
                        </button>
                        <button
                            onClick={() => { setTool('eraser'); setTextDialog(null); }}
                            className={`p-2 rounded-md transition-colors ${tool === 'eraser' ? 'bg-red-500/30 text-red-400' : 'text-zinc-400 hover:text-white hover:bg-zinc-700'}`}
                            title="Eraser (Erase ink & click/drag to delete shapes or text)"
                        >
                            <div className="w-4 h-4 border-2 border-current rounded-sm flex items-center justify-center text-[9px] font-bold">E</div>
                        </button>
                        <button
                            onClick={() => { setTool('pan'); setTextDialog(null); }}
                            className={`p-2 rounded-md transition-colors ${tool === 'pan' ? 'bg-zinc-600 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-700'}`}
                            title="Pan Tool"
                        >
                            <FiMove className="text-base" />
                        </button>
                    </div>
                    
                    <div className="w-[1px] h-6 bg-zinc-700 mx-1" />
                    
                    {/* Color Presets */}
                    <div className="flex items-center gap-1.5">
                        {PRESET_COLORS.map(preset => (
                            <button
                                key={preset}
                                onClick={() => setColor(preset)}
                                className={`w-5 h-5 rounded-full transition-transform ${color === preset ? 'scale-125 ring-2 ring-indigo-500 ring-offset-2 ring-offset-zinc-800' : 'hover:scale-110'}`}
                                style={{ backgroundColor: preset }}
                                title={preset}
                                disabled={tool === 'eraser'}
                            />
                        ))}
                    </div>

                    <div className="w-[1px] h-6 bg-zinc-700 mx-1" />
                    
                    {/* Custom Color */}
                    <input 
                        type="color" 
                        value={color} 
                        onChange={(e) => setColor(e.target.value)}
                        className="w-6 h-6 rounded cursor-pointer bg-transparent border-0 p-0"
                        title="Custom Color"
                        disabled={tool === 'eraser'}
                    />
                    
                    {/* Size Slider */}
                    <input 
                        type="range" 
                        min="1" 
                        max="20" 
                        value={strokeWidth} 
                        onChange={(e) => setStrokeWidth(parseInt(e.target.value))}
                        className="w-20 accent-indigo-500 ml-2"
                        title="Stroke & Text Size"
                    />

                    <div className="w-[1px] h-6 bg-zinc-700 mx-1" />

                    {/* Clear Canvas */}
                    <button
                        onClick={clearCanvas}
                        className="p-2 text-zinc-400 hover:text-red-400 hover:bg-zinc-700 rounded-md transition-colors"
                        title="Clear Canvas"
                    >
                        <FiTrash2 className="text-base" />
                    </button>
                </div>

                {/* Right Actions & Collaboration */}
                <div className="flex items-center gap-3">
                    <CollaboratorsBar
                        doc={doc}
                        activeUsers={activeUsers}
                        onOpenShare={() => setShowShareModal(true)}
                    />
                    <div className="h-6 w-[1px] bg-zinc-800 hidden sm:block" />
                    <CapsuleButton type="outline" onClick={handleClose}>Close</CapsuleButton>
                    <CapsuleButton type="active" onClick={handleSave} disabled={saving}>
                        {saving ? 'Saving...' : 'Save Canvas'}
                    </CapsuleButton>
                </div>
            </header>

            {/* Canvas Viewport */}
            <main ref={containerRef} className="flex-1 relative w-full h-full overflow-hidden touch-none">
                <canvas
                    ref={gridCanvasRef}
                    className="absolute inset-0 w-full h-full pointer-events-none"
                />
                <canvas
                    ref={canvasRef}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerLeave={handlePointerUp}
                    onDoubleClick={handleDoubleClick}
                    className="absolute inset-0 w-full h-full"
                    style={{
                        cursor: tool === 'pan' ? 'grab' : tool === 'text' ? 'text' : tool === 'eraser' ? 'crosshair' : isDrawing ? 'crosshair' : 'default',
                        touchAction: 'none'
                    }}
                />

                {/* Floating Text Input Box */}
                {textDialog && (
                    <div
                        className="absolute z-40 flex items-center gap-1.5 bg-[#161B22] border-2 border-indigo-500 rounded-lg p-2 shadow-2xl backdrop-blur"
                        style={{
                            left: `${textDialog.canvasX * camera.zoom + camera.x}px`,
                            top: `${textDialog.canvasY * camera.zoom + camera.y}px`,
                            transform: 'translate(-4px, -4px)'
                        }}
                        onPointerDown={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.stopPropagation()}
                        onTouchStart={(e) => e.stopPropagation()}
                    >
                        <input
                            ref={textInputRef}
                            type="text"
                            autoFocus
                            placeholder="Type text..."
                            value={textDialog.value}
                            onChange={(e) => setTextDialog(prev => ({ ...prev, value: e.target.value }))}
                            onKeyDown={(e) => {
                                e.stopPropagation();
                                if (e.key === 'Enter') {
                                    handleAddText();
                                } else if (e.key === 'Escape') {
                                    setTextDialog(null);
                                }
                            }}
                            className="bg-transparent text-white px-2 py-1 outline-none font-medium text-base min-w-[160px]"
                            style={{
                                color: color,
                                fontSize: `${Math.max(16, strokeWidth * 2.5)}px`
                            }}
                        />
                        <button
                            onClick={() => handleAddText()}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-md font-medium text-xs transition-colors flex items-center gap-1 cursor-pointer shadow"
                            title="Done (Enter)"
                        >
                            <FiCornerDownLeft className="text-sm" /> Done
                        </button>
                        <button
                            onClick={() => setTextDialog(null)}
                            className="text-zinc-400 hover:text-white p-1.5 rounded hover:bg-zinc-700 transition-colors flex items-center justify-center cursor-pointer"
                            title="Cancel (Esc)"
                        >
                            <FiX className="text-sm" />
                        </button>
                    </div>
                )}
                
                {/* Live Remote Collaborator Cursors */}
                {Object.values(remoteCursors).map((rc) => {
                    const screenX = rc.x * camera.zoom + camera.x;
                    const screenY = rc.y * camera.zoom + camera.y;
                    return (
                        <div
                            key={rc.userId}
                            className="absolute pointer-events-none transition-all duration-75 z-30"
                            style={{
                                left: `${screenX}px`,
                                top: `${screenY}px`,
                            }}
                        >
                            <svg className="w-5 h-5 drop-shadow-md" viewBox="0 0 24 24" fill={rc.color || '#6366f1'}>
                                <path d="M3 3l7 18 3-7 7-3L3 3z" />
                            </svg>
                            <div
                                style={{ backgroundColor: rc.color || '#6366f1' }}
                                className="px-2 py-0.5 rounded-full text-[10px] font-semibold text-white shadow-lg whitespace-nowrap ml-3 -mt-1 select-none"
                            >
                                {rc.name}
                            </div>
                        </div>
                    );
                })}

                {/* Zoom Indicator */}
                <div className="absolute bottom-6 right-6 bg-zinc-800/80 backdrop-blur border border-zinc-700 px-3 py-1.5 rounded-full text-xs text-zinc-300 pointer-events-none font-medium shadow-lg z-20">
                    {Math.round(camera.zoom * 100)}%
                </div>
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
