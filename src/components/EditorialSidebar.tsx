import React, { useState, useMemo } from 'react';
import { 
  AnnotationStroke, 
  EditorialCategory, 
  EditorialStatus 
} from '../types/document';
import { 
  Tag, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Search, 
  Trash2, 
  ExternalLink, 
  Download, 
  Filter,
  FileSpreadsheet,
  FileText
} from 'lucide-react';

interface EditorialSidebarProps {
  strokes: AnnotationStroke[];
  currentPageIndex: number;
  totalPages: number;
  selectedStrokeId: string | null;
  onSelectStroke: (strokeId: string | null) => void;
  onNavigateToPage: (pageIndex: number) => void;
  onUpdateStroke: (stroke: AnnotationStroke) => void;
  onDeleteStroke: (strokeId: string) => void;
  onClearAllAnnotations: () => void;
  documentTitle: string;
}

export const EditorialSidebar: React.FC<EditorialSidebarProps> = ({
  strokes,
  currentPageIndex,
  selectedStrokeId,
  onSelectStroke,
  onNavigateToPage,
  onUpdateStroke,
  onDeleteStroke,
  onClearAllAnnotations,
  documentTitle
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | EditorialStatus>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | EditorialCategory>('all');
  const [onlyCurrentPage, setOnlyCurrentPage] = useState(false);
  const [editingMarkId, setEditingMarkId] = useState<string | null>(null);
  const [tempMarkIdText, setTempMarkIdText] = useState('');

  // Filtered and sorted strokes
  const filteredStrokes = useMemo(() => {
    return strokes
      .filter(s => {
        if (onlyCurrentPage && s.pageIndex !== currentPageIndex) return false;
        if (statusFilter !== 'all' && s.status !== statusFilter) return false;
        if (categoryFilter !== 'all' && s.category !== categoryFilter) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchId = s.markId.toLowerCase().includes(q);
          const matchComment = s.comment.toLowerCase().includes(q);
          const matchTitle = (s.title || '').toLowerCase().includes(q);
          const matchCategory = s.category.toLowerCase().includes(q);
          return matchId || matchComment || matchTitle || matchCategory;
        }
        return true;
      })
      .sort((a, b) => {
        if (a.pageIndex !== b.pageIndex) return a.pageIndex - b.pageIndex;
        return a.createdAt - b.createdAt;
      });
  }, [strokes, currentPageIndex, onlyCurrentPage, statusFilter, categoryFilter, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const total = strokes.length;
    const pending = strokes.filter(s => s.status === 'pendiente').length;
    const inReview = strokes.filter(s => s.status === 'en_revision').length;
    const resolved = strokes.filter(s => s.status === 'resuelto').length;
    return { total, pending, inReview, resolved };
  }, [strokes]);

  // Jump to stroke on page
  const handleJumpToStroke = (stroke: AnnotationStroke) => {
    if (stroke.pageIndex !== currentPageIndex) {
      onNavigateToPage(stroke.pageIndex);
    }
    onSelectStroke(stroke.id);
  };

  // Export report to Markdown
  const handleExportMarkdown = () => {
    const lines = [
      `# Informe de Revisión Editorial y Glosas al Margen`,
      `**Documento:** ${documentTitle}`,
      `**Fecha de exportación:** ${new Date().toLocaleString('es-ES')}`,
      `**Total de marcas registradas:** ${strokes.length} (${stats.resolved} resueltas, ${stats.pending} pendientes)`,
      '',
      '---',
      ''
    ];

    strokes.forEach((s, idx) => {
      lines.push(`### ${idx + 1}. [${s.markId}] - ${s.title || 'Observación editorial'}`);
      lines.push(`- **Página:** ${s.pageIndex + 1}`);
      lines.push(`- **Categoría:** ${formatCategoryLabel(s.category)}`);
      lines.push(`- **Estado:** ${formatStatusLabel(s.status)}`);
      lines.push(`- **Herramienta:** ${s.tool}`);
      lines.push(`- **Autor:** ${s.author || 'Revisor'}`);
      lines.push(`- **Comentario:** ${s.comment || '*(Sin comentario redactado)*'}`);
      lines.push('');
    });

    const blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Revision_Editorial_${documentTitle.replace(/\s+/g, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export annotations as JSON
  const handleExportJSON = () => {
    const data = {
      documentTitle,
      exportedAt: new Date().toISOString(),
      annotations: strokes
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Anotaciones_${documentTitle.replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <aside className="w-96 h-full flex flex-col bg-white border-l border-stone-200 select-none">
      {/* Header */}
      <div className="p-4 border-b border-stone-200 bg-stone-50/70">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-stone-700" />
            <h2 className="text-sm font-bold tracking-tight text-stone-900">
              Índice de Marcas y Glosas
            </h2>
          </div>
          <span className="text-xs font-mono font-semibold px-2 py-0.5 bg-stone-200 rounded text-stone-800">
            {filteredStrokes.length} de {strokes.length}
          </span>
        </div>

        {/* Minimalist Summary Counts */}
        <div className="flex items-center gap-3 text-xs text-stone-600">
          <span className="text-stone-700 font-medium">
            Pendientes: <span className="font-mono text-amber-700">{stats.pending}</span>
          </span>
          <span aria-hidden="true" className="text-stone-300">·</span>
          <span>
            En revisión: <span className="font-mono text-blue-700">{stats.inReview}</span>
          </span>
          <span aria-hidden="true" className="text-stone-300">·</span>
          <span>
            Resueltas: <span className="font-mono text-emerald-700">{stats.resolved}</span>
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3 border-b border-stone-200 space-y-2 bg-white">
        {/* Search input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por ID [ED-01], nota o categoría..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-400"
          />
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 text-xs">
          <button
            type="button"
            onClick={() => setOnlyCurrentPage(!onlyCurrentPage)}
            className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
              onlyCurrentPage 
                ? 'bg-stone-900 text-white' 
                : 'bg-stone-100 text-stone-600 hover:text-stone-900'
            }`}
          >
            Solo Pág. {currentPageIndex + 1}
          </button>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="text-[11px] bg-stone-100 text-stone-700 px-2 py-1 rounded border-none focus:outline-none"
          >
            <option value="all">Todos los estados</option>
            <option value="pendiente">Solo pendientes</option>
            <option value="en_revision">En revisión</option>
            <option value="resuelto">Resueltos</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as any)}
            className="text-[11px] bg-stone-100 text-stone-700 px-2 py-1 rounded border-none focus:outline-none"
          >
            <option value="all">Todas categorías</option>
            <option value="correccion">Corrección</option>
            <option value="estilo">Estilo</option>
            <option value="fuente">Fuente</option>
            <option value="duda">Duda</option>
            <option value="aprobado">Aprobado</option>
            <option value="reescribir">Reescribir</option>
          </select>
        </div>
      </div>

      {/* List of Marked Annotations */}
      <div className="flex-1 overflow-y-auto divide-y divide-stone-100 p-2 space-y-1">
        {filteredStrokes.length === 0 ? (
          <div className="p-8 text-center text-stone-400">
            <Tag className="w-8 h-8 mx-auto mb-2 text-stone-300 stroke-[1.5]" />
            <p className="text-xs font-medium text-stone-600 mb-1">
              No hay marcas en este filtro
            </p>
            <p className="text-[11px] text-stone-400 leading-relaxed">
              Toca o raya sobre el documento con tu pluma Wacom para añadir una nueva marca con identificador.
            </p>
          </div>
        ) : (
          filteredStrokes.map(stroke => {
            const isSelected = stroke.id === selectedStrokeId;
            const isEditingId = editingMarkId === stroke.id;

            return (
              <div
                key={stroke.id}
                onClick={() => handleJumpToStroke(stroke)}
                className={`p-3 rounded-lg transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-amber-50/60 border-amber-300 shadow-xs'
                    : 'bg-white hover:bg-stone-50 border-transparent hover:border-stone-200'
                }`}
              >
                {/* Header: ID, Category, Page, Actions */}
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {/* Color pip */}
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: stroke.color }}
                    />

                    {/* Editable Mark Identifier */}
                    {isEditingId ? (
                      <input
                        type="text"
                        value={tempMarkIdText}
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => setTempMarkIdText(e.target.value)}
                        onBlur={() => {
                          if (tempMarkIdText.trim()) {
                            onUpdateStroke({ ...stroke, markId: tempMarkIdText.trim() });
                          }
                          setEditingMarkId(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            if (tempMarkIdText.trim()) {
                              onUpdateStroke({ ...stroke, markId: tempMarkIdText.trim() });
                            }
                            setEditingMarkId(null);
                          } else if (e.key === 'Escape') {
                            setEditingMarkId(null);
                          }
                        }}
                        className="font-mono text-xs font-bold bg-white border border-stone-400 rounded px-1 py-0.5 w-20 text-stone-900"
                      />
                    ) : (
                      <button
                        type="button"
                        title="Doble clic para cambiar identificador"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingMarkId(stroke.id);
                          setTempMarkIdText(stroke.markId);
                        }}
                        className="font-mono text-xs font-bold text-stone-900 hover:text-amber-800 underline decoration-dotted decoration-stone-300"
                      >
                        [{stroke.markId}]
                      </button>
                    )}

                    {/* Category Label */}
                    <span className="text-[10px] text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded">
                      {formatCategoryLabel(stroke.category)}
                    </span>

                    {/* Page Locator */}
                    <span className="text-[10px] font-mono text-stone-400">
                      P.{stroke.pageIndex + 1}
                    </span>
                  </div>

                  {/* Status Toggle & Delete */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      title="Cambiar estado"
                      onClick={(e) => {
                        e.stopPropagation();
                        const nextStatus: EditorialStatus = 
                          stroke.status === 'pendiente' 
                            ? 'en_revision' 
                            : stroke.status === 'en_revision' 
                            ? 'resuelto' 
                            : 'pendiente';
                        onUpdateStroke({ ...stroke, status: nextStatus });
                      }}
                      className={`text-[10px] px-1.5 py-0.5 rounded font-medium transition-colors ${
                        stroke.status === 'resuelto'
                          ? 'bg-emerald-100 text-emerald-800'
                          : stroke.status === 'en_revision'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                      }`}
                    >
                      {formatStatusLabel(stroke.status)}
                    </button>

                    <button
                      type="button"
                      title="Eliminar marca"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteStroke(stroke.id);
                      }}
                      className="p-1 text-stone-300 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Title */}
                <h4 className="text-xs font-semibold text-stone-900 mb-1 line-clamp-1">
                  {stroke.title || 'Marca sin título'}
                </h4>

                {/* Comment / Note text */}
                <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                  {stroke.comment || (
                    <span className="italic text-stone-400">
                      Haga clic para agregar comentario a esta marca...
                    </span>
                  )}
                </p>

                {/* Jump to stroke button */}
                <div className="mt-2 pt-1.5 border-t border-stone-100/80 flex items-center justify-between text-[10px] text-stone-400">
                  <span>{stroke.tool}</span>
                  <span className="text-amber-800 font-medium hover:underline flex items-center gap-1">
                    Localizar en pág. {stroke.pageIndex + 1}
                    <ExternalLink className="w-2.5 h-2.5" />
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Actions: Exporting, Clearing */}
      <div className="p-3 border-t border-stone-200 bg-stone-50 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleExportMarkdown}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 bg-white border border-stone-300 rounded hover:bg-stone-100 transition-colors shadow-2xs"
          >
            <FileText className="w-3.5 h-3.5 text-stone-600" />
            <span>Informe .MD</span>
          </button>

          <button
            type="button"
            onClick={handleExportJSON}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 bg-white border border-stone-300 rounded hover:bg-stone-100 transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-stone-600" />
            <span>Glosas .JSON</span>
          </button>
        </div>

        {strokes.length > 0 && (
          <button
            type="button"
            onClick={() => {
              if (window.confirm('¿Desea limpiar todas las marcas y glosas de este documento?')) {
                onClearAllAnnotations();
              }
            }}
            className="w-full text-center text-[11px] text-stone-400 hover:text-red-600 transition-colors py-1"
          >
            Eliminar todas las marcas del documento
          </button>
        )}
      </div>
    </aside>
  );
};

function formatCategoryLabel(cat: EditorialCategory): string {
  switch (cat) {
    case 'correccion': return 'Corrección';
    case 'estilo': return 'Estilo';
    case 'fuente': return 'Fuente/Cita';
    case 'duda': return 'Duda autor';
    case 'aprobado': return 'Aprobado';
    case 'reescribir': return 'Reescribir';
    default: return cat;
  }
}

function formatStatusLabel(st: EditorialStatus): string {
  switch (st) {
    case 'pendiente': return 'Pendiente';
    case 'en_revision': return 'En revisión';
    case 'resuelto': return 'Resuelto ✓';
    default: return st;
  }
}
