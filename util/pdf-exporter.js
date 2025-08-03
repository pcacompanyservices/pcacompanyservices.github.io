// Export a function to export a DOM node as a PDF using jsPDF and html2canvas
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
    let y = margin;
    pdf.addImage(imgData, 'PNG', margin, y, imgWidth, imgHeight);
    pdf.save(filename);
    onComplete();
  });
}
