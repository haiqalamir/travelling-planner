const fs = require("fs");
const path = require("path");
const handlebars = require("handlebars");
const mara = require("muhammara"); // Ensure this package is installed

// Function to generate the invoice PDF
async function generateInvoicePDF(invoiceData) {
  // Read the Handlebars invoice template
  const templatePath = path.join(__dirname, "../templates/invoice.hbs");
  const templateContent = fs.readFileSync(templatePath, "utf-8");
  const template = handlebars.compile(templateContent);

  // Generate HTML content using the template and invoice data
  const htmlContent = template(invoiceData);

  // (This is a placeholder for actual PDF generation using muhammara.)
  // For now, we return a Buffer created from the HTML content.
  const pdfBuffer = Buffer.from(htmlContent);

  return pdfBuffer;
}

module.exports = {
  generateInvoicePDF,
};
