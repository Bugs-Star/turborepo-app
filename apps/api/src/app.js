// src/app.js
import express from 'express';
import cors from 'cors';
import qs from 'qs';
import routes from './routes/index.js';

const app = express();

// 미들웨어
app.use(cors());
app.use(express.json());

// query parser
app.set('query parser', str => qs.parse(str));

// 라우트
app.use('/', routes);

export default app;