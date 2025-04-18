const express = require('express');
const authMiddleware = require('../middleware/auth');
const pdfGenerator = require('../../utils/pdfGenerator');
const router = express.Router();

// POST /api/generateInvoice
router.post('/', authMiddleware, async (req, res) => {
  try {
    const invoiceData = req.body;
    // The invoiceData should include all items and details required by the template
    const pdfBuffer = await pdfGenerator.generateInvoicePDF(invoiceData);
    
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=invoice.pdf'
    });
    res.send(pdfBuffer);
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error generating invoice PDF' });
  }
});

module.exports = router;
