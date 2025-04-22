// backend/api/routes/generateInvoice.js

const express        = require('express');
const authMiddleware = require('../middleware/auth');
const Trip           = require('../../models/Trip');
const Invoice        = require('../../models/Invoice');
const hummus         = require('muhammara');
const moment         = require('moment');

const router = express.Router();

function streamPdf(res, trip, invoiceNum, services, subtotal, salesTax, totalDue, inline = false) {
  // 1) set headers
  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': `${inline ? 'inline' : 'attachment'}; filename=invoice-${invoiceNum}.pdf`
  });

  // 2) create Hummus writer
  const writer = hummus.createWriter(new hummus.PDFStreamForResponse(res));

  // 3) load the real TTFs from node_modules/muhammara/fonts
  const fontRegular = writer.getFontForFile(
    require.resolve('muhammara/fonts/Helvetica.ttf')
  );
  const fontBold    = writer.getFontForFile(
    require.resolve('muhammara/fonts/Helvetica-bold.ttf')
  );

  // 4) start page
  const page = writer.createPage(0, 0, 595, 842);
  const cxt  = writer.startPageContentContext(page);

  function drawText(text, x, y, opts = {}) {
    cxt.writeText(
      text,
      x,
      842 - y,
      {
        font:  opts.bold ? fontBold    : fontRegular,
        size:  opts.size  || 10,
        colorspace: 'gray',
        color: opts.color != null ? opts.color : 0x00
      }
    );
  }

  // === HEADER ===
  drawText('Travel Planner Agency',    50,  50, { size:20 });
  drawText('Building memories for you',50,  75, { size:10, color:0x888888 });
  drawText('INVOICE',                 400,  50, { size:20, bold:true, color:0x888888 });

  // Company info
  drawText('456, Jalan Bunga Raya',   50, 110);
  drawText('Kuala Lumpur, WP 50000', 50, 125);
  drawText('Phone: +60 3-1234 5678',  50, 140);
  drawText('Fax: +60 3-8765 4321',    50, 155);

  // Invoice metadata
  drawText(`INVOICE #${invoiceNum}`,  400, 140);
  drawText(`Date: ${moment().format('DD/MM/YYYY')}`, 400, 155);

  // — CUSTOMER —
  drawText('TO:',                    50, 200, { size:12 });
  drawText(trip.customerName,       50, 220);
  drawText(`Phone: ${trip.customerPhone}`, 50, 235);
  drawText(`Email: ${trip.customerEmail}`, 50, 250);

  // — ITEMS TABLE —
  const tableX = 50, tableW = 500;
  const col1   = tableX, col2 = tableX + 100, col3 = tableX + 430;
  const top    = 300, hdrH = 30, rowH = 30;
  const rows   = services.length;
  const tableH = hdrH + rowH * rows;

  cxt.drawRectangle(tableX, 842 - (top + tableH), tableW, tableH, { type:'stroke' });
  [col1, col2, col3, col1 + tableW].forEach(x =>
    cxt.drawRectangle(x, 842 - (top + tableH), 0, tableH, { type:'stroke' })
  );
  cxt.drawRectangle(tableX, 842 - (top + hdrH), tableW, 0, { type:'stroke' });
  for (let i = 1; i <= rows; i++) {
    cxt.drawRectangle(
      tableX,
      842 - (top + hdrH + rowH * i),
      tableW, 0,
      { type:'stroke' }
    );
  }

  drawText('ITEM',        col1 + 5, top + 10, { size:12, bold:true });
  drawText('DESCRIPTION', col2 + 5, top + 10, { size:12, bold:true });
  drawText('TOTAL (RM)',  col3 + 5, top + 10, { size:12, bold:true });

  services.forEach((svc, i) => {
    const y = top + hdrH + rowH * i + 20;
    drawText(`${i+1}. ${svc.label}`, col1 + 5, y);
    drawText(svc.description,        col2 + 5, y, { size:10 });
    drawText(svc.amount.toFixed(2),  col3 + 5, y);
  });

  // — TOTALS —
  let yPos = top + hdrH + rowH * rows + 40;
  drawText('SUBTOTAL',      col3 - 80, yPos, { bold:true });
  drawText(subtotal.toFixed(2), col3 + 5, yPos);
  yPos += 20;
  drawText('SALES TAX (6%)', col3 - 80, yPos, { bold:true });
  drawText(salesTax.toFixed(2),   col3 + 5, yPos);
  yPos += 20;
  drawText('TOTAL DUE',      col3 - 80, yPos, { size:12, bold:true });
  drawText(totalDue.toFixed(2),   col3 + 5, yPos);

  // Footer
  yPos += 60;
  drawText('Make all checks payable to Travel Planner Agency', tableX, yPos, { size:8 });
  yPos += 15;
  drawText('Questions? Contact James:', tableX, yPos, { size:8 });
  yPos += 15;
  drawText('• Phone: +60 3-1234 5678',      tableX, yPos, { size:8 });
  yPos += 10;
  drawText('• Email: james@travelplanner.com', tableX, yPos, { size:8 });
  drawText('THANK YOU FOR YOUR BUSINESS!', 295, 820, { size:12, bold:true });

  // finish
  writer.writePage(page);
  writer.end();
  res.end();
}

