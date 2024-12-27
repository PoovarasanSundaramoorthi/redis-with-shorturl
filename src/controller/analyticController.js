import URL from "../models/urlModel.js";
import baseController from "./baseController.js";
import redisClient from "../config/redisClient.js";

const BaseController = new baseController;

export async function getUrlAnalytics(req, res, next) {
    try {
        const { alias } = req.params;

        // Check if analytics data is in Redis
        redisClient.get(`urlAnalytics:${alias}`, async (err, cachedData) => {
            if (cachedData) {
                console.log('Returning cached data');
                return res.status(200).json(JSON.parse(cachedData)); // Send cached data
            }

            // If not found in Redis, fetch from database
            const url = await URL.findOne({ alias });
            if (!url) {
                return BaseController.errorResponse(res, 404, "Short URL not found");
            }

            const totalClicks = url.analytics.length;
            const uniqueClicks = new Set(url.analytics.map((a) => a.ip)).size;

            // Recent 7 days
            const last7Days = new Date();
            last7Days.setDate(last7Days.getDate() - 7);

            const clicksByDate = url.analytics.reduce((acc, entry) => {
                const date = new Date(entry.timestamp).toISOString().split("T")[0];
                if (new Date(entry.timestamp) >= last7Days) {
                    acc[date] = (acc[date] || 0) + 1;
                }
                return acc;
            }, {});

            // OS Analytics
            const osAnalytics = {};
            const deviceAnalytics = {};

            url.analytics.forEach((entry) => {
                const userAgent = entry.device || "";
                const osMatch = userAgent.match(/\(([^)]+)\)/);
                const osName = osMatch ? osMatch[1].split(";")[0] : "Unknown";

                // OS analytics
                osAnalytics[osName] = osAnalytics[osName] || { uniqueClicks: 0, uniqueUsers: new Set() };
                osAnalytics[osName].uniqueClicks++;
                osAnalytics[osName].uniqueUsers.add(entry.ip);

                // Device Type Analytics
                const deviceType = userAgent.includes("Mobile") ? "mobile" : "desktop";
                deviceAnalytics[deviceType] = deviceAnalytics[deviceType] || { uniqueClicks: 0, uniqueUsers: new Set() };
                deviceAnalytics[deviceType].uniqueClicks++;
                deviceAnalytics[deviceType].uniqueUsers.add(entry.ip);
            });

            // Format OS and device analytics
            const osType = Object.entries(osAnalytics).map(([osName, data]) => ({
                osName,
                uniqueClicks: data.uniqueClicks,
                uniqueUsers: data.uniqueUsers.size,
            }));

            const deviceType = Object.entries(deviceAnalytics).map(([deviceName, data]) => ({
                deviceName,
                uniqueClicks: data.uniqueClicks,
                uniqueUsers: data.uniqueUsers.size,
            }));

            // Final response
            const response = {
                totalClicks,
                uniqueUsers: uniqueClicks,
                clicksByDate,
                osType,
                deviceType,
            };

            // Cache the result in Redis
            redisClient.setex(`urlAnalytics:${alias}`, 3600, JSON.stringify(response)); // Cache for 1 hour

            res.status(200).json(response);
        });
    } catch (error) {
        next(error);
    }
}


export async function getTopicAnalytics(req, res, next) {
    try {
        const { topic } = req.params;

        // Check if topic analytics is in Redis
        redisClient.get(`topicAnalytics:${topic}`, async (err, cachedData) => {
            if (cachedData) {
                console.log('Returning cached data');
                return res.status(200).json(JSON.parse(cachedData)); // Send cached data
            }

            // If not found in Redis, fetch from database
            const urls = await URL.find({ group: topic });
            if (!urls.length) {
                return BaseController.errorResponse(res, 404, "No URLs found under this topic");
            }

            const totalClicks = urls.reduce((sum, url) => sum + url.analytics.length, 0);
            const uniqueClicks = new Set(urls.flatMap((url) => url.analytics.map((a) => a.ip))).size;

            const response = {
                totalClicks,
                uniqueUsers: uniqueClicks,
                urls: urls.map((url) => ({
                    shortUrl: url.shortUrl,
                    totalClicks: url.analytics.length,
                    uniqueClicks: new Set(url.analytics.map((a) => a.ip)).size,
                })),
            };

            // Cache the result in Redis
            redisClient.setex(`topicAnalytics:${topic}`, 3600, JSON.stringify(response)); // Cache for 1 hour

            res.status(200).json(response);
        });
    } catch (error) {
        next(error);
    }
}

export async function getOverallAnalytics(req, res, next) {
    try {
        const userId = req?.user?.id // Assuming the user is authenticated

        // Check if overall analytics is in Redis
        redisClient.get(`overallAnalytics:${userId}`, async (err, cachedData) => {
            if (cachedData) {
                console.log('Returning cached data');
                return res.status(200).json(JSON.parse(cachedData)); // Send cached data
            }

            // If not found in Redis, fetch from database
            const urls = await URL.find({ createdBy: userId });
            if (!urls.length) {
                return BaseController.errorResponse(res, 404, "No URLs found for this user");
            }

            // Calculate overall analytics
            const totalUrls = urls.length;
            const totalClicks = urls.reduce((sum, url) => sum + url.analytics.length, 0);
            const uniqueUsers = new Set(urls.flatMap((url) => url.analytics.map((a) => a.ip))).size;

            const clicksByDate = urls.flatMap((url) => url.analytics).reduce((acc, entry) => {
                const date = new Date(entry.timestamp).toISOString().split("T")[0];
                acc[date] = (acc[date] || 0) + 1;
                return acc;
            }, {});

            // OS Type and Device Type Analytics (same as previous)

            // Cache the result in Redis
            const response = {
                totalUrls,
                totalClicks,
                uniqueUsers,
                clicksByDate,
                osType: osTypeArray,
                deviceType: deviceTypeArray,
            };
            redisClient.setex(`overallAnalytics:${userId}`, 3600, JSON.stringify(response)); // Cache for 1 hour

            return BaseController.successResponse(res, "Overall analytics retrieved successfully", response);
        });
    } catch (error) {
        next(error);
    }
}
