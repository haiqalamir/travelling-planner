const express = require('express');
const cors = require('cors');  // <-- Require the cors middleware
const mongoose = require('mongoose');

// Import routes
const holidayPlannerRoutes = require('./api/routes/holidayPlanner');
const viewPlansRoutes = require('./api/routes/viewPlans');
const generateInvoiceRoutes = require('./api/routes/generateInvoice');
const registerRoutes = require('./api/routes/register'); 
const loginRoutes = require('./api/routes/login');       

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS with specific options
const corsOptions = {
  origin: 'http://localhost:3000', // Allow only the frontend origin
  optionsSuccessStatus: 200         // Some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(cors(corsOptions));  // <-- Use cors middleware

// Body parser middleware
app.use(express.json());

// Connect to MongoDB (update your connection string if needed)
mongoose.connect('mongodb://travelUser:travelPassword@139.99.36.18:1303/travelPlanner', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error: ", err));

// Set up routes
app.use('/api/holidayPlanner', holidayPlannerRoutes);
app.use('/api/viewPlans', viewPlansRoutes);
app.use('/api/generateInvoice', generateInvoiceRoutes);
app.use('/api/register', registerRoutes);
app.use('/api/login', loginRoutes);

// Basic endpoint to confirm the API is running
app.get('/', (req, res) => {
  res.send('Travel Planner API is running.');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
