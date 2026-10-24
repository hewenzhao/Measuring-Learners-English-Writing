const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

function generatePdf() {
  const mdPath = path.join(__dirname, 'UserGuide.md');
  const pdfPath = path.join(__dirname, 'public', 'UserGuide.pdf');

  const content = fs.readFileSync(mdPath, 'utf-8');
  const lines = content.split('\n');

  const doc = new PDFDocument({
    margin: 50,
    size: 'A4',
    info: {
      Title: 'Measuring Learners English Writing - User Guide',
      Author: 'Oscar Wenzhao He',
      Subject: 'User Guide and Methodology for English Learner Writing Analysis'
    }
  });

  const writeStream = fs.createWriteStream(pdfPath);
  doc.pipe(writeStream);

  // Set default styles
  lines.forEach((line) => {
    const trimmed = line.trim();

    if (!trimmed) {
      doc.moveDown(0.4);
      return;
    }

    if (trimmed.startsWith('# ')) {
      // Title
      doc.fillColor('#1e3a8a')
         .fontSize(22)
         .font('Helvetica-Bold')
         .text(trimmed.replace('# ', ''), { align: 'left' });
      doc.moveDown(0.5);
    } else if (trimmed.startsWith('## ')) {
      // Section Header
      doc.moveDown(0.8);
      doc.fillColor('#1d4ed8')
         .fontSize(15)
         .font('Helvetica-Bold')
         .text(trimmed.replace('## ', ''));
      doc.moveDown(0.3);
    } else if (trimmed.startsWith('### ')) {
      // Sub-section Header
      doc.moveDown(0.5);
      doc.fillColor('#374151')
         .fontSize(12)
         .font('Helvetica-Bold')
         .text(trimmed.replace('### ', ''));
      doc.moveDown(0.2);
    } else if (trimmed.startsWith('*   ') || trimmed.startsWith('-   ') || trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
      // Bullet items
      const bulletText = trimmed
        .replace(/^[\*\-]\s+/, '')
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/\*(.*?)\*/g, '$1');

      doc.fillColor('#1f2937')
         .fontSize(10)
         .font('Helvetica')
         .text('• ' + bulletText, { indent: 15, lineGap: 2 });
    } else if (trimmed.startsWith('---')) {
      doc.moveDown(0.5);
      doc.strokeColor('#e5e7eb').lineWidth(1).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown(0.5);
    } else {
      // Regular paragraph
      const cleanText = trimmed
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/\*(.*?)\*/g, '$1');

      const isDesignerNote = cleanText.includes('Designed by Oscar Wenzhao He');
      
      doc.fillColor(isDesignerNote ? '#4b5563' : '#374151')
         .fontSize(isDesignerNote ? 10 : 10)
         .font(isDesignerNote ? 'Helvetica-Oblique' : 'Helvetica')
         .text(cleanText, { lineGap: 3, align: isDesignerNote ? 'right' : 'left' });
      doc.moveDown(0.3);
    }
  });

  doc.end();

  writeStream.on('finish', () => {
    console.log('Successfully generated public/UserGuide.pdf');
  });
}

generatePdf();
