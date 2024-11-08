import Router from "express";
import {validationResult} from "express-validator";
import NewsService from "../services/NewsService.js";
import { newsCreateValidator, newsUpdateValidator, commentCreateValidator } from "../validations/NewsValidation.js";
import UserService from "../services/UserService.js";

const router = new Router();

const userService = new UserService();
const newsService = new NewsService();

router.get("/", async (req, res) => {
    try {
        const offset = parseInt(req.query.offset);
        const limit = parseInt(req.query.limit);
        const news = await newsService.getAllNews(offset, limit);
        res.json({
            "news": news
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({
            "error": error.message
        });
    }
});

router.get("/:id", async (req, res) => {
    try {
        await newsService.viewNews(req.params.id, req.ip);
        const news = await newsService.getNewsById(req.params.id);
        res.json({
            "news": news
        });
    } catch (error) {
        console.error(error);
        if (error.message === "News not found") {
            return res.status(404).json({
                "error": error.message
            });
        } else {
            return res.status(400).json({
                "error": error.message
            });
        }
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
        console.error(error);
        res.status(400).json({
            "error": error.message
        });
    }
});

router.put("/", newsUpdateValidator, async (req, res) => {
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
        await newsService.updateNews(req.body);
        res.json({
            "result": true
        });
    } catch (error) {
        console.error(error);
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
        await newsService.deleteNews(req.params.id);
        res.json({
            "result": true
        });
    } catch (error) {
        console.error(error);
        res.status(404).json({
            "error": error.message
        });
    }
});

router.post("/:id/like", async (req, res) => {
    try {
        await newsService.likeNews(req.params.id, req.ip);
        res.json({
            "result": true
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({
            "error": error.message
        });
    }
});

router.post("/:id/unlike", async (req, res) => {
    try {
        await newsService.unlikeNews(req.params.id, req.ip);
        res.json({
            "result": true
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({
            "error": error.message
        });
    }
});

router.post("/:id/comment", commentCreateValidator, async (req, res) => {
    try {
        await newsService.commentNews(req.params.id, req.ip, req.body.content);
        res.json({
            "result": true
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({
            "error": error.message
        });
    }
});

router.delete("/:id/comment/:commentId", async (req, res) => {
    try {
        await newsService.deleteCommentNews(req.params.id, req.ip, req.params.commentId);
        res.json({
            "result": true
        });
    } catch (error) {
        console.error(error);
        res.status(404).json({
            "error": error.message
        });
    }
});

export default router;