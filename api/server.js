import express from "express";
import {default as Router} from "./routes/index.js";
import cors from "cors";
import internalIp from 'internal-ip';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './swaggerConfig.js';

const internalIP = internalIp.v4.sync();

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

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

app.listen(port, () => {
    console.log(`Example app listening at address: http://${internalIP}:${port}`);
    console.log(`Swagger UI available at: http://${internalIP}:${port}/api-docs`);
});