import UserEntity from "../entities/UserEntity.js";
import { faker } from '@faker-js/faker';

class UserService {
    async getAll(offset, limit) {
        return UserEntity.find(undefined, "-__v", undefined)
            .skip(offset)
            .limit(limit)
            .lean();
    }

    async getByIp(ip) {
        const user = await UserEntity.findOne({ip: ip}, "-__v", undefined).lean();
        if (!user) {
            throw new Error('User not found');
        }
        return user;
    }

    async create(user) {
        return UserEntity.create(user, undefined);
    }

    async update(user) {
        const foundUser = await this.getByIp(user.ip);
        const userId = foundUser._id;
        const updatedUser = await UserEntity.findByIdAndUpdate(userId, {$set: {
            ...user
        }}, undefined);
        if (!updatedUser) {
            throw new Error('User not found');
        }
        return updatedUser;
    }

    async delete(ip) {
        const foundUser = await this.getByIp(ip);
        const userId = foundUser._id;
        const deletedUser = await UserEntity.findByIdAndDelete(userId, undefined);
        if (!deletedUser) {
            throw new Error('User not found');
        }
        return deletedUser;
    }

    async getAllUsers(offset = 0, limit = 20) {
        const foundUsers = await this.getAll(offset, limit);
        return this.formatUsers(foundUsers);
    }

    async getUserByIp(ip) {
        return this.getByIp(ip);
    }

    async createUser(ip) {
        return this.create({
            ip: ip,
            username: faker.internet.username(),
            lastOnline: new Date()
        });
    }

    async updateUserLastOnline(ip) {
        return this.update({
            ip: ip,
            lastOnline: Date.now()
        });
    }

    async deleteUser(ip) {
        return this.delete(ip);
    }

    formatUsers(users) {
        return users.map(user => {
            return {
                ip: user.ip,
                username: user.username,
                lastOnline: user.lastOnline
            };
        });
    }
}

export default UserService;