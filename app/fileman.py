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

    ssh_stdin, ssh_stdout, ssh_stderr = clients[username].exec_command("pwd")
    #print(ssh_stdout.readlines()[0][:-1])

    client_directory[username] = ssh_stdout.readlines()[0][:-1]



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

    #when the path is an absolute path (starts with /), then cd to that path
    #otherwise, cd to the current directory and then cd to the path
    new_directory = ""
    if directory[0] == "/":
        new_directory = directory
    else:
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

def delete_file(filename, username):

    ssh_stdin, ssh_stdout, ssh_stderr = clients[username].exec_command(f"cd {client_directory[username]}; rm {filename}")

    return ssh_stdout.readlines()

def rename_file(old, new, username):

    ssh_stdin, ssh_stdout, ssh_stderr = clients[username].exec_command(f"cd {client_directory[username]}; mv {old} {new}")

    return ssh_stdout.readlines()

def create_file(filename, username, content):
    # we use hex to avoid issues with special characters
    ssh_stdin, ssh_stdout, ssh_stderr = clients[username].exec_command(f"cd {client_directory[username]}; echo '{content}' > temp && xxd -r -p temp > {filename}; rm temp")

    return ssh_stdout.readlines()

def create_directory(foldername, username):

    ssh_stdin, ssh_stdout, ssh_stderr = clients[username].exec_command(f"cd {client_directory[username]}; mkdir {foldername}")

    return ssh_stdout.readlines()

def delete_directory(directoryname, username):

    ssh_stdin, ssh_stdout, ssh_stderr = clients[username].exec_command(f"cd {client_directory[username]}; rm -rf {directoryname}")

    return ssh_stdout.readlines()

def search(filename, username):

    ssh_stdin, ssh_stdout, ssh_stderr = clients[username].exec_command(f"cd {client_directory[username]}; find ~ -name {filename} 2>/dev/null")

    return ssh_stdout.readlines()

def upload(filename, username, content):
    # print(filename)
    # ssh_stdin, ssh_stdout, ssh_stderr = clients[username].exec_command(f"cd {client_directory[username]}; echo '{content}' > temp && xxd -r -p temp > '{filename}'; rm temp")
    ftp_client= clients[username].open_sftp()
    localtemp = open(filename, "wb")
    localtemp.write(content)
    localtemp.close()

    ftp_client.put("./"+filename, client_directory[username]+r"/"+filename)
    os.remove(filename)
    ftp_client.close()
    #return ssh_stdout.readlines()

def download(filename, username):
    ftp_client= clients[username].open_sftp()
    ftp_client.get(client_directory[username]+r"/"+filename, "./"+filename)
    ftp_client.close()


def get_hex(filename, username):
    ssh_stdin, ssh_stdout, ssh_stderr = clients[username].exec_command(f"cd {client_directory[username]}; xxd -p {filename}")

    return ssh_stdout.readlines()

def move_file_to_folder(filename, foldername, username):
    ssh_stdin, ssh_stdout, ssh_stderr = clients[username].exec_command(f"cd {client_directory[username]}; mv {filename} {foldername}")

    return ssh_stdout.readlines()