import React, { useRef, useEffect, useState, useCallback } from 'react';
import { 
  AnnotationStroke, 
  StrokePoint, 
  ToolType, 
  EditorialCategory, 
  EditorialStatus,
  StabilizationLevel,
  StylusDiagnostics
} from '../types/document';
import { Check, Edit3, Trash2, Tag } from 'lucide-react';

interface WacomAnnotationCanvasProps {
  pageIndex: number;
  width: number;
  height: number;
  strokes: AnnotationStroke[];
  onAddStroke: (stroke: AnnotationStroke) => void;
  onUpdateStroke: (stroke: AnnotationStroke) => void;
  onDeleteStroke: (strokeId: string) => void;
  activeTool: ToolType;
  currentColor: string;
  currentWidth: number;
  currentOpacity: number;
  currentIdPrefix: string;
  nextIdNumber: number;
  onIncrementIdNumber: () => void;
  palmRejection: boolean;
  stabilizationLevel?: StabilizationLevel;
  onStylusEvent?: (diagnostics: StylusDiagnostics) => void;
  selectedStrokeId: string | null;
  onSelectStroke: (strokeId: string | null) => void;
}

export const WacomAnnotationCanvas: React.FC<WacomAnnotationCanvasProps> = ({
  pageIndex,
  width,
  height,
  strokes,
  onAddStroke,
  onUpdateStroke,
  onDeleteStroke,
  activeTool,
  currentColor,
  currentWidth,
  currentOpacity,
  currentIdPrefix,
  nextIdNumber,
  onIncrementIdNumber,
  palmRejection,
  stabilizationLevel = 'caligrafico',
  onStylusEvent,
  selectedStrokeId,
  onSelectStroke
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);
  const currentPointsRef = useRef<StrokePoint[]>([]);
  const lastStabilizedRef = useRef<{ x: number; y: number; pressure: number } | null>(null);

  const [activeEditingStroke, setActiveEditingStroke] = useState<AnnotationStroke | null>(null);
  const [popoverPos, setPopoverPos] = useState<{ x: number; y: number } | null>(null);

  // Redraw canvas with all existing strokes and current in-progress points
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI
    const dpr = window.devicePixelRatio || 1;
    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    }

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    // Draw completed strokes
    strokes.forEach(stroke => {
      drawSingleStroke(ctx, stroke, stroke.id === selectedStrokeId);
    });

    // Draw in-progress stroke if any
    if (isDrawingRef.current && currentPointsRef.current.length > 0) {
      const tempStroke: AnnotationStroke = {
        id: 'in-progress',
        markId: `${currentIdPrefix}-${String(nextIdNumber).padStart(2, '0')}`,
        pageIndex,
        tool: activeTool,
        color: currentColor,
        baseWidth: currentWidth,
        opacity: currentOpacity,
        points: currentPointsRef.current,
        bbox: calculateBoundingBox(currentPointsRef.current),
        createdAt: Date.now(),
        author: 'Revisor',
        comment: '',
        category: 'correccion',
        status: 'pendiente'
      };
      drawSingleStroke(ctx, tempStroke, false);
    }

    ctx.restore();
  }, [width, height, strokes, selectedStrokeId, activeTool, currentColor, currentWidth, currentOpacity, currentIdPrefix, nextIdNumber, pageIndex]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  // Pointer Down (Wacom / Stylus / Mouse)
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    // Palm Rejection: if palm rejection is on and a finger touch is registered, ignore
    if (palmRejection && e.pointerType === 'touch') {
      return;
    }

    e.currentTarget.setPointerCapture(e.pointerId);

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    let pressure = e.pressure;
    if (e.pointerType === 'mouse' && (pressure === 0 || pressure === 0.5)) {
      pressure = 0.5;
    }

    const isPhysicalEraser = (e.pointerType === 'pen' && (e.buttons === 32 || (e as any).button === 5));

    if (onStylusEvent) {
      onStylusEvent({
        pointerType: e.pointerType,
        pressure,
        tiltX: e.tiltX || 0,
        tiltY: e.tiltY || 0,
        buttons: e.buttons,
        isEraser: isPhysicalEraser || activeTool === 'eraser',
        palmRejection,
        sampleRateHz: e.pointerType === 'pen' ? 240 : 60
      });
    }

    // Check if clicked near an existing stroke badge or stroke for selection
    if (activeTool !== 'eraser' && !isPhysicalEraser) {
      const clickedStroke = findStrokeNearPoint(x, y, strokes);
      if (clickedStroke && !e.shiftKey) {
        onSelectStroke(clickedStroke.id);
        setActiveEditingStroke(clickedStroke);
        setPopoverPos({ 
          x: Math.min(x, width - 320), 
          y: Math.min(y + 15, height - 260) 
        });
        return;
      }
    }

    // Eraser Tool handling
    if (activeTool === 'eraser' || isPhysicalEraser) {
      const targetStroke = findStrokeNearPoint(x, y, strokes, 18);
      if (targetStroke) {
        onDeleteStroke(targetStroke.id);
        if (selectedStrokeId === targetStroke.id) {
          onSelectStroke(null);
          setActiveEditingStroke(null);
        }
      }
      return;
    }

    // Start new stroke
    isDrawingRef.current = true;
    lastStabilizedRef.current = { x, y, pressure };
    currentPointsRef.current = [
      {
        x,
        y,
        pressure,
        tiltX: e.tiltX,
        tiltY: e.tiltY,
        time: performance.now()
      }
    ];

    renderCanvas();
  };

  // Pointer Move (Wacom with Coalesced Events & Calligraphic Smoothing)
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (palmRejection && e.pointerType === 'touch') return;

    // Extract all high-frequency coalesced sub-events emitted by Wacom driver
    const coalescedEvents = (e.nativeEvent && typeof (e.nativeEvent as any).getCoalescedEvents === 'function')
      ? (e.nativeEvent as any).getCoalescedEvents()
      : [e];

    const isPhysicalEraser = (e.pointerType === 'pen' && (e.buttons === 32 || (e as any).button === 5));

    // Eraser drag mode
    if ((activeTool === 'eraser' || isPhysicalEraser) && e.buttons === 1) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const targetStroke = findStrokeNearPoint(x, y, strokes, 18);
      if (targetStroke) {
        onDeleteStroke(targetStroke.id);
      }
      return;
    }

    if (!isDrawingRef.current) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const alpha = getStabilizationAlpha(stabilizationLevel);

    for (let i = 0; i < coalescedEvents.length; i++) {
      const cev = coalescedEvents[i];
      const rawX = cev.clientX - rect.left;
      const rawY = cev.clientY - rect.top;
      let rawPressure = cev.pressure;
      if (cev.pointerType === 'mouse' && (rawPressure === 0 || rawPressure === 0.5)) {
        rawPressure = 0.5;
      }

      // Streamline dynamic calligraphic smoothing filter
      const last = lastStabilizedRef.current || { x: rawX, y: rawY, pressure: rawPressure };
      const stabilizedX = last.x + (rawX - last.x) * alpha;
      const stabilizedY = last.y + (rawY - last.y) * alpha;
      const stabilizedPressure = last.pressure + (rawPressure - last.pressure) * (alpha * 1.2);

      lastStabilizedRef.current = { 
        x: stabilizedX, 
        y: stabilizedY, 
        pressure: Math.min(1.0, Math.max(0.01, stabilizedPressure)) 
      };

      // Push only if there is meaningful movement to save memory and avoid clusters
      const pts = currentPointsRef.current;
      const prevPt = pts[pts.length - 1];
      const distSq = prevPt ? (stabilizedX - prevPt.x) ** 2 + (stabilizedY - prevPt.y) ** 2 : 100;

      if (distSq >= 1.2) {
        currentPointsRef.current.push({
          x: stabilizedX,
          y: stabilizedY,
          pressure: stabilizedPressure,
          tiltX: cev.tiltX,
          tiltY: cev.tiltY,
          time: performance.now()
        });
      }
    }

    // Telemetry
    if (onStylusEvent) {
      const lastPt = currentPointsRef.current[currentPointsRef.current.length - 1];
      onStylusEvent({
        pointerType: e.pointerType,
        pressure: lastPt ? lastPt.pressure : e.pressure,
        tiltX: e.tiltX || 0,
        tiltY: e.tiltY || 0,
        buttons: e.buttons,
        isEraser: isPhysicalEraser || activeTool === 'eraser',
        palmRejection,
        sampleRateHz: e.pointerType === 'pen' ? 240 : 60
      });
    }

    renderCanvas();
  };

  // Pointer Up (Finalize stroke and attach identifier)
  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    lastStabilizedRef.current = null;

    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }

    const pts = currentPointsRef.current;
    if (pts.length < 2) {
      currentPointsRef.current = [];
      renderCanvas();
      return;
    }

    // Smooth final points with Catmull-Rom resampling for perfect permanent curves
    const smoothedPoints = resampleAndSmoothPoints(pts, stabilizationLevel);
    const bbox = calculateBoundingBox(smoothedPoints);
    const markId = `${currentIdPrefix}-${String(nextIdNumber).padStart(2, '0')}`;
    const newStrokeId = `stroke-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

    const marginCalloutX = Math.min(width - 40, bbox.maxX + 35);
    const marginCalloutY = (bbox.minY + bbox.maxY) / 2;

    const newStroke: AnnotationStroke = {
      id: newStrokeId,
      markId,
      pageIndex,
      tool: activeTool,
      color: currentColor,
      baseWidth: currentWidth,
      opacity: currentOpacity,
      points: smoothedPoints,
      bbox,
      createdAt: Date.now(),
      author: 'Revisor Wacom',
      title: getDefaultTitleForTool(activeTool),
      comment: '',
      category: activeTool === 'bracket' ? 'estilo' : activeTool === 'highlighter' ? 'fuente' : 'correccion',
      status: 'pendiente',
      marginCalloutX,
      marginCalloutY
    };

    onAddStroke(newStroke);
    onIncrementIdNumber();
    onSelectStroke(newStrokeId);

    setActiveEditingStroke(newStroke);
    setPopoverPos({
      x: Math.min(bbox.maxX + 10, width - 330),
      y: Math.max(10, Math.min(bbox.minY, height - 280))
    });

    currentPointsRef.current = [];
    renderCanvas();
  };

  const handlePointerCancel = () => {
    isDrawingRef.current = false;
    currentPointsRef.current = [];
    lastStabilizedRef.current = null;
    renderCanvas();
  };

  return (
    <div className="relative w-full h-full select-none">
      <canvas
        ref={canvasRef}
        className="drawing-canvas absolute inset-0 z-20 cursor-crosshair w-full h-full pointer-events-auto"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
      />

      {/* Interactive Mark Badges [ED-01] on the canvas layer */}
      {strokes.map(stroke => {
        const isSelected = stroke.id === selectedStrokeId;
        const badgeX = Math.min(width - 70, Math.max(10, stroke.bbox.maxX - 10));
        const badgeY = Math.max(12, stroke.bbox.minY - 14);

        return (
          <div
            key={`badge-${stroke.id}`}
            style={{ left: `${badgeX}px`, top: `${badgeY}px` }}
            className={`absolute z-30 transition-transform ${
              isSelected ? 'scale-110 z-40' : 'hover:scale-105'
            }`}
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelectStroke(stroke.id);
                setActiveEditingStroke(stroke);
                setPopoverPos({
                  x: Math.min(badgeX, width - 330),
                  y: Math.min(badgeY + 24, height - 280)
                });
              }}
              style={{
                borderColor: stroke.color,
                color: stroke.color,
                backgroundColor: isSelected ? '#FFFFFF' : 'rgba(255, 255, 255, 0.94)'
              }}
              className={`px-1.5 py-0.5 text-[10px] font-mono font-bold tracking-tight rounded border shadow-sm flex items-center gap-1 backdrop-blur-xs cursor-pointer ${
                isSelected ? 'ring-2 ring-stone-900 shadow-md' : 'opacity-90 hover:opacity-100'
              }`}
            >
              <Tag className="w-2.5 h-2.5" />
              <span>{stroke.markId}</span>
              {stroke.status === 'resuelto' && (
                <Check className="w-2.5 h-2.5 text-emerald-600" />
              )}
            </button>
          </div>
        );
      })}

      {/* Margin Editorial Popover Card */}
      {activeEditingStroke && popoverPos && (
        <div
          style={{
            left: `${popoverPos.x}px`,
            top: `${popoverPos.y}px`
          }}
          className="absolute z-50 w-80 bg-white border border-stone-300 rounded-lg shadow-xl p-3.5 text-stone-900 animate-in fade-in zoom-in-95 duration-150"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-stone-200 pb-2 mb-2.5">
            <div className="flex items-center gap-2">
              <span 
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: activeEditingStroke.color }}
              />
              <span className="font-mono font-bold text-xs bg-stone-100 px-1.5 py-0.5 rounded text-stone-800">
                {activeEditingStroke.markId}
              </span>
              <span className="text-xs text-stone-500">
                Pág. {activeEditingStroke.pageIndex + 1}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                title="Eliminar marca"
                onClick={() => {
                  onDeleteStroke(activeEditingStroke.id);
                  setActiveEditingStroke(null);
                  onSelectStroke(null);
                }}
                className="p-1 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setActiveEditingStroke(null)}
                className="p-1 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded transition-colors text-xs font-bold"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Title */}
          <div className="mb-2">
            <input
              type="text"
              value={activeEditingStroke.title || ''}
              onChange={(e) => {
                const updated = { ...activeEditingStroke, title: e.target.value };
                setActiveEditingStroke(updated);
                onUpdateStroke(updated);
              }}
              placeholder="Asunto o motivo de la marca..."
              className="w-full text-xs font-semibold text-stone-900 border border-stone-200 rounded px-2 py-1 focus:outline-none focus:border-stone-500"
            />
          </div>

          {/* Comment Body */}
          <div className="mb-2.5">
            <textarea
              rows={3}
              value={activeEditingStroke.comment}
              onChange={(e) => {
                const updated = { ...activeEditingStroke, comment: e.target.value };
                setActiveEditingStroke(updated);
                onUpdateStroke(updated);
              }}
              placeholder="Escribe la observación editorial o nota al autor..."
              className="w-full text-xs text-stone-700 border border-stone-200 rounded p-2 focus:outline-none focus:border-stone-500 resize-none leading-relaxed"
            />
          </div>

          {/* Category & Status Selector */}
          <div className="grid grid-cols-2 gap-2 mb-2 text-xs">
            <div>
              <label className="block text-[10px] uppercase font-bold text-stone-400 mb-1">
                Categoría
              </label>
              <select
                value={activeEditingStroke.category}
                onChange={(e) => {
                  const updated = { 
                    ...activeEditingStroke, 
                    category: e.target.value as EditorialCategory 
                  };
                  setActiveEditingStroke(updated);
                  onUpdateStroke(updated);
                }}
                className="w-full text-xs bg-stone-50 border border-stone-200 rounded px-1.5 py-1 text-stone-800 focus:outline-none"
              >
                <option value="correccion">Corrección de texto</option>
                <option value="estilo">Mejora de estilo</option>
                <option value="fuente">Verificar fuente / cita</option>
                <option value="duda">Duda al autor</option>
                <option value="aprobado">Aprobado / Visto bueno</option>
                <option value="reescribir">Reescribir pasaje</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-stone-400 mb-1">
                Estado
              </label>
              <select
                value={activeEditingStroke.status}
                onChange={(e) => {
                  const updated = { 
                    ...activeEditingStroke, 
                    status: e.target.value as EditorialStatus 
                  };
                  setActiveEditingStroke(updated);
                  onUpdateStroke(updated);
                }}
                className="w-full text-xs bg-stone-50 border border-stone-200 rounded px-1.5 py-1 text-stone-800 focus:outline-none"
              >
                <option value="pendiente">Pendiente</option>
                <option value="en_revision">En revisión</option>
                <option value="resuelto">Resuelto ✓</option>
              </select>
            </div>
          </div>

          {/* Footer Metadata */}
          <div className="flex items-center justify-between text-[10px] text-stone-400 pt-1.5 border-t border-stone-100">
            <span>{activeEditingStroke.author || 'Revisor'}</span>
            <button
              type="button"
              onClick={() => setActiveEditingStroke(null)}
              className="text-xs text-stone-800 font-medium hover:underline"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Mathematical Helpers: Catmull-Rom Splines and Calligraphic Smoothing ---

function getStabilizationAlpha(level: StabilizationLevel): number {
  switch (level) {
    case 'caligrafico':
      return 0.32; // Ultra-smooth spring damping, completely eliminates polygonal straight lines
    case 'equilibrado':
      return 0.58; // Balanced natural handwriting
    case 'natural':
    default:
      return 0.82; // Fast, direct
  }
}

function calculateBoundingBox(points: StrokePoint[]) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  points.forEach(p => {
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
  });

  return {
    minX: minX === Infinity ? 0 : minX,
    minY: minY === Infinity ? 0 : minY,
    maxX: maxX === -Infinity ? 0 : maxX,
    maxY: maxY === -Infinity ? 0 : maxY
  };
}

function findStrokeNearPoint(
  x: number, 
  y: number, 
  strokes: AnnotationStroke[], 
  tolerance = 16
): AnnotationStroke | null {
  for (let i = strokes.length - 1; i >= 0; i--) {
    const s = strokes[i];
    if (
      x >= s.bbox.minX - tolerance &&
      x <= s.bbox.maxX + tolerance &&
      y >= s.bbox.minY - tolerance &&
      y <= s.bbox.maxY + tolerance
    ) {
      for (const p of s.points) {
        const dx = p.x - x;
        const dy = p.y - y;
        if (dx * dx + dy * dy <= tolerance * tolerance) {
          return s;
        }
      }
    }
  }
  return null;
}

function getDefaultTitleForTool(tool: ToolType): string {
  switch (tool) {
    case 'pen':
      return 'Corrección a pluma';
    case 'highlighter':
      return 'Pasaje resaltado';
    case 'bracket':
      return 'Corchete de párrafo';
    case 'callout':
      return 'Llamada al margen';
    case 'strikeout':
      return 'Tachado editorial';
    case 'circle':
      return 'Foco de atención';
    default:
      return 'Anotación editorial';
  }
}

/**
 * Resamples and smooths points using Catmull-Rom interpolation
 * so finished strokes retain fluid curvature and continuous width.
 */
function resampleAndSmoothPoints(
  rawPoints: StrokePoint[], 
  level: StabilizationLevel
): StrokePoint[] {
  if (rawPoints.length < 3) return rawPoints;

  const result: StrokePoint[] = [];
  result.push(rawPoints[0]);

  // Catmull-Rom subdivision for fluid curvature
  const steps = level === 'caligrafico' ? 4 : 2;

  for (let i = 0; i < rawPoints.length - 1; i++) {
    const p0 = i > 0 ? rawPoints[i - 1] : rawPoints[i];
    const p1 = rawPoints[i];
    const p2 = rawPoints[i + 1];
    const p3 = i < rawPoints.length - 2 ? rawPoints[i + 2] : p2;

    for (let t = 1; t <= steps; t++) {
      const u = t / steps;
      const u2 = u * u;
      const u3 = u2 * u;

      // Catmull-Rom formula
      const x = 0.5 * (
        (2 * p1.x) +
        (-p0.x + p2.x) * u +
        (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * u2 +
        (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * u3
      );

      const y = 0.5 * (
        (2 * p1.y) +
        (-p0.y + p2.y) * u +
        (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * u2 +
        (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * u3
      );

      const pressure = p1.pressure + (p2.pressure - p1.pressure) * u;

      result.push({
        x,
        y,
        pressure,
        time: p1.time
      });
    }
  }

  return result;
}

/**
 * Draws a single stroke onto the 2D canvas with Catmull-Rom to Cubic Bezier
 * spline conversion and Wacom pressure dynamics, eliminating straight lines.
 */
function drawSingleStroke(
  ctx: CanvasRenderingContext2D, 
  stroke: AnnotationStroke,
  isSelected: boolean
) {
  const pts = stroke.points;
  if (!pts || pts.length === 0) return;

  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if (stroke.tool === 'highlighter') {
    // Highlighter mode: translucent flat chisel stroke with smooth curves
    ctx.globalAlpha = stroke.opacity || 0.45;
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.baseWidth || 22;

    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);

    if (pts.length === 2) {
      ctx.lineTo(pts[1].x, pts[1].y);
    } else {
      for (let i = 0; i < pts.length - 1; i++) {
        const xc = (pts[i].x + pts[i + 1].x) / 2;
        const yc = (pts[i].y + pts[i + 1].y) / 2;
        ctx.quadraticCurveTo(pts[i].x, pts[i].y, xc, yc);
      }
      ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
    }
    ctx.stroke();

  } else if (stroke.tool === 'bracket') {
    // Marginal bracket [
    ctx.globalAlpha = stroke.opacity || 0.9;
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.baseWidth || 3;

    const minY = stroke.bbox.minY;
    const maxY = stroke.bbox.maxY;
    const leftX = stroke.bbox.minX;
    const capWidth = 14;

    ctx.beginPath();
    ctx.moveTo(leftX + capWidth, minY);
    ctx.lineTo(leftX, minY);
    ctx.lineTo(leftX, maxY);
    ctx.lineTo(leftX + capWidth, maxY);
    ctx.stroke();

  } else if (stroke.tool === 'strikeout') {
    // Horizontal strikeout
    ctx.globalAlpha = 0.9;
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = 2.5;

    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
    ctx.stroke();

  } else if (stroke.tool === 'circle') {
    // Review ellipse around points
    ctx.globalAlpha = 0.9;
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.baseWidth || 3;

    const cx = (stroke.bbox.minX + stroke.bbox.maxX) / 2;
    const cy = (stroke.bbox.minY + stroke.bbox.maxY) / 2;
    const rx = Math.max(12, (stroke.bbox.maxX - stroke.bbox.minX) / 2 + 6);
    const ry = Math.max(12, (stroke.bbox.maxY - stroke.bbox.minY) / 2 + 6);

    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.stroke();

  } else {
    // Standard Pen with Wacom continuous pressure dynamics and smooth curvature:
    ctx.globalAlpha = stroke.opacity || 0.95;
    ctx.fillStyle = stroke.color;
    ctx.strokeStyle = stroke.color;

    if (pts.length === 1) {
      const p = pts[0];
      const r = (stroke.baseWidth * (0.3 + 1.4 * Math.pow(p.pressure, 1.2))) / 2;
      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(1, r), 0, Math.PI * 2);
      ctx.fill();
    } else if (pts.length === 2) {
      const avgPressure = (pts[0].pressure + pts[1].pressure) / 2;
      ctx.lineWidth = Math.max(1, stroke.baseWidth * (0.3 + 1.4 * Math.pow(avgPressure, 1.2)));
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      ctx.lineTo(pts[1].x, pts[1].y);
      ctx.stroke();
    } else {
      // Catmull-Rom to Cubic Bezier continuous spline
      for (let i = 0; i < pts.length - 1; i++) {
        const p0 = i > 0 ? pts[i - 1] : pts[i];
        const p1 = pts[i];
        const p2 = pts[i + 1];
        const p3 = i < pts.length - 2 ? pts[i + 2] : p2;

        const avgPressure = (p1.pressure + p2.pressure) / 2;
        ctx.lineWidth = Math.max(
          1,
          stroke.baseWidth * (0.3 + 1.4 * Math.pow(avgPressure, 1.2))
        );

        // Control points derived from Catmull-Rom tangents for C1 continuity
        const cp1x = p1.x + (p2.x - p0.x) / 6;
        const cp1y = p1.y + (p2.y - p0.y) / 6;
        const cp2x = p2.x - (p3.x - p1.x) / 6;
        const cp2y = p2.y - (p3.y - p1.y) / 6;

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
        ctx.stroke();
      }
    }
  }

  // Draw selection highlight if active
  if (isSelected) {
    ctx.strokeStyle = '#2563EB';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    const pad = 6;
    ctx.strokeRect(
      stroke.bbox.minX - pad,
      stroke.bbox.minY - pad,
      stroke.bbox.maxX - stroke.bbox.minX + pad * 2,
      stroke.bbox.maxY - stroke.bbox.minY + pad * 2
    );
    ctx.setLineDash([]);
  }

  ctx.restore();
}
