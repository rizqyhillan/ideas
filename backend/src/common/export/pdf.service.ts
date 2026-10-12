import { Injectable } from '@nestjs/common';
import { PDFDocument } from 'pdfkit';
import * as path from 'path';

/**
 * PDF generation service using pdfkit.
 * Produces a downloadable PDF file from structured data (e.g., master data tables).
 */
@Injectable()
export class PdfService {
  private readonly robotoRegular?: string;

  constructor() {
    // Load Roboto fonts from the pdfmake package's bundled fonts
    try {
      const robotoDir = path.resolve(
        __dirname,
        '..',
        '..',
        '..',
        'node_modules',
        'pdfmake',
        'build',
        'fonts',
        'Roboto'
      );
      const fs = require('fs');
      this.robotoRegular = fs.readFileSync(
        path.resolve(robotoDir, 'Roboto-Regular.ttf'),
        'base64'
      );
    } catch {
      this.robotoRegular = undefined;
    }
  }

  /**
   * Build a PDF buffer from a dataset.
   * @param data  Array of row objects (each key = column header)
   * @param fileName  File name (without extension)
   * @param title  Report title (optional)
   */
  async generatePdfBuffer(data: any[], fileName: string = 'laporan', title: string = 'Laporan Data'): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const chunks: Buffer[] = [];
        const doc = new PDFDocument({
          size: 'A4',
          margins: { top: 50, bottom: 50, left: 60, right: 60 },
          bufferPages: false,
        });

        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => {
          resolve(Buffer.concat(chunks));
        });
        doc.on('error', reject);

        // Font: use Helvetica (built-in) for simplicity
        doc.font('Helvetica');

        // Title
        doc.fontSize(18);
        doc.font('Helvetica');
        doc.text(title, { align: 'center' });
        doc.moveDown(0.5);

        // Subheader
        doc.fontSize(10);
        doc.font('Helvetica');
        doc.fillColor('#666666');
        doc.text(
          `Jumlah data: ${data.length} baris`,
          { align: 'center' }
        );
        doc.moveDown(0.5);

        if (data && data.length > 0) {
          const headers = Object.keys(data[0]);
          const rows = data.map((item) =>
            headers.map((h) => String(item[h] ?? ''))
          );

          const pageWidth =
            doc.page.width - doc.page.margins.left - doc.page.margins.right;
          const rowHeight = 18;

          // Header background
          doc.rect(
            doc.page.margins.left,
            doc.y,
            pageWidth,
            20
          ).fill('#3b82f6').stroke('#3b82f6');
          doc.moveTo(doc.page.margins.left, doc.y);
          doc.lineTo(doc.page.margins.left + pageWidth, doc.y).stroke('#3b82f6');

          // Header text
          doc.fontSize(9);
          doc.font('Helvetica');
          doc.fillColor('#ffffff');
          doc.text(
            headers.join('\t'),
            doc.page.margins.left + 4,
            doc.y + 5,
            { width: pageWidth - 8, align: 'center' }
          );
          doc.moveDown(0.2);

          // Data rows
          rows.forEach((row, i) => {
            const y = doc.y;
            if (i % 2 === 1) {
              doc.rect(doc.page.margins.left, y, pageWidth, rowHeight)
                .fill('#f0f4f8')
                .stroke('#f0f4f8');
            }
            doc.fontSize(8);
            doc.font('Helvetica');
            doc.fillColor('#1e293b');
            doc.text(
              row.join('\t'),
              doc.page.margins.left + 4,
              y + 6,
              { width: pageWidth - 8, align: 'left' }
            );
            doc.moveDown(0.5);
            if (doc.y > doc.page.height - doc.page.margins.bottom - 40) {
              doc.addPage();
            }
          });
        } else {
          doc.fontSize(10);
          doc.font('Helvetica');
          doc.fillColor('#666666');
          doc.text('Tidak ada data untuk dilaporkan.', { align: 'center' });
        }

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }
}
