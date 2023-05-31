from flask import Flask, render_template, request, session, redirect
import fileman
import os
import terminal

app = Flask(__name__)
app.secret_key = os.urandom(12).hex()

@app.route("/", methods=["GET"])
def connectForm():
    #basic http form that takes in username and password
    return render_template("connect.html")

@app.route("/connect", methods=["POST"])
def connect():
    #connect to server
    #get username and password from post form
    username = request.form["username"]
    password = request.form["password"]
    
    terminal.startTerminal(username, password)
    fileman.init_client(username, password)
    session["username"] = username

    return redirect("/file_system")

@app.route("/file_system", methods=["GET"])
def file_system():
    files = fileman.list_files(session["username"])
    folders = fileman.list_folders(session["username"])

    individualPath = fileman.currentPath(session["username"]).split("/")

    paths = []
    for i in range(len(individualPath)):
        totalpath = ""
        for j in range(0, i + 1):
            totalpath += individualPath[j] + "/"
        paths.append(totalpath)
        
    return render_template("file_system.html", username = session["username"], files = files, folders = folders, currentPath=individualPath, paths=paths)

@app.route("/getFileData", methods=["GET"])
def getFileData():
    #get file data from server
    username = request.args.get("username")

    if username != session["username"]:
        return "Error: You do not have permission to delete this file"
    
    filename = request.args.get("filename")
    
    data = fileman.cat_file(filename, username)
    return data

@app.route("/cd", methods=["GET"])
def cd():
    #change directory
    username = request.args.get("username")

    if username != session["username"]:
        return "Error: You do not have permission to delete this file"
    
    directory = request.args.get("directory")
    fileman.cd(directory, username)
    return "Success"

@app.route("/deleteFile", methods=["GET"])
def deleteFile():
    username = request.args.get("username")

    if username != session["username"]:
        return "Error: You do not have permission to delete this file"
    
    filename = request.args.get("filename")
    fileman.delete_file(filename, username)

@app.route("/renameFile", methods=["GET"])
def renameFile():
    username = request.args.get("username")

    if username != session["username"]:
        return "Error: You do not have permission to delete this file"
    
    filename = request.args.get("filename")
    newFilename = request.args.get("newFilename")
    print(filename, newFilename)
    fileman.rename_file(filename, newFilename, username)

if __name__ == "__main__":
    app.debug = False
    app.run(port="7999")
