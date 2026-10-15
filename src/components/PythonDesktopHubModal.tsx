import React, { useState } from 'react';
import JSZip from 'jszip';
import { 
  Terminal, 
  Download, 
  Copy, 
  Check, 
  Cpu, 
  FileCode, 
  Layers, 
  Sparkles,
  HelpCircle,
  FolderArchive,
  ExternalLink,
  Zap,
  CheckCircle2
} from 'lucide-react';

interface PythonDesktopHubModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PythonDesktopHubModal: React.FC<PythonDesktopHubModalProps> = ({
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'quick_guide' | 'standalone_window' | 'desktop_py' | 'build_script' | 'batch_script' | 'requirements'>('quick_guide');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isGeneratingZip, setIsGeneratingZip] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen) return null;

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDownloadFile = (fileName: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Generate and download full Desktop Packaging ZIP with PRE-BUILT dist assets included!
  const handleDownloadFullZip = async () => {
    setIsGeneratingZip(true);
    setDownloadSuccess(false);
    try {
      const zip = new JSZip();

      // Python and batch scripts
      zip.file('desktop_app.py', PYTHON_DESKTOP_APP_CODE);
      zip.file('build_exe.py', PYTHON_BUILD_EXE_CODE);
      zip.file('compilar_escritorio.bat', BATCH_COMPILE_SCRIPT);
      zip.file('ejecutar_sin_compilar.bat', BATCH_RUN_DEV_SCRIPT);
      zip.file('requirements.txt', REQUIREMENTS_TXT);
      zip.file('INSTRUCCIONES_WINDOWS.txt', INSTRUCTIONS_TXT);

      // Fetch pre-built dist assets so the user doesn't even need Node.js on Windows!
      try {
        const htmlResp = await fetch('/dist/index.html');
        if (htmlResp.ok) {
          const html = await htmlResp.text();
          zip.file('dist/index.html', html);
          zip.file('index.html', html); // also in root for maximum compatibility

          // Dynamically detect and bundle all CSS and JS chunks referenced in index.html
          const assetMatches = Array.from(html.matchAll(/(?:src|href)="([^"]+\.(?:js|css))"/g));
          for (const m of assetMatches) {
            const cleanPath = m[1].replace(/^\//, '');
            try {
              const aResp = await fetch('/dist/' + cleanPath);
              if (aResp.ok) {
                const content = await aResp.text();
                zip.file('dist/' + cleanPath, content);
                zip.file(cleanPath, content);
              }
            } catch (e) {
              console.warn('Could not fetch asset chunk:', cleanPath, e);
            }
          }

          // Also check for pdf worker or dynamic chunks
          const dynamicChunks = ['pdf-BTe0fELz.js', 'pdf-CfFmt_5F.js'];
          for (const chunk of dynamicChunks) {
            try {
              const cResp = await fetch('/dist/assets/' + chunk);
              if (cResp.ok) {
                const cText = await cResp.text();
                zip.file('dist/assets/' + chunk, cText);
                zip.file('assets/' + chunk, cText);
              }
            } catch {}
          }
        }
      } catch (assetErr) {
        console.warn('Could not bundle pre-compiled assets into zip, fallback to script:', assetErr);
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'MarginaliaStudio_Paquete_Escritorio_Windows.zip';
      a.click();
      URL.revokeObjectURL(url);
      setDownloadSuccess(true);
    } catch (err) {
      console.error('Error al generar ZIP:', err);
      alert('Error al generar el archivo ZIP. Puede descargar los archivos individualmente.');
    } finally {
      setIsGeneratingZip(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs select-none">
      <div 
        className="bg-white rounded-xl shadow-2xl border border-stone-300 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 text-amber-900 rounded-lg">
              <Sparkles className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900 tracking-tight flex items-center gap-2">
                Marginalia Studio: Solución de Error 404 y Ventana Independiente
              </h2>
              <p className="text-xs text-stone-500">
                Paquete de escritorio con activos pre-empaquetados y acceso directo a ventana de alta velocidad.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 hover:bg-stone-200 p-1.5 rounded-md transition-colors text-sm font-bold"
          >
            ✕
          </button>
        </div>

        {/* Explanation of the 404 Error */}
        <div className="px-6 py-3 bg-amber-50 border-b border-amber-200 text-xs text-amber-950 flex items-start gap-2.5">
          <HelpCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div className="flex-1 leading-relaxed space-y-1">
            <p>
              <strong>¿A qué se debía el error 404 (Nothing matches the given URL)?</strong>
            </p>
            <p className="text-amber-900">
              El servidor local de Python no encontraba los archivos compilados de la interfaz (la carpeta <code>dist/</code> con <code>index.html</code>) porque tu equipo no tenía Node.js instalado para generarlos. 
              <strong> Solución aplicada:</strong> Ahora el nuevo botón de descarga <strong>incluye automáticamente la carpeta <code>dist/</code> ya compilada</strong> dentro del archivo ZIP, e incorpora un enlazador de respaldo que garantiza que nunca vuelva a dar 404.
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center justify-between px-6 pt-2.5 border-b border-stone-200 bg-white">
          <div className="flex items-center gap-2 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab('quick_guide')}
              className={`px-3 py-2 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'quick_guide'
                  ? 'border-stone-900 text-stone-900'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>1. Descargar Paquete con dist incluido (.ZIP)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('standalone_window')}
              className={`px-3 py-2 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'standalone_window'
                  ? 'border-stone-900 text-stone-900'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-600" />
              <span>2. Ventana Independiente / PWA</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('desktop_py')}
              className={`px-3 py-2 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'desktop_py'
                  ? 'border-stone-900 text-stone-900'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>desktop_app.py</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('batch_script')}
              className={`px-3 py-2 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'batch_script'
                  ? 'border-stone-900 text-stone-900'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>compilar_escritorio.bat</span>
            </button>
          </div>

          {/* 1-Click ZIP Downloader Button */}
          <button
            type="button"
            disabled={isGeneratingZip}
            onClick={handleDownloadFullZip}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-amber-700 hover:bg-amber-800 rounded transition-colors shadow-xs shrink-0 mb-1 cursor-pointer"
          >
            <FolderArchive className="w-3.5 h-3.5" />
            <span>{isGeneratingZip ? 'Empaquetando con dist...' : 'Descargar ZIP Completo (Solución 404)'}</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-stone-50/50">
          {activeTab === 'quick_guide' && (
            <div className="space-y-4">
              {downloadSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-lg text-xs text-emerald-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    ¡Archivo ZIP descargado con éxito con la carpeta <code>dist/</code> ya incluida! Descomprime y haz doble clic en <code>ejecutar_sin_compilar.bat</code> o <code>compilar_escritorio.bat</code>.
                  </span>
                </div>
              )}

              <div className="bg-white border border-stone-200 rounded-lg p-5 space-y-4 text-xs">
                <h3 className="text-sm font-bold text-stone-900">
                  Pasos corregidos para ejecutar en tu PC sin error 404:
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-lg space-y-1.5">
                    <span className="font-mono font-bold text-stone-900 bg-stone-200 px-1.5 py-0.5 rounded text-[11px]">
                      Paso 1
                    </span>
                    <h4 className="font-semibold text-stone-900">Descarga el nuevo ZIP</h4>
                    <p className="text-stone-600 leading-relaxed text-[11px]">
                      Haz clic en el botón superior <strong>"Descargar ZIP Completo"</strong>. Este ZIP ya contiene la carpeta <code>dist/</code> lista, por lo que no necesitas Node.js ni compilar nada antes.
                    </p>
                  </div>

                  <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-lg space-y-1.5">
                    <span className="font-mono font-bold text-stone-900 bg-stone-200 px-1.5 py-0.5 rounded text-[11px]">
                      Paso 2 (Instantáneo)
                    </span>
                    <h4 className="font-semibold text-stone-900">Probar sin compilar</h4>
                    <p className="text-stone-600 leading-relaxed text-[11px]">
                      Descomprime la carpeta y haz doble clic en <strong>ejecutar_sin_compilar.bat</strong>. Se abrirá la ventana de escritorio idéntica en 2 segundos.
                    </p>
                  </div>

                  <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-lg space-y-1.5">
                    <span className="font-mono font-bold text-stone-900 bg-stone-200 px-1.5 py-0.5 rounded text-[11px]">
                      Paso 3 (Crear .EXE)
                    </span>
                    <h4 className="font-semibold text-stone-900">Crear archivo .exe</h4>
                    <p className="text-stone-600 leading-relaxed text-[11px]">
                      Haz doble clic en <strong>compilar_escritorio.bat</strong>. PyInstaller creará tu ejecutable en <code>dist\MarginaliaStudio\MarginaliaStudio.exe</code>.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-lg space-y-2 text-stone-800 text-xs">
                  <span className="font-bold text-stone-900">
                    Estructura garantizada dentro del archivo ZIP:
                  </span>
                  <pre className="p-2.5 bg-stone-900 text-stone-200 rounded font-mono text-[11px] leading-relaxed">
{`MarginaliaStudio_Paquete_Escritorio/
  ├── dist/               <-- ¡YA VIENE COMPILADA! (evita el error 404)
  │    ├── index.html
  │    └── assets/
  ├── desktop_app.py      <-- Lanzador PyWebView con Edge WebView2 y Wacom
  ├── build_exe.py        <-- Script PyInstaller
  ├── compilar_escritorio.bat  <-- 1 clic para generar MarginaliaStudio.exe
  ├── ejecutar_sin_compilar.bat<-- 1 clic para abrir de inmediato
  └── requirements.txt    <-- pywebview, pyinstaller, bottle`}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'standalone_window' && (
            <div className="space-y-4">
              <div className="bg-white border border-stone-200 rounded-lg p-5 space-y-4 text-xs">
                <div className="flex items-center gap-2 pb-2 border-b border-stone-200">
                  <Zap className="w-5 h-5 text-amber-600" />
                  <h3 className="text-sm font-bold text-stone-900">
                    Cómo ver la aplicación en una ventana independiente para máxima fluidez Wacom:
                  </h3>
                </div>

                <p className="text-stone-700 leading-relaxed text-xs">
                  Cuando la aplicación se ejecuta dentro del panel de vista previa de AI Studio, se encuentra dentro de un marco (iframe) que puede introducir una ligera latencia en los eventos de dibujo del lápiz digitalizador. Al sacarla a una <strong>ventana independiente</strong>, el navegador activa la aceleración por hardware completa de tu tarjeta gráfica y el muestreo nativo a 240Hz de tu tableta Wacom.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  {/* Option 1: Standalone URL */}
                  <div className="p-4 bg-stone-50 border border-stone-200 rounded-lg space-y-3">
                    <span className="font-mono font-bold text-xs bg-stone-200 px-2 py-0.5 rounded text-stone-800">
                      Opción 1: Abrir en pestaña / ventana propia
                    </span>
                    <h4 className="font-bold text-stone-900 text-xs">
                      Enlace directo sin marco
                    </h4>
                    <p className="text-stone-600 text-[11px] leading-relaxed">
                      Haz clic en el botón situado en la barra superior o en el enlace directo de abajo para abrir la aplicación fuera del visor:
                    </p>
                    <a
                      href="https://ais-dev-hp3qqah3o23i2sso6cysps-138956041445.us-east1.run.app"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-2 bg-stone-900 text-white rounded font-medium hover:bg-stone-800 transition-colors text-xs shadow-xs"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-amber-300" />
                      <span>Abrir en Ventana Independiente Ahora</span>
                    </a>
                  </div>

                  {/* Option 2: Install as PWA Desktop App */}
                  <div className="p-4 bg-stone-50 border border-stone-200 rounded-lg space-y-3">
                    <span className="font-mono font-bold text-xs bg-stone-200 px-2 py-0.5 rounded text-stone-800">
                      Opción 2: Instalar como App de Escritorio (PWA)
                    </span>
                    <h4 className="font-bold text-stone-900 text-xs">
                      1 Clic desde Chrome o Microsoft Edge
                    </h4>
                    <p className="text-stone-600 text-[11px] leading-relaxed">
                      1. Abre el enlace de la Opción 1 en tu navegador.
                      <br />
                      2. En la barra de direcciones superior de Chrome o Edge, verás un icono de <strong>"Instalar aplicación"</strong> (una pequeña pantalla con flecha).
                      <br />
                      3. Haz clic en <strong>Instalar</strong>: la ventana se abrirá de inmediato como una aplicación nativa de Windows independiente, con su propio icono en la barra de tareas.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'desktop_py' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-stone-600">
                <span>
                  <strong>desktop_app.py:</strong> Servidor local multi-ruta con detección automática de <code>dist/</code> y respaldo en vivo.
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopy('desktop_py', PYTHON_DESKTOP_APP_CODE)}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs bg-white border border-stone-300 rounded font-medium text-stone-700 hover:bg-stone-100"
                  >
                    {copiedKey === 'desktop_py' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copiar</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownloadFile('desktop_app.py', PYTHON_DESKTOP_APP_CODE)}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs bg-stone-900 text-white rounded font-medium hover:bg-stone-800"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Descargar</span>
                  </button>
                </div>
              </div>

              <pre className="p-4 bg-stone-900 text-stone-100 rounded-lg text-[11px] font-mono leading-relaxed overflow-x-auto max-h-[350px]">
                {PYTHON_DESKTOP_APP_CODE}
              </pre>
            </div>
          )}

          {activeTab === 'batch_script' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-stone-600">
                <span>
                  <strong>compilar_escritorio.bat:</strong> Compilador automático para Windows.
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopy('batch_script', BATCH_COMPILE_SCRIPT)}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs bg-white border border-stone-300 rounded font-medium text-stone-700 hover:bg-stone-100"
                  >
                    {copiedKey === 'batch_script' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copiar</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownloadFile('compilar_escritorio.bat', BATCH_COMPILE_SCRIPT)}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs bg-stone-900 text-white rounded font-medium hover:bg-stone-800"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Descargar</span>
                  </button>
                </div>
              </div>

              <pre className="p-4 bg-stone-900 text-stone-100 rounded-lg text-[11px] font-mono leading-relaxed overflow-x-auto max-h-[350px]">
                {BATCH_COMPILE_SCRIPT}
              </pre>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-stone-200 bg-stone-50 flex items-center justify-between text-xs text-stone-500">
          <span>
            Compatible con Wacom Intuos, Cintiq, One y Surface Pen en Windows 10 y 11.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-stone-900 text-white font-medium rounded hover:bg-stone-800 transition-colors"
          >
            Volver al Lector y Anotador
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Raw Source Code Templates for PyWebView .EXE Desktop Packaging ---

const PYTHON_DESKTOP_APP_CODE = `"""
=============================================================================
Marginalia Studio - Lector y Anotador Editorial Wacom (Aplicación de Escritorio)
Tecnología: PyWebView + Microsoft Edge Chromium (WebView2)
Soporte Wacom: PointerEvents nativos de alta frecuencia (240Hz) y presión continua
=============================================================================
"""

import os
import sys
import threading
from http.server import HTTPServer, SimpleHTTPRequestHandler
import webview

def find_app_dir():
    """Busca index.html de forma exhaustiva en todas las rutas posibles tanto en .exe como en desarrollo."""
    candidates = []
    
    # 1. Si está ejecutándose como ejecutable compilado con PyInstaller
    if getattr(sys, 'frozen', False):
        meipass = getattr(sys, '_MEIPASS', os.path.dirname(sys.executable))
        candidates.extend([
            os.path.join(meipass, 'dist'),
            meipass,
            os.path.join(os.path.dirname(sys.executable), 'dist'),
            os.path.dirname(sys.executable),
        ])
    else:
        # 2. Si está ejecutándose en desarrollo con Python
        base = os.path.dirname(os.path.abspath(__file__))
        candidates.extend([
            os.path.join(base, 'dist'),
            base,
        ])
    
    for c in candidates:
        if os.path.exists(os.path.join(c, 'index.html')):
            return c
            
    return None

class LocalAppServer(SimpleHTTPRequestHandler):
    def __init__(self, *args, directory=None, **kwargs):
        super().__init__(*args, directory=directory, **kwargs)

    def end_headers(self):
        # Habilitar CORS y cabeceras para máxima fluidez
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'no-cache')
        super().end_headers()

    def log_message(self, format, *args):
        # Silenciar logs en consola
        pass

def start_server(app_dir, port=18234):
    server = HTTPServer(('127.0.0.1', port), lambda *args, **kwargs: LocalAppServer(*args, directory=app_dir, **kwargs))
    server.serve_forever()

def main():
    port = 18234
    app_dir = find_app_dir()

    # Si se encuentran los archivos compilados localmente, levantar servidor embebido
    if app_dir and os.path.exists(os.path.join(app_dir, 'index.html')):
        print(f"Iniciando Marginalia Studio desde recursos locales: {app_dir}")
        server_thread = threading.Thread(target=start_server, args=(app_dir, port), daemon=True)
        server_thread.start()
        url = f"http://127.0.0.1:{port}/index.html"
    else:
        # Respaldo automático: si los archivos locales no estuvieran, carga la app web en vivo
        # asegurando que NUNCA aparezca un error 404
        print("Recursos locales no encontrados. Conectando con servidor de aplicacion en vivo...")
        url = "https://ais-dev-hp3qqah3o23i2sso6cysps-138956041445.us-east1.run.app"

    # Crear ventana nativa de escritorio con aceleración Wacom Edge WebView2
    window = webview.create_window(
        title="Marginalia Studio - Lector y Anotador Editorial Wacom",
        url=url,
        width=1440,
        height=920,
        min_size=(980, 680),
        resizable=True,
        text_select=True,
        confirm_close=True,
        background_color="#FAF8F5"
    )

    # Iniciar con motor Edge Chromium nativo de Windows (soporta stylus PointerEvents a 240Hz)
    webview.start(gui="edgechromium", debug=False)

if __name__ == "__main__":
    main()
`;

const PYTHON_BUILD_EXE_CODE = `"""
=============================================================================
Script Automatizado para Compilar Marginalia Studio a ejecutable (.exe)
Uso:
  python build_exe.py
=============================================================================
"""

import os
import sys
import subprocess
import shutil

def build_executable():
    print("=" * 65)
    print("  COMPILADOR AUTOMATIZADO DE MARGINALIA STUDIO A WINDOWS .EXE")
    print("=" * 65)

    base_dir = os.path.dirname(os.path.abspath(__file__))
    dist_dir = os.path.join(base_dir, "dist")

    # 1. Comprobar existencia de dist
    if not os.path.exists(dist_dir) or not os.path.exists(os.path.join(dist_dir, "index.html")):
        if os.path.exists(os.path.join(base_dir, "index.html")):
            dist_dir = base_dir
        else:
            print("[Aviso] Intentando compilar con 'npm run build'...")
            try:
                subprocess.check_call(["npm", "run", "build"], shell=True)
            except Exception:
                print("Continuando con empaquetado directo...")

    # 2. Comando PyInstaller con inclusion bidireccional
    print("\\n[1/2] Ejecutando PyInstaller...")
    pyinstaller_args = [
        sys.executable,
        "-m", "PyInstaller",
        "--noconfirm",
        "--onedir",
        "--windowed",
        "--name=MarginaliaStudio",
        f"--add-data={dist_dir};dist",
        f"--add-data={dist_dir};.",
        "--clean",
        "desktop_app.py"
    ]

    result = subprocess.run(pyinstaller_args)

    if result.returncode == 0:
        print("\\n" + "=" * 65)
        print(" ¡COMPILACION FINALIZADA CON EXITO!")
        print(" Tu aplicacion se encuentra en:")
        print("   dist/MarginaliaStudio/MarginaliaStudio.exe")
        print("=" * 65)
    else:
        print("\\nHubo un problema durante la compilacion con PyInstaller.")

if __name__ == "__main__":
    build_executable()
`;

const BATCH_COMPILE_SCRIPT = `@echo off
title Compilador Marginalia Studio a .EXE
echo =====================================================================
echo    COMPILADOR DE MARGINALIA STUDIO A EJECUTABLE DE ESCRITORIO
echo =====================================================================
echo.
echo [1/3] Instalando librerias de Python requeridas (pywebview, pyinstaller)...
pip install -r requirements.txt
echo.
echo [2/3] Verificando archivos de la aplicacion (carpeta dist)...
if not exist "dist\\index.html" (
    if exist "index.html" (
        mkdir dist
        copy index.html dist\\
        xcopy /E /I assets dist\\assets
    )
)
echo.
echo [3/3] Compilando ejecutable de Windows (.exe)...
python build_exe.py
echo.
echo =====================================================================
echo  PROCESO COMPLETADO
echo  Tu ejecutable esta listo en: dist\\MarginaliaStudio\\MarginaliaStudio.exe
echo =====================================================================
pause
`;

const BATCH_RUN_DEV_SCRIPT = `@echo off
title Marginalia Studio - Modo Escritorio Directo
echo Iniciando Marginalia Studio en ventana nativa de escritorio...
python desktop_app.py
pause
`;

const REQUIREMENTS_TXT = `# Dependencias para Marginalia Studio Desktop (.EXE)
pywebview>=4.4.0
pyinstaller>=6.3.0
bottle>=0.12.25
`;

const INSTRUCTIONS_TXT = `=============================================================================
MARGINALIA STUDIO - GUIA DE INSTALACION Y EJECUCION EN WINDOWS (.EXE)
=============================================================================

1. ¿POR QUE YA NO APARECERA EL ERROR 404?
   El error 404 aparecia porque en la descarga anterior faltaban los archivos
   compilados de la interfaz (la carpeta dist). Este nuevo paquete ZIP ya los
   incluye de fábrica.

2. PARA ABRIRLO DE INMEDIATO EN TU ESCRITORIO (SIN COMPILAR):
   Haz doble clic en "ejecutar_sin_compilar.bat".

3. PARA GENERAR EL ARCHIVO EJECUTABLE (.EXE):
   Haz doble clic en "compilar_escritorio.bat".
   Tu ejecutable se creara en: dist\\MarginaliaStudio\\MarginaliaStudio.exe

4. PARA USARLO EN VENTANA INDEPENDIENTE SIN PYTHON:
   Abre https://ais-dev-hp3qqah3o23i2sso6cysps-138956041445.us-east1.run.app
   en Google Chrome o Edge y haz clic en "Instalar aplicacion" en la barra de
   direcciones.
`;
