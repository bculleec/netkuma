netkuma.js is a low-level mini networking framework for your Node.js web applications. It uses the net library hence 'net' and is small and hardworking hence 'kuma' meaning bear.

 - [Website](https://netkuma.ca/) - [Docs](https://netkuma.up.railway.app/docs)

## Features
netkuma.js is still early and in-development but supports practical building blocks for web frameworking. You can:

 - register `GET` routes
 - listen on any port and host
 - send raw text responses
 - render simple HTML views by passing a file path
 - define routes with URL parameters `/user/:id` and access them via `request.params`

This project will continue to grow and more functionality will be added as it evolves.

## Example
```
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

```