// POST → generate & download
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { tripId } = req.body;
    const customerId = req.user.id;
    const trip       = await Trip.findOne({ _id: tripId, customerId });
    if (!trip) return res.status(404).json({ error: 'Trip not found' });

    const services = [
      { label:'Accommodation', description:'Stay at a hotel…', amount:150.00 },
      { label:'Transport',     description:'Airport & local…', amount: 50.00 },
      { label:'Entertainment', description:'Tours & events…', amount:100.00 },
      { label:'Meals',         description:'Full meal plan…', amount: 60.00 },
      { label:'Insurance',     description:'Comprehensive…', amount: 30.00 },
      { label:'Misc',          description:'Service fees…', amount: 25.00 },
    ];
    const subtotal = services.reduce((a,s)=>a+s.amount,0);
    const salesTax = parseFloat((subtotal*0.06).toFixed(2));
    const totalDue = subtotal + salesTax;

    const lastInv = await Invoice.findOne().sort({ invoiceNumber:-1 });
    const nextNum = lastInv
      ? String(parseInt(lastInv.invoiceNumber,10)+1).padStart(4,'0')
      : '0001';

    await Invoice.create({
      invoiceNumber: nextNum,
      customerId,
      tripId,
      items: services,
      subtotal,
      salesTax,
      total: totalDue
    });

    streamPdf(res, trip, nextNum, services, subtotal, salesTax, totalDue, false);
  } catch (err) {
    console.error(err);
    if (!res.headersSent) res.status(500).json({ error: 'Error generating invoice PDF' });
  }
});

// GET → view inline
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { tripId } = req.query;
    const customerId = req.user.id;
    const inv        = await Invoice.findOne({ tripId, customerId });
    if (!inv) return res.status(404).json({ error: 'Invoice not found' });

    const trip     = await Trip.findById(tripId);
    const services = inv.items.map(i=>({
      label: i.description,
      description: i.description,
      amount: i.amount
    }));
    const subtotal = parseFloat(services.reduce((a,s)=>a+s.amount,0).toFixed(2));
    const salesTax = parseFloat((subtotal*0.06).toFixed(2));
    const totalDue = inv.total;
    const invNum   = String(inv.invoiceNumber).padStart(4,'0');

    streamPdf(res, trip, invNum, services, subtotal, salesTax, totalDue, true);
  } catch (err) {
    console.error(err);
    if (!res.headersSent) res.status(500).json({ error: 'Error streaming invoice PDF' });
  }
});

module.exports = router;
