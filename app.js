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
                const user = await userService.getUserByIp(ip_trimmed);
                await userService.setUserRole(user.id, "admin");
            }
        } else {
            await userService.getUserByIpElseCreate(allowedIps);
            const user = await userService.getUserByIp(allowedIps);
            await userService.setUserRole(user.id, "admin");
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
        req.userIp = req.headers['x-forwarded-for'] || req.ip;
        await userService.getUserByIpElseCreate(req.userIp);
        const user = await userService.getUserByIp(req.userIp);
        await userService.updateUserLastOnline(user.id);
    } catch (error) {
        console.error(`Error in user IP handling middleware: ${error}`);
    }
    next();
});

app.use((req,res,next) => {
    const ip = `Request from IP: ${req.userIp}`;
    const method = `Method: ${req.method}`;
    const path = `Path: ${req.path}`;
    const date = `Date: ${new Date().toLocaleString()}`;
    const separator = "-----------------------------------";
    console.log(`${ip}\n${method}\n${path}\n${date}\n${separator}`);
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