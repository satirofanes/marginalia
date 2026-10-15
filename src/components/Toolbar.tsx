import React from 'react';
import { 
  ToolType, 
  DocumentModel, 
  StylusDiagnostics,
  StabilizationLevel
} from '../types/document';
import { 
  PenTool, 
  Highlighter, 
  Eraser, 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  Upload, 
  Layers, 
  Terminal, 
  Undo2, 
  Redo2, 
  FileText,
  ShieldCheck,
  Tag,
  Circle,
  SplitSquareVertical,
  Minus,
  Sparkles,
  ExternalLink,
  Maximize2
} from 'lucide-react';

interface ToolbarProps {
  currentDocument: DocumentModel;
  documents: DocumentModel[];
  onSelectDocument: (docId: string) => void;
  onUploadFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
  currentPageIndex: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
  zoomScale: number;
  onZoomChange: (newZoom: number) => void;
  activeTool: ToolType;
  onSelectTool: (tool: ToolType) => void;
  currentColor: string;
  onSelectColor: (color: string) => void;
  currentWidth: number;
  onSelectWidth: (width: number) => void;
  currentIdPrefix: string;
  onChangeIdPrefix: (prefix: string) => void;
  nextIdNumber: number;
  palmRejection: boolean;
  onTogglePalmRejection: () => void;
  stabilizationLevel: StabilizationLevel;
  onChangeStabilizationLevel: (level: StabilizationLevel) => void;
  stylusDiagnostics: StylusDiagnostics | null;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onOpenPythonModal: () => void;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

const EDITORIAL_COLORS = [
  { hex: '#DC2626', name: 'Rojo Corrección' },
  { hex: '#1E3A8A', name: 'Azul Estilográfica' },
  { hex: '#18181B', name: 'Negro Tinta' },
  { hex: '#15803D', name: 'Verde Revisor' },
  { hex: '#FEF08A', name: 'Amarillo Marcatextos' },
  { hex: '#D97706', name: 'Ámbar Glosa' },
  { hex: '#7E22CE', name: 'Púrpura Editorial' },
];

const ID_PREFIXES = ['ED', 'CORR', 'REF', 'GLOSA', 'NOTA', 'REV'];

export const Toolbar: React.FC<ToolbarProps> = ({
  currentDocument,
  documents,
  onSelectDocument,
  onUploadFile,
  currentPageIndex,
  totalPages,
  onPageChange,
  zoomScale,
  onZoomChange,
  activeTool,
  onSelectTool,
  currentColor,
  onSelectColor,
  currentWidth,
  onSelectWidth,
  currentIdPrefix,
  onChangeIdPrefix,
  nextIdNumber,
  palmRejection,
  onTogglePalmRejection,
  stabilizationLevel,
  onChangeStabilizationLevel,
  stylusDiagnostics,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onOpenPythonModal,
  isSidebarOpen,
  onToggleSidebar
}) => {
  return (
    <header className="w-full bg-white border-b border-stone-200 select-none z-30 shrink-0">
      {/* Level 1: 3-Zone Top Navigation Contract */}
      <div className="flex items-center justify-between gap-8 px-6 py-2.5 border-b border-stone-200/80">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded bg-stone-900 text-amber-100 flex items-center justify-center font-serif-display font-bold text-lg shadow-xs">
            M
          </div>
          <span className="text-base font-serif-display font-bold tracking-tight text-stone-900 whitespace-nowrap">
            Marginalia Studio
          </span>
          <span className="text-[11px] font-mono text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded ml-1">
            Wacom Edition
          </span>
        </div>

        {/* Zone 2: Navigation Links & Active Document Selector */}
        <nav className="hidden lg:flex items-center gap-6 text-xs font-medium text-stone-600">
          <div className="flex items-center gap-2">
            <span className="text-stone-400">Documento:</span>
            <select
              value={currentDocument.id}
              onChange={(e) => onSelectDocument(e.target.value)}
              className="bg-stone-50 border border-stone-200 text-stone-900 font-semibold px-2.5 py-1 rounded max-w-xs truncate focus:outline-none focus:border-stone-400 text-xs"
            >
              {documents.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.title} ({doc.format.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          <label className="cursor-pointer hover:text-stone-900 transition-colors flex items-center gap-1.5 whitespace-nowrap">
            <Upload className="w-3.5 h-3.5 text-stone-500" />
            <span>Abrir archivo (PDF, Word, Excel, ePub, TXT)</span>
            <input
              type="file"
              accept=".pdf,.docx,.xlsx,.xls,.csv,.epub,.txt,.md,.rtf,.png,.jpg,.jpeg"
              onChange={onUploadFile}
              className="hidden"
            />
          </label>

          <button
            type="button"
            onClick={onToggleSidebar}
            className={`hover:text-stone-900 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              isSidebarOpen ? 'text-stone-900 font-bold' : ''
            }`}
          >
            <Tag className="w-3.5 h-3.5 text-stone-500" />
            <span>Índice de Marcas</span>
          </button>
        </nav>

        {/* Zone 3: Primary Actions (Independent Window, Fullscreen & .EXE) */}
        <div className="flex items-center gap-2 shrink-0">
          <a
            href="https://ais-dev-hp3qqah3o23i2sso6cysps-138956041445.us-east1.run.app"
            target="_blank"
            rel="noopener noreferrer"
            title="Abrir en ventana independiente fuera del marco para máxima aceleración y fluidez del stylus"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-700 bg-stone-100 border border-stone-200 rounded hover:bg-stone-200 hover:text-stone-900 transition-colors shadow-2xs whitespace-nowrap"
          >
            <ExternalLink className="w-3.5 h-3.5 text-stone-600" />
            <span>Ventana Independiente</span>
          </a>

          <button
            type="button"
            title="Alternar Pantalla Completa"
            onClick={() => {
              if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(() => {});
              } else {
                document.exitFullscreen().catch(() => {});
              }
            }}
            className="p-1.5 text-stone-600 bg-stone-100 border border-stone-200 rounded hover:bg-stone-200 transition-colors"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={onOpenPythonModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-stone-900 rounded hover:bg-stone-800 transition-colors shadow-2xs whitespace-nowrap"
          >
            <Terminal className="w-3.5 h-3.5 text-amber-300" />
            <span>Compilar .EXE / Python</span>
          </button>
        </div>
      </div>

      {/* Level 2: Wacom Instrument & Editorial Marking Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-2 bg-stone-50 text-xs">
        {/* Stylus Tools Selection */}
        <div className="flex items-center gap-1 bg-white border border-stone-200 rounded p-1 shadow-2xs">
          <button
            type="button"
            title="Pluma de Tinta Editorial (sensible a la presión Wacom)"
            onClick={() => {
              onSelectTool('pen');
              if (currentWidth > 8) onSelectWidth(3.0);
            }}
            className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors ${
              activeTool === 'pen'
                ? 'bg-stone-900 text-white font-medium'
                : 'text-stone-700 hover:bg-stone-100'
            }`}
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>Pluma</span>
          </button>

          <button
            type="button"
            title="Marcatextos / Subrayador Translúcido"
            onClick={() => {
              onSelectTool('highlighter');
              onSelectColor('#FEF08A');
              onSelectWidth(22);
            }}
            className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors ${
              activeTool === 'highlighter'
                ? 'bg-amber-400 text-stone-900 font-semibold'
                : 'text-stone-700 hover:bg-stone-100'
            }`}
          >
            <Highlighter className="w-3.5 h-3.5" />
            <span>Resaltador</span>
          </button>

          <button
            type="button"
            title="Corchete de Párrafo Marginal"
            onClick={() => onSelectTool('bracket')}
            className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
              activeTool === 'bracket'
                ? 'bg-stone-900 text-white font-medium'
                : 'text-stone-700 hover:bg-stone-100'
            }`}
          >
            <span className="font-mono font-bold text-sm leading-none">[</span>
            <span>Corchete</span>
          </button>

          <button
            type="button"
            title="Tachado Editorial"
            onClick={() => onSelectTool('strikeout')}
            className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
              activeTool === 'strikeout'
                ? 'bg-stone-900 text-white font-medium'
                : 'text-stone-700 hover:bg-stone-100'
            }`}
          >
            <Minus className="w-3.5 h-3.5" />
            <span>Tachado</span>
          </button>

          <button
            type="button"
            title="Círculo de Atención"
            onClick={() => onSelectTool('circle')}
            className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
              activeTool === 'circle'
                ? 'bg-stone-900 text-white font-medium'
                : 'text-stone-700 hover:bg-stone-100'
            }`}
          >
            <Circle className="w-3.5 h-3.5" />
            <span>Círculo</span>
          </button>

          <button
            type="button"
            title="Borrador (soporta botón invertido del lápiz Wacom)"
            onClick={() => onSelectTool('eraser')}
            className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
              activeTool === 'eraser'
                ? 'bg-red-600 text-white font-medium'
                : 'text-stone-700 hover:bg-stone-100'
            }`}
          >
            <Eraser className="w-3.5 h-3.5" />
            <span>Borrador</span>
          </button>
        </div>

        {/* Color Palette */}
        <div className="flex items-center gap-1.5 bg-white border border-stone-200 rounded px-2.5 py-1 shadow-2xs">
          <span className="text-[10px] text-stone-400 uppercase font-semibold mr-1">
            Tinta
          </span>
          {EDITORIAL_COLORS.map((c) => (
            <button
              key={c.hex}
              type="button"
              title={c.name}
              onClick={() => onSelectColor(c.hex)}
              className={`w-5 h-5 rounded-full border transition-transform ${
                currentColor === c.hex
                  ? 'scale-115 border-stone-900 ring-2 ring-stone-400 ring-offset-1'
                  : 'border-stone-300 hover:scale-105'
              }`}
              style={{ backgroundColor: c.hex }}
            />
          ))}
        </div>

        {/* Line Width Presets */}
        <div className="flex items-center gap-1 bg-white border border-stone-200 rounded px-2.5 py-1 shadow-2xs">
          <span className="text-[10px] text-stone-400 uppercase font-semibold mr-1">
            Grosor
          </span>
          {[1.5, 3.0, 5.0, 8.0].map((w) => (
            <button
              key={w}
              type="button"
              onClick={() => onSelectWidth(w)}
              className={`px-1.5 py-0.5 rounded text-[11px] font-mono transition-colors ${
                currentWidth === w
                  ? 'bg-stone-900 text-white font-bold'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              {w}pt
            </button>
          ))}
        </div>

        {/* Mark Identifier Prefix Selector */}
        <div className="flex items-center gap-1.5 bg-white border border-stone-200 rounded px-2.5 py-1 shadow-2xs">
          <Tag className="w-3.5 h-3.5 text-stone-500" />
          <span className="text-[10px] text-stone-400 uppercase font-semibold">
            Próximo ID:
          </span>
          <select
            value={currentIdPrefix}
            onChange={(e) => onChangeIdPrefix(e.target.value)}
            className="text-xs font-mono font-bold text-stone-900 bg-transparent border-none focus:outline-none"
          >
            {ID_PREFIXES.map((prefix) => (
              <option key={prefix} value={prefix}>
                {prefix}
              </option>
            ))}
          </select>
          <span className="font-mono text-xs font-bold text-stone-900 bg-stone-100 px-1 py-0.5 rounded">
            -{String(nextIdNumber).padStart(2, '0')}
          </span>
        </div>

        {/* Palm Rejection Toggle */}
        <button
          type="button"
          onClick={onTogglePalmRejection}
          className={`flex items-center gap-1 px-2.5 py-1 rounded border shadow-2xs transition-colors ${
            palmRejection
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-100'
          }`}
          title="Rechazo de Palma: Bloquea toques táctiles accidentales mientras se usa el estilete"
        >
          <ShieldCheck className={`w-3.5 h-3.5 ${palmRejection ? 'text-emerald-600' : 'text-stone-400'}`} />
          <span className="text-xs font-medium">Rechazo Palma</span>
          <span className="text-[10px] font-mono font-bold ml-0.5">
            {palmRejection ? 'ON' : 'OFF'}
          </span>
        </button>

        {/* Wacom Calligraphic Smoothing Selector */}
        <div 
          className="flex items-center gap-1.5 bg-white border border-stone-200 rounded px-2.5 py-1 shadow-2xs"
          title="Estabilizador de trazo para tabletas Wacom: elimina aristas rectas y suaviza curvas con interpolación Catmull-Rom"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span className="text-[10px] text-stone-400 uppercase font-semibold">
            Suavizado:
          </span>
          <select
            value={stabilizationLevel}
            onChange={(e) => onChangeStabilizationLevel(e.target.value as StabilizationLevel)}
            className="text-xs font-semibold text-stone-900 bg-transparent border-none focus:outline-none cursor-pointer"
          >
            <option value="caligrafico">Caligráfico (Ultra-suave)</option>
            <option value="equilibrado">Equilibrado</option>
            <option value="natural">Natural (Directo)</option>
          </select>
        </div>

        {/* Undo / Redo */}
        <div className="flex items-center gap-1 bg-white border border-stone-200 rounded p-1 shadow-2xs">
          <button
            type="button"
            title="Deshacer trazo (Ctrl+Z)"
            disabled={!canUndo}
            onClick={onUndo}
            className={`p-1 rounded transition-colors ${
              canUndo ? 'text-stone-700 hover:bg-stone-100' : 'text-stone-300 cursor-not-allowed'
            }`}
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            title="Rehacer trazo (Ctrl+Y)"
            disabled={!canRedo}
            onClick={onRedo}
            className={`p-1 rounded transition-colors ${
              canRedo ? 'text-stone-700 hover:bg-stone-100' : 'text-stone-300 cursor-not-allowed'
            }`}
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Page Navigation & Zoom */}
        <div className="flex items-center gap-2">
          {/* Pagination */}
          <div className="flex items-center gap-1 bg-white border border-stone-200 rounded px-1.5 py-1 shadow-2xs">
            <button
              type="button"
              disabled={currentPageIndex <= 0}
              onClick={() => onPageChange(currentPageIndex - 1)}
              className={`p-1 rounded ${
                currentPageIndex > 0 ? 'text-stone-700 hover:bg-stone-100' : 'text-stone-300'
              }`}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono text-xs px-1 text-stone-700 tabular-nums">
              {currentPageIndex + 1} / {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPageIndex >= totalPages - 1}
              onClick={() => onPageChange(currentPageIndex + 1)}
              className={`p-1 rounded ${
                currentPageIndex < totalPages - 1 ? 'text-stone-700 hover:bg-stone-100' : 'text-stone-300'
              }`}
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Zoom */}
          <div className="flex items-center gap-1 bg-white border border-stone-200 rounded px-1.5 py-1 shadow-2xs">
            <button
              type="button"
              onClick={() => onZoomChange(Math.max(0.6, zoomScale - 0.1))}
              className="p-1 text-stone-600 hover:bg-stone-100 rounded"
              title="Alejar"
            >
              <ZoomOut className="w-3 h-3" />
            </button>
            <span className="font-mono text-[11px] text-stone-600 tabular-nums w-9 text-center">
              {Math.round(zoomScale * 100)}%
            </span>
            <button
              type="button"
              onClick={() => onZoomChange(Math.min(1.8, zoomScale + 0.1))}
              className="p-1 text-stone-600 hover:bg-stone-100 rounded"
              title="Acercar"
            >
              <ZoomIn className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Live Wacom Stylus Telemetry Status Pill (Subtle bottom line) */}
      <div className="px-6 py-1 bg-stone-100/90 border-t border-stone-200/60 flex items-center justify-between text-[10px] text-stone-500 font-mono">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="text-stone-400">Puntero:</span>
            <span className="text-stone-800 font-bold uppercase">
              {stylusDiagnostics?.pointerType === 'pen' ? 'Estilete Wacom / Lápiz' : stylusDiagnostics?.pointerType || 'Mouse'}
            </span>
          </div>
          <span aria-hidden="true" className="text-stone-300">·</span>
          <div className="flex items-center gap-1.5">
            <span className="text-stone-400">Presión Dinámica:</span>
            <span className="text-stone-800 font-semibold tabular-nums">
              {stylusDiagnostics ? `${Math.round((stylusDiagnostics.pressure || 0) * 100)}%` : '0%'}
            </span>
            {/* Visual pressure bar */}
            <div className="w-16 h-1.5 bg-stone-300 rounded-full overflow-hidden inline-block align-middle ml-1">
              <div 
                className="h-full bg-amber-600 transition-all duration-75"
                style={{ width: `${Math.round((stylusDiagnostics?.pressure || 0) * 100)}%` }}
              />
            </div>
          </div>
          <span aria-hidden="true" className="text-stone-300">·</span>
          <div className="flex items-center gap-1.5">
            <span className="text-stone-400">Inclinación (Tilt):</span>
            <span className="text-stone-700 tabular-nums">
              X: {stylusDiagnostics?.tiltX || 0}° · Y: {stylusDiagnostics?.tiltY || 0}°
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {stylusDiagnostics?.isEraser && (
            <span className="text-red-700 font-bold bg-red-100 px-1.5 py-0.2 rounded">
              Borrador de Estilete Activo
            </span>
          )}
          <span className="text-stone-400">
            {currentDocument.fileName} · {currentDocument.fileSize}
          </span>
        </div>
      </div>
    </header>
  );
};
