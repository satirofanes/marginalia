export type DocumentFormat = 'pdf' | 'docx' | 'xlsx' | 'pptx' | 'epub' | 'txt' | 'md' | 'image';

export type EditorialCategory = 
  | 'correccion'     // Corrección tipográfica u ortográfica
  | 'estilo'         // Mejora de estilo, cadencia o redacción
  | 'fuente'         // Verificar cita, bibliografía o dato
  | 'duda'           // Pregunta / Duda al autor
  | 'aprobado'       // Visto bueno / Mantener
  | 'reescribir';    // Párrafo a reformular

export type EditorialStatus = 'pendiente' | 'en_revision' | 'resuelto';

export type StabilizationLevel = 'natural' | 'equilibrado' | 'caligrafico';

export interface StrokePoint {
  x: number;
  y: number;
  pressure: number;   // 0.0 to 1.0 (from Wacom/stylus pointer events)
  tiltX?: number;     // stylus tilt angle
  tiltY?: number;
  time?: number;
}

export interface BoundingBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export type ToolType = 
  | 'pen'           // Pluma estilográfica / tinta de corrección
  | 'highlighter'   // Marcatextos / subrayador translúcido
  | 'eraser'        // Borrador (por trazo o área)
  | 'callout'       // Flecha con llamada al margen
  | 'bracket'       // Corchete de párrafo editorial [
  | 'strikeout'     // Línea de tachado editorial
  | 'circle';       // Círculo o elipse de atención

export interface AnnotationStroke {
  id: string;
  markId: string;           // Identificador único (e.g. "ED-01", "REF-2", "CORR-05")
  pageIndex: number;
  tool: ToolType;
  color: string;
  baseWidth: number;
  opacity: number;
  points: StrokePoint[];
  bbox: BoundingBox;
  createdAt: number;
  updatedAt?: number;
  author: string;
  title?: string;
  comment: string;
  category: EditorialCategory;
  status: EditorialStatus;
  marginCalloutX?: number;  // X position where margin note is pinned
  marginCalloutY?: number;  // Y position where margin note is pinned
}

export interface DocumentPage {
  pageIndex: number;
  pageNumber: number;
  title?: string;
  aspectRatio?: number; // width / height
  textContent?: string;
  htmlContent?: string;
  tableData?: {
    sheets: {
      name: string;
      headers: string[];
      rows: (string | number)[][];
    }[];
  };
  slideData?: {
    slideNumber: number;
    title: string;
    bullets: string[];
    notes?: string;
  };
  renderedImageUrl?: string;
  annotationsCount?: number;
}

export interface DocumentModel {
  id: string;
  title: string;
  fileName: string;
  fileSize: string;
  format: DocumentFormat;
  totalPages: number;
  author?: string;
  dateCreated: string;
  pages: DocumentPage[];
  rawFile?: File;
  rawArrayBuffer?: ArrayBuffer;
}

export interface StylusDiagnostics {
  pointerType: string;      // 'pen' | 'touch' | 'mouse'
  pressure: number;         // current 0.0 - 1.0
  tiltX: number;
  tiltY: number;
  buttons: number;
  isEraser: boolean;
  palmRejection: boolean;
  sampleRateHz: number;
}
