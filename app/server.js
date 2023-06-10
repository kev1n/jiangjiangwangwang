var WebSocket = require('faye-websocket');
var express = require('express');
var app = express();
app.use(express.json());
var server = require('http').Server(app);
var term = require('term.js');
var { Client }   = require('ssh2');

var clientSSHConnection = {}
// Regular HTTP routes
app.post('/authenticate', (req, res) => {
  //get username and password from request
  var username = req.body.username;
  var password = req.body.password;
  
  var conn = new Client();
  conn.connect({
    host: '149.89.161.100',
    port: 22,
    username: username,
    password: password
  })

  clientSSHConnection[username] = conn;
  res.send({success: true});

  
});

async function verifyCookie(cookie) {
  const body = {
    cookie: cookie
  } 

  const response = await fetch(`http://127.0.0.1:7999/verify_session`, 
      {
          method: "POST",
          headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
          }, 
          body: JSON.stringify(body)
      }
  );

  return response.json();
}

server.on('upgrade', async function(request, socket, body) {
  if (WebSocket.isWebSocket(request)) {
    //get the session cookie from the raw header
    var sessionCookie = request.rawHeaders.filter((header) => {
      return header.includes('session=');
    })[0].substring(8)

    var response = await verifyCookie(sessionCookie);
    var username = response["username"];
  
    if (username != "None") {
      var ws = new WebSocket(request, socket, body);
      var conn = clientSSHConnection[username];

      ws.on('open', function() {
        conn.shell(function(err, stream) {
          if (err) {
            ws.write('\n*** SSH SHELL ERROR: ' + err.message + ' ***\n');
            conn.end();
            return;
          }

          // Force binary strings to be sent over websocket to prevent
          // getting a Blob on the browser side which term.js cannot
          // currently handle
          stream.setEncoding('binary');

          stream.pipe(ws).pipe(stream).on('close', function() {
            conn.end();
          });
        }
      )}
      )

    }
    
  }
});

server.listen(8000, '127.0.0.1');
