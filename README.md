# Remote console

Send traffic to a server and have it logged to a web page in real time.

## Using remote console

There are three endpoints for sending log traffic to:
  * `/log` - Normal logs, akin to `console.log`
  * `/log-warning` - Warning logs, akin to `console.warn`
  * `/log-error` - Error logs, akin to `console.error`

All endpoints expect an HTTP POST request with a JSON payload in the format of:

```JSON
{
  "message": "hello world"
}
```
