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
            max: 1024
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