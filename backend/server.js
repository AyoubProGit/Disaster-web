import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';
import { staticCacheMiddleware, apiCacheMiddleware } from './middleware/cache.js';
import payloadRouter from './routes/payload.js';
const app = express();
const PORT = process.env.PORT || 5001;
// --- RPS Middleware (doit être AVANT routes/static) ---
const rpsWindow = new Array(10).fill(0); // 10 "tranches" de 100ms = 1s
let rpsIndex = 0;
setInterval(() => {
    rpsIndex = (rpsIndex + 1) % rpsWindow.length;
    rpsWindow[rpsIndex] = 0;
}, 100);
app.use((req, res, next) => {
    rpsWindow[rpsIndex]++;
    next();
});
app.use((_, res, next) => {
    res.set('Timing-Allow-Origin', '*');
    next();
});
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: false,
    crossOriginOpenerPolicy: false,
    // Désactiver complètement toutes les restrictions par défaut
    noSniff: false,
    ieNoOpen: false,
    hsts: false,
    frameguard: false,
    xssFilter: false
}));
app.use(cors());
app.use(compression());

// Headers CSP personnalisés pour permettre l'exécution des scripts et styles
app.use((req, res, next) => {
    res.setHeader('Content-Security-Policy', "default-src 'self' 'unsafe-inline' 'unsafe-eval' blob: data:; script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: data:; style-src 'self' 'unsafe-inline' blob: data: https://fonts.googleapis.com; img-src 'self' blob: data:; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' blob: data:;");
    next();
});
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// --- Static assets avec cache optimisé RGESN 7.x ---
app.use('/static', staticCacheMiddleware, express.static(path.join(__dirname, 'static'), {
    extensions: ['js', 'css', 'jpg', 'png', 'webp', 'avif'],
    maxAge: 31536000, // 1 an par défaut
    etag: true,
    lastModified: true
}));
// --- API server ---
app.get('/api/server', apiCacheMiddleware, (_, res) => {
    const rps = rpsWindow.reduce((a, b) => a + b, 0);
    res.json({
        memory: process.memoryUsage().rss,
        load: +os.loadavg()[0].toFixed(2),
        rps
    });
});
// --- API payload optimisée avec pagination et streaming ---
app.use('/api/payload', apiCacheMiddleware, payloadRouter);

// --- Frontend build files ---
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath, {
    maxAge: 31536000, // 1 an par défaut
    etag: true,
    lastModified: true
}));

// --- Favicon route spécifique ---
app.get('/favicon.svg', (req, res) => {
    const faviconPath = path.join(__dirname, '..', 'public', 'favicon.svg');
    res.setHeader('Content-Type', 'image/svg+xml');
    res.sendFile(faviconPath, { maxAge: 86400000 }); // 24h cache
});

// --- Serve React app for all other routes (SPA routing) ---
app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => console.log(`backend on :${PORT}`));
