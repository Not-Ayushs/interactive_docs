import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import CapsuleButton from '../components/CapsuleButton.jsx';
import { FiX, FiCheck, FiFolder, FiEdit2, FiMove, FiTrash2, FiSquare, FiCircle, FiType } from 'react-icons/fi';
import { getApiBaseUrl } from '../utils/api.js';

const PRESET_COLORS = ['#ffffff', '#ff4d4d', '#4dff4d', '#4d4dff', '#ffff4d'];

export default function CanvasEditor() {
    const { docId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const canvasRef = useRef(null);
    const gridCanvasRef = useRef(null);
    const containerRef = useRef(null);

    const [doc, setDoc] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [savedStatus, setSavedStatus] = useState('');

    // --- Canvas State ---
    const [elements, setElements] = useState([]);
    const [camera, setCamera] = useState({ x: 0, y: 0, zoom: 1 });
    const [tool, setTool] = useState('pen'); // 'pen', 'pan', 'eraser', 'rectangle', 'circle', 'text'
    const [color, setColor] = useState('#ffffff');
    const [strokeWidth, setStrokeWidth] = useState(5);

    // Interaction State
    const [isDrawing, setIsDrawing] = useState(false);
    const [isPanning, setIsPanning] = useState(false);
    const [lastPointerPosition, setLastPointerPosition] = useState(null);
    
    // Text overlay state
    const [textInput, setTextInput] = useState(null); // { x, y, canvasX, canvasY, value }

    const returnCollection = location.state?.fromCollection || doc?.collectionName;

    // Fetch document and load canvas data
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
                        
                        // Support migrating 'lines' to 'elements' format if needed
                        let loadedElements = [];
                        if (Array.isArray(parsed.elements)) {
                            loadedElements = parsed.elements;
                        } else if (Array.isArray(parsed.lines)) {
                            loadedElements = parsed.lines.map(line => ({ ...line, type: 'path' }));
                        }
                        
                        if (loadedElements.length > 0) {
                            setElements(loadedElements);
                            if (parsed.camera) setCamera(parsed.camera);
                        } else if (parsed.lines) {
                             console.warn("Empty lines array found.");
                        } else {
                            console.warn("Canvas data is not in expected custom format. Starting fresh.");
                        }
                    } catch (e) {
                        console.error("Failed to load canvas data", e);
                        setElements([]);
                    }
                }
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching document:", err);
                setLoading(false);
            });
    }, [docId]);

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

        const canvasDataToSave = {
            elements,
            camera
        };

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
            ctx.strokeStyle = element.color;
            ctx.fillStyle = element.color;
            ctx.lineWidth = element.width;
            
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
                ctx.font = `${Math.max(16, element.width * 3)}px sans-serif`;
                ctx.textBaseline = 'top';
                ctx.fillText(element.text, element.x, element.y);
            }
        });

        ctx.globalCompositeOperation = 'source-over';
    }, [elements, camera]);

    useEffect(() => {
        renderGrid();
        renderCanvas();
    }, [renderGrid, renderCanvas]);

    useEffect(() => {
        const handleResize = () => {
            if (canvasRef.current && gridCanvasRef.current && containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                
                canvasRef.current.width = rect.width;
                canvasRef.current.height = rect.height;
                
                gridCanvasRef.current.width = rect.width;
                gridCanvasRef.current.height = rect.height;
                
                renderGrid();
                renderCanvas();
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [renderCanvas, renderGrid]);

    const getPointerPos = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    };

    const getCanvasPos = (pos) => {
        return {
            x: (pos.x - camera.x) / camera.zoom,
            y: (pos.y - camera.y) / camera.zoom
        };
    };

    const handlePointerDown = (e) => {
        if (!canvasRef.current) return;
        
        // If there's an active text input and we click elsewhere, commit it
        if (textInput && tool !== 'text') {
            commitText();
            return;
        }

        e.target.setPointerCapture(e.pointerId);
        
        const pos = getPointerPos(e);

        if (e.button === 1 || tool === 'pan' || e.shiftKey) {
            setIsPanning(true);
            setLastPointerPosition(pos);
            return;
        }

        if (e.button === 0) {
            if (tool === 'text') {
                // If we already have a text input open, commit it first
                if (textInput) commitText();
                setTextInput({ 
                    x: pos.x, 
                    y: pos.y, 
                    canvasX: getCanvasPos(pos).x, 
                    canvasY: getCanvasPos(pos).y, 
                    value: '' 
                });
                return;
            }

            setIsDrawing(true);
            const canvasPos = getCanvasPos(pos);

            if (tool === 'pen' || tool === 'eraser') {
                setElements(prev => [
                    ...prev,
                    { type: 'path', tool, color, width: strokeWidth, points: [canvasPos] }
                ]);
            } else if (tool === 'rectangle' || tool === 'circle') {
                setElements(prev => [
                    ...prev,
                    { type: tool, tool, color, width: strokeWidth, x: canvasPos.x, y: canvasPos.y, w: 0, h: 0 }
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

        if (isDrawing) {
            const canvasPos = getCanvasPos(pos);
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
        if (canvasRef.current) {
            canvasRef.current.releasePointerCapture(e.pointerId);
        }
    };

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
        if (window.confirm("Are you sure you want to clear the entire canvas?")) {
            setElements([]);
        }
    };

    const commitText = () => {
        if (textInput && textInput.value.trim() !== '') {
            setElements(prev => [
                ...prev,
                { 
                    type: 'text', 
                    tool: 'text', 
                    color, 
                    width: strokeWidth, 
                    x: textInput.canvasX, 
                    y: textInput.canvasY, 
                    text: textInput.value 
                }
            ]);
        }
        setTextInput(null);
    };

    const handleTextKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            commitText();
            setTool('pen');
        } else if (e.key === 'Escape') {
            setTextInput(null);
            setTool('pen');
        }
    };

    if (loading) {
        return (
            <div className="w-full h-screen bg-[#0A0E15] flex items-center justify-center text-zinc-400">
                Loading canvas...
            </div>
        );
    }

    return (
        <div className="w-full h-screen bg-[#0A0E15] flex flex-col overflow-hidden text-white">
            <header className="w-full h-16 bg-zinc-900/90 backdrop-blur-md border-b border-zinc-800 px-6 flex items-center justify-between z-50">
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

                <div className="flex items-center gap-2 bg-zinc-800/50 px-4 py-1.5 rounded-full border border-zinc-700/50">
                    <div className="flex items-center gap-1 mr-2">
                        <button
                            onClick={() => setTool('pan')}
                            className={`p-2 rounded-md transition-colors ${tool === 'pan' ? 'bg-zinc-600 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-700'}`}
                            title="Pan Tool (or Space/Middle-Click)"
                        >
                            <FiMove />
                        </button>
                        <button
                            onClick={() => setTool('pen')}
                            className={`p-2 rounded-md transition-colors ${tool === 'pen' ? 'bg-indigo-500/20 text-indigo-400' : 'text-zinc-400 hover:text-white hover:bg-zinc-700'}`}
                            title="Pen Tool"
                        >
                            <FiEdit2 />
                        </button>
                        <button
                            onClick={() => setTool('rectangle')}
                            className={`p-2 rounded-md transition-colors ${tool === 'rectangle' ? 'bg-indigo-500/20 text-indigo-400' : 'text-zinc-400 hover:text-white hover:bg-zinc-700'}`}
                            title="Rectangle"
                        >
                            <FiSquare />
                        </button>
                        <button
                            onClick={() => setTool('circle')}
                            className={`p-2 rounded-md transition-colors ${tool === 'circle' ? 'bg-indigo-500/20 text-indigo-400' : 'text-zinc-400 hover:text-white hover:bg-zinc-700'}`}
                            title="Circle"
                        >
                            <FiCircle />
                        </button>
                        <button
                            onClick={() => setTool('text')}
                            className={`p-2 rounded-md transition-colors ${tool === 'text' ? 'bg-indigo-500/20 text-indigo-400' : 'text-zinc-400 hover:text-white hover:bg-zinc-700'}`}
                            title="Text"
                        >
                            <FiType />
                        </button>
                        <button
                            onClick={() => setTool('eraser')}
                            className={`p-2 rounded-md transition-colors ${tool === 'eraser' ? 'bg-red-500/20 text-red-400' : 'text-zinc-400 hover:text-white hover:bg-zinc-700'}`}
                            title="Eraser Tool"
                        >
                            <div className="w-4 h-4 border-2 border-current rounded-sm"></div>
                        </button>
                    </div>
                    
                    <div className="w-[1px] h-6 bg-zinc-700 mx-1"></div>
                    
                    <div className="flex items-center gap-1">
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

                    <div className="w-[1px] h-6 bg-zinc-700 mx-2"></div>
                    
                    <input 
                        type="color" 
                        value={color} 
                        onChange={(e) => setColor(e.target.value)}
                        className="w-6 h-6 rounded cursor-pointer bg-transparent border-0 p-0"
                        title="Custom Color"
                        disabled={tool === 'eraser'}
                    />
                    
                    <input 
                        type="range" 
                        min="1" 
                        max="20" 
                        value={strokeWidth} 
                        onChange={(e) => setStrokeWidth(parseInt(e.target.value))}
                        className="w-20 accent-indigo-500 ml-2"
                        title="Stroke/Font Size"
                    />

                    <div className="w-[1px] h-6 bg-zinc-700 mx-2"></div>

                    <button
                        onClick={clearCanvas}
                        className="p-2 text-zinc-400 hover:text-red-400 hover:bg-zinc-700 rounded-md transition-colors"
                        title="Clear Canvas"
                    >
                        <FiTrash2 />
                    </button>
                </div>

                <div className="flex items-center gap-3">
                    <CapsuleButton type="outline" onClick={handleClose}>Close</CapsuleButton>
                    <CapsuleButton type="active" onClick={handleSave} disabled={saving}>
                        {saving ? 'Saving...' : 'Save Canvas'}
                    </CapsuleButton>
                </div>
            </header>

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
                    className="absolute inset-0 w-full h-full"
                    style={{
                        cursor: tool === 'pan' ? 'grab' : tool === 'text' ? 'text' : isDrawing ? 'crosshair' : 'default',
                        touchAction: 'none'
                    }}
                />
                
                {textInput && (
                    <input
                        autoFocus
                        type="text"
                        value={textInput.value}
                        onChange={(e) => setTextInput({ ...textInput, value: e.target.value })}
                        onKeyDown={handleTextKeyDown}
                        onBlur={commitText}
                        className="absolute bg-transparent border-none outline-none resize-none overflow-hidden whitespace-nowrap"
                        style={{
                            left: textInput.x,
                            top: textInput.y,
                            color: color,
                            fontSize: `${Math.max(16, strokeWidth * 3) * camera.zoom}px`,
                            transform: 'translateY(-2px)',
                            fontFamily: 'sans-serif',
                            minWidth: '200px'
                        }}
                        placeholder="Type here..."
                    />
                )}
                
                <div className="absolute bottom-6 right-6 bg-zinc-800/80 backdrop-blur border border-zinc-700 px-3 py-1.5 rounded-full text-xs text-zinc-300 pointer-events-none font-medium shadow-lg">
                    {Math.round(camera.zoom * 100)}%
                </div>
            </main>
        </div>
    );
}
