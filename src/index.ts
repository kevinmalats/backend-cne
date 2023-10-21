import express from 'express';
import http from 'http'
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import cors from 'cors';
import mongoose from 'mongoose';
import router from './router';
const app = express();
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URL = process.env.MONGO_URL;
const PORT = process.env.PORT;
const DATABASE_NAME = process.env.DATABASE_NAME;
console.log(MONGO_URL);
app.use(cors({
    credentials: true,
}));

app.use(compression());
app.use(cookieParser());
app.use(bodyParser.json());

const server = http.createServer(app);

server.listen(PORT, () => {
    console.log('Server is running in http://localhost:'+PORT);
});



mongoose.Promise = Promise;
mongoose.connect(MONGO_URL+DATABASE_NAME)

//mongoose.connection.on('error', (error: Error) => console.log(error))
const db = mongoose.connection;

db.on('error', (error) => {
    console.error('MongoDB connection error:', error);
});

db.once('open', () => {
    console.log(`Connected to the database: ${DATABASE_NAME}`);
});

app.use("/",(req, res, next) => {
   res.send("Hello World");
});

app.use('/api/v1/', router());