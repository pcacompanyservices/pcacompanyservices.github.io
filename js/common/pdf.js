// Shared PDF export helper using jsPDF and html2canvas

export async function exportResultToPdf({
  exportContainer,
  filename = 'export.pdf',
  onStart = () => {},
  onComplete = () => {}
}) {
  if (!window.jspdf || !window.jspdf.jsPDF || !window.html2canvas) {
    throw new Error('jsPDF and html2canvas must be loaded before calling exportResultToPdf');
  }
  onStart();
  await document.fonts.ready;
  window.html2canvas(exportContainer, {
    backgroundColor: '#fff',
    scale: 2,
    useCORS: true
  }).then(canvas => {
    const imgData = canvas.toDataURL('image/png');
    const jsPDF = window.jspdf.jsPDF;
    const pdf = new jsPDF({ unit: 'pt', format: 'a4' });
    const pageWidth = 595.28;
    const margin = 40;
    const imgWidth = pageWidth - margin * 2;
    const imgHeight = canvas.height * imgWidth / canvas.width;
    pdf.addImage(imgData, 'PNG', margin, margin, imgWidth, imgHeight);
    pdf.save(filename);
    onComplete();
  });
}

export function ensureJsPdfAndHtml2Canvas(cb) {
  let loaded = 0;
  function check() { loaded++; if (loaded === 2) cb(); }
  if (!window.jspdf || !window.jspdf.jsPDF) {
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    s.onload = check;
    document.head.appendChild(s);
  } else loaded++;
  if (!window.html2canvas) {
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
    s.onload = check;
    document.head.appendChild(s);
  } else loaded++;
  if ((window.jspdf && window.jspdf.jsPDF) && window.html2canvas) cb();
}
