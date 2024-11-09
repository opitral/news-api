import express from 'express';
import mongoose from "mongoose";
import cors from "cors";
import dotenv from 'dotenv';

import NewsController from './controllers/NewsController.js';
import UserController from './controllers/UserController.js';

import UserService from "./services/UserService.js";

dotenv.config();
const userService = new UserService();

mongoose.connect(process.env.DB_URL)
    .then(() => {
        console.log("Connected to database");
        initializeAdminUsers().then(() => console.log("Admin users initialized"));
    })
    .catch((error) => {
        console.error(`Error connecting to the database: ${error}`);
    });

const app = express();
const port = process.env.PORT || 8080;

async function initializeAdminUsers() {
    console.log("Initialize admin users");
    try {
        const allowedIps = process.env.ALLOWED_IPS?.split(',');
        if (allowedIps && typeof allowedIps.length) {
            for (const ip of allowedIps) {
                const ip_trimmed = ip.trim();
                await userService.getUserByIpElseCreate(ip_trimmed);
                await userService.setUserRole(ip_trimmed, "admin");
            }
        } else {
            await userService.getUserByIpElseCreate(allowedIps);
            await userService.setUserRole(allowedIps, "admin");
        }
    } catch (error) {
        console.error(`Error initializing admin users: ${error}`);
    }
}

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
app.use("/api/users", UserController);

app.listen(port, (error) => {
    if (error) {
        console.error(`Error at server start: ${error}`);
    } else {
        console.log(`Server is running on port: ${port}`);
    }
});