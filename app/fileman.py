import paramiko
from flask import session
import os

clients = {}
client_directory = {}

def init_client(username, password):
    proxy = None
    client = paramiko.SSHClient()
    client.load_system_host_keys()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

    server = "149.89.161.100"

    client.connect(server, username=username, password=password, sock=proxy)
    clients[username] = client

    client_directory[username] = "~/"

def list_files(username):

    ssh_stdin, ssh_stdout, ssh_stderr = clients[username].exec_command( f"cd {client_directory[username]}; ls -p | grep -v /")

    return ssh_stdout.readlines()

def list_folders(username):

    ssh_stdin, ssh_stdout, ssh_stderr = clients[username].exec_command(f"cd {client_directory[username]}; ls -d */")

    return ssh_stdout.readlines()

def cat_file(file, username):

    ssh_stdin, ssh_stdout, ssh_stderr = clients[username].exec_command(f"cd {client_directory[username]}; cat {file}")

    return ssh_stdout.readlines()

def cd(directory, username):
    print(directory)
    new_directory = client_directory[username] + "/" + directory
    print(new_directory)
    ssh_stdin, ssh_stdout, ssh_stderr = clients[username].exec_command(f"cd {new_directory}; pwd")
    client_directory[username] = ssh_stdout.readlines()[0][:-1]
    print(client_directory[username])

def currentPath(username):
    return client_directory[username]

def rename_file(directory, old, new, username):

    ssh_stdin, ssh_stdout, ssh_stderr = clients[username].exec_command("mv " + directory + "/" + old + " " + directory + "/" + new)

    return ssh_stdout.readlines()
