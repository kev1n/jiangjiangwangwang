$(".searchbar").select2({
    templateResult: format,
    templateSelection: format,
    tokenSeparators: [',', ' '],
    minimumInputLength: 2,
    minimumResultsForSearch: 10,
    placeholder: "Search this folder",
    ajax: {
        url: "/search",
        dataType: "json",
        type: "POST",
        delay: 750,
        data: function (params) {

            var queryParameters = {
                filename: params.term,
                username: username
            }
            return queryParameters;
        }
    }
}).on("select2:select", function(e) {
    var data = e.params.data.text;
    //send a post request to the server to cd into that directory
    var filenamelength = data.split("/").slice(-1)[0].length;
    var isfile = e.params.data.file;

    if (isfile) {
        var data = data.slice(0, data.length-filenamelength);
    }
    
    $.ajax({
        url: "/cd",
        type: "POST",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify({
            directory: data,
            username: username
        }),
        success: function(data) {
            //reload the page
            window.location.reload();
        }
    });

    // what you would like to happen
});


function format(state) {
    //does the state have a file attribute?
    if (!state.hasOwnProperty('file')) {
        return state.text;
    }


    //if the file is a directory, add a folder icon
    if (!state.file) {
        return $(`<div><i class="bi bi-folder-symlink-fill"></i>${state.text}</div>`);
    } else {
        //<i class="bi bi-file-text-fill"></i>
        return $(`<div><i class="bi bi-file-text-fill"></i>${state.text}</div>`);
    }
}