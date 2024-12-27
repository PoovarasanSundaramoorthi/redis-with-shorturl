import express from "express";
import { getShortAlias, shorten } from "../controller/urlController.js";
import rateLimit from "express-rate-limit";
import { createShortValidation, getShortAliasValidation } from "../validation/shortUrlValidation.js";
import validate from "../validation/index.js";

const urlRouter = express.Router();
// Define rate limiting rules
const createShortUrlLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each user to 10 requests per 15 minutes
    message: {
        status: "fail",
        message: "Too many requests. Please try again later."
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

urlRouter.post('/shorten', validate(createShortValidation), createShortUrlLimiter, shorten)
urlRouter.get('/shorten/:alias', validate(getShortAliasValidation), getShortAlias)

export default urlRouter