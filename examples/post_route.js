/*
Tiny example to show you how you can set up a POST route.
*/

import { netkuma } from "../netkuma.js";

const app = netkuma({ logger: true });

app.post('/', (request, reply) => {
    const q = request.body.q;

    return reply.send('Creating your post: ' + q);
});

app.get('/', (request, reply) => {
    return reply.send(`
        <form method='post'>
        <input type=text name='q' id='q'>
        <input type=submit>
        </form>
        <div id='response'>
        <script>
        document.querySelector('form').addEventListener('submit', async (e) => {
            e.preventDefault();    
            console.log('form submitted');
            const response = await fetch('/', {
                method: 'post',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ q: document.getElementById('q').value })
            });
            document.getElementById('response').innerText = await response.text();
        })
        </script>
        `);
});

app.listen({port : 8080, host: '0.0.0.0'}, (err, address) => {
    if (err) throw err;
});
