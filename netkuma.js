import net from "node:net";
import fs from "node:fs";
import path from "node:path";

const netkuma = function(opts) {
    const app = {};
    app.routes = {};
    app.postRoutes = {};
    
    app.logger = opts.logger;
    app.publicDir = opts.publicDir;

    const server = net.createServer((socket) => {
        socket.on('data', (bytes) => {
            const httpObj = parseHttp(bytes.toString());

            if (!httpObj.route) { console.error('Unable to obtain route info from ', httpObj); return; }
            if (!httpObj.method) { console.error('Unable to obtain method info from ', httpObj); return; }

            if (httpObj.method === 'GET') {
                const match = app.matchesGetRoute(httpObj.route);

                if (match) { app.executeGetRoute(match, socket); }
                else { console.error('Could not find a match for ' + httpObj.route) }
            } else if (httpObj.method === 'POST') {
                const match = app.matchesPostRoute(httpObj.route);
                if (match) { app.executePostRoute(match, socket, httpObj.body); }
                else { console.error('Could not find a match for ' + httpObj.route) }
            } else {
                console.error('invalid http method', httpObj.method);
                return;
            }

        });
    });

    app.get = function (route, callback) {
        app.routes[route] = {};
        app.routes[route].callback = callback;
        app.routes[route].urlSegments = route.split('/').splice(1); /* always consume the first forward-slash */
        return;
    }

    app.post = function (route, callback) {
        app.postRoutes[route] = {};
        app.postRoutes[route].callback = callback;
        app.postRoutes[route].urlSegments = route.split('/').splice(1); /* always consume the first forward-slash */

        return;
    }

    app.listen = function (opts, callback) {
        if (!opts.host) { opts.host = '127.0.0.1'; }
        server.listen({ port: opts.port, hostname: opts.host }, () => {
            if ( app.logger ) { console.log(`server is listening on ${opts.host}:${opts.port}`); }
        })
    }

    app.matchesRoute = function (route, routesDict) {

        if (Object.keys(routesDict).includes(route)) return route; /* exact match -- whew life made easy */
        
        /* a route match can be an exact match or a param match */
        const routeSegments = route.split('/').splice(1);

        for (const registeredRoute of Object.keys(routesDict)) {
            if (routeSegments.length !== routesDict[registeredRoute].urlSegments.length) continue;

            routesDict[registeredRoute].params = {};

            let match = registeredRoute;
            for (const [idx, segment] of routesDict[registeredRoute].urlSegments.entries()) {
                /* is it an exact route or a parameter */
                if (segment[0] !== ':' && segment !== routeSegments[idx]) {
                    match = false;
                    break;
                } else {
                    if (segment[0] === ':') { routesDict[registeredRoute].params[segment.substring(1)] = routeSegments[idx] }
                }
            }
            if (match) { return registeredRoute; }
        };
        return false;
    };

    app.matchesPostRoute = function (route) {
        const routesDict = app.postRoutes;
        const match = app.matchesRoute(route, routesDict);
        return match;
    };

    app.matchesGetRoute = function (route) {
        const routesDict = app.routes;
        const match = app.matchesRoute(route, routesDict);
        return match;
    }

    app.executeRoute = function (route, socket, routesDict, reqBody) {
        const callback = routesDict[route].callback;

        const request = {
            params: routesDict[route].params
        }

        if (reqBody) { request.body = reqBody }

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

    app.executePostRoute = function(route, socket, body) {
        app.executeRoute(route, socket, app.postRoutes, body);
    };

    app.executeGetRoute = function (route, socket) {
        app.executeRoute(route, socket, app.routes);
    };

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

    const httpObj = parseHttpRoute(lines[0]);

    if (httpObj?.method === 'POST') { httpObj.body = parseHttpBody(httpString); }

    return httpObj;

}

function parseHttpRoute(reqString) {
    const tokens = reqString.split(' ');
    if (tokens[0] === 'GET' && tokens[1]) { return { route: tokens[1] , method: 'GET' } }
    else if (tokens[0] === 'POST' && tokens[1]) { return { route: tokens[1] , method: 'POST' } }
    return null;
}

function parseHttpBody(httpString) {
    const tokens = httpString.split(`\r\n\r\n`);

    if (tokens.length > 1) {
        return JSON.parse(tokens[1]);
    }

}

export { netkuma };
