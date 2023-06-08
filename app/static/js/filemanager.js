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
    newFilename = document.getElementById("file-form-" + filename).value

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

    const content = document.getElementById("create-file").value
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

window.editor = {}
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
          });
    } else {
        window.editor[`modal-${filename}-contents`].setValue(`${jsonData}`)
    }

    
    

}

async function editFile(filename) {
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

    window.location.reload()
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