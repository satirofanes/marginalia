import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  DocumentModel, 
  AnnotationStroke, 
  ToolType, 
  StylusDiagnostics,
  StabilizationLevel
} from './types/document';
import { SAMPLE_DOCUMENTS, INITIAL_ANNOTATIONS } from './services/sampleDocuments';
import { parseUploadedFile } from './services/fileParser';
import { Toolbar } from './components/Toolbar';
import { EditorialSidebar } from './components/EditorialSidebar';
import { DocumentPageView } from './components/renderers/DocumentPageView';
import { PythonDesktopHubModal } from './components/PythonDesktopHubModal';

export default function App() {
  // Document state
  const [documents, setDocuments] = useState<DocumentModel[]>(SAMPLE_DOCUMENTS);
  const [currentDocId, setCurrentDocId] = useState<string>('doc-novel-proof');
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  const [zoomScale, setZoomScale] = useState<number>(1.0);

  // Annotations & Marginalia state
  const [annotations, setAnnotations] = useState<Record<string, AnnotationStroke[]>>(INITIAL_ANNOTATIONS);
  const [historyStack, setHistoryStack] = useState<Record<string, AnnotationStroke[][]>>({});
  const [redoStack, setRedoStack] = useState<Record<string, AnnotationStroke[][]>>({});
  const [selectedStrokeId, setSelectedStrokeId] = useState<string | null>(null);

  // Wacom & Stylus tool settings
  const [activeTool, setActiveTool] = useState<ToolType>('pen');
  const [currentColor, setCurrentColor] = useState<string>('#DC2626'); // Classic editorial red
  const [currentWidth, setCurrentWidth] = useState<number>(3.0);
  const [currentOpacity, setCurrentOpacity] = useState<number>(0.95);
  const [currentIdPrefix, setCurrentIdPrefix] = useState<string>('ED');
  const [nextIdNumber, setNextIdNumber] = useState<number>(4);
  const [palmRejection, setPalmRejection] = useState<boolean>(true);
  const [stabilizationLevel, setStabilizationLevel] = useState<StabilizationLevel>('caligrafico');
  const [stylusDiagnostics, setStylusDiagnostics] = useState<StylusDiagnostics | null>(null);

  // UI state
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [isPythonModalOpen, setIsPythonModalOpen] = useState<boolean>(false);
  const [isProcessingFile, setIsProcessingFile] = useState<boolean>(false);

  // Current active document
  const currentDocument = useMemo(() => {
    return documents.find(d => d.id === currentDocId) || documents[0];
  }, [documents, currentDocId]);

  // Current active page
  const currentPage = useMemo(() => {
    if (!currentDocument.pages || currentDocument.pages.length === 0) {
      return {
        pageIndex: 0,
        pageNumber: 1,
        title: 'Página inicial',
        textContent: 'Documento en blanco.'
      };
    }
    const safeIndex = Math.min(currentPageIndex, currentDocument.pages.length - 1);
    return currentDocument.pages[safeIndex];
  }, [currentDocument, currentPageIndex]);

  // Strokes for current document
  const currentDocStrokes = useMemo(() => {
    return annotations[currentDocId] || [];
  }, [annotations, currentDocId]);

  // Helper to save current state to undo history before mutations
  const pushToUndoHistory = useCallback(() => {
    const currentList = annotations[currentDocId] || [];
    setHistoryStack(prev => ({
      ...prev,
      [currentDocId]: [...(prev[currentDocId] || []), currentList]
    }));
    // Clear redo when new action is taken
    setRedoStack(prev => ({
      ...prev,
      [currentDocId]: []
    }));
  }, [annotations, currentDocId]);

  // Add new stroke
  const handleAddStroke = useCallback((newStroke: AnnotationStroke) => {
    pushToUndoHistory();
    setAnnotations(prev => ({
      ...prev,
      [currentDocId]: [...(prev[currentDocId] || []), newStroke]
    }));
  }, [currentDocId, pushToUndoHistory]);

  // Update stroke (e.g. comment edited, category changed, status resolved)
  const handleUpdateStroke = useCallback((updatedStroke: AnnotationStroke) => {
    setAnnotations(prev => {
      const list = prev[currentDocId] || [];
      return {
        ...prev,
        [currentDocId]: list.map(s => s.id === updatedStroke.id ? updatedStroke : s)
      };
    });
  }, [currentDocId]);

  // Delete stroke
  const handleDeleteStroke = useCallback((strokeId: string) => {
    pushToUndoHistory();
    setAnnotations(prev => {
      const list = prev[currentDocId] || [];
      return {
        ...prev,
        [currentDocId]: list.filter(s => s.id !== strokeId)
      };
    });
    if (selectedStrokeId === strokeId) {
      setSelectedStrokeId(null);
    }
  }, [currentDocId, pushToUndoHistory, selectedStrokeId]);

  // Clear all annotations
  const handleClearAllAnnotations = useCallback(() => {
    pushToUndoHistory();
    setAnnotations(prev => ({
      ...prev,
      [currentDocId]: []
    }));
    setSelectedStrokeId(null);
  }, [currentDocId, pushToUndoHistory]);

  // Undo
  const handleUndo = useCallback(() => {
    const docHistory = historyStack[currentDocId] || [];
    if (docHistory.length === 0) return;

    const previousState = docHistory[docHistory.length - 1];
    const newHistory = docHistory.slice(0, -1);
    const currentState = annotations[currentDocId] || [];

    setRedoStack(prev => ({
      ...prev,
      [currentDocId]: [...(prev[currentDocId] || []), currentState]
    }));

    setHistoryStack(prev => ({
      ...prev,
      [currentDocId]: newHistory
    }));

    setAnnotations(prev => ({
      ...prev,
      [currentDocId]: previousState
    }));
  }, [historyStack, annotations, currentDocId]);

  // Redo
  const handleRedo = useCallback(() => {
    const docRedo = redoStack[currentDocId] || [];
    if (docRedo.length === 0) return;

    const nextState = docRedo[docRedo.length - 1];
    const newRedo = docRedo.slice(0, -1);
    const currentState = annotations[currentDocId] || [];

    setHistoryStack(prev => ({
      ...prev,
      [currentDocId]: [...(prev[currentDocId] || []), currentState]
    }));

    setRedoStack(prev => ({
      ...prev,
      [currentDocId]: newRedo
    }));

    setAnnotations(prev => ({
      ...prev,
      [currentDocId]: nextState
    }));
  }, [redoStack, annotations, currentDocId]);

  // File Upload Handler (PDF, Word, Excel, ePub, TXT)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingFile(true);
    try {
      const parsedDoc = await parseUploadedFile(file);
      setDocuments(prev => [parsedDoc, ...prev]);
      setCurrentDocId(parsedDoc.id);
      setCurrentPageIndex(0);
      setNextIdNumber(1);
    } catch (err) {
      console.error('Error al procesar archivo:', err);
      alert('Hubo un error al procesar el archivo. Intente con otro formato.');
    } finally {
      setIsProcessingFile(false);
      // Reset input
      e.target.value = '';
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input or textarea
      if (
        document.activeElement?.tagName === 'INPUT' || 
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
        e.preventDefault();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        handleRedo();
        e.preventDefault();
      } else if (e.key === 'p' || e.key === 'P') {
        setActiveTool('pen');
      } else if (e.key === 'h' || e.key === 'H') {
        setActiveTool('highlighter');
        setCurrentColor('#FEF08A');
        setCurrentWidth(22);
      } else if (e.key === 'e' || e.key === 'E') {
        setActiveTool('eraser');
      } else if (e.key === 'ArrowLeft') {
        if (currentPageIndex > 0) setCurrentPageIndex(p => p - 1);
      } else if (e.key === 'ArrowRight') {
        if (currentPageIndex < currentDocument.totalPages - 1) {
          setCurrentPageIndex(p => p + 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo, currentPageIndex, currentDocument.totalPages]);

  const canUndo = (historyStack[currentDocId]?.length || 0) > 0;
  const canRedo = (redoStack[currentDocId]?.length || 0) > 0;

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-stone-200">
      {/* Editorial Navigation & Wacom Toolbar */}
      <Toolbar
        currentDocument={currentDocument}
        documents={documents}
        onSelectDocument={(id) => {
          setCurrentDocId(id);
          setCurrentPageIndex(0);
        }}
        onUploadFile={handleFileUpload}
        currentPageIndex={currentPageIndex}
        totalPages={currentDocument.totalPages}
        onPageChange={setCurrentPageIndex}
        zoomScale={zoomScale}
        onZoomChange={setZoomScale}
        activeTool={activeTool}
        onSelectTool={setActiveTool}
        currentColor={currentColor}
        onSelectColor={setCurrentColor}
        currentWidth={currentWidth}
        onSelectWidth={setCurrentWidth}
        currentIdPrefix={currentIdPrefix}
        onChangeIdPrefix={setCurrentIdPrefix}
        nextIdNumber={nextIdNumber}
        palmRejection={palmRejection}
        onTogglePalmRejection={() => setPalmRejection(!palmRejection)}
        stabilizationLevel={stabilizationLevel}
        onChangeStabilizationLevel={setStabilizationLevel}
        stylusDiagnostics={stylusDiagnostics}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={canUndo}
        canRedo={canRedo}
        onOpenPythonModal={() => setIsPythonModalOpen(true)}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Document Reading & Annotation Viewport */}
        <main className="flex-1 overflow-y-auto overflow-x-auto p-8 flex items-start justify-center bg-stone-300/40">
          {isProcessingFile ? (
            <div className="flex flex-col items-center justify-center h-96 text-stone-600 gap-3">
              <div className="w-8 h-8 border-3 border-stone-800 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-semibold">Procesando y maquetando documento...</p>
            </div>
          ) : (
            <DocumentPageView
              document={currentDocument}
              page={currentPage}
              pageIndex={currentPageIndex}
              zoomScale={zoomScale}
              strokes={currentDocStrokes}
              onAddStroke={handleAddStroke}
              onUpdateStroke={handleUpdateStroke}
              onDeleteStroke={handleDeleteStroke}
              activeTool={activeTool}
              currentColor={currentColor}
              currentWidth={currentWidth}
              currentOpacity={currentOpacity}
              currentIdPrefix={currentIdPrefix}
              nextIdNumber={nextIdNumber}
              onIncrementIdNumber={() => setNextIdNumber(n => n + 1)}
              palmRejection={palmRejection}
              stabilizationLevel={stabilizationLevel}
              onStylusEvent={setStylusDiagnostics}
              selectedStrokeId={selectedStrokeId}
              onSelectStroke={setSelectedStrokeId}
            />
          )}
        </main>

        {/* Marginalia & Identifiers Index Sidebar */}
        {isSidebarOpen && (
          <EditorialSidebar
            strokes={currentDocStrokes}
            currentPageIndex={currentPageIndex}
            totalPages={currentDocument.totalPages}
            selectedStrokeId={selectedStrokeId}
            onSelectStroke={setSelectedStrokeId}
            onNavigateToPage={setCurrentPageIndex}
            onUpdateStroke={handleUpdateStroke}
            onDeleteStroke={handleDeleteStroke}
            onClearAllAnnotations={handleClearAllAnnotations}
            documentTitle={currentDocument.title}
          />
        )}
      </div>

      {/* Python Desktop Hub & .EXE Compiler Modal */}
      <PythonDesktopHubModal
        isOpen={isPythonModalOpen}
        onClose={() => setIsPythonModalOpen(false)}
      />
    </div>
  );
}
