import express from 'express';
import {config} from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { connection } from './Database/dbConnection.js';

export const app = express();
config({path:"./config.env"});

app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
}))

app.use(express.json());
app.use(cookieParser()); 
app.use(express.urlencoded({extended: true}));

connection();

