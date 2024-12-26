import express from 'express';
import cors from 'cors';
import globalErrorHandler from '../src/controller/errorController.js';
import hpp from 'hpp';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import ExpressMongoSanitize from 'express-mongo-sanitize';
import passport from 'passport';
import '../src/config/passport.js';
import authRouter from './routes/authRoutes.js';
import { databaseUrl, sessionSecretKey } from './config/envconfig.js';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import urlRouter from './routes/urlRoutes.js';
import analyticsRouter from './routes/analyticRoutes.js';

const app = express();

app.use(cors())
app.use(helmet());
app.use(hpp());
const limit = rateLimit({
    limit: 1000,
    windowMs: 60 * 60 * 1000,
    message: 'This Ip reached maximum limit of requests'
})
app.use(limit)
app.use(ExpressMongoSanitize())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure session middleware
app.use(
    session({
        secret: sessionSecretKey, // Replace this with an environment variable for production
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({
            mongoUrl: databaseUrl, // Replace with your MongoDB connection string
            collectionName: "sessions",
        }),
        cookie: {
            secure: false, // Set to true in production when using HTTPS
        },
    })
);

// Initialize Passport and use session
app.use(passport.initialize());
app.use(passport.session());

// Include auth routes
app.use("/auth", authRouter);
app.use("/api", urlRouter);
app.use("/api", analyticsRouter);

// Example route
app.get('/', (req, res) => res.send('Server is running!'));

app.use('*', (req, res) => {
    return res.json({
        status: 404,
        message: "Not found"
    })
})

app.use(globalErrorHandler)

export default app