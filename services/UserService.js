import UserEntity from "../entities/UserEntity.js";
import { faker } from '@faker-js/faker';

class UserService {
    async getAll(offset, limit) {
        return UserEntity.find(undefined, "-__v", undefined)
            .skip(offset)
            .limit(limit)
            .sort({ createdAt: -1 })
            .lean();
    }

    async getByIp(ip) {
        const foundUser = await UserEntity.findOne({ip: ip}, "-__v", undefined);
        if (!foundUser.ip) {
            throw new Error('User not found');
        }
        return foundUser;
    }

    async create(user) {
        return UserEntity.create(user, undefined);
    }

    async update(user) {
        const foundUser = await this.getByIp(user.ip);
        const userId = foundUser._id;
        const updatedUser = await UserEntity.findByIdAndUpdate(userId, {$set: {
            ...user,
            ip: undefined
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

    async updateUserLastOnline(ip) {
        return this.update({
            ip: ip,
            lastOnline: Date.now()
        });
    }

    async deleteUser(ip) {
        return this.delete(ip);
    }

    async getUserByIpElseCreate(ip) {
        try {
            return await this.getUserByIp(ip);
        } catch (error) {
            return this.createUser(ip);
        }
    }

    async getUserRole(ip) {
        const foundUser = await this.getUserByIp(ip);
        return foundUser.role;
    }

    async setUserRole(ip, role) {
        return this.update({
            ip: ip,
            role: role
        });
    }

    async isUserAdmin(ip) {
        const role = await this.getUserRole(ip);
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