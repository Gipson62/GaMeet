import express from "express";
import {default as Router} from "./routes/index.js";
import cors from "cors";
import internalIp from 'internal-ip';

const internalIP = internalIp.v4.sync();

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());
app.use(Router);

app.listen(port, () => {
    console.log(`Example app listening at address: http://${internalIP}:${port}`);
});