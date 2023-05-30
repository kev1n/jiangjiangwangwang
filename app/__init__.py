import paramiko
from flask import Flask, render_template, request
from subprocess import Popen
import atexit
import time

app = Flask(__name__)
websocketServers = []

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

    websocketServers.append(Popen(["node", "./server.js", username, password]))
    
    proxy = None
    client = paramiko.SSHClient()
    client.load_system_host_keys()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

    server = "149.89.161.100"

    client.connect(server, username=username, password=password, sock=proxy)
    ssh_stdin, ssh_stdout, ssh_stderr = client.exec_command("ls -a")

    print(ssh_stdout)

    return render_template("server.html", files = ssh_stdout.readlines())

"""

"""

def onClose():
    print("Closing")
    for websocketServer in websocketServers:
        websocketServer.kill()
        print(websocketServer)
        print("Killed websocketserver")
    
atexit.register(onClose)
if __name__ == "__main__":
    app.debug = False
    app.run(port="7999")
