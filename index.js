import app from './src/app.js';
import http from 'http';
import { configDotenv } from 'dotenv';
import { databaseUrl, port } from './src/config/envconfig.js';
import mongoose from 'mongoose';
import cluster from 'cluster';
import os from 'os'

configDotenv({
    path: './.env'
})
const dbport = port || 5000

process.on('uncaughtException', (err) => {
    console.log('Uncaught Exception ');
    console.log(err.name, err.message);
    process.exit(1)
})
console.log('databaseUrl :>> ', databaseUrl);
mongoose.connect(databaseUrl).then(() => {
    console.log('Successfully connected to MongoDB');
})
    .catch((err) => {
        console.error('Error connecting to MongoDB:', err);
    });

// if (cluster.isMaster) {
//     console.log(`Master process ${process.pid} is running`);

//     const numCPU = os.cpus().length;
//     for (let i = 0; i < numCPU; i++) {
//         cluster.fork(); // Fork workers based on the number of CPU cores
//     }

//     cluster.on('exit', (worker, code, signal) => {
//         console.log(`Worker ${worker.process.pid} died`);
//     });

//     // Handle graceful shutdown
//     process.on('SIGTERM', () => {
//         console.log('Master process: Shutting down gracefully');
//         cluster.disconnect(() => {
//             console.log('All workers have been disconnected');
//             process.exit(0); // Exit the master process
//         });
//     });

// } else {
// Worker processes handle the server creation and incoming requests
const server = http.createServer(app);

server.listen(dbport, () => {
    console.log(`Worker ${process.pid} is running on port ${dbport}`);
});

// Graceful shutdown for workers
process.on('SIGTERM', () => {
    console.log(`Worker ${process.pid}: Shutting down gracefully`);
    server.close(() => {
        console.log(`Worker ${process.pid}: Server closed`);
        process.exit(0); // Exit the worker process
    });
});
// }

process.on('unhandledRejection', (err) => {
    console.log('Unhandled Rejection shutting down !!!');
    console.log(err.name, err.message);
})