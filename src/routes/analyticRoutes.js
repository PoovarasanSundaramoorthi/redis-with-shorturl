import express from 'express';
import { getOverallAnalytics, getTopicAnalytics, getUrlAnalytics } from '../controller/analyticController.js';

const analyticsRouter = express.Router();

// Define more specific routes first
analyticsRouter.get('/analytics/overall', getOverallAnalytics);
analyticsRouter.get('/analytics/topic/:topic', getTopicAnalytics);
analyticsRouter.get('/analytics/:alias', getUrlAnalytics);

export default analyticsRouter;
