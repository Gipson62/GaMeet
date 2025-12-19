import express from "express";
import { default as Router } from "./routes/index.js";
import cors from "cors";
import internalIp from "internal-ip";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./swaggerConfig.js";

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

app.use(cors());
app.use(express.json());
app.use(requestLogger);

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

app.listen(port, () => {
  console.log(`Example app listening at address: http://${internalIP}:${port}`);
  console.log(`Swagger UI available at: http://${internalIP}:${port}/api-docs`);
});