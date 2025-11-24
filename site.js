import { netkuma } from './netkuma.js';

const app = netkuma({ logger: true , publicDir: 'site'});

app.get('/', (request, reply) => {
    return reply.send("Super fast API!!!");
});

app.get('/feed', (request, reply) => {
    return reply.send("Welcome to your feed.");
});

/* you can even render an html page! */
app.get('/', (request, reply) => {
    return reply.view('index.html');
});

app.get('/docs', (request, reply) => {
    return reply.view('docs.html');
});

app.get('/quickstart', (request, reply) => {
    return reply.view('docs/quickstart.html');
});

app.get('/route-params', (request, reply) => {
    return reply.view('docs/route-params.html');
});

app.listen({ port: 8000, host: '0.0.0.0' }, (err, address) => {
    if (err) throw err;
});
