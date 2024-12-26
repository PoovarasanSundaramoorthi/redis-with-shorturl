import URL from "../models/urlModel.js";
import baseController from "./baseController.js";
const BaseController = new baseController;
export async function getUrlAnalytics(req, res, next) {
    try {
        const { alias } = req.params;
        console.log('true :>> ', true);
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
        res.status(200).json({
            totalClicks,
            uniqueUsers: uniqueClicks,
            clicksByDate,
            osType,
            deviceType,
        });
    } catch (error) {
        next(error);
    }
}

export async function getTopicAnalytics(req, res, next) {
    try {
        const { topic } = req.params;

        const urls = await URL.find({ group: topic });
        if (!urls.length) {
            return BaseController.errorResponse(res, 404, "No URLs found under this topic");
        }

        const totalClicks = urls.reduce((sum, url) => sum + url.analytics.length, 0);
        const uniqueClicks = new Set(urls.flatMap((url) => url.analytics.map((a) => a.ip))).size;

        res.status(200).json({
            totalClicks,
            uniqueUsers: uniqueClicks,
            urls: urls.map((url) => ({
                shortUrl: url.shortUrl,
                totalClicks: url.analytics.length,
                uniqueClicks: new Set(url.analytics.map((a) => a.ip)).size,
            })),
        });
    } catch (error) {
        next(error);
    }
}

export async function getOverallAnalytics(req, res, next) {
    try {
        console.log('req.user :>> ', req.user);
        const userId = req?.user?.id || '676bf6b0926f5ef52af7b4e7'; // Assuming the user is authenticated and `req.user` contains their info.
        // Fetch all URLs created by the user
        const urls = await URL.find({ createdBy: userId });
        if (!urls.length) {
            return BaseController.errorResponse(res, 404, "No URLs found for this user");
        }

        // Calculate overall analytics
        const totalUrls = urls.length;
        const totalClicks = urls.reduce((sum, url) => sum + url.analytics.length, 0);
        const uniqueUsers = new Set(urls.flatMap((url) => url.analytics.map((a) => a.ip))).size;

        // Clicks by date
        const clicksByDate = urls.flatMap((url) => url.analytics).reduce((acc, entry) => {
            const date = new Date(entry.timestamp).toISOString().split("T")[0];
            acc[date] = (acc[date] || 0) + 1;
            return acc;
        }, {});

        // OS Type
        const osType = urls.flatMap((url) => url.analytics).reduce((acc, entry) => {
            const os = entry.os || "Unknown";
            if (!acc[os]) {
                acc[os] = { uniqueClicks: 0, uniqueUsers: new Set() };
            }
            acc[os].uniqueClicks++;
            acc[os].uniqueUsers.add(entry.ip);
            return acc;
        }, {});
        const osTypeArray = Object.keys(osType).map((osName) => ({
            osName,
            uniqueClicks: osType[osName].uniqueClicks,
            uniqueUsers: osType[osName].uniqueUsers.size,
        }));

        // Device Type
        const deviceType = urls.flatMap((url) => url.analytics).reduce((acc, entry) => {
            const device = entry.device || "Unknown";
            if (!acc[device]) {
                acc[device] = { uniqueClicks: 0, uniqueUsers: new Set() };
            }
            acc[device].uniqueClicks++;
            acc[device].uniqueUsers.add(entry.ip);
            return acc;
        }, {});
        const deviceTypeArray = Object.keys(deviceType).map((deviceName) => ({
            deviceName,
            uniqueClicks: deviceType[deviceName].uniqueClicks,
            uniqueUsers: deviceType[deviceName].uniqueUsers.size,
        }));

        // Prepare the response
        const response = {
            totalUrls,
            totalClicks,
            uniqueUsers,
            clicksByDate,
            osType: osTypeArray,
            deviceType: deviceTypeArray,
        };

        return BaseController.successResponse(res, "Overall analytics retrieved successfully", response);
    } catch (error) {
        next(error);
    }
}