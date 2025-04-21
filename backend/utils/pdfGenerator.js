// backend/utils/pdfGenerator.js
const hummus = require('muhammara');
const moment = require('moment');

async function generateInvoicePDF(data) {
  return new Promise((resolve, reject) => {
    try {
      const {
        invoiceNumber,
        date,
        company,
        customer,
        services,
        subtotal,
        salesTax,
        totalDue
      } = data;

      // create a PDF writer that streams directly to HTTP response
      const writer = hummus.createWriterToModify(
        new hummus.PDFRStreamForBuffer(Buffer.from('')),
        new hummus.PDFStreamForResponse()
      );

      // A4 portrait: 595×842 pts
      const page = writer.createPage(0, 0, 595, 842);
      const cxt  = writer.startPageContentContext(page);

      // helper to draw text at (x,y) pts from top‑left
      const drawText = (txt, x, y, opts = {}) => {
        cxt.writeText(
          txt,
          x,
          842 - y,
          {
            font: writer.getFontForFile(
              opts.bold
                ? require.resolve('muhammara/resources/fonts/Helvetica-Bold.ttf')
                : require.resolve('muhammara/resources/fonts/Helvetica.ttf')
            ),
            size: opts.size || 10,
            colorspace: 'gray',
            color: opts.color != null ? opts.color : 0x00,
            realtextSize: opts.realtextSize || false
          }
        );
      };

      // ── Header ───────────────────────────────────────────────
      drawText(company.name,   50, 50, { size: 20 });
      drawText(company.desc,   50, 75, { size: 10, color: 0x888888 });
      drawText('INVOICE',      400, 50, { size: 20, color: 0x888888, bold: true });

      // Company address & contact
      drawText(`Address: ${company.addressLine1}`, 50, 110);
      drawText(company.addressLine2,               50, 125);
      drawText(`Phone: ${company.phone}`,           50, 140);
      drawText(`Fax:   ${company.fax}`,             50, 155);

      // Invoice # and date
      drawText(`INVOICE #${invoiceNumber}`, 400, 140);
      drawText(`Date: ${moment(date).format('DD/MM/YYYY')}`, 400, 155);

      // ── Customer block ───────────────────────────────────────
      drawText('TO:', 50, 200, { size: 12 });
      drawText(customer.name,       50, 220);
      drawText(`Phone: ${customer.phone}`, 50, 235);
      drawText(`Email: ${customer.email}`, 50, 250);

      // ── Table ────────────────────────────────────────────────
      const tableX      = 50;
      const tableWidth  = 500;
      const col1        = tableX;
      const col2        = tableX + 100;
      const col3        = tableX + 430;
      const tableTop    = 300;
      const headerH     = 30;
      const rowH        = 30;
      const numRows     = services.length;
      const tableH      = headerH + rowH * numRows;

      // outer rectangle
      cxt.drawRectangle(
        tableX,
        842 - (tableTop + tableH),
        tableWidth,
        tableH,
        { type: 'stroke', color: 0x00 }
      );

      // vertical lines
      [col1, col2, col3, col1 + tableWidth].forEach(x =>
        cxt.drawLine(
          x,
          842 - tableTop,
          x,
          842 - (tableTop + tableH)
        )
      );

      // horizontal header line
      cxt.drawLine(
        tableX,
        842 - (tableTop + headerH),
        tableX + tableWidth,
        842 - (tableTop + headerH)
      );

      // row separators
      for(let i = 1; i <= numRows; i++){
        cxt.drawLine(
          tableX,
          842 - (tableTop + headerH + rowH * i),
          tableX + tableWidth,
          842 - (tableTop + headerH + rowH * i)
        );
      }

      // header titles
      drawText('ITEM',        col1 + 5,  tableTop + 10, { size: 12, bold: true });
      drawText('DESCRIPTION', col2 + 5,  tableTop + 10, { size: 12, bold: true });
      drawText('TOTAL (RM)',  col3 + 5,  tableTop + 10, { size: 12, bold: true });

      // row contents
      services.forEach((svc, idx) => {
        const y = tableTop + headerH + rowH * idx + 20;
        drawText(`${idx+1}. ${svc.label}`,      col1 + 5, y);
        drawText(svc.description,               col2 + 5, y, { size: 10 });
        drawText(svc.amount.toFixed(2),        col3 + 5, y, { realtextSize: true });
      });

      // ── Totals ───────────────────────────────────────────────
      let y = tableTop + headerH + rowH * numRows + 40;
      drawText('SUBTOTAL',       col3 - 80, y, { bold: true });
      drawText(subtotal.toFixed(2), col3 + 5, y, { realtextSize: true });
      y += 20;
      drawText('SALES TAX (6%)',  col3 - 80, y, { bold: true });
      drawText(salesTax.toFixed(2), col3 + 5, y, { realtextSize: true });
      y += 20;
      drawText('TOTAL DUE',       col3 - 80, y, { size: 12, bold: true });
      drawText(totalDue.toFixed(2), col3 + 5, y, { size: 12, realtextSize: true });

      // ── Payment instructions ─────────────────────────────────
      y += 60;
      drawText('Make all checks payable to Travel Planner Agency', tableX, y, { size: 8 });
      y += 15;
      drawText('If you have any questions concerning this invoice, feel free to contact James at:', tableX, y, { size: 8 });
      y += 15;
      drawText(`• Phone: ${company.phone}`, tableX, y, { size: 8 });
      y += 10;
      drawText('• Email: james@travelplanner.com', tableX, y, { size: 8 });

      // ── Footer ────────────────────────────────────────────────
      drawText(
        'THANK YOU FOR YOUR BUSINESS!',
        295,
        820,
        { size: 12, bold: true, realtextSize: true, align: 'center' }
      );

      // finish up
      writer.writePage(page).end();
    } catch (err) {
      return reject(err);
    }
  });
}

module.exports = { generateInvoicePDF };
