from flask import Flask, render_template, request, session, redirect, url_for, send_file, Response, after_this_request
import fileman
import os
import terminal
from werkzeug.utils import secure_filename
from itsdangerous import URLSafeTimedSerializer, BadTimeSignature
from flask.sessions import session_json_serializer
from hashlib import sha1
import json
import requests
from io import BytesIO

app = Flask(__name__)
app.secret_key = os.urandom(50).hex()
terminal.startTerminal()

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
    
    fileman.init_client(username, password)
    session["username"] = username

    #send username and password to express app
    req = requests.post(
        "http://localhost:8000/authenticate",
        json={"username": username, "password": password},
    )

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

    individualPaths = individualPaths[1:]
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
    
    filename = request.json["directoryName"]
    newFilename = request.json["newDirectoryName"]
    print(filename, newFilename)
    fileman.rename_file(filename, newFilename, username)

    return "Success"


@app.route("/search", methods=["POST"])
def search():
    username = request.form["username"]

    if username != session["username"]:
        return "Error: You do not have permission to delete this file"
    
    filename = request.form["filename"]
    folders, files = fileman.search(filename, username)


    """ get data into this format
    {
  "results": [
    {
      "id": 1,
      "text": "Option 1"
      "file": True
    },
    {
      "id": 2,
      "text": "Option 2"
      "file": False
    }
  ],
  "pagination": {
    "more": true
  }
}
    """

    

    results = {"results": []}

    index = 0
    for i in range(len(files)):
        file = files[index][:-1]
        results["results"].append({"id": index + 1, "text": file, "file": True, "slashes": file.count("/")})
        index += 1

    for i in range(len(folders)):
        folder = folders[i][:-1]
        results["results"].append({"id": index + 1, "text": folder, "file": False, "slashes": folder.count("/")})
        index += 1
    results["results"].sort(key=lambda x: x["slashes"], reverse=False)

    #change the indexes now that the list is sorted
    for i in range(len(results["results"])):
        results["results"][i]["id"] = i + 1

    
    print(results["results"])

    

    return results
    
@app.route("/upload", methods=["POST"])
def upload():
    print(request.form)
    print(request.files)
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

@app.route("/download/<username>/<filename>", methods=["GET"])
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

    bytesfromfile = fileman.download(filename, username)
    buffer = BytesIO()
    buffer.write(bytesfromfile)
    buffer.seek(0)

    return send_file(buffer, as_attachment=True, download_name=filename)

#for some bullshit reason we need two of the same route for both previews.
@app.route("/downloadpdf/<username>/<filename>", methods=["GET"])
def downloadpdf(username, filename):
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

    bytesfromfile = fileman.download(filename, username)
    buffer = BytesIO()
    buffer.write(bytesfromfile)
    buffer.seek(0)

    return send_file(buffer, as_attachment=True, download_name=filename)

@app.route("/moveFileToFolder", methods=["POST"])
def moveFileToFolder():
    username = request.json["username"]

    if username != session["username"]:
        return "Error: You do not have permission to move this file"
    
    filename = request.json["filename"]
    foldername = request.json["foldername"]

    fileman.move_file_to_folder(filename, foldername, username)

    return "Success"

@app.route('/verify_session/', methods=['POST'])
def verify_session():
    session_cookie = request.json["cookie"]
    return str(readAndVerifyCookie(session_cookie))

#https://gist.github.com/GioBonvi/b94278d0519dfa46f96f3de354efe269
def readAndVerifyCookie(cookie):
  signer = URLSafeTimedSerializer(
    app.secret_key, salt="cookie-session",
    serializer=session_json_serializer,
    signer_kwargs={"key_derivation": "hmac", "digest_method": sha1}
  )
  try:
    session_data = signer.loads(cookie)
    return json.dumps(session_data)
  except BadTimeSignature:
    return {"username": None}

if __name__ == "__main__":
    app.debug = False
    app.run(port="7999")
