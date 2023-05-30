from flask import Flask, render_template, request
import fileman
import os
import terminal
from subprocess import Popen

app = Flask(__name__)
app.secret_key = os.urandom(12).hex()

@app.route("/", methods=["GET"])
def connectForm():
    #basic http form that takes in username and password
    return render_template("connect.html")

@app.route("/server", methods=["POST"])
def server():
    #connect to server
    #get username and password from post form
    username = request.form["username"]
    password = request.form["password"]
    
    fileman.init_client(username, password)
    files = fileman.list_files(username)

    terminal.startTerminal(username, password)

    return render_template("server.html", files = files)

if __name__ == "__main__":
    app.debug = False
    app.run(port="7999")
