async function getContentsOfFile(username, filename) {
    //query /getFileData with get request, username and filename in querystring

    const response = await fetch(`/getFileData?username=${username}&filename=${filename}`);
    const jsonData = await response.json();
    alert(jsonData);
}

async function changeDirectory(username, directory) {
    //query /cd with get request, username and directory in querystring
    const response = await fetch(`/cd?username=${username}&directory=${directory}`);

    window.location.reload()
}

async function deleteFile(username, filename) {
    //query /deleteFile with get request, username and filename in querystring
    const response = await fetch(`/deleteFile?username=${username}&filename=${filename}`);

    window.location.reload()
}

async function renameFile(username, filename) {
    newFilename = document.getElementById("file-form-" + filename).value
    console.log(newFilename)
    //query /renameFile with get request, username, filename and newFilename in querystring
    const response = await fetch(`/renameFile?username=${username}&filename=${filename}&newFilename=${newFilename}`);

    window.location.reload()
}