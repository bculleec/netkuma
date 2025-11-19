import { netkuma } from './netkuma.js';

const app = netkuma({ logger: true , publicDir: 'site'});

app.get('/', (request, reply) => {
    return reply.send("Super fast API!!!");
});

app.get('/feed', (request, reply) => {
    return reply.send("Welcome to your feed.");
});

/* you can even render an html page! */
app.get('/about', (request, reply) => {
    return reply.view('about.html');
});

app.listen({ port: 8000 }, (err, address) => {
    if (err) throw err;
});
