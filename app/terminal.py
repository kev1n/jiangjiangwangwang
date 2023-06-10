from subprocess import Popen
import atexit

def startTerminal():
    print("starting websocket server")
    Popen(["node", "./server.js"])
