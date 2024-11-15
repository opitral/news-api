import Router from "express";
import UserService from "../services/UserService.js";

const router = new Router();

const userService = new UserService();

router.get("/", async (req, res) => {
    try {
        if (req.isNotAdmin()) {
            return res.status(403).json({
                "error": "user not authorized to get all users"
            });
        }

        const offset = parseInt(req.query.offset);
        const limit = parseInt(req.query.limit);
        const users = await userService.getAllUsers(offset, limit);
        res.json({
            "users": users
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
        if (req.isNotAdmin()) {
            return res.status(403).json({
                "error": "user not authorized to get user by id"
            });
        }

        const user = await userService.getUserById(req.params.id);
        res.json({
            "user": user
        });
    } catch (error) {
        console.error(error);
        if (error.message === "User not found") {
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

router.post("/", async (req, res) => {
    try {
        if (req.isNotAdmin()) {
            return res.status(403).json({
                "error": "user not authorized to create user"
            });
        }
        const user = await userService.createUser(req.body.ip);
        res.json({
            "id": user.id
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({
            "error": error.message
        });
    }
});

router.put("/", async (req, res) => {
    try {
        if (req.isNotAdmin()) {
            return res.status(403).json({
                "error": "user not authorized to update user"
            });
        }
        await userService.update(req.body);
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
    try {
        if (req.isNotAdmin()) {
            return res.status(403).json({
                "error": "user not authorized to delete user"
            });
        }
        await userService.deleteUser(req.params.id);
        res.json({
            "result": true
        });
    } catch (error) {
        console.error(error);
        if (error.message === "User not found") {
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

export default router;