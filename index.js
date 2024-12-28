import app from './src/app.js';
import http from 'http';
import { configDotenv } from 'dotenv';
import { databaseUrl } from './src/config/envconfig.js';
import mongoose from 'mongoose';

// Load environment variables from .env file
configDotenv({
    path: './.env',
});

// Ensure PORT is defined in environment variables
const port = process.env.PORT || 5000;
if (!process.env.PORT) {
    console.error('Environment variable PORT is not defined.');
    process.exit(1);
}

console.log('Port :>>', port);
console.log('Database URL :>>', databaseUrl);

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1); // Exit the process to avoid undefined state
});

// Connect to MongoDB
mongoose
    .connect(databaseUrl)
    .then(() => {
        console.log('Successfully connected to MongoDB');
    })
    .catch((err) => {
        console.error('Error connecting to MongoDB:', err);
        process.exit(1); // Exit if the database connection fails
    });

// Create HTTP server and listen on the specified port
const server = http.createServer(app);

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

// Graceful shutdown for SIGTERM signal
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        mongoose.connection.close(false, () => {
            console.log('MongoDB connection closed');
            process.exit(0);
        });
    });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
    process.exit(1); // Exit to avoid undefined state
});
