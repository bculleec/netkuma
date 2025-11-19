import net from "node:net";
import fs from "node:fs";
import path from "node:path";

const netkuma = function(opts) {
    const app = {};
    app.routes = {};
    
    app.logger = opts.logger;
    app.publicDir = opts.publicDir;

    const server = net.createServer((socket) => {
        socket.on('data', (bytes) => {
            const httpObj = parseHttp(bytes.toString());

            if (app.hasRoute(httpObj.route)) {
                app.executeRoute(httpObj.route, socket);
            }

        });
    });

    app.get = function (route, callback) {
        app.routes[route] = callback;
    }

    app.listen = function (opts, callback) {
        if (!opts.host) { opts.host = '127.0.0.1'; }
        server.listen({ port: opts.port, hostname: opts.host }, () => {
            if ( app.logger ) { console.log(`server is listening on ${opts.host}:${opts.port}`); }
        })
    }

    app.hasRoute = function (route) {
        return (Object.keys(app.routes).includes(route));
    }

    app.executeRoute = function (route, socket) {
        const callback = app.routes[route];

        const reply = {
            send: (body) => {
                socket.write(
                    'HTTP/1.1 200 OK\r\n' +
                    'Content-Length: ' + Buffer.byteLength(body) + '\r\n' +
                    '\r\n' + 
                    body
                );
                socket.end();
            },
            view: (fname) => {
                if (publicFileExists(app.publicDir, fname)) {
                    const httpBody = publicFileRead(app.publicDir, fname);
                    reply.send(httpBody);
                }
            }
        }
        callback( {} , reply );
    }

    return app;
}

function publicFileExists(publicDir, fileName) {
    return fs.existsSync(path.join('./site', fileName));
}

function publicFileRead(publicDir, fileName) {
    return fs.readFileSync(path.join('./site', fileName));
}

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

export { netkuma };
