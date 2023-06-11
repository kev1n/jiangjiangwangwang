const username = document.getElementById("username").innerHTML


async function getContentsOfFile(filename) {
    //query /getFileData with get request, username and filename in querystring

    const body = {
        username: username,
        filename: filename
    }
    const response = await fetch(`/getFileData`, 
        {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }, 
            body: JSON.stringify(body)
        }
    );
    let jsonData = await response.json();
    jsonData = jsonData.join("")
    alert(jsonData);
}

async function changeDirectory(directory) {
    //query /cd with get request, username and directory in querystring

    const body = {
        username: username,
        directory: directory
    }

    const response = await fetch(`/cd`,
        {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
                },
            body: JSON.stringify(body)
        }
    );

    window.location.reload()
}

async function deleteFile(filename) {
    //query /deleteFile with get request, username and filename in querystring

    const body = {
        username: username,
        filename: filename
    }

    const response = await fetch(`/deleteFile`, {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
                },
            body: JSON.stringify(body)
        });

    window.location.reload()
}

async function renameFile(filename) {
    let newFilename = document.getElementById("file-form-" + filename).value

    const body = {
        username: username,
        filename: filename,
        newFilename: newFilename
    }

    console.log(newFilename)
    //query /renameFile with get request, username, filename and newFilename in querystring
    const response = await fetch(`/renameFile`, {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
                },
            body: JSON.stringify(body)
        });

    window.location.reload()
}

async function createFile() {
    //query /createFile with get request, username and filename in querystring

    const content = window.editor["create-file-editor"].getValue()
    const filename = document.getElementById("create-file-name").value


    const body = {
        username: username,
        filename: filename,
        content: content
    }

    
    const response = await fetch(`/createFile`, {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
                },
            body: JSON.stringify(body)
        });

    window.location.reload()
}

async function createDirectory() {
    //query /createDirectory with post request, username and directory in body

    const directory = document.getElementById("create-folder-name").value

    const body = {
        username: username,
        directory: directory
    }
    
    const response = await fetch(`/createDirectory`, {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
                },
            body: JSON.stringify(body)
        });

    window.location.reload()
}

async function deleteDirectory(directoryname) {
    //query /deleteDirectory with get request, username and filename in querystring

    const body = {
        username: username,
        directory: directoryname
    }

    const response = await fetch(`/deleteDirectory`, {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
                },
            body: JSON.stringify(body)
        });

    window.location.reload()
}

async function renameDirectory(directoryName) {
    let newDirectoryName = document.getElementById("folder-form-" + directoryName).value

    const body = {
        username: username,
        directoryName: directoryName,
        newDirectoryName: newDirectoryName
    }

    console.log(newDirectoryName)
    console.log(directoryName)
    //query /renameFile with get request, username, filename and newFilename in querystring
    const response = await fetch(`/renameDirectory`, {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
                },
            body: JSON.stringify(body)
        });

    window.location.reload()
}

window.editor = {}
sockets = {}
async function populateModalContents(filename) {
    
    const body = {
        username: username,
        filename: filename
    }
    const response = await fetch(`/getFileData`, 
        {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }, 
            body: JSON.stringify(body)
        }
    );

    let jsonData = await response.json();
    jsonData = jsonData.join("")

    contentArea = document.getElementById(`modal-${filename}-contents`)
    //only create editor when it doesn't already exist
    if (contentArea.childElementCount == 0) {

        require(["vs/editor/editor.main"], () => {
            
            monacoLanguages = monaco.languages.getLanguages()

            language = "plaintext"

            if (filename.split(".").length != 1) {
                const extension = "." + filename.split(".")[1]
                for (var i = 0; i < monacoLanguages.length; i++) {
                    if (Array.isArray(monacoLanguages[i].extensions) == false) continue
                    if (Array.from(monacoLanguages[i].extensions).includes(extension)) {
                        language = monacoLanguages[i].id
                        break
                    }
                }
            }

            window.editor[`modal-${filename}-contents`] = monaco.editor.create(contentArea, {
              value: `${jsonData}`,
              language: language,
              theme: 'vs-light',
              automaticLayout: true
            });

            var Socket = window.MozWebSocket || window.WebSocket;
            socket = new Socket('ws://' + location.hostname + ':' + 8000);
            sockets[filename] = socket
            socket.onopen = async function() {
            var term = new Terminal({
                cols: 100,
                rows: 50,
                convertEol: true,
                useStyle: true,
                cursorBlink: true,
                screenKeys: true,
                automaticLayout: true
            });

            var f = new FitAddon.FitAddon();

            term.loadAddon(f);

            term.onData(function(data) {
                socket.send(data);
            });
            
            /*
            let qty = 0
            term.onRender(function() {
                qty++
                //console.log(qty)
                if (qty == 3)
                //we turn the filename into base64 to avoid dealing with special characters
                socket.send(`tmux new-session -A -s ${btoa(filename)}\r`)
            });*/

            term.open(document.getElementById(`modal-${filename}-terminal`));
            f.fit();
            
            term.finishedLoading = false
            socket.onmessage = function(event) {
                console.log(event.data)
                console.log(event.data.includes(username))
                term.write(event.data);
                if (!term.finishedLoading && event.data.includes(username)) {
                    term.finishedLoading = true
                    socket.send(`tmux new-session -A -s ${btoa(filename)}\r`)
                    f.fit();
                }
            };

            socket.onclose = function() {
                term.destroy();
            };

            };
          });
    } else {
        window.editor[`modal-${filename}-contents`].setValue(`${jsonData}`)
    }

}

function runCode(filename) {
    //this will save the changes first
    editFile(filename, false)

    socket = sockets[filename]
    //get the right extension
    const extension = filename.split(".")[1]
    path = document.getElementById("current-path").innerHTML

    if (extension == "py") {
        socket.send(`python3 ${path}/${filename}\r`)
    } else if (extension == "java") {
        socket.send(`javac ${path}/${filename}; java -cp ${path} ${filename.split(".")[0]}; rm ${path}/${filename.split(".")[0]}.class\r`)
    }
}

async function editFile(filename, reload=true) {
    var editor = window.editor[`modal-${filename}-contents`]
    const content = editor.getValue()

    const body = {
        username: username,
        filename: filename,
        content: content
    }
    
    const response = await fetch(`/createFile`, {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
                },
            body: JSON.stringify(body)
        });
    
    if (reload) window.location.reload()
}

async function moveFileToFolder(filename, foldername) {
    const body = {
        username: username,
        filename: filename,
        foldername: foldername
    }
    
    const response = await fetch(`/moveFileToFolder`, {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
                },
            body: JSON.stringify(body)
        });

    window.location.reload()
}

function openEditorForFileCreation() {
    //open monoco editor at #create-file-editor
    require(["vs/editor/editor.main"], () => {
        window.editor["create-file-editor"] = monaco.editor.create(document.getElementById("create-file-editor"), {
          value: "",
          language: "plaintext",
          theme: 'vs-light',
          automaticLayout: true
        });
      })
}
