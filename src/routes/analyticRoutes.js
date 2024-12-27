import express from 'express';
import { getOverallAnalytics, getTopicAnalytics, getUrlAnalytics } from '../controller/analyticController.js';
import { getOverallAnalyticsValidation, getTopicAnalyticsValidation, getUrlAnalyticsValidation } from '../validation/shortUrlValidation.js';
import validate from '../validation/index.js';

const analyticsRouter = express.Router();

// Define more specific routes first
analyticsRouter.get('/analytics/overall', validate(getOverallAnalyticsValidation), getOverallAnalytics);
analyticsRouter.get('/analytics/topic/:topic', validate(getTopicAnalyticsValidation), getTopicAnalytics);
analyticsRouter.get('/analytics/:alias', validate(getUrlAnalyticsValidation), getUrlAnalytics);

export default analyticsRouter;
