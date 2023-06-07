
async function getContentsOfFile(username, filename) {
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
    const jsonData = await response.json();
    
    alert(jsonData);
}

async function changeDirectory(username, directory) {
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

async function deleteFile(username, filename) {
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

async function renameFile(username, filename) {
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

async function createFile(username) {
    //query /createFile with get request, username and filename in querystring

    const content = document.getElementById("create-file").value
    const filename = document.getElementById("create-file-name").value

    const contentAsHex = content.hexEncode()

    const body = {
        username: username,
        filename: filename,
        content: contentAsHex
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

async function createDirectory(username) {
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

async function populateModalContents(username, filename) {
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
    const jsonData = await response.json();

    var textarea = document.getElementById(`modal-${filename}-contents`)
    console.log(textarea)
    textarea.value = jsonData


}

async function editFile(username, filename) {
    var textarea = document.getElementById(`modal-${filename}-contents`)
    const content = textarea.value
    //turn to hex
    const contentAsHex = content.hexEncode()

    const body = {
        username: username,
        filename: filename,
        content: contentAsHex
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

String.prototype.hexEncode = function(){
    var hex, i;

    var result = "";
    for (i=0; i<this.length; i++) {
        hex = this.charCodeAt(i).toString(16);
        result += "0".repeat(2 - hex.length) + hex
    }

    return result
}

// var download = document.getElementById("download");

// var delete_temp = function() {

// download.addEventListener("click", function());