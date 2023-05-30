var WebSocket = require('faye-websocket');
var express = require('express');
var app = express();
var server = require('http').Server(app);
var term = require('term.js');
var { Client }   = require('ssh2');

//get username and password args
var args = process.argv.slice(2);
var username = args[0];
var password = args[1];

server.on('upgrade', function(request, socket, body) {
  if (WebSocket.isWebSocket(request)) {
    var ws = new WebSocket(request, socket, body);
    var conn;
    ws.on('open', function() {
        conn = new Client();
      conn.on('ready', function() {
        ws.write('\n*** SSH CONNECTION ESTABLISHED ***\n');
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
        });
      }).on('close', function() {
        ws.write('\n*** SSH CONNECTION CLOSED ***\n');
        ws.close();
      }).connect({
        host: '149.89.161.100',
        port: 22,
        username: username,
        password: password
      });
    }).on('close', function(event) {
      try {
        conn && conn.end();
      } catch (ex) {}
    });
  }
});

server.listen(8000, '127.0.0.1');
