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

            const match = app.matchesRoute(httpObj.route);

            if (match) { app.executeRoute(match, socket); }
            else { console.error('Could not find a match for ' + httpObj.route) }

        });
    });

    app.get = function (route, callback) {
        app.routes[route] = {};
        app.routes[route].callback = callback;
        app.routes[route].urlSegments = route.split('/').splice(1); /* always consume the first forward-slash */
        return;
    }

    app.listen = function (opts, callback) {
        if (!opts.host) { opts.host = '127.0.0.1'; }
        server.listen({ port: opts.port, hostname: opts.host }, () => {
            if ( app.logger ) { console.log(`server is listening on ${opts.host}:${opts.port}`); }
        })
    }

    app.matchesRoute = function (route) {

        if (Object.keys(app.routes).includes(route)) return route; /* exact match -- whew life made easy */
        
        /* a route match can be an exact match or a param match */
        const routeSegments = route.split('/').splice(1);

        for (const registeredRoute of Object.keys(app.routes)) {
            if (routeSegments.length !== app.routes[registeredRoute].urlSegments.length) continue;

            app.routes[registeredRoute].params = {};

            let match = registeredRoute;
            for (const [idx, segment] of app.routes[registeredRoute].urlSegments.entries()) {
                /* is it an exact route or a parameter */
                if (segment[0] !== ':' && segment !== routeSegments[idx]) {
                    match = false;
                    break;
                } else {
                    if (segment[0] === ':') { app.routes[registeredRoute].params[segment.substring(1)] = routeSegments[idx] }
                }
            }
            if (match) { return registeredRoute; }
        };
        return false;
    }

    app.executeRoute = function (route, socket) {
        const callback = app.routes[route].callback;

        const request = {
            params: app.routes[route].params
        }

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
                } else {
                    reply.send('File' + app.publicDir + fname + 'was not found...')
                }
            }
        }
        callback( request , reply );
    }

    return app;
}

function publicFileExists(publicDir, fileName) {
    return fs.existsSync(path.join(publicDir, fileName));
}

function publicFileRead(publicDir, fileName) {
    return fs.readFileSync(path.join(publicDir, fileName));
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
