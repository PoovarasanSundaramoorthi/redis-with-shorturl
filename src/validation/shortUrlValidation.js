import Joi from 'joi';

// addons update validations
export const createShortValidation = {
    body: Joi.object({
        originalUrl: Joi.string().required(),
        alias: Joi.string().required(),
        group: Joi.string().required(),
    }),
};

// Schema for overall analytics
export const getOverallAnalyticsValidation = {
    params: Joi.object().keys({}),
    query: Joi.object().keys({
        userId: Joi.string().optional(), // Optional userId in query
    })
};

// Schema for topic analytics
export const getTopicAnalyticsValidation = {
    params: Joi.object().keys({
        topic: Joi.string().required(),
    }),
    query: Joi.object().keys({}),
};

// Schema for URL analytics by alias
export const getUrlAnalyticsValidation = {
    params: Joi.object().keys({
        alias: Joi.string().required(),
    }),
    query: Joi.object().keys({}),
};

// Schema for shortening URL by alias
export const getShortAliasValidation = {
    params: Joi.object().keys({
        alias: Joi.string().required(),
    }),
    query: Joi.object().keys({}),
};