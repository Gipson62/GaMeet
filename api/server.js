import express from "express";
import { default as Router } from "./routes/index.js";
import cors from "cors";
import internalIp from "internal-ip";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./swaggerConfig.js";
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const internalIP = internalIp.v4.sync();

const app = express();
const port = 3001;

const requestLogger = (req, res, next) => {
  const started = Date.now();
  console.log(`${new Date().toISOString()} [req] ${req.method} ${req.originalUrl}`);

  res.on("finish", () => {
    const durationMs = Date.now() - started;
    console.log(`${new Date().toISOString()} [res: ${res.statusCode}] ${req.method} ${req.originalUrl}. Took: (${durationMs}ms)`);
  });

  next();
};

// Configuration CORS permissive pour le développement mobile
app.use(cors({
  origin: '*', // Autorise toutes les origines (utile pour le mobile)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(requestLogger);

// Servir les fichiers statiques (images)
// IMPORTANT : Rend le dossier 'uploads' accessible publiquement via /uploads
// On utilise path.resolve pour être sûr du chemin absolu
app.use('/uploads', express.static(path.resolve(__dirname, 'uploads')));

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  swaggerOptions: {
    url: '/swagger.json'
  }
}));

// Swagger JSON endpoint
app.get('/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

app.use(Router);

app.use((err, req, res, next) => {
  console.error(`${new Date().toISOString()} [error] ${req.method} ${req.originalUrl} -> ${err.message}`);
  if (err.stack) {
    console.error(err.stack);
  }

  if (res.headersSent) {
    return next(err);
  }

  res.status(err.status || 500).json({ error: "Internal server error" });
});

// Écoute sur toutes les interfaces réseau (0.0.0.0) au lieu de localhost uniquement
app.listen(port, '0.0.0.0', () => {
  console.log(`Example app listening at address: http://${internalIP}:${port}`);
  console.log(`Also accessible locally at: http://localhost:${port}`);
  console.log(`Swagger UI available at: http://${internalIP}:${port}/api-docs`);
});