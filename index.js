import cluster from 'cluster';
import os from 'os';
import app from './src/app.js';
import http from 'http';
import { configDotenv } from 'dotenv';
import mongoose from 'mongoose';
import { databaseUrl } from './src/config/envconfig.js';

// Load environment variables
configDotenv({ path: './.env' });

const port = process.env.PORT || 5000;

if (cluster.isPrimary) {
    const numCPUs = os.cpus().length;
    console.log(`Master process ${process.pid} is running`);
    console.log(`Forking ${numCPUs} workers...`);

    // Fork workers
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died. Restarting...`);
        cluster.fork();
    });
} else {
    // Only the first worker will listen on the port
    if (cluster.worker.id === 1) {
        mongoose
            .connect(databaseUrl)
            .then(() => {
                console.log('Successfully connected to MongoDB');
            })
            .catch((err) => {
                console.error('Error connecting to MongoDB:', err);
                process.exit(1);
            });

        const server = http.createServer(app);

        server.listen(port, () => {
            console.log(`Worker ${process.pid} is running on port ${port}`);
        });

        process.on('SIGTERM', () => {
            console.log(`Worker ${process.pid} received SIGTERM. Closing server...`);
            server.close(() => {
                console.log(`Worker ${process.pid} server closed.`);
                mongoose.connection.close(false, () => {
                    console.log(`Worker ${process.pid} MongoDB connection closed.`);
                    process.exit(0);
                });
            });
        });
    } else {
        console.log(`Worker ${process.pid} is running but not listening on a port`);
    }
}
