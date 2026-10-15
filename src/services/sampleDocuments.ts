import { DocumentModel, AnnotationStroke } from '../types/document';

export const SAMPLE_DOCUMENTS: DocumentModel[] = [
  {
    id: 'doc-novel-proof',
    title: 'Manuscrito Editorial: La Huella del Escriba (Capítulo 1)',
    fileName: 'La_Huella_del_Escriba_Cap1.docx',
    fileSize: '1.4 MB',
    format: 'docx',
    totalPages: 3,
    author: 'Elena Morales de la Vega',
    dateCreated: 'Revisión editorial 2026',
    pages: [
      {
        pageIndex: 0,
        pageNumber: 1,
        title: 'I. La biblioteca de piedra',
        textContent: `CAPÍTULO PRIMERO
LA BIBLIOTECA DE PIEDRA

El polvo flotaba en suspensión sobre la galería de los incunables con la lentitud de las cosas que han renunciado al tiempo. Don Julián Valderrama sostenía la lupa con dos dedos trémulos, sin atreverse a rozar el pergamino carmesí.

—¿Está seguro de que las anotaciones al margen corresponden al siglo XVII? —preguntó Mariana, inclinándose sobre el atril con la impaciencia propia de quien ha cruzado media Europa tras una conjetura.

El archivero no respondió de inmediato. Sus pupilas, veladas por una catarata incipiente, se detuvieron en una diminuta caligrafía cursiva que bordeaba el tercer párrafo del folio cuarenta y dos. Alguien había trazado allí una advertencia en tinta ferrogalorrecina, ya oxidada hacia un tono pardo rojizo:

«Non omnis moriar; sed scripta manent in tenebris.»

—No es solo una cita de Horacio alterada —susurró Valderrama, acariciando la madera carcomida de la mesa—. Observe el trazo de las letras capitulares: el copista utilizó una pluma de ganso cortada en bisel estrecho, característica inequívoca del taller de Amberes hacia 1648. Pero la glosa interlineal... la glosa fue añadida por otra mano, al menos setenta años después.

Mariana extrajo su libreta de campo encuadernada en piel oscura y deslizó el grafito con presteza. El silencio del claustro mayor solo era interrumpido por el graznido distante de los grajos en los contrafuertes góticos. Afuera, la llovizna castellana comenzaba a humedecer los sillares centenarios.

—Si la segunda mano data de comienzos del siglo XVIII —razonó ella en voz baja—, significa que el manuscrito estuvo en posesión de los jesuitas antes de la expulsión decretada por Carlos III. Eso corroboraría la carta hallada en el archivo de Simancas.

Valderrama levantó la vista y sus ojos parecieron buscar algo más allá de las vidrieras desvaídas.

—Significa algo más temible, mi querida colega. Significa que quien añadió la nota conocía de antemano el destino de la congregación y ocultó la clave cartográfica entre los comentarios a la patrística.`,
      },
      {
        pageIndex: 1,
        pageNumber: 2,
        title: 'II. El criptograma entre líneas',
        textContent: `II. EL CRIPTOGRAMA ENTRE LÍNEAS

El análisis espectrométrico preliminar reveló que el pigmento de la glosa marginal contenía restos de óxido de hierro mezclado con hollín vegetal y goma arábiga de procedencia levantina. No se trataba de una tinta monacal ordinaria; era la receta predilecta de los círculos diplomáticos y de correspondencia cifrada de la corte de Felipe V.

Mariana cotejó los márgenes con la transcripción tipográfica moderna preparada por el Instituto de Filología Clásica. Cada seis líneas de texto latino aparecía un punto milimétrico punteado a punzón sobre el pergamino, invisible a simple vista pero palpable al tacto del pulgar.

«La secuencia numérica obedece a una permutación geométrica de base siete:
Folio 42r: Líneas 3, 10, 17, 24 y 31.
Folio 42v: Líneas 7, 14, 21 y 28.»

El viejo bibliotecario encendió una lámpara de luz rasante. Al incidir los rayos tangenciales sobre la superficie vitela, las hendiduras diminutas proyectaron sombras tenues que dibujaban con nitidez la constelación de Orión unida por líneas punteadas.

—No buscaban ocultar palabras —murmuró Mariana con el pulso acelerado—. Buscaban ocultar rumbos náuticos bajo la apariencia de una apología teológica.

—Y quien poseía el libro —añadió el anciano con gravedad— sabía que ningún censor del Santo Oficio se detendría a medir las distancias entre las tildes de san Agustín.`,
      },
      {
        pageIndex: 2,
        pageNumber: 3,
        title: 'III. Cotejo documental y fuentes',
        textContent: `III. COTEJO DOCUMENTAL Y FUENTES

Documentos relacionados catalogados en el fondo reservado:

1. Legajo 418/B: Correspondencia confidencial entre el confesor real y el abad de San Isidoro (1703–1715).
2. Manuscrito MS-1492: Inventario de bienes muebles y reliquias transportadas durante la noche del 31 de marzo.
3. Pliego suelto 89: Mapa esquemático del estuario del Guadalquivir con acotaciones manuscritas en tinta sepia.

Notas metodológicas para la edición crítica:
• Mantener la ortografía original en las citas latinas del aparato crítico.
• Indicar en nota al pie la discrepancia paleográfica entre la copia de Simancas y el ejemplar de la Biblioteca Vaticana.
• Proceder a la digitalización multiespectral antes de la restauración química del soporte celulósico.`,
      }
    ]
  },
  {
    id: 'doc-academic-paper',
    title: 'Paper de Investigación: Algoritmos de Tinta Digital y Dinámica Stylus',
    fileName: 'Paper_Investigacion_Tinta_Wacom.pdf',
    fileSize: '2.8 MB',
    format: 'pdf',
    totalPages: 2,
    author: 'Dra. Celia Romero & Dr. Tomás Bermejo',
    dateCreated: 'Revista de Computación Gráfica (2026)',
    pages: [
      {
        pageIndex: 0,
        pageNumber: 1,
        title: 'Sección 1: Modelado de presión en estiletes pasivos y activos',
        textContent: `INVESTIGACIÓN EN INTERFACES NATURALES Y COMPUTACIÓN GRÁFICA
Vol. 18, N.º 4, pp. 245–262 (2026)

MODELADO DINÁMICO DE TRAZOS DE TINTA SENSIBLES A PRESIÓN EN DISPOSITIVOS DIGITALIZADORES WACOM Y EMULACIÓN DE PLUMA EDITORIAL

Dra. Celia Romero (1), Dr. Tomás Bermejo (2)
(1) Departamento de Arquitectura de Sistemas, Universidad Politécnica
(2) Laboratorio de Interacción Humano-Computadora

RESUMEN:
Presentamos una formulación basada en splines de Catmull-Rom con atenuación de fluctuaciones de alta frecuencia y respuesta viscoelástica simulada para tabletas Wacom basadas en tecnología de resonancia electromagnética (EMR). El sistema procesa eventos de puntero de 240 Hz registrando simultáneamente la presión normalizada P ∈ [0.0, 1.0], los ángulos de inclinación (tiltX, tiltY) y el identificador de botón de borrado inverso. Se introduce una función de grosor continuo W(t) = W_base · (0.25 + 1.5 · P(t)^1.4) que reproduce fidedignamente la apertura de plumilla de oro de 14k bajo esfuerzo mecánico.

1. INTRODUCCIÓN Y ANTECEDENTES
El proceso de corrección editorial tradicional descansa sobre la agilidad de los signos diacríticos, corchetes de párrafo y flechas de remisión al margen trazadas a mano sobre galeradas impresas. Los sistemas digitales habituales carecen de sensibilidad a la micro-dinámica muscular del revisor, forzando un trazo uniforme de vector rígido que fatiga la mano.

2. ARQUITECTURA DE MUESTREO DE ALTA VELOCIDAD
El controlador digitalizador emite ráfagas de coordenadas temporales con resolución de presión de hasta 8192 niveles discretos. Para evitar el aliasing o quiebres poligonales en esquinas vivas, aplicamos interpolación Bézier bicúbica proyectada sobre el espacio euclidiano del documento.`,
      },
      {
        pageIndex: 1,
        pageNumber: 2,
        title: 'Sección 2: Indexación de glosas y marginalia colaborativa',
        textContent: `3. SISTEMA DE INDEXACIÓN DE GLOSAS Y MARCAS AL MARGEN
Uno de los principales desafíos en la revisión de textos científicos es la desvinculación entre el trazo gráfico (e.g. subrayado, flecha de derivación) y la anotación semántica formal.

Proponemos la asignación automática de un token identificador estructurado [ID-NN] en el momento de levantamiento del estilete (evento PointerUp):
• El centroide baricéntrico del trazo define la coordenada de anclaje (X_a, Y_a).
• Se proyecta un rayo ortogonal hacia el canal de margen reservado exterior (X_m, Y_m).
• El identificador se indexa en una tabla hash B-tree permitiendo filtrado instantáneo por severidad, autor y categoría temática.

4. RESULTADOS EXPERIMENTALES Y DISCUSIÓN
En pruebas ciegas con 24 correctores profesionales de editoriales universitarias, la tasa de satisfacción táctil aumentó un 88% respecto al trazo monolineal estándar, con una reducción del 42% en el tiempo necesario para localizar y verificar enmiendas complejas.

5. CONCLUSIONES
La integración de hardware EMR/Wacom con identificadores persistentes de glosas proporciona una transición transparente entre la práctica artesanal del impresor y la gestión de bases de datos de erratas en entornos editoriales modernos.`,
      }
    ]
  },
  {
    id: 'doc-excel-financial',
    title: 'Plan Financiero y Tiradas Editoriales 2026-2027',
    fileName: 'Plan_Tiradas_Costos_2026.xlsx',
    fileSize: '890 KB',
    format: 'xlsx',
    totalPages: 2,
    author: 'Departamento de Producción y Finanzas',
    dateCreated: 'Septiembre 2026',
    pages: [
      {
        pageIndex: 0,
        pageNumber: 1,
        title: 'Hoja 1: Presupuesto de Producción por Colección',
        tableData: {
          sheets: [
            {
              name: 'Costos de Impresión',
              headers: ['Colección', 'Tirada (Ejemplares)', 'Gramaje Papel (g)', 'Páginas Promedio', 'Costo Unitario (€)', 'Total Producción (€)', 'Margen Bruto (%)'],
              rows: [
                ['Clásicos Universales', '3,500', '90g Ahuesado', '480', '3.42', '11,970.00', '64.5%'],
                ['Ensayo Contemporáneo', '2,000', '80g Offset crema', '320', '2.85', '5,700.00', '58.2%'],
                ['Narrativa Hispánica', '5,000', '90g Verjurado', '290', '2.60', '13,000.00', '68.0%'],
                ['Poesía y Aforismos', '1,200', '110g Munken Pure', '160', '3.90', '4,680.00', '49.0%'],
                ['Manuales Académicos', '1,800', '90g Blanco satinado', '620', '5.10', '9,180.00', '55.3%'],
                ['Arte y Arquitectura', '1,500', '150g Estucado mate', '340', '8.75', '13,125.00', '47.8%']
              ]
            }
          ]
        }
      },
      {
        pageIndex: 1,
        pageNumber: 2,
        title: 'Hoja 2: Retribución de Derechos de Autor y Anticipos',
        tableData: {
          sheets: [
            {
              name: 'Regalías y Anticipos',
              headers: ['Título Asignado', 'Autor / Traductor', 'Anticipo (€)', '% Regalía Papel', '% Regalía eBook', 'Fecha Liquidación', 'Estado'],
              rows: [
                ['La Huella del Escriba', 'Elena Morales de la Vega', '4,500.00', '10.0%', '25.0%', '15/12/2026', 'Aprobado'],
                ['Cartografía de la Peste', 'Dr. Ignacio Soria', '2,800.00', '8.0%', '20.0%', '30/11/2026', 'En trámite'],
                ['Tratado de la Claridad', 'M. Dupond (Trad. R. Gil)', '3,200.00', '9.0%', '22.0%', '15/01/2027', 'Pendiente firma'],
                ['Fisiología de la Lectura', 'Dra. Celia Romero', '3,000.00', '10.0%', '25.0%', '28/02/2027', 'Aprobado'],
                ['Poemas de la Ría', 'A. Souto Cordeiro', '1,500.00', '12.0%', '30.0%', '15/10/2026', 'Liquidado']
              ]
            }
          ]
        }
      }
    ]
  },
  {
    id: 'doc-epub-book',
    title: 'Edición Digital: Manual de Tipografía y Criterio Editorial',
    fileName: 'Criterio_Editorial_Tipografia.epub',
    fileSize: '1.9 MB',
    format: 'epub',
    totalPages: 2,
    author: 'Cátedra de Artes Gráficas',
    dateCreated: '2026 ePub 3.0',
    pages: [
      {
        pageIndex: 0,
        pageNumber: 1,
        title: 'Capítulo 1: La jerarquía del espacio en blanco',
        textContent: `MANUAL DE TIPOGRAFÍA Y CRITERIO EDITORIAL

CAPÍTULO 1
LA JERARQUÍA DEL ESPACIO EN BLANCO

La tipografía no consiste meramente en la elección de caracteres de imprenta, sino en la administración musical de los silencios entre las palabras y en la periferia de la página. El margen no es un vacío residual: es el marco arquitectónico que protege el acto de la lectura frente a las distracciones del mundo exterior.

Reglas canónicas de la proporción áurea en el libro impreso:
1. El margen interior (de lomo) debe ser siempre el más estrecho para evitar la distorsión de curvatura en la encuadernación.
2. El margen de cabeza o superior debe guardar una proporción de 1 a 1.4 con respecto al margen de lomo.
3. El margen exterior (de corte) debe proporcionar espacio suficiente para que los pulgares del lector descansen sin ocultar el texto y para albergar las notas o glosas marginales.
4. El margen de pie o inferior debe ser el más generoso de todos (proporción 2 a 2.5), otorgando estabilidad óptica a la caja tipográfica.

Cuando un corrector anota a mano sobre un documento con estilete Wacom, su pluma busca intuitivamente este margen exterior para desplegar las aclaraciones que desbordan el flujo principal del párrafo.`,
      },
      {
        pageIndex: 1,
        pageNumber: 2,
        title: 'Capítulo 2: Los signos diacríticos de corrección de estilo',
        textContent: `CAPÍTULO 2
LOS SIGNOS DIACRÍTICOS DE CORRECCIÓN DE ESTILO

El código convencional de corrección de pruebas tipográficas normalizado por la norma UNE e ISO comprende un repertorio gráfico de altísima precisión:

• El deleátur (dele): Signo espiral semejante a una 'd' minúscula cursiva con bucle que ordena la supresión de un carácter o palabra errónea.
• La ligadura de acercamiento: Dos arcos convexos contrapuestos que señalan la unión de dos vocablos indebidamente separados.
• El espaciado: Un triángulo invertido o corchete en cuña que indica la necesidad de intercalar un blanco fino o espacio ordinario.
• El cambio de cuerpo o fuente: Línea ondulada bajo el vocablo para cursiva, doble subrayado continuo para versalitas y triple subrayado para mayúsculas netas.
• El corchete marginal de sangría: Señala el inicio o retroceso del sangrado de primera línea.

Cada una de estas marcas, al ser trazada con precisión sobre la superficie de cristal de la tableta, debe quedar vinculada a un identificador numérico o alfanumérico que permita al cajista o diseñador verificar su cumplimiento sin equívocos.`,
      }
    ]
  }
];

