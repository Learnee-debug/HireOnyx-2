const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();

// CORS: support multiple origins (local dev + production)
const ALLOWED_ORIGINS = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:4173', // Vite preview
].filter(Boolean);

app.use(helmet());
app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return cb(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    cb(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/health', require('./src/routes/health.routes'));
app.use('/api/ai', require('./src/routes/ai.routes'));
app.use('/api/auth', require('./src/routes/auth.routes'));

// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({ success: false, error: `Route ${req.method} ${req.path} not found` });
});

// Error middleware MUST be last
app.use(require('./src/middleware/error.middleware'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`HireOnyx backend running on port ${PORT}`));
