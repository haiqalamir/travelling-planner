const express = require('express');
const authMiddleware = require('../middleware/auth');
const Trip = require('../../models/Trip');
const Invoice = require('../../models/Invoice');
const hummus = require('muhammara');
const moment = require('moment');

const router = express.Router();

// POST /api/generateInvoice
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { tripId } = req.body;
    const customerId = req.user.id;

    // 1) Fetch trip & verify ownership
    const trip = await Trip.findOne({ _id: tripId, customerId });
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    // 2) Build services list & compute totals
    const services = [
      { label: 'Accommodation', description: 'Stay at a hotel with comfortable rooms and essential amenities for your vacation.', amount: 150.00 },
      { label: 'Transport',      description: 'Includes airport transfers and transportation within the destination city.',      amount: 50.00  },
      { label: 'Entertainment',  description: 'Access to local attractions, guided tours, and cultural events during your stay.',       amount: 100.00 },
      { label: 'Meals',          description: 'Full meal plan including breakfast, lunch, and dinner at selected restaurants or the hotel.', amount: 60.00  },
      { label: 'Insurance',      description: 'Comprehensive travel insurance covering cancellations, medical emergencies, and lost luggage.', amount: 30.00  },
      { label: 'Misc',           description: 'Additional expenses such as service fees, taxes, or tips during the trip.',            amount: 25.00  },
    ];

    const subtotal  = services.reduce((sum, s) => sum + s.amount, 0);
    const salesTax  = parseFloat((subtotal * 0.06).toFixed(2));
    const totalDue  = parseFloat((subtotal + salesTax).toFixed(2));

    // 3) Determine next invoice number
    const lastInvoice = await Invoice.findOne().sort({ invoiceNumber: -1 });
    const nextNumber  = lastInvoice
      ? String(parseInt(lastInvoice.invoiceNumber, 10) + 1).padStart(4, '0')
      : '0001';

    // 4) Persist invoice record
    await Invoice.create({
      invoiceNumber: nextNumber,
      customerId,
      tripId,
      items:    services,
      subtotal,
      salesTax,
      total:    totalDue
    });

    // 5) Stream PDF response
    res.set({
      'Content-Type':        'application/pdf',
      'Content-Disposition': `attachment; filename=invoice-${nextNumber}.pdf`
    });

    const writer = hummus.createWriter(new hummus.PDFStreamForResponse(res));
    const page   = writer.createPage(0, 0, 595, 842);
    const cxt    = writer.startPageContentContext(page);

    // Helper: draw text with built‑in fonts
    function drawText(text, x, y, options = {}) {
      cxt.writeText(text, x, 842 - y, {
        font:      options.bold ? 'Helvetica-Bold' : 'Helvetica',
        size:      options.size || 10,
        colorspace:'gray',
        color:     options.color != null ? options.color : 0x00
      });
    }

    // === HEADER ===
    drawText('Travel Planner Agency',      50,  50, { size:20 });
    drawText('Building memories for you',  50,  75, { size:10, color:0x888888 });
    drawText('INVOICE',                   400,  50, { size:20, bold:true, color:0x888888 });

    // Company details
    drawText('456, Jalan Bunga Raya',      50, 110);
    drawText('Kuala Lumpur, WP 50000',    50, 125);
    drawText('Phone: +60 3-1234 5678',     50, 140);
    drawText('Fax:   +60 3-8765 4321',     50, 155);

    // Invoice metadata
    drawText(`INVOICE #${nextNumber}`,    400, 140);
    drawText(`Date: ${moment().format('DD/MM/YYYY')}`, 400, 155);

    // Customer block
    drawText('TO:',                       50, 200, { size:12 });
    drawText(req.user.name  || trip.customerName,        50, 220);
    drawText(`Phone: ${req.user.phone  || trip.customerPhone}`, 50, 235);
    drawText(`Email: ${req.user.email  || trip.customerEmail}`, 50, 250);

    // === TABLE ===
    const tableX = 50, tableW = 500;
    const col1   = tableX, col2 = tableX + 100, col3 = tableX + 430;
    const top    = 300, hdrH = 30, rowH = 30, rows = services.length;
    const tableH = hdrH + rowH * rows;

    // Outer border
    cxt.drawRectangle(tableX, 842 - (top + tableH), tableW, tableH, { type:'stroke' });

    // Vertical lines (as zero‑width rectangles)
    [col1, col2, col3, col1 + tableW].forEach(x =>
      cxt.drawRectangle(x, 842 - (top + tableH), 0, tableH, { type:'stroke' })
    );

    // Horizontal header‑divider
    cxt.drawRectangle(tableX, 842 - (top + hdrH), tableW, 0, { type:'stroke' });

    // Horizontal row lines
    for (let i = 1; i <= rows; i++) {
      cxt.drawRectangle(
        tableX,
        842 - (top + hdrH + rowH * i),
        tableW,
        0,
        { type:'stroke' }
      );
    }

    // Table headers
    drawText('ITEM',         col1 + 5, top + 10, { size:12, bold:true });
    drawText('DESCRIPTION',  col2 + 5, top + 10, { size:12, bold:true });
    drawText('TOTAL (RM)',   col3 + 5, top + 10, { size:12, bold:true });

    // Table rows
    services.forEach((svc, i) => {
      const y = top + hdrH + rowH * i + 20;
      drawText(`${i+1}. ${svc.label}`, col1 + 5, y);
      drawText(svc.description,        col2 + 5, y, { size:10 });
      drawText(svc.amount.toFixed(2),  col3 + 5, y);
    });

    // Totals block
    let yPos = top + hdrH + rowH * rows + 40;
    drawText('SUBTOTAL',       col3 - 80, yPos, { bold:true });
    drawText(subtotal.toFixed(2), col3 + 5, yPos);
    yPos += 20;
    drawText('SALES TAX (6%)', col3 - 80, yPos, { bold:true });
    drawText(salesTax.toFixed(2),   col3 + 5, yPos);
    yPos += 20;
    drawText('TOTAL DUE',      col3 - 80, yPos, { size:12, bold:true });
    drawText(totalDue.toFixed(2),   col3 + 5, yPos, { size:12 });

    // Footer notes
    yPos += 60;
    drawText('Make all checks payable to Travel Planner Agency', tableX, yPos, { size:8 });
    yPos += 15; drawText('If you have any questions concerning this invoice, contact James:', tableX, yPos, { size:8 });
    yPos += 15; drawText('• Phone: +60 3-1234 5678', tableX, yPos, { size:8 });
    yPos += 10; drawText('• Email: james@travelplanner.com', tableX, yPos, { size:8 });
    drawText('THANK YOU FOR YOUR BUSINESS!', 295, 820, { size:12, bold:true });

    // Finish
    writer.writePage(page);
    writer.end();
  } catch (err) {
    console.error(err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Error generating invoice PDF' });
    }
  }
});

module.exports = router;