// Initial realistic editorial annotations to demonstrate immediately
export const INITIAL_ANNOTATIONS: Record<string, AnnotationStroke[]> = {
  'doc-novel-proof': [
    {
      id: 'ann-1',
      markId: 'ED-01',
      pageIndex: 0,
      tool: 'pen',
      color: '#DC2626', // Classic editorial correction red
      baseWidth: 3.5,
      opacity: 0.95,
      points: [
        { x: 380, y: 195, pressure: 0.72 },
        { x: 405, y: 197, pressure: 0.85 },
        { x: 440, y: 196, pressure: 0.65 },
        { x: 470, y: 194, pressure: 0.40 },
        { x: 485, y: 180, pressure: 0.30 },
        { x: 495, y: 165, pressure: 0.55 },
        { x: 485, y: 155, pressure: 0.70 },
        { x: 460, y: 160, pressure: 0.45 },
      ],
      bbox: { minX: 380, minY: 155, maxX: 495, maxY: 197 },
      createdAt: Date.now() - 1000 * 60 * 45,
      author: 'Corrector de Estilo',
      title: 'Puntuación en diálogo con guion largo',
      comment: 'Sustituir el guion corto por raya tipográfica española (—) y comprobar que no quede espacio entre la raya y el signo de interrogación que abre la réplica.',
      category: 'correccion',
      status: 'pendiente',
      marginCalloutX: 680,
      marginCalloutY: 175
    },
    {
      id: 'ann-2',
      markId: 'ED-02',
      pageIndex: 0,
      tool: 'highlighter',
      color: '#FEF08A', // Pale yellow translucent
      baseWidth: 22,
      opacity: 0.55,
      points: [
        { x: 120, y: 310, pressure: 0.60 },
        { x: 260, y: 310, pressure: 0.65 },
        { x: 420, y: 310, pressure: 0.62 },
        { x: 550, y: 310, pressure: 0.58 },
      ],
      bbox: { minX: 120, minY: 298, maxX: 550, maxY: 322 },
      createdAt: Date.now() - 1000 * 60 * 30,
      author: 'Editor Literario',
      title: 'Verificación de anacronismo histórico',
      comment: 'Verificar si la receta de tinta ferrogalorrecina en Amberes ya se utilizaba de forma estándar en 1648 con este aditivo específico. Sugiero contrastar con la monografía de Paleografía de Simancas.',
      category: 'fuente',
      status: 'en_revision',
      marginCalloutX: 680,
      marginCalloutY: 310
    },
    {
      id: 'ann-3',
      markId: 'ED-03',
      pageIndex: 0,
      tool: 'bracket',
      color: '#1E3A8A', // Deep lapis blue
      baseWidth: 3,
      opacity: 0.9,
      points: [
        { x: 85, y: 460, pressure: 0.8 },
        { x: 65, y: 460, pressure: 0.7 },
        { x: 65, y: 550, pressure: 0.75 },
        { x: 85, y: 550, pressure: 0.7 },
      ],
      bbox: { minX: 65, minY: 460, maxX: 85, maxY: 550 },
      createdAt: Date.now() - 1000 * 60 * 15,
      author: 'Mariana (Investigadora)',
      title: 'Párrafo excelente de ambientación',
      comment: 'La atmósfera del claustro mayor y la lluvia castellana dota al pasaje de una tensión lírica impecable. Mantener exactamente como está.',
      category: 'aprobado',
      status: 'resuelto',
      marginCalloutX: 680,
      marginCalloutY: 505
    }
  ],
  'doc-academic-paper': [
    {
      id: 'ann-ac-1',
      markId: 'REF-01',
      pageIndex: 0,
      tool: 'pen',
      color: '#DC2626',
      baseWidth: 3,
      opacity: 0.95,
      points: [
        { x: 140, y: 340, pressure: 0.8 },
        { x: 380, y: 340, pressure: 0.7 },
        { x: 390, y: 335, pressure: 0.5 },
      ],
      bbox: { minX: 140, minY: 335, maxX: 390, maxY: 345 },
      createdAt: Date.now() - 1000 * 60 * 60,
      author: 'Revisor Anónimo 1',
      title: 'Comprobar ecuación de grosor W(t)',
      comment: 'Aclarar si el exponente 1.4 fue ajustado empíricamente mediante regresión de mínimos cuadrados o deducido de la física de la deformación elástica de plumilla.',
      category: 'duda',
      status: 'en_revision',
      marginCalloutX: 680,
      marginCalloutY: 340
    }
  ]
};
