// src/app.js
import express from 'express';
import cors from 'cors';
import qs from 'qs';
import routes from './routes/index.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// 미들웨어
app.use(cors());
app.use(express.json());

// query parser
app.set('query parser', str => qs.parse(str));

// 정적 파일 서빙 (업로드된 이미지)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 라우트
app.use('/', routes);

export default app;