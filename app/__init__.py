from flask import Flask, render_template, request, session, redirect, send_file, Response, after_this_request
import fileman
import os
import terminal
from werkzeug.utils import secure_filename

app = Flask(__name__)
app.secret_key = os.urandom(12).hex()

uploads = os.path.dirname(os.path.realpath(__file__))
app.config['UPLOAD_FOLDER'] = uploads
ALLOWED_EXTENSIONS = {'txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif','java','py','c','js','css','html','docx','zip','mp3','wav','mp4','ppt','rar','xls','pde'}

def allowed_file(filename):
    if filename.split(".") == None:
        return True
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route("/", methods=["GET"])
def connectForm():
    #basic http form that takes in username and password
    return render_template("login.html")

@app.route("/connect", methods=["POST"])
def connect():
    #connect to server
    #get username and password from post form
    username = request.form["username"]
    password = request.form["password"]
    
    #terminal.startTerminal(username, password)
    fileman.init_client(username, password)
    session["username"] = username

    return redirect("/file_system")

@app.route("/file_system", methods=["GET"])
def file_system():
    files = fileman.list_files(session["username"])
    folders = fileman.list_folders(session["username"])

    currentPath = fileman.currentPath(session["username"])
    individualPaths = currentPath.split("/")

    paths = []
    for i in range(len(individualPaths)):
        totalpath = ""
        for j in range(0, i + 1):
            totalpath += individualPaths[j] + "/"
        paths.append(totalpath)

    #get rid of new line at the end of each file because it messes up the html
    for i in range(len(files)):
        files[i] = files[i][:-1]
    for i in range(len(folders)):
        folders[i] = folders[i][:-1]

    folders.insert(0, "~")
    folders.insert(0, "..")

    
    return render_template("file_system.html", username = session["username"], files = files, folders = folders, individualPaths = individualPaths, paths=paths, currentPath=currentPath)

@app.route("/getFileData", methods=["POST"])
def getFileData():
    #get file data from server
    username = request.json["username"]

    if username != session["username"]:
        return "Error: You do not have permission to delete this file"
    
    filename = request.json["filename"]

    data = fileman.cat_file(filename, username)
    
    return data

@app.route("/cd", methods=["POST"])
def cd():
    username = request.json.get("username")

    if username != session["username"]:
        return "Error: You do not have permission to delete this file"
    
    directory = request.json["directory"]
    fileman.cd(directory, username)
    return "Success"

@app.route("/deleteFile", methods=["POST"])
def deleteFile():
    username = request.json["username"]

    if username != session["username"]:
        return "Error: You do not have permission to delete this file"
    
    filename = request.json["filename"]
    fileman.delete_file(filename, username)

    return "Success"

@app.route("/renameFile", methods=["POST"])
def renameFile():
    username = request.json["username"]

    if username != session["username"]:
        return "Error: You do not have permission to delete this file"
    
    filename = request.json["filename"]
    newFilename = request.json["newFilename"]

    fileman.rename_file(filename, newFilename, username)

    return "Success"

@app.route("/createFile", methods=["POST"])
def createFile():
    username = request.json["username"]

    if username != session["username"]:
        return "Error: You do not have permission to delete this file"
    
    filename = request.json["filename"]

    #turn content into a bytes like object before uploading
    content = str.encode(request.json["content"])

    fileman.upload(filename, username, content)

    return "Success"

@app.route("/createDirectory", methods=["POST"])
def createDirectory():
    username = request.json["username"]

    if username != session["username"]:
        return "Error: You do not have permission to delete this file"
    
    foldername = request.json["directory"]
    fileman.create_directory(foldername, username)

    return "Success"

@app.route("/deleteDirectory", methods=["POST"])
def deleteDirectory():
    username = request.json["username"]

    if username != session["username"]:
        return "Error: You do not have permission to delete this directory"
    
    directoryname = request.json["directory"]
    fileman.delete_directory(directoryname, username)

    return "Success"

@app.route("/renameDirectory", methods=["POST"])
def renameDirectory():
    username = request.json["username"]

    if username != session["username"]:
        return "Error: You do not have permission to delete this file"
    
    filename = request.json["directoryname"]
    newFilename = request.json["newDirectoryname"]

    fileman.rename_file(filename, newFilename, username)

    return "Success"


@app.route("/search", methods=["POST"])
def search():
    username = request.form["username"]

    if username != session["username"]:
        return "Error: You do not have permission to delete this file"
    
    filename = request.form["filename"]
    files = fileman.search(filename, username)

    #get rid of new line at the end of each file because it messes up the html
    for i in range(len(files)):
        files[i] = files[i][:-1]

    return render_template("search.html", username = session["username"], filename=filename, files=files)
    
@app.route("/upload", methods=["POST"])
def upload():
    username = request.form["username"]

    if username != session["username"]:
        return "Error: You do not have permission to upload files"
    
    file = request.files["file"]
    filename = secure_filename(file.filename)

    if filename == '':
        return "No File Found"
    if not allowed_file(filename):
        return "File Type Not Allowed"
    
    content = file.read()
    fileman.upload(filename, username, content)

    return "Success"

@app.route("/download/<username>/<filename>", methods=["GET","POST"])
def download(username, filename):
    if username != session["username"]:
        return "Error: You do not have permission to download files"
    
    """
    content = fileman.get_hex(filename, username)
    file = open(filename, "wb")
    for i in content:
        file.write(bytes.fromhex(i))
    # def generate():
    #     for i in file:
    #         yield i
    # response = Response(generate(), mimetype=mimetypes.guess_type(filename)[0])
    # response.headers.set("Content-Disposition", "attachment", filename=filename)
    
    # # file_path = str(filename)
    # # os.remove(r""+file_path)
    # return response
    file.close()
    os.remove(filename)
    """

    fileman.download(filename, username)

    @after_this_request
    def remove_file(response):
        try:
            os.remove(filename)
        except Exception as error:
            app.logger.error("Error removing or closing downloaded file handle", error)
        return response
    
    return send_file(filename, as_attachment=True)

@app.route("/moveFileToFolder", methods=["POST"])
def moveFileToFolder():
    username = request.json["username"]

    if username != session["username"]:
        return "Error: You do not have permission to move this file"
    
    filename = request.json["filename"]
    foldername = request.json["foldername"]

    fileman.move_file_to_folder(filename, foldername, username)

    return "Success"

if __name__ == "__main__":
    app.debug = False
    app.run(port="7999")
