import net from 'node:net';
import fs from 'node:fs';
import path from 'node:path';

/* net.BlockList */
const blockList = new net.BlockList();
blockList.addAddress('0.0.0.0');
blockList.addAddress('120.0.0.0');

console.log(blockList.check('0.0.0.0'));
console.log(blockList.check('1.0.0.0'));

console.log(blockList.rules);

/* net.SocketAddress */
const address = new net.SocketAddress({
    address: '127.0.0.1',
    family: 'ipv4',
    port: 8080
});

console.log(address.family);

const address2 = net.SocketAddress.parse('0.0.0.0:7070');
console.log(address2.port);

/* net.Server */
const server = new net.createServer((socket) => {
    console.log('client connected');
    
    socket.on('data', (data) => {
        // console.log('data received')
        // console.log(data.toString());

        const httpObj = parseHttp(data.toString());

        console.log(httpObj.route);

        if (isPublicFile(httpObj.route)) { 
            const response = fs.readFileSync(getPublicFilePath(httpObj.route));
            const httpResponse = makeHttpResponse(response);
            socket.write(httpResponse);
        }
        else { 
            console.log('requested file not found');
            const response = 'HTTP/1.1 200 OK\r\n' +
            `Content-Length:${Buffer.byteLength(httpObj.route)}\r\n\r\n` +
            httpObj.route;
            socket.write(response);
        }
        socket.end();
    });

}).on('error', (err) => {
    // handle errors
    throw err;
});

server.listen({port: 8080, host:'127.0.0.1'}, () => {
    console.log('opened server on', server.address());
});

function parseHttp(httpString) {
    const lines = httpString.split('\n');

    const route = parseHttpRoute(lines[0]);
    return { route };

}

function parseHttpRoute(reqString) {
    const tokens = reqString.split(' ');
    if (tokens[0] === 'GET' && tokens[1]) { return tokens[1] }
    return null;
}

function isPublicFile(fileName) {
    return fs.existsSync(path.join('./site', fileName));
}

function getPublicFilePath(fileName) {
    return path.join('./site', fileName);
}

function makeHttpResponse(content) {
    const contentLength = Buffer.byteLength(content);
    const response = 'HTTP/1.1 200 OK\r\n' +
        `Content-Length:${contentLength}\r\n\r\n` +
        content;
    return response;
}

