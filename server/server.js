const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// DB Config
const db = 'mongodb://127.0.0.1:27017/ai-budget-db'; // Local MongoDB

// Connect to MongoDB
mongoose
    .connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB Connected...'))
    .catch(err => console.log(err));

// Use Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/finance', require('./routes/finance'));
app.use('/api/ai', require('./routes/ai'));

// Serve static assets in production (if built)
if (process.env.NODE_ENV === 'production' || true) { // Always serve if folder exists for simplicity in this demo
    app.use(express.static(path.join(__dirname, '../client/dist')));

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, '../client', 'dist', 'index.html'));
    });
}

const PORT = 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
