from subprocess import Popen
import atexit

def startTerminal(username, password):
    print("starting websocket server")
    server = Popen(["node", "./server.js"])
