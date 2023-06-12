var terminalSpawnedAlready = false;
var open = false;
function switchButton() {
    var button = document.getElementById("toggle-button")
    //already open and we click to close it - hide terminal with css
    if (open) {
        //turn button into close button
        button.innerHTML = "Open Terminal"
        button.onclick = () => openTerminal()
    } else {
        //closed and we click to open it
        //turn button into close button
        button.innerHTML = "Close Terminal"
        button.onclick = () => closeTerminal(button)
    }
    open = !open
}

var sidebar = document.getElementById("sidebar")
var dragbar = document.getElementById("dragbar")
  
var clone = dragbar.cloneNode(true)
clone.onmousedown = function(e) {
    console.log('dragging')
    e.preventDefault();
    dragging = 1;
    body.addEventListener('mousemove', resize);
    body.classList.add('resizing');
};

dragbar.remove()

function closeTerminal(button) {
    switchButton()
    //get parent element of terminal
    document.getElementById("terminal-container").style.display = "none"
    document.getElementById("terminal").style.display = "none"
    document.getElementById("dragbar").remove()

    //set the container back to its original size
    body.style.setProperty("--left-width", `91%`);

}

var f = new FitAddon.FitAddon();
function openTerminal() {
    switchButton()
    sidebar.appendChild(clone)
    if (terminalSpawnedAlready) {
        document.getElementById("terminal-container").style.display = "block"
        document.getElementById("terminal").style.display = "block"
        return
    } else {
        document.getElementById("terminal-container").style.display = "block"
        var Socket = window.MozWebSocket || window.WebSocket;
        socket = new Socket('ws://' + location.hostname + ':' + 8000);
        socket.onopen = function() {
        var term = new Terminal({
            cols: 100,
            rows: 150,
            convertEol: true,
            useStyle: true,
            cursorBlink: true,
            screenKeys: true
        });

        f = new FitAddon.FitAddon();

        term.loadAddon(f);

        term.onData(function(data) {
            socket.send(data);
        });

        term.open(document.getElementById('terminal'));
        f.fit();

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


