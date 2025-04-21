// server.js
const express = require('express');
const cors    = require('cors');
const mongoose = require('mongoose');

const holidayPlannerRoutes   = require('./api/routes/holidayPlanner');
const viewPlansRoutes        = require('./api/routes/viewPlans');
const generateInvoiceRoutes  = require('./api/routes/generateInvoice');
const registerRoutes         = require('./api/routes/register');
const loginRoutes            = require('./api/routes/login');
const invoiceRoutes          = require('./api/routes/invoices');

const app = express();
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());

mongoose
  .connect('mongodb://travelUser:travelPassword@139.99.36.18:1303/travelPlanner', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// 🔑 Make sure these match exactly:
app.use('/api/holidayPlanner', holidayPlannerRoutes);
app.use('/api/viewPlans',      viewPlansRoutes);
app.use('/api/register',       registerRoutes);
app.use('/api/login',          loginRoutes);
app.use('/api/invoices',       invoiceRoutes);
app.use('/api/generateInvoice', generateInvoiceRoutes);

app.listen(process.env.PORT || 3001, () => {
  console.log(`Server running on port ${process.env.PORT || 3001}`);
});
