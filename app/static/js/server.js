var terminalSpawnedAlready = false;
var open = false;
function switchButton(port) {
    var button = document.getElementById("toggle-button")
    //already open and we click to close it - hide terminal with css
    if (open) {
        //turn button into close button
        button.innerHTML = "Open Terminal"
        button.onclick = () => openTerminal(port)
    } else {
        //closed and we click to open it
        //turn button into close button
        button.innerHTML = "Close Terminal"
        button.onclick = () => closeTerminal(button, port)
    }
    open = !open
}

function closeTerminal(button, port) {
    switchButton(port)
    document.getElementById("terminal").style.display = "none"
}
function openTerminal(port) {
    switchButton(port)
    if (terminalSpawnedAlready) {
        document.getElementById("terminal").style.display = "block"
        return
    } else {
        var Socket = window.MozWebSocket || window.WebSocket;
        socket = new Socket('ws://' + location.hostname + ':' + port);
        socket.onopen = function() {
        var term = new Terminal({
            cols: 100,
            rows: 50,
            convertEol: true,
            useStyle: true,
            cursorBlink: true,
            screenKeys: true
        });

        term.onData(function(data) {
            socket.send(data);
        });

        term.open(document.getElementById('terminal'));

        term.write("\x1b[31mWelcome to the terminal!\x1b[m\r\n")
        
        socket.onmessage = function(event) {
            term.write(event.data);
        };

        socket.onclose = function() {
            term.destroy();
        };
        };

        terminalSpawnedAlready = true
    }
};
