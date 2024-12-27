import { configDotenv } from "dotenv";

configDotenv({ path: './.env' })

const { DATABASE_URL, PORT, REDIS_HOST, REDIS_PORT, SESSION_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL } = process.env

const port = PORT;
const databaseUrl = DATABASE_URL;
const sessionSecretKey = SESSION_SECRET;
const googleClientId = GOOGLE_CLIENT_ID;
const googleClientSecretId = GOOGLE_CLIENT_SECRET;
const googleCallbackUrl = GOOGLE_CALLBACK_URL;
const redisHost = REDIS_HOST;
const redisPort = REDIS_PORT
export { port, databaseUrl, sessionSecretKey, googleClientId, googleCallbackUrl, googleClientSecretId, redisHost, redisPort }