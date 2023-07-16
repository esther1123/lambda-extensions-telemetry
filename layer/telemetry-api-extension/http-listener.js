import http from 'http';

export const listen = (address, port) => {
    const logsQueue = [];
    // init HTTP server for the Telemetry API subscription
    const server = http.createServer(function (request, response) {
        if (request.method === 'POST') {
            let body = '';
            request.on('data', function (data) {
                body += data;
            });
            request.on('end', function () {
                console.log('Logs listener received: ' + body);
                try {
                    let batch = JSON.parse(body);

                    // logs filter logic goes here
                    // e.g. only stream warn logs to S3
                    for (let item of batch) {
                        if (JSON.stringify(item).indexOf('warn log') !== -1) {
                            // { "time": "...", "type": "function", "record": "..." }
                            logsQueue.push(item.record);
                        }
                    }

                    // Forward all the logs
                    // if (batch.length > 0) {
                    //     logsQueue.push(...batch);
                    // }
                } catch (e) {
                    console.log("failed to parse logs");
                }
                response.writeHead(200, {})
                response.end("OK")
            });
        } else {
            console.log('GET');
            response.writeHead(200, {});
            response.end("OK");
        }
    });

    server.listen(port, address);
    console.log(`Listening for logs at http://${address}:${port}`);
    return { logsQueue, server };
};
