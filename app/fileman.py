import paramiko
from flask import session
import os

clients = {}

def init_client(username, password):
    proxy = None
    client = paramiko.SSHClient()
    client.load_system_host_keys()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

    server = "149.89.161.100"

    client.connect(server, username=username, password=password, sock=proxy)
    clients[username] = client
    session["username"] = username

def list_files(username):

    ssh_stdin, ssh_stdout, ssh_stderr = clients[username].exec_command("ls -a")

    return ssh_stdout.readlines()


def rename_file(directory, old, new, username):

    ssh_stdin, ssh_stdout, ssh_stderr = clients[username].exec_command("mv " + directory + "/" + old + " " + directory + "/" + new)
    
    return ssh_stdout.readlines()
