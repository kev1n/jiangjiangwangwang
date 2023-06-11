/* lastTarget is set first on dragenter, then
   compared with during dragleave. */
var lastTarget = null;


function isFile(evt) {
    var dt = evt.dataTransfer;

    for (var i = 0; i < dt.types.length; i++) {
        if (dt.types[i] === "Files") {
            return true;
        }
    }
    return false;
}

window.addEventListener("dragenter", function(e)
{
    if (isFile(e)) {
        lastTarget = e.target; // cache the last target here
        // unhide our dropzone overlay
        document.querySelector(".dropzone").style.visibility = "";
        document.querySelector(".dropzone").style.opacity = 1;
    }

});

window.addEventListener("dragleave", function(e)
{
    e.preventDefault();
    // this is the magic part. when leaving the window,
    // e.target happens to be exactly what we want: what we cached
    // at the start, the dropzone we dragged into.
    // so..if dragleave target matches our cache, we hide the dropzone.
    // `e.target === document` is a workaround for Firefox 57
    if(e.target === lastTarget || e.target === document)
    {
        document.querySelector(".dropzone").style.visibility = "hidden";
        document.querySelector(".dropzone").style.opacity = 0;
    }
});

window.addEventListener("dragover", function (e) {
    e.preventDefault();
});

window.addEventListener("drop", async function (e) {
    e.preventDefault();
    document.querySelector(".dropzone").style.visibility = "hidden";
    document.querySelector(".dropzone").style.opacity = 0;
    if(e.dataTransfer.files.length == 1)
    {
        var fd = new FormData();
        fd.append('file', e.dataTransfer.files[0], e.dataTransfer.files[0].name);
        fd.append("username", username)
        var req = fetch('/upload', {
            method: 'post',
            body: fd /* or aFile[0]*/
        });

        req.then(function(response) {
            // returns status + response headers
            // but not yet the body, 
            // for that call `response[text() || json() || arrayBuffer()]` <-- also promise
          
            if (response.ok) {
              // status code was 200-299
              //reload page
                window.location.reload();
            } else {
              // status was something else
                alert("File upload failed!");
            }
          });
          
    }
});