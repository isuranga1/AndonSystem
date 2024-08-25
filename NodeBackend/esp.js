var WebSocketServer = require("websocket").server;
const port = 443;

var serverforEsp = http.createServer(function (request, response) {
  console.log(new Date() + " Received request for " + request.url);
  response.writeHead(404);
  response.end();
});
//
