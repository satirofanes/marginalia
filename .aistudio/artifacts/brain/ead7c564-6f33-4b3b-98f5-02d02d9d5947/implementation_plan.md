# Plan de Implementación: Fluidez Wacom Caligráfica y Empaquetado Desktop .EXE Idéntico

Corrige la geometría de trazo recto en tabletas digitalizadoras Wacom implementando un estabilizador caligráfico ultra-suave con captura de eventos coalescentes (`getCoalescedEvents`), y reestructura el empaquetado a `.exe` para que el ejecutable de escritorio sea 100% idéntico a la interfaz de Marginalia Studio mediante PyWebView y PyInstaller.

## Decisiones Críticas y Preferencias del Usuario

> [!IMPORTANT]
> Se han incorporado las preferencias confirmadas por el usuario en la fase interactiva:
> - **Empaquetado de escritorio**: Ejecutable nativo con PyWebView y PyInstaller que renderiza exactamente la misma interfaz web, garantizando paridad visual al 100% sin discordancias.
> - **Respuesta del trazo Wacom**: Estabilizador de trazo ultra-suave tipo caligrafía con amortiguación viscoelástica y captura de micro-muestreo a alta frecuencia.

---

## 1. Diagnóstico de los Problemas

### Problema 1: Trazos con líneas rectas en lugar de curvas fluidas
- **Causa raíz técnica**: En navegadores y sistemas Windows, los eventos estándar `pointermove` descartan coordenadas intermedias cuando el lápiz se mueve a velocidad media/alta (coalescencia de eventos por defecto del sistema operativo). Además, el dibujo entre puntos discretos utilizaba interpolación cuadrática simple con pocos puntos de control, produciendo segmentos facetados.
- **Solución**:
  1. Extraer todos los micro-puntos emitidos por el digitalizador Wacom mediante `e.getCoalescedEvents()`, multiplicando por 4 el número de muestras por segundo (hasta 240 Hz).
  2. Implementar un filtro estabilizador caligráfico (algoritmo *Streamline / Dynamic Spring Filter*) que suaviza la aceleración del trazo.
  3. Renderizar las curvas con splines bicúbicos de Catmull-Rom y cálculo de normales para variación de grosor continua sin quiebres poligonales.

### Problema 2 y 3: El archivo .exe generado no se parece a la previsualización
- **Causa raíz técnica**: El script anterior `app_desktop.py` compilaba un prototipo mínimo en PyQt6 puro que no contenía los componentes, estilos Tailwind, tipografías ni la maquetación editorial del visor web.
- **Solución**:
  1. Cambiar la arquitectura de empaquetado a **PyWebView + PyInstaller**.
  2. `desktop_app.py`: Script en Python que levanta una ventana nativa de Windows (usando el motor Microsoft Edge Chromium WebView2 integrado en Windows 10/11) y sirve los activos estáticos compilados de la aplicación.
  3. `build_exe.py` y `compilar_escritorio.bat`: Script en un solo clic que compila los activos de la aplicación web (`npm run build`), los incrusta en el paquete binario de PyInstaller y produce un único archivo `MarginaliaStudio.exe`. Al hacer doble clic en el `.exe`, se abre de inmediato la aplicación exacta con todas sus herramientas, visor multiformato e índice editorial.
  4. Generador y descargador directo del paquete completo (`MarginaliaStudio_Desktop_Pack.zip`) con todos los archivos necesarios y un archivo `.bat` para ejecutar en Windows sin complicaciones.

---

## 2. Arquitectura del Sistema

```
┌────────────────────────────────────────────────────────────────────────┐
│                        MARGINALIA STUDIO                               │
├───────────────────────────────────┬────────────────────────────────────┤
│       ENTRADA DE TABLETA WACOM    │      ARQUITECTURA DE ESCRITORIO    │
│                                   │                                    │
│   [ Wacom Pen / EMR Stylus ]      │   [ MarginaliaStudio.exe ]         │
│               │                   │              │                     │
│               ▼                   │              ▼                     │
│   e.getCoalescedEvents() (240Hz)  │   Python (desktop_app.py)          │
│               │                   │              │                     │
│               ▼                   │              ▼                     │
│   Estabilizador Caligráfico       │   PyWebView (Edge WebView2)        │
│   (Filtro de amortiguación)       │              │                     │
│               │                   │              ▼                     │
│               ▼                   │   Interfaz Editorial Completa      │
│   Interpolación Catmull-Rom       │   (100% idéntica a la vista web)   │
│               │                   │   - Visor multiformato             │
│               ▼                   │   - Motor Wacom de alta precisión  │
│   Lienzo de Tinta Digital         │   - Índice de notas y marcas       │
└───────────────────────────────────┴────────────────────────────────────┘
```

---

## 3. Plan de Modificaciones de Código

### A. Motor de Tinta y Estabilizador Caligráfico (`src/components/WacomAnnotationCanvas.tsx`)
- Integrar captura de eventos coalescentes (`e.getCoalescedEvents() || [e]`) en `handlePointerMove`.
- Implementar algoritmo de suavizado caligráfico con buffer circular de puntos y proyección spline Catmull-Rom.
- Añadir control de nivel de estabilización en la barra de herramientas (Natural, Equilibrado, Caligráfico Ultra-suave).
- Ajustar la función de cálculo de normales para que los extremos del trazo terminen en punta cónica natural de pluma estilográfica.

### B. Hub y Scripts de Compilación a .EXE (`src/components/PythonDesktopHubModal.tsx`)
- Actualizar `desktop_app.py` para usar PyWebView con soporte completo de eventos táctiles y de puntero Wacom.
- Crear el script `compilar_escritorio.bat` y `build_exe.py` que empaqueta automáticamente la aplicación compilada en `MarginaliaStudio.exe`.
- Incorporar botón de **"Descargar Paquete Completo de Escritorio (.zip)"** que genera un archivo comprimido descargable con:
  - `desktop_app.py`
  - `build_exe.py`
  - `compilar_escritorio.bat` (ejecución con 1 solo clic en Windows)
  - `requirements.txt`
  - Guía paso a paso ilustrada en español.

### C. Barra de Herramientas y Opciones de Trazo (`src/components/Toolbar.tsx`)
- Agregar selector de estabilización de trazo (*Caligrafía Wacom*) directamente en la cinta de instrumentos para que el usuario pueda calibrar la suavidad según su ritmo de escritura.
- Acceso directo al botón de empaquetado de escritorio con instrucciones paso a paso.

---

## 4. Verificación y Pruebas
1. **Prueba de trazo y curvatura**: Trazar curvas rápidas, círculos cerrados y bucles caligráficos comprobando que no aparezcan aristas poligonales ni líneas rectas.
2. **Prueba de sensibilidad a la presión**: Verificar modulación gradual del grosor del trazo con diferentes niveles de fuerza del lápiz.
3. **Verificación de compilación web**: Ejecutar `compile_applet` y `lint_applet` para confirmar cero errores de tipos o sintaxis.
4. **Verificación de scripts Python**: Comprobar la sintaxis y estructura de los archivos generadores del `.exe`.
