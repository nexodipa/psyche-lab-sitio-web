# Psyche Lab

## Alcance vigente: 13 de octubre de 2026

La web publica ofrece materiales educativos por encargo: guias de estudio,
diapositivas y plantillas de organizacion. Se retiraron las ofertas de sesiones,
orientacion psiquiatrica, evaluacion personal y revision de pruebas, asi como
los enlaces a muestras antiguas. Los apartados historicos de este documento
describen versiones anteriores, no servicios actualmente ofrecidos.

No se acredita habilitacion clinica ni se solicita informacion de pacientes.
Las imagenes editoriales no representan instalaciones propias.
El formulario prepara texto para copiar y no envia datos.

Verificacion: `node scripts/test-scope.cjs` con Playwright disponible.
Comprueba 12 idiomas, cuatro anchos, cobertura del texto traducible,
metadatos, anclas, avisos y ausencia de errores JavaScript.
Estas comprobaciones no equivalen a revision por hablantes nativos.

Sitio estatico de materiales educativos de psicologia: guias de estudio, resumenes,
mapas conceptuales, diapositivas y plantillas de organizacion de habitos y estudio.

## Lo que no es

No ofrece diagnostico, psicoterapia, atencion de crisis, evaluacion personal ni
interpretacion de pruebas. No acredita habilitacion clinica, no recibe historias
clinicas ni datos de pacientes, y no publica muestras de informes ni de revision
de pruebas. Las muestras PDF de versiones anteriores fueron retiradas del repositorio
el 27 de octubre de 2026 (siguen en el historial de git).

## Archivos

- `index.html`: estructura de la pagina.
- `styles.css`: estilos responsive.
- `script.js`: menu movil y formulario que prepara una solicitud copiable (no envia datos).
- `translations.js` y `scope-copy.js`: selector y paquetes de idioma para ES, EN, DE, FR, PT, IT, RU, CS, ZH, JA, HE y AR.
- `assets/`: imagenes editoriales (no representan instalaciones propias).

## Abrir

Abre `index.html` en el navegador o sube la carpeta completa a un hosting estatico.
