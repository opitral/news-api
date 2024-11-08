import NewsEntity from "../entities/NewsEntity.js";
import mongoose from "mongoose";
import UserService from "./UserService.js";

class NewsService {

    userService = new UserService();

    async getAll(offset, limit) {
        return NewsEntity.find(undefined, "-__v", undefined)
            .skip(offset)
            .limit(limit)
            .sort({ createdAt: -1 })
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
        return this.formatOneNews(foundNews);
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

        if (news.likes.some((like) => like.user.toString() === user.id.toString())) {
            throw new Error('User already liked this news');
        }

        news.likes.push({
            user: user.id,
            date: Date.now()
        });
        return news.save();
    }

    async unlikeNews(newsId, userIp) {
        const news = await this.getById(newsId);
        const user = await this.userService.getUserByIp(userIp);

        if (!news.likes.some((like) => like.user.toString() === user.id.toString())) {
            throw new Error('User did not like this news');
        }

        news.likes = news.likes.filter((like) => {
            return like.user.toString() !== user.id.toString();
        });
        return news.save();
    }

    async viewNews(newsId, userIp) {
        const news = await this.getById(newsId);
        const user = await this.userService.getUserByIp(userIp);

        if (!news.views.some((view) => view.user.toString() === user.id.toString())) {
            news.views.push({
                user: user.id,
                date: Date.now()
            });

            return news.save();
        }
    }

    async commentNews(newsId, userIp, comment) {
        const news = await this.getById(newsId);
        const user = await this.userService.getUserByIp(userIp);

        news.comments.push({
            user: user.id,
            content: comment,
            date: Date.now()
        });
        return news.save();
    }

    async deleteCommentNews(newsId, userIp, commentId) {
        const news = await this.getById(newsId);

        const comment = news.comments.find((comment) => comment._id.toString() === commentId);
        if (!comment) {
            throw new Error('Comment not found');
        }

        const isAdmin = await this.userService.isUserAdmin(userIp);
        if (comment.user.ip !== userIp && !isAdmin) {
            throw new Error('User not authorized to delete comment');
        }

        news.comments = news.comments.filter((comment) => comment._id.toString() !== commentId);
        return news.save();
    }

    truncateText(text, maxLength) {
        if (text.length > maxLength) {
            return text.slice(0, maxLength) + "...";
        }
        return text;
    }

    formatOneNews(news) {
        return {
            id: news._id,
            title: news.title,
            content: news.content,
            image: news.image,
            video: news.video,
            likes: news.likes.length,
            views: news.views.length,
            comments: news.comments.map((comment) => {
                return {
                    id: comment._id,
                    user: comment.user,
                    content: comment.content,
                    date: comment.date
                };
                }),
            createdAt: news.createdAt,
    }};

    formatNews(news) {
        return news.map((news) => {
            const temp = this.formatOneNews(news);
            temp.title = this.truncateText(news.title, 50);
            temp.content = this.truncateText(news.content, 100);
            temp.comments = news.comments.length;
            return temp;
        });
    }
}

export default NewsService;