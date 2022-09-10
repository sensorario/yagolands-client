import staticPlugin from '@fastify/static';
import fastify from 'fastify';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootUrl = new URL(import.meta.url);

const server = fastify({ logger: true });

server.register(staticPlugin, {
    root: dirname(fileURLToPath(rootUrl))
});

server.get('/', (req, reply) => reply.sendFile('index.html'));

const port = 3000;
const start = () => {
    try {
        server.listen({ port });
    } catch (err) {
        server.log.error(err);
        process.exit(1);
    }
};

start();
