import React from 'react';
import { 
  DocumentModel, 
  DocumentPage, 
  AnnotationStroke, 
  ToolType,
  StylusDiagnostics,
  StabilizationLevel
} from '../../types/document';
import { WacomAnnotationCanvas } from '../WacomAnnotationCanvas';
import { Table, BookOpen } from 'lucide-react';

interface DocumentPageViewProps {
  document: DocumentModel;
  page: DocumentPage;
  pageIndex: number;
  zoomScale: number;
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

export const DocumentPageView: React.FC<DocumentPageViewProps> = ({
  document: doc,
  page,
  pageIndex,
  zoomScale,
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
  stabilizationLevel,
  onStylusEvent,
  selectedStrokeId,
  onSelectStroke
}) => {
  // Base dimensions of our A4 / Letter editorial page in logical CSS pixels
  const baseWidth = 860;
  const baseHeight = 1180;

  const scaledWidth = Math.round(baseWidth * zoomScale);
  const scaledHeight = Math.round(baseHeight * zoomScale);

  return (
    <div
      style={{
        width: `${scaledWidth}px`,
        minHeight: `${scaledHeight}px`,
        transformOrigin: 'top center'
      }}
      className="relative mx-auto my-6 bg-[#FCFAF6] border border-stone-300 rounded-xs paper-shadow paper-grain select-none transition-all duration-150 flex flex-col"
    >
      {/* Editorial Header / Running Head */}
      <div className="px-14 pt-8 pb-4 flex items-center justify-between border-b border-stone-200/60 text-[11px] font-serif-display uppercase tracking-widest text-stone-600">
        <span className="truncate max-w-sm">{doc.title}</span>
        <span className="font-mono text-stone-500 tabular-nums">
          — {page.pageNumber} / {doc.totalPages} —
        </span>
      </div>

      {/* Main Document Content Body */}
      <div className="relative flex-1 px-14 py-8 overflow-hidden">
        {/* Case 1: Pre-rendered PDF or Scanned Image */}
        {page.renderedImageUrl ? (
          <div className="w-full h-full flex items-center justify-center pointer-events-none">
            <img
              src={page.renderedImageUrl}
              alt={`Página ${page.pageNumber}`}
              className="w-full h-auto object-contain pointer-events-none"
              referrerPolicy="no-referrer"
            />
          </div>
        ) : page.tableData ? (
          /* Case 2: Spreadsheet (Excel / CSV) */
          <div className="w-full h-full overflow-x-auto text-xs font-mono pointer-events-none">
            {page.tableData.sheets.map((sheet, sIdx) => (
              <div key={sIdx} className="mb-6">
                <div className="flex items-center gap-2 mb-2 pb-1 border-b border-stone-300 font-sans font-bold text-stone-800 text-xs">
                  <Table className="w-3.5 h-3.5 text-stone-500" />
                  <span>{sheet.name}</span>
                </div>
                <table className="w-full border-collapse border border-stone-300 text-[11px]">
                  <thead>
                    <tr className="bg-stone-200/70 text-stone-700">
                      <th className="border border-stone-300 px-2 py-1 w-8 text-center bg-stone-300/60 font-semibold">
                        #
                      </th>
                      {sheet.headers.map((h, hIdx) => (
                        <th
                          key={hIdx}
                          className="border border-stone-300 px-3 py-1.5 text-left font-semibold"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sheet.rows.map((row, rIdx) => (
                      <tr
                        key={rIdx}
                        className={rIdx % 2 === 0 ? 'bg-white' : 'bg-stone-50/70'}
                      >
                        <td className="border border-stone-300 px-2 py-1 text-center bg-stone-100/60 text-stone-400 font-mono text-[10px]">
                          {rIdx + 1}
                        </td>
                        {row.map((cell, cIdx) => (
                          <td
                            key={cIdx}
                            className="border border-stone-300 px-3 py-1 text-stone-800 tabular-nums"
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        ) : (
          /* Case 3: Editorial Typography Document (DOCX / EPUB / TXT / MD) */
          <div className="w-full max-w-2xl mx-auto space-y-4 text-stone-900 pointer-events-none">
            {page.title && (
              <h2 className="text-xl font-serif-display font-bold text-stone-900 pb-2 border-b border-stone-200">
                {page.title}
              </h2>
            )}
            <div className="font-serif-editorial text-[15px] leading-relaxed text-stone-800 space-y-4 text-justify">
              {page.textContent?.split('\n\n').map((paragraph, pIdx) => {
                if (!paragraph.trim()) return null;
                // Elegant drop cap for first paragraph on page 1
                const isFirstParagraph = pageIndex === 0 && pIdx === 0;
                return (
                  <p
                    key={pIdx}
                    className={
                      isFirstParagraph
                        ? 'first-letter:text-4xl first-letter:font-serif first-letter:font-bold first-letter:float-left first-letter:mr-2.5 first-letter:text-stone-950'
                        : 'indent-6'
                    }
                  >
                    {paragraph}
                  </p>
                );
              })}
            </div>
          </div>
        )}

        {/* Wacom Drawing Canvas Layer (Positioned directly over the page content) */}
        <div className="absolute inset-0 z-20">
          <WacomAnnotationCanvas
            pageIndex={pageIndex}
            width={baseWidth}
            height={baseHeight}
            strokes={strokes.filter(s => s.pageIndex === pageIndex)}
            onAddStroke={onAddStroke}
            onUpdateStroke={onUpdateStroke}
            onDeleteStroke={onDeleteStroke}
            activeTool={activeTool}
            currentColor={currentColor}
            currentWidth={currentWidth}
            currentOpacity={currentOpacity}
            currentIdPrefix={currentIdPrefix}
            nextIdNumber={nextIdNumber}
            onIncrementIdNumber={onIncrementIdNumber}
            palmRejection={palmRejection}
            stabilizationLevel={stabilizationLevel}
            onStylusEvent={onStylusEvent}
            selectedStrokeId={selectedStrokeId}
            onSelectStroke={onSelectStroke}
          />
        </div>
      </div>

      {/* Editorial Footer */}
      <div className="px-14 py-4 border-t border-stone-200/50 flex items-center justify-between text-[10px] text-stone-500 font-sans font-medium">
        <span>{doc.format.toUpperCase()} · Revisión Editorial Wacom</span>
        <span className="font-mono">Página {page.pageNumber}</span>
      </div>
    </div>
  );
};
