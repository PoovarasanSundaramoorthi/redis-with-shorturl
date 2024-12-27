import geoip from "geoip-lite";
import URL from "../models/urlModel.js";
import BaseController, { dataStore } from "./baseController.js";
import redis from "../config/redisClient.js";


const baseController = new BaseController();

export async function shorten(req, res, next) {
    try {
        const { originalUrl, alias, group } = req.body;

        if (!originalUrl) {
            return baseController.errorResponse(res, 400, "Original URL is required");
        }

        // Check if alias is already used
        const aliasExists = alias && (await URL.findOne({ alias }));
        if (aliasExists) {
            return BaseController.errorResponse(res, 400, "Alias is already in use");
        }

        // Generate a unique short URL if no alias provided
        const shortUrl = alias || Math.random().toString(36).substr(2, 8);
        const userId = req?.user?.id || '676bf6b0926f5ef52af7b4e7';
        const newUrlData = {
            originalUrl,
            shortUrl,
            alias,
            group,
            createdBy: userId,
        };

        const newUrl = await dataStore(URL, newUrlData);
        const response = {
            shortUrl: newUrl.shortUrl,
            createdAt: newUrl.createdAt,
        };
        baseController.createdResponse(res, "Short URL created successfully", response);
    } catch (error) {
        next(error);
    }
}

export async function getShortAlias(req, res, next) {
    try {
        console.log('req.params :>> ', req.params);
        const { alias } = req.params;

        // Check if the short URL data is cached in Redis
        const cachedUrl = await redis.get(`shortUrl:${alias}`);
        if (cachedUrl) {
            // If cached, return the data from Redis
            return res.json(JSON.parse(cachedUrl));
        }

        if (!alias) {
            console.log('alias :>> ', true);
            return baseController.errorResponse(res, 404, "Alias is required");
        }

        const url = await URL.findOne({ alias });

        if (!url) {
            console.log('url :>> ', true);
            return baseController.errorResponse(res, 404, "Short URL not found");
        }

        const geolocation = req.ip === '::1' || req.ip === '127.0.0.1' ? "localhost" : geoip.lookup(req.ip);

        // Log analytics
        const analyticsData = {
            ip: req.ip,
            geolocation: geolocation,
            device: req.headers["user-agent"],
            timestamp: new Date(),
        };
        console.log('analyticsData :>> ', analyticsData);
        url.analytics.push(analyticsData);
        console.log('url :>> ', url);
        await url.save();
        // Cache the URL data in Redis for 1 hour (3600 seconds)
        await redis.set(`shortUrl:${alias}`, JSON.stringify(url.originalUrl), 'EX', 3600);

        res.redirect(url.originalUrl);
    } catch (error) {
        next(error);
    }
}
