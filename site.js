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

app.get('/docs', (request, reply) => {
    return reply.send("This page is still under construction! netkuma will work hard to get it ready soon.");
})

app.listen({ port: 8000, host: '0.0.0.0' }, (err, address) => {
    if (err) throw err;
});
