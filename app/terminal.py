from subprocess import Popen
import atexit

websocketServers = []

def startTerminal(username, password):
    print("starting websocket server")
    server = Popen(["node", "./server.js", username, password])
    websocketServers.append(server)

def onClose():
    print("Closing")
    for websocketServer in websocketServers:
        websocketServer.kill()
        print(websocketServer)
        print("Killed websocketserver")
    
atexit.register(onClose)