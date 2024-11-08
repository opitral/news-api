import express from 'express';
import mongoose from "mongoose";
import cors from "cors";
import dotenv from 'dotenv';

dotenv.config();

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

app.listen(port, (error) => {
    if (error) {
        console.error(`Error at server start: ${error}`);
    } else {
        console.log(`Server is running on port: ${port}`);
    }
});
