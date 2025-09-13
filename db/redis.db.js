import { createClient } from 'redis';

const client = createClient({
    username: 'default',
    password: 'nLJ2jKsCFeZg4I5d1oXSJXROna5vKo4d',
    socket: {
        host: 'redis-13247.c251.east-us-mz.azure.redns.redis-cloud.com',
        port: 13247
    }
});

client.on('error', err => console.log('Redis Client Error', err));

await client.connect();
export default client;

