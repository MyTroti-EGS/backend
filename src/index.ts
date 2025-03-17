import dotenv from 'dotenv';
dotenv.config();

import BackendApp from './BackendApp';

const app = new BackendApp();

process.on('SIGINT', app.gracefullyStop);
process.on('SIGTERM', app.gracefullyStop);

app.listen(parseInt(process.env.PORT ?? "5000"));
