/* eslint-disable no-console */
import 'bootstrap';
import $ from 'jquery';

const MESSAGE_CLASSES = {
  'log': 'Console-message--log',
  'warn': 'Console-message--warning',
  'error': 'Console-message--error',
};

$(() => {

  const $console = $('#console');
  const ws = new WebSocket('ws://localhost:8081');

  let userHasScrolledBack = false;

  $console.on('scroll', function () {
    // Check whether the user has scrolled back or not
    let scrollOffset = $console.scrollTop() as number;
    let consoleHeight = $console.outerHeight() as number;
    if (scrollOffset + consoleHeight >= $console[0].scrollHeight) {
      userHasScrolledBack = false;
    } else {
      userHasScrolledBack = true;
    }
  });

  ws.addEventListener('open', function open() {
    console.log("Successfully connected to web socket");
  });

  ws.addEventListener('message', function incoming({ data: json }) {
    let data = JSON.parse(json);
    handleSocketPayload(data);
  });

  function handleSocketPayload(payload: any) {
    switch (payload.type) {
      // Console message - add message to console
      case 'console':
        // Extract data from payload
        let logType: 'log' | 'warn' | 'error' = payload.data.type;
        let logTimeFormatted: string = new Date(payload.data.time).toLocaleString();
        let logMessage: string = payload.data.message;

        // Append HTML for row
        $console.append(`
          <span class="Console-message ${MESSAGE_CLASSES[logType]}">
            <span class="Console-messageTime">${logTimeFormatted}&nbsp;</span>
            ${logMessage}
          </span>
        `);

        if (!userHasScrolledBack) {
          scrollConsoleToBottom();
        }
        break;
      default:
        throw new Error("Unhandled websocket payload type: " + payload.type);
    }
  }

  function scrollConsoleToBottom() {
    $console.scrollTop($console.height() as number);
  }

  // Ensure websocket is closed before leaving the page
  window.onbeforeunload = function () {
    ws.close();
  };
});
