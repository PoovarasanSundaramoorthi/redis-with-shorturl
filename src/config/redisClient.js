// import { createClient } from 'redis';

// const redisClient = createClient();

// redisClient.on('error', (err) => console.error('Redis Client Error', err));

// const connectRedis = async () => {
//     try {
//         await redisClient.connect();
//         console.log('Connected to Redis!');
//     } catch (error) {
//         console.error('Redis Connection Error:', error);
//     }
// };

// connectRedis();

// export default redisClient;

import Redis from 'ioredis';
import { redisHost, redisPort } from './envconfig.js';
console.log('redisHost, redisPort :>> ', redisHost, redisPort);
const redis = new Redis({
    host: redisHost,
    port: redisPort,
    retryStrategy: (times) => Math.min(times * 50, 2000),
    password: '', // Password if Redis is protected (leave empty if no password)
    db: 0, // Database index (default is 0)
});
// const redis = new Redis({
//     host: "localhost", // Use Redis service name in Docker
//     port: 6379,
//     retryStrategy: (times) => Math.min(times * 50, 2000),
//     password: '', // Password if Redis is protected (leave empty if no password)
//     db: 0, // Database index (default is 0)
// });

redis.on("connect", function () {
    console.log("Connected to Redis...");
});

redis.on("error", function (err) {
    console.log("Redis error: " + err);
});

export default redis;
