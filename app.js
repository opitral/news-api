import express from 'express';
import mongoose from "mongoose";
import cors from "cors";
import dotenv from 'dotenv';

import NewsController from './controllers/NewsController.js';
import UserService from "./services/UserService.js";

dotenv.config();
const userService = new UserService();

mongoose.connect(process.env.DB_URL)
    .then(() => {
        console.log("Connected to database");
    })
    .catch((error) => {
        console.error(`Error connecting to the database: ${error}`);
    });

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(async (req, _, next) => {
    try {
        await userService.getUserByIpElseCreate(req.ip);
        await userService.updateUserLastOnline(req.ip);
    } catch (error) {
        console.error(`Error in user IP handling middleware: ${error}`);
    }
    next();
});

app.use("/api/news", NewsController);

app.listen(port, (error) => {
    if (error) {
        console.error(`Error at server start: ${error}`);
    } else {
        console.log(`Server is running on port: ${port}`);
    }
});