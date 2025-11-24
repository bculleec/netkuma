/*
Tiny example showing how you can use route parameters.
*/

import { netkuma } from "../netkuma.js"; 

const app = netkuma( {logger : true } );

app.get('/item/:id', (request, reply) => {
    return reply.send('Item infomation: Item Identification number - ' + request.params.id);
});

app.get('/:id/send', (request, reply) => {
    return reply.send(request.params.id + ' has been sent!');
});

app.listen({ port: 4040, host: '0.0.0.0' }, (err, address) => {
    if (err) throw err;
});
