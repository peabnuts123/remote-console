import express from 'express';
import * as WebSocket from 'ws';


// WEB SOCKETS ===
const wss = new WebSocket.Server({ port: 8081 });

// Set of all currently connected clients
let connectedClients: WebSocket[] = [];

// Whenever a websocket connection is made
wss.on('connection', function connection(ws: WebSocket) {
  // Add new socket to list of connected sockets
  log("New client connected");
  connectedClients.push(ws);

  // WebSocket disconnect
  ws.on("close", function onClose() {
    log("Client disconnected");
    // Remove from list of connected clients
    connectedClients.splice(connectedClients.indexOf(ws));
  });
});


// EXPRESS SERVER ===
const app = express();

// Serve directory as static site
app.use(express.static('www'));
app.use(express.json());
/**
 * Express middleware for shared validation logic for
 * log endpoints
 */
function validateLogBody(request: express.Request, response: express.Response, next: express.NextFunction) {
  if (request.header('content-type') !== 'application/json') {
    return response.status(400).send("Requests must be sent with Content-Type 'application/json'\n");
  }

  let payload: any = request.body;

  log(payload);

  // Validation
  if (typeof payload.message !== 'string') {
    return response.status(400).send("Invalid payload. Missing 'message' property.\n");
  } else if (payload.message.trim().length === 0) {
    return response.status(400).send("Message must not be empty.\n");
  } else {
    next();
  }
}
app.post('/log*', validateLogBody);


app.post('/log', (request, response) => {
  let message: string = request.body.message;

  // "Thanks, got that"
  response.sendStatus(204);

  // Send payload to frontend
  logToConnectedClients(message);
});

app.post('/log-warning', (request, response) => {
  let message: string = request.body.message;

  // "Thanks, got that"
  response.sendStatus(204);

  // Send payload to frontend
  logWarningToConnectedClients(message);
});

app.post('/log-error', (request, response) => {
  let message: string = request.body.message;

  // "Thanks, got that"
  response.sendStatus(204);

  // Send payload to frontend
  logErrorToConnectedClients(message);
});

// Run server
const PORT = process.env.PORT || 8080;
app.listen(PORT, function () {
  log(`Server listening on http://localhost:${PORT}`);
  log(`POST logs to /log, /log-warning or /log-error`);
});


// UTILITY FUNCTIONS ===
// Logging functions
/* eslint-disable no-unused-vars */
function log(...messages: any[]) { logRaw('log', ...messages); }
function logWarning(...messages: any[]) { logRaw('warn', ...messages); }
function logError(...messages: any[]) { logRaw('error', ...messages); }
function logRaw(fn: 'log' | 'warn' | 'error', ...messages: any[]) {
  // eslint-disable-next-line no-console
  console[fn](`[${new Date().toLocaleTimeString()}] `, ...messages);
}
/* eslint-enable */

// Websocket payloads
function logToConnectedClients(message: string) {
  return sendPayloadToConnectedClients({
    type: 'console',
    data: {
      type: 'log',
      message,
      time: new Date().toISOString(),
    },
  });
}
function logWarningToConnectedClients(message: string) {
  return sendPayloadToConnectedClients({
    type: 'console',
    data: {
      type: 'warn',
      message,
      time: new Date().toISOString(),
    },
  });
}
function logErrorToConnectedClients(message: string) {
  return sendPayloadToConnectedClients({
    type: 'console',
    data: {
      type: 'error',
      message,
      time: new Date().toISOString(),
    },
  });
}
/**
 * Send data to all connected clients
 * @param payload Data to be sent to connected clients
 */
function sendPayloadToConnectedClients(payload: any) {
  log(`Sending payload to ${connectedClients.length} connected clients:\n`, JSON.stringify(payload, null, 2));

  connectedClients.forEach((ws) => {
    ws.send(JSON.stringify(payload), (error) => {
      if (error) {
        logError("Error while sending payload: ", error);
      }
    });
  });
}
