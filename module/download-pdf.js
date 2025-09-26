// Centralized PDF download utilities (moved to /module)
// Usage:
// import { buildStandardPdfFilename, exportResultToPdf } from '../module/download-pdf.js';

let _pdfLibPromise = null;

export function ensurePdfLibsLoaded() {
  if (_pdfLibPromise) return _pdfLibPromise;
  _pdfLibPromise = new Promise((resolve, reject) => {
    let toLoad = 0; let loaded = 0; let errored = false;
    function done() { if (errored) return; if (loaded === toLoad) resolve(); }
    function addScript(src) {
      toLoad++;
      const s = document.createElement('script');
      s.src = src;
      s.onload = () => { loaded++; done(); };
      s.onerror = () => { errored = true; reject(new Error('Failed loading ' + src)); };
      document.head.appendChild(s);
    }
    if (!window.jspdf || !window.jspdf.jsPDF) {
      addScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
    }
    if (!window.html2canvas) {
      addScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
    }
    if (toLoad === 0) resolve();
  });
  return _pdfLibPromise;
}

function withExportStyles() {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'css/export-a4.css';
  document.head.appendChild(link);
  document.body.classList.add('export-mode');
  return () => {
    document.body.classList.remove('export-mode');
    if (link.parentNode) link.parentNode.removeChild(link);
  };
}

export function buildStandardPdfFilename(prefix = '[PCA_Salary_Simulation]') {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  return `${prefix}_${day}-${month}-${year}.pdf`;
}

export async function exportResultToPdf({ exportContainer, filename = buildStandardPdfFilename(), onStart = () => {}, onComplete = () => {} }) {
  await ensurePdfLibsLoaded();
  if (!window.jspdf || !window.jspdf.jsPDF || !window.html2canvas) {
    throw new Error('PDF export libraries not available');
  }
  onStart();
  await document.fonts.ready;
  exportContainer.classList.add('export-a4');
  const cleanupStyles = withExportStyles();
  try {
    const A4_WIDTH_PX = 794;
    const A4_HEIGHT_PX = 1123;
    const CAPTURE_SCALE = 2;
    const canvas = await window.html2canvas(exportContainer, {
      backgroundColor: '#fff',
      scale: CAPTURE_SCALE,
      useCORS: true,
      width: A4_WIDTH_PX,
      height: Math.max(A4_HEIGHT_PX, exportContainer.scrollHeight),
      windowWidth: A4_WIDTH_PX,
      windowHeight: Math.max(A4_HEIGHT_PX, exportContainer.scrollHeight)
    });
    const imgData = canvas.toDataURL('image/png');
    const jsPDF = window.jspdf.jsPDF;
    const pdf = new jsPDF({ unit: 'pt', format: 'a4' });
    const pageWidthPt = 595.28;
    const marginPt = 40;
    const contentWidthPt = pageWidthPt - marginPt * 2;
    const imgHeightPt = canvas.height * (contentWidthPt / canvas.width);
    pdf.addImage(imgData, 'PNG', marginPt, marginPt, contentWidthPt, imgHeightPt);
    pdf.save(filename);
    onComplete();
  } finally {
    exportContainer.classList.remove('export-a4');
    cleanupStyles();
  }
}
