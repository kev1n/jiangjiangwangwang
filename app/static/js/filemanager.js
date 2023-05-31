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