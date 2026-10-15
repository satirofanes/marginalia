import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import { DocumentModel, DocumentPage, DocumentFormat } from '../types/document';

export async function parseUploadedFile(file: File): Promise<DocumentModel> {
  const fileName = file.name;
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  const fileSize = formatFileSize(file.size);
  const now = new Date().toLocaleDateString('es-ES', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const arrayBuffer = await file.arrayBuffer();

  if (ext === 'pdf') {
    return parsePdfFile(file, arrayBuffer, fileName, fileSize, now);
  } else if (['xlsx', 'xls', 'csv'].includes(ext)) {
    return parseSpreadsheetFile(arrayBuffer, fileName, fileSize, now, ext as DocumentFormat);
  } else if (ext === 'docx') {
    return parseDocxFile(arrayBuffer, fileName, fileSize, now);
  } else if (ext === 'epub') {
    return parseEpubFile(arrayBuffer, fileName, fileSize, now);
  } else if (['txt', 'md', 'json', 'rtf', 'log'].includes(ext)) {
    return parseTextFile(file, fileName, fileSize, now, ext === 'md' ? 'md' : 'txt');
  } else if (['jpg', 'jpeg', 'png', 'webp', 'svg'].includes(ext)) {
    return parseImageFile(file, fileName, fileSize, now);
  } else {
    // Default fallback to text inspection
    return parseTextFile(file, fileName, fileSize, now, 'txt');
  }
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  const kb = bytes / 1024;
  if (kb < 1024) return kb.toFixed(1) + ' KB';
  const mb = kb / 1024;
  return mb.toFixed(1) + ' MB';
}

async function parsePdfFile(
  _file: File, 
  arrayBuffer: ArrayBuffer, 
  fileName: string, 
  fileSize: string, 
  now: string
): Promise<DocumentModel> {
  try {
    const pdfjsLib = await import('pdfjs-dist');
    // Configure worker
    if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '4.0.379'}/pdf.worker.min.mjs`;
    }

    const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
    const pdf = await loadingTask.promise;
    const totalPages = pdf.numPages;
    const pages: DocumentPage[] = [];

    for (let i = 1; i <= Math.min(totalPages, 50); i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const text = textContent.items
        .map((item: any) => ('str' in item ? item.str : ''))
        .join(' ');

      // Render page to high-res data URL for crisp annotation background
      const viewport = page.getViewport({ scale: 1.5 });
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      if (ctx) {
        await (page.render as any)({ canvasContext: ctx, viewport, canvas }).promise;
        const renderedImageUrl = canvas.toDataURL('image/png');
        pages.push({
          pageIndex: i - 1,
          pageNumber: i,
          title: `Página ${i}`,
          aspectRatio: viewport.width / viewport.height,
          textContent: text || `[Contenido gráfico vectorial de la página ${i}]`,
          renderedImageUrl
        });
      } else {
        pages.push({
          pageIndex: i - 1,
          pageNumber: i,
          title: `Página ${i}`,
          textContent: text || `[Página ${i} de ${totalPages}]`
        });
      }
    }

    return {
      id: `doc-${Date.now()}`,
      title: fileName.replace(/\.[^/.]+$/, ''),
      fileName,
      fileSize,
      format: 'pdf',
      totalPages: pages.length,
      author: 'Documento PDF Importado',
      dateCreated: now,
      pages,
      rawArrayBuffer: arrayBuffer
    };
  } catch (err) {
    console.warn('PDF.js render warning, falling back to document model:', err);
    // Graceful fallback
    return {
      id: `doc-${Date.now()}`,
      title: fileName.replace(/\.[^/.]+$/, ''),
      fileName,
      fileSize,
      format: 'pdf',
      totalPages: 1,
      author: 'Documento PDF',
      dateCreated: now,
      pages: [
        {
          pageIndex: 0,
          pageNumber: 1,
          title: 'Documento PDF cargado',
          textContent: `Documento PDF "${fileName}" importado con éxito.\nPuede dibujar y anotar con Wacom sobre el lienzo de revisión editorial.`
        }
      ],
      rawArrayBuffer: arrayBuffer
    };
  }
}

async function parseSpreadsheetFile(
  arrayBuffer: ArrayBuffer, 
  fileName: string, 
  fileSize: string, 
  now: string, 
  format: DocumentFormat
): Promise<DocumentModel> {
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  const sheetNames = workbook.SheetNames;
  const pages: DocumentPage[] = [];

  sheetNames.forEach((sheetName, index) => {
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as (string | number)[][];
    
    if (jsonData.length > 0) {
      const headers = (jsonData[0] || []).map(h => String(h || 'Columna'));
      const rows = jsonData.slice(1, 100); // cap first 100 rows per sheet for smooth interaction

      pages.push({
        pageIndex: index,
        pageNumber: index + 1,
        title: `Hoja: ${sheetName}`,
        tableData: {
          sheets: [
            {
              name: sheetName,
              headers,
              rows
            }
          ]
        }
      });
    }
  });

  if (pages.length === 0) {
    pages.push({
      pageIndex: 0,
      pageNumber: 1,
      title: 'Hoja vacía',
      textContent: 'El libro de cálculo no contiene datos visibles.'
    });
  }

  return {
    id: `doc-${Date.now()}`,
    title: fileName.replace(/\.[^/.]+$/, ''),
    fileName,
    fileSize,
    format,
    totalPages: pages.length,
    author: 'Hoja de Cálculo Office',
    dateCreated: now,
    pages
  };
}

async function parseDocxFile(
  arrayBuffer: ArrayBuffer, 
  fileName: string, 
  fileSize: string, 
  now: string
): Promise<DocumentModel> {
  try {
    const zip = await JSZip.loadAsync(arrayBuffer);
    const documentXmlFile = zip.file('word/document.xml');
    
    if (!documentXmlFile) {
      throw new Error('No word/document.xml found in docx');
    }

    const xmlString = await documentXmlFile.async('text');
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'application/xml');

    const paragraphs = xmlDoc.getElementsByTagName('w:p');
    const textBlocks: string[] = [];
    
    for (let i = 0; i < paragraphs.length; i++) {
      const p = paragraphs[i];
      const textNodes = p.getElementsByTagName('w:t');
      let pText = '';
      for (let j = 0; j < textNodes.length; j++) {
        pText += textNodes[j].textContent;
      }
      if (pText.trim().length > 0) {
        textBlocks.push(pText.trim());
      }
    }

    // Partition paragraphs into natural pages of ~500 words
    const pages: DocumentPage[] = [];
    let currentBatch: string[] = [];
    let wordCount = 0;

    for (const block of textBlocks) {
      currentBatch.push(block);
      wordCount += block.split(/\s+/).length;
      if (wordCount >= 450) {
        pages.push({
          pageIndex: pages.length,
          pageNumber: pages.length + 1,
          title: `Página ${pages.length + 1}`,
          textContent: currentBatch.join('\n\n')
        });
        currentBatch = [];
        wordCount = 0;
      }
    }

    if (currentBatch.length > 0 || pages.length === 0) {
      pages.push({
        pageIndex: pages.length,
        pageNumber: pages.length + 1,
        title: `Página ${pages.length + 1}`,
        textContent: currentBatch.join('\n\n') || 'Documento sin texto legible.'
      });
    }

    return {
      id: `doc-${Date.now()}`,
      title: fileName.replace(/\.[^/.]+$/, ''),
      fileName,
      fileSize,
      format: 'docx',
      totalPages: pages.length,
      author: 'Microsoft Word DOCX',
      dateCreated: now,
      pages
    };
  } catch (err) {
    console.warn('Docx xml parse error, falling back:', err);
    return {
      id: `doc-${Date.now()}`,
      title: fileName.replace(/\.[^/.]+$/, ''),
      fileName,
      fileSize,
      format: 'docx',
      totalPages: 1,
      author: 'Documento Word',
      dateCreated: now,
      pages: [
        {
          pageIndex: 0,
          pageNumber: 1,
          title: 'Documento Word Importado',
          textContent: `Documento "${fileName}" importado.\nListo para anotaciones y glosas al margen con Wacom.`
        }
      ]
    };
  }
}

async function parseEpubFile(
  arrayBuffer: ArrayBuffer, 
  fileName: string, 
  fileSize: string, 
  now: string
): Promise<DocumentModel> {
  try {
    const zip = await JSZip.loadAsync(arrayBuffer);
    const pages: DocumentPage[] = [];

    // Search for html / xhtml files in the epub archive
    const htmlFiles = Object.keys(zip.files).filter(path => 
      (path.endsWith('.xhtml') || path.endsWith('.html') || path.endsWith('.htm')) && 
      !path.includes('toc')
    );

    for (let i = 0; i < Math.min(htmlFiles.length, 25); i++) {
      const fileEntry = zip.files[htmlFiles[i]];
      const rawHtml = await fileEntry.async('text');
      const parser = new DOMParser();
      const doc = parser.parseFromString(rawHtml, 'text/html');
      
      const title = doc.querySelector('h1, h2, title')?.textContent || `Capítulo ${i + 1}`;
      const bodyText = doc.body.textContent || '';
      
      if (bodyText.trim().length > 30) {
        pages.push({
          pageIndex: pages.length,
          pageNumber: pages.length + 1,
          title,
          textContent: bodyText.trim().replace(/\n\s*\n/g, '\n\n')
        });
      }
    }

    if (pages.length === 0) {
      pages.push({
        pageIndex: 0,
        pageNumber: 1,
        title: 'eBook Importado',
        textContent: `Archivo ePub "${fileName}" cargado en el visor editorial.`
      });
    }

    return {
      id: `doc-${Date.now()}`,
      title: fileName.replace(/\.[^/.]+$/, ''),
      fileName,
      fileSize,
      format: 'epub',
      totalPages: pages.length,
      author: 'eBook Reader',
      dateCreated: now,
      pages
    };
  } catch (err) {
    console.warn('ePub parsing error:', err);
    return {
      id: `doc-${Date.now()}`,
      title: fileName.replace(/\.[^/.]+$/, ''),
      fileName,
      fileSize,
      format: 'epub',
      totalPages: 1,
      author: 'eBook',
      dateCreated: now,
      pages: [{
        pageIndex: 0,
        pageNumber: 1,
        title: 'eBook',
        textContent: `Libro electrónico "${fileName}" listo para revisión y anotaciones con lápiz táctil.`
      }]
    };
  }
}

async function parseTextFile(
  file: File, 
  fileName: string, 
  fileSize: string, 
  now: string, 
  format: 'txt' | 'md'
): Promise<DocumentModel> {
  const text = await file.text();
  const paragraphs = text.split(/\n\s*\n/);
  const pages: DocumentPage[] = [];
  
  let currentGroup: string[] = [];
  let words = 0;

  paragraphs.forEach((p) => {
    currentGroup.push(p);
    words += p.split(/\s+/).length;
    if (words >= 450) {
      pages.push({
        pageIndex: pages.length,
        pageNumber: pages.length + 1,
        title: `Página ${pages.length + 1}`,
        textContent: currentGroup.join('\n\n')
      });
      currentGroup = [];
      words = 0;
    }
  });

  if (currentGroup.length > 0 || pages.length === 0) {
    pages.push({
      pageIndex: pages.length,
      pageNumber: pages.length + 1,
      title: `Página ${pages.length + 1}`,
      textContent: currentGroup.join('\n\n') || text || 'Archivo de texto vacío.'
    });
  }

  return {
    id: `doc-${Date.now()}`,
    title: fileName.replace(/\.[^/.]+$/, ''),
    fileName,
    fileSize,
    format,
    totalPages: pages.length,
    author: 'Archivo de Texto',
    dateCreated: now,
    pages
  };
}

async function parseImageFile(
  file: File, 
  fileName: string, 
  fileSize: string, 
  now: string
): Promise<DocumentModel> {
  const url = URL.createObjectURL(file);
  return {
    id: `doc-${Date.now()}`,
    title: fileName.replace(/\.[^/.]+$/, ''),
    fileName,
    fileSize,
    format: 'image',
    totalPages: 1,
    author: 'Documento Escaneado / Imagen',
    dateCreated: now,
    pages: [
      {
        pageIndex: 0,
        pageNumber: 1,
        title: 'Imagen escaneada',
        renderedImageUrl: url,
        textContent: `Documento escaneado: ${fileName}`
      }
    ]
  };
}
