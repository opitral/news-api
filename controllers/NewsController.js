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

router.get("/top", async (req, res) => {
    try {
        const news = await newsService.getTodayTopNews();
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
        await newsService.createViewNews(req.params.id, req.userIp);
        const news = await newsService.getNewsById(req.params.id);
        news.isLiked = !!(await newsService.isNewsLikedByUser(req.params.id, req.userIp));
        for (const comment of news.comments) {
            const commentOwner = await userService.getUserById(comment.user);
            comment.isOwner = commentOwner.ip === req.userIp || await userService.isUserAdmin(req.userIp);
        }
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
    if (req.isNotAdmin()) {
        return res.status(403).json({
            "error": "user not authorized to create news"
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
    if (req.isNotAdmin()) {
        return res.status(403).json({
            "error": "user not authorized to update news"
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
    if (req.isNotAdmin()) {
        return res.status(403).json({
            "error": "user not authorized to delete news"
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
        await newsService.likeNews(req.params.id, req.userIp);
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
        await newsService.unlikeNews(req.params.id, req.userIp);
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
        await newsService.createCommentNews(req.params.id, req.userIp, req.body.content);
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
        const comment = await newsService.getCommentNews(req.params.id, req.params.commentId);
        const commentOwner = await userService.getUserById(comment.user);
        if (commentOwner.ip !== req.userIp && req.isNotAdmin()) {
            return res.status(403).json({
                "error": "user not authorized to delete comment"
            });
        }
        await newsService.deleteCommentNews(req.params.id, req.params.commentId);
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