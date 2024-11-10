import UserEntity from "../entities/UserEntity.js";
import { faker } from '@faker-js/faker';
import mongoose from "mongoose";

class UserService {
    async getAll(offset, limit) {
        return UserEntity.find(undefined, "-__v", undefined)
            .skip(offset)
            .limit(limit)
            .sort({ createdAt: -1 })
            .lean();
    }

    async getById(id) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new Error('Invalid user ID');
        }
        const userId = new mongoose.Types.ObjectId(id);
        const foundUser = await UserEntity.findById(userId, "-__v", undefined);
        if (!foundUser) {
            throw new Error('User not found');
        }
        return foundUser;
    }

    async getByIp(ip) {
        const foundUser = await UserEntity.findOne({ip: ip}, "-__v", undefined);
        if (!foundUser) {
            throw new Error('User not found');
        }
        return foundUser;
    }

    async create(user) {
        return UserEntity.create(user, undefined);
    }

    async update(user) {
        if (!mongoose.Types.ObjectId.isValid(user.id)) {
            throw new Error('Invalid user ID');
        }
        const userId = new mongoose.Types.ObjectId(user.id);
        const updatedUser = await UserEntity.findByIdAndUpdate(userId, {$set: {
            ...user,
            ip: undefined
        }}, undefined);
        if (!updatedUser) {
            throw new Error('User not found');
        }
        return updatedUser;
    }

    async delete(id) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new Error('Invalid user ID');
        }
        const userId = new mongoose.Types.ObjectId(id);
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

    async getUserById(id) {
        const foundUser = await this.getById(id);
        return this.formatUser(foundUser);
    }

    async getUserByIp(ip) {
        const foundUser = await this.getByIp(ip);
        return this.formatUser(foundUser);
    }

    async createUser(ip) {
        return this.create({
            ip: ip,
            username: faker.internet.username(),
            lastOnline: new Date()
        });
    }

    async updateUserLastOnline(id) {
        return this.update({
            id: id,
            lastOnline: Date.now()
        });
    }

    async deleteUser(id) {
        return this.delete(id);
    }

    async getUserByIpElseCreate(ip) {
        let user = await UserEntity.findOne({ ip: ip }, "-__v", undefined);
        if (!user) {
            user = this.createUser(ip);
        }
        return user;
    }

    async getUserRole(id) {
        const foundUser = await this.getUserById(id);
        return foundUser.role;
    }

    async setUserRole(id, role) {
        return this.update({
            id: id,
            role: role
        });
    }

    async isUserAdmin(ip) {
        const user = await this.getUserByIp(ip);
        const role = await this.getUserRole(user.id);
        return role === 'admin';
    }

    formatUser(user) {
        return {
            id: user._id,
            ip: user.ip,
            username: user.username,
            role: user.role,
            lastOnline: user.lastOnline,
            createdAt: user.createdAt
        };
    }

    formatUsers(users) {
        return users.map(user => {
            return this.formatUser(user);
        });
    }
}

export default UserService;