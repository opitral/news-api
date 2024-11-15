import { body } from "express-validator";

export const newsCreateValidator = [
    body("title", "Title must be from 8 to 128 characters")
        .isLength({
            min: 8,
            max: 128
        }),
    body("content", "Content must be from 8 to 1024 characters")
        .isLength({
            min: 8,
            max: 8192
        }),
    body("image", "Image url must be from 8 to 256 characters")
        .optional()
        .isURL()
        .isLength({
            min: 8,
            max: 256
        }),
    body("video", "Video url must be from 8 to 256 characters")
        .optional()
        .isURL()
        .isLength({
            min: 8,
            max: 256
        })
]

export const newsUpdateValidator = [
    body("id", "Id must be a valid ObjectId")
        .isMongoId(),
    body("title", "Title must be from 8 to 128 characters")
        .optional()
        .isLength({
            min: 8,
            max: 128
        }),
    body("content", "Content must be from 8 to 1024 characters")
        .optional()
        .isLength({
            min: 8,
            max: 8192
        }),
    body("image", "Image url must be from 8 to 256 characters")
        .optional()
        .isURL()
        .isLength({
            min: 8,
            max: 256
        }),
    body("video", "Video url must be from 8 to 256 characters")
        .optional()
        .isURL()
        .isLength({
            min: 8,
            max: 256
        })
]

export const commentCreateValidator = [
    body("content", "Content must be from 8 to 1024 characters")
        .isLength({
            min: 8,
            max: 1024
        })
]