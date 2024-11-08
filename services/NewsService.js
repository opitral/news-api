import NewsEntity from "../entities/NewsEntity.js";
import mongoose from "mongoose";
import UserService from "./UserService.js";

class NewsService {

    userService = new UserService();

    async getAll(offset, limit) {
        return NewsEntity.find(undefined, "-__v", undefined)
            .skip(offset)
            .limit(limit)
            .lean();
    }

    async getById(id) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new Error('Invalid news ID');
        }
        const newsId = new mongoose.Types.ObjectId(id);
        const news = await NewsEntity.findById(newsId, "-__v", undefined);
        if (!news) {
            throw new Error('News not found');
        }
        return news;
    }

    async create(news) {
        return NewsEntity.create(news, undefined);
    }

    async update(news) {
        if (!mongoose.Types.ObjectId.isValid(news.id)) {
            throw new Error('Invalid news ID');
        }
        const newsId = new mongoose.Types.ObjectId(news.id);
        const updatedNews = await NewsEntity.findByIdAndUpdate(newsId, {$set: {
            ...news,
            id: undefined
        }}, undefined);
        if (!updatedNews) {
            throw new Error('News not found');
        }
        return updatedNews;
    }

    async delete(id) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new Error('Invalid news ID');
        }
        const newsId = new mongoose.Types.ObjectId(id);
        const deletedNews = await NewsEntity.findByIdAndDelete(newsId, undefined);
        if (!deletedNews) {
            throw new Error('News not found');
        }
        return deletedNews;
    }

    async getAllNews(offset = 0, limit = 20) {
        const foundNews = await this.getAll(offset, limit);
        return this.formatNews(foundNews);
    }

    async getNewsById(id) {
        const foundNews = await this.getById(id);
        return this.formatNews(foundNews);
    }

    async createNews(news) {
        return this.create(news);
    }

    async updateNews(news) {
        return this.update(news);
    }

    async deleteNews(id) {
        return this.delete(id);
    }

    async likeNews(newsId, userIp) {
        const news = await this.getById(newsId);
        const user = await this.userService.getUserByIp(userIp);

        if (news.likes.some((like) => like.user.toString() === user._id.toString())) {
            throw new Error('User already liked this news');
        }

        news.likes.push({
            user: user._id,
            date: Date.now()
        });
        return news.save();
    }

    async unlikeNews(newsId, userIp) {
        const news = await this.getById(newsId);
        const user = await this.userService.getUserByIp(userIp);

        if (!news.likes.some((like) => like.user.toString() === user._id.toString())) {
            throw new Error('User did not like this news');
        }

        news.likes = news.likes.filter((like) => {
            return like.user.toString() !== user._id.toString();
        });
        return news.save();
    }

    async viewNews(newsId, userIp) {
        const news = await this.getById(newsId);
        const user = await this.userService.getUserByIp(userIp);

        if (!news.views.some((view) => view.user.toString() === user._id.toString())) {
            news.views.push({
                user: user._id,
                date: Date.now()
            });

            return news.save();
        }
    }

    async commentNews(newsId, userIp, comment) {
        const news = await this.getById(newsId);
        const user = await this.userService.getUserByIp(userIp);

        news.comments.push({
            user: user._id,
            content: comment,
            date: Date.now()
        });
        return news.save();
    }

    async deleteCommentNews(newsId, userIp, commentId) {
        const news = await this.getById(newsId);

        if (news.comments.some((comment) => comment._id.toString() === commentId && comment.user.ip !== userIp) || !(userIp in process.env.ALLOWED_IPS)) {
            throw new Error('User not authorized to delete comment');
        }

        if (!news.comments.some((comment) => comment._id.toString() === commentId)) {
            throw new Error('Comment not found');
        }

        news.comments = news.comments.filter((comment) => {
            return comment._id.toString() !== commentId;
        });
        return news.save();
    }

    formatNews(news) {
        return news.map((news) => {
            return {
                id: news._id,
                title: news.title,
                content: news.content,
                image: news.image,
                video: news.video,
                likes: news.likes,
                views: news.views,
                comments: news.comments,
                createdAt: news.createdAt,
                updatedAt: news.updatedAt
            };
        });
    }
}

export default NewsService;