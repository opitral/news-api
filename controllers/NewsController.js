import Router from "express";
import {validationResult} from "express-validator";
import NewsService from "../services/NewsService.js";
import { newsCreateValidator, commentCreateValidator } from "../validations/NewsValidation.js";
import UserService from "../services/UserService.js";

const router = new Router();

const userService = new UserService();
const newsService = new NewsService();

router.get("/", async (req, res) => {
    try {
        const user = await userService.getUserByIpElseCreate(req.ip);
        await userService.updateUserLastOnline(user.ip);

        const offset = parseInt(req.query.offset);
        const limit = parseInt(req.query.limit);
        const news = await newsService.getAllNews(offset, limit);
        res.json({
            "news": news
        });
    } catch (error) {
        res.status(400).json({
            "error": error.message
        });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const user = await userService.getUserByIpElseCreate(req.ip);
        await userService.updateUserLastOnline(user.ip);

        await newsService.viewNews(req.params.id, user.ip);
        const news = await newsService.getNewsById(req.params.id);
        res.json({
            "news": news
        });
    } catch (error) {
        console.log(error);
        res.status(404).json({
            "error": "News not found"
        });
    }
});

router.post("/", newsCreateValidator, async (req, res) => {
    if (await userService.isUserAdmin(req.ip) === false) {
        return res.status(403).json({
            "error": "Forbidden"
        });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            message: errors.array(),
        });
    }

    try {
        const news = await newsService.createNews(req.body)
        res.json({
            "id": news.id
        });
    } catch (error) {
        res.status(400).json({
            "error": error.message
        });
    }
});

router.put("/", newsCreateValidator, async (req, res) => {
    if (await userService.isUserAdmin(req.ip) === false) {
        return res.status(403).json({
            "error": "Forbidden"
        });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            message: errors.array(),
        });
    }

    try {
        const result = await newsService.updateNews(req.body);
        res.json({
            "id": result.id
        });
    } catch (error) {
        res.status(400).json({
            "error": error.message
        });
    }
});

router.delete("/:id", async (req, res) => {
    if (await userService.isUserAdmin(req.ip) === false) {
        return res.status(403).json({
            "error": "Forbidden"
        });
    }
    try {
        const result = await newsService.deleteNews(req.params.id);
        res.json({
            "result": result
        });
    } catch (error) {
        res.status(404).json({
            "error": "News not found"
        });
    }
});

router.post("/:id/like", async (req, res) => {
    try {
        const result = await newsService.likeNews(req.params.id, req.ip);
        res.json({
            "result": result
        });
    } catch (error) {
        res.status(400).json({
            "error": error.message
        });
    }
});

router.post("/:id/unlike", async (req, res) => {
    try {
        const result = await newsService.unlikeNews(req.params.id, req.ip);
        res.json({
            "result": result
        });
    } catch (error) {
        res.status(400).json({
            "error": error.message
        });
    }
});

router.post("/:id/comment", commentCreateValidator, async (req, res) => {
    try {
        const result = await newsService.commentNews(req.params.id,req.ip, req.body.comment);
        res.json({
            "result": result
        });
    } catch (error) {
        res.status(400).json({
            "error": error.message
        });
    }
});

export default router;