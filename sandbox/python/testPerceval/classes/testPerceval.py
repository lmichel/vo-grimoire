import json
import os.path
import sys
import urllib.request
from os import path

from perceval.backends.core.mbox import MBox

'''
This program is build to test GrimoireLab : Perceval and especially Perceval on .mbox files
You will be able to :
    - Display all the messages of an archive
    - Display the number of mails sent by someone
    - Display the first five mails of the archive
    - Search a keyword in the archive
    - Build a JSON with N messages
'''

class analyzePerceval(object):

    # Method who download the archive and stores it in ../data/mbox
    # If the archive is already downloaded, it will not redownload-it
    # The path is relative
    def downloadMails(self):
        base_path = os.path.dirname(os.path.realpath(__file__))
        mbox_path = base_path.replace("/python/testPerceval/classes", "/data/mbox")
        if path.exists(mbox_path + '/mails.mbox') is False:
            print("\nBeginning Download...")
            url = 'http://mail.ivoa.net/pipermail/dm.mbox/dm.mbox'
            urllib.request.urlretrieve(url, mbox_path + '/mails.mbox', reporthook=self.showProgress)
            print("\nDownload Finished !")
        else:
            print("\nArchive already downloaded !")
        print("\nThe archive is located at : " + mbox_path)
        return mbox_path

    # This method allow you to see in the terminal the progress of the download
    def showProgress(self, count, bloc_size, total_size):
        percent = int(count * bloc_size * 100 / total_size)
        sys.stdout.write("\r" + "...%d%%" % percent)

    # This method create the repository for Perceval to work
    # You will need to specify the target mailing list
    # and the path where the archives are
    def createRepo(self, dir):
        mbox_uri = 'dm@iova.net'
        mbox_dir = dir
        repo = MBox(uri=mbox_uri, dirpath=mbox_dir)
        return repo

    # Simple method to type the Name of a person
    def typeName(self):
        name = input("\nType the Name of the person : ")
        if name is None:
            print("\nMust Specify a name")
            return ""
        else:
            return name

    # Simple method to type words
    def typeWord(self):
        word = input("\nType the keyword : ")
        if word is None:
            print("\nMust Specify a name")
            return ""
        else:
            return word

    # Simple method who prints all the messages of an archive
    def getAllMessages(self, repo):
        print("\nWORK IN PROGRESS !")
        for message in repo.fetch():
            print(json.dumps(message, indent=4))

    # This method counts the number of mails sent by the person with his name passed in parameter
    def getMessageCounterName(self, repo, nom):
        print("\nWORK IN PROGRESS !")
        compteur = 0
        try:
            for message in repo.fetch():
                if nom.lower() in message['data']['From'].lower():
                    compteur = compteur + 1
            print("\nNumber of mails send by  " + nom + " : " + str(compteur))
        except:
            print('\n')

    # This method print all the messages with the specified keyword in it
    def keyword(self, repo, keyword):
        try:
            for message in repo.fetch():
                if keyword.lower() in message['data']['body']['plain'].lower():
                    print('\n' + message['data']['body']['plain'])
        except:
            print('\n')

    # This method build an array with the first five messages of the archive
    def divideMbox(self, repo):
        index = 0
        tab = list(repo.fetch())
        tabRes = []
        for index in range(0, 4):
            index = index + 1
            tabRes.append(tab[:index])
        return tabRes

    # This method print an array in JSON format
    def printArray(self, arr):
        print("\nWORK IN PROGRESS !")
        try:
            for message in arr:
                print(json.dumps(message, indent=4))
        except:
            print('\n')

    # This method build a json with N messages
    def buildJSON(self, repo):
        base_path = os.path.dirname(os.path.realpath(__file__))
        json_path = base_path.replace("/python/testPerceval/classes", "/data/json/")
        n = input("\nType the number of messages you want to be saved : ")
        n = int(n)
        tab = list(repo.fetch())
        index = 0
        tabRes = []
        for index in range(0, n):
            index = index + 1
            tabRes.append(tab[index])
        index = 0
        with open(json_path + 'json_' + str(n) + '_messages.json', 'w', encoding='utf-8') as f:
            for index in range(0, n):
                json.dump(tabRes[index], f, ensure_ascii=False, indent=4)
        print("\nJSON created.")

    # Introduction of the program
    def intro(self):
        print("This is a program who test Perceval.")
        print("\nYou will be asked to type a number corresponding of the action you want to do.")
        print("\nThe program will start to download the archive if not already downloaded.")

    # Method who let the user choose an action
    def run(self, repo):
        options = [0, 1, 2, 3, 4, 5, 10]
        res = 0
        while res == 0:
            print("\nType the number of action you want to do.")
            print("\n--- Actions ---")
            print("1 : Print all messages")
            print("2 : Count the mails send by someone")
            print("3 : Print the 5 firsts messages")
            print("4 : Search a keyword")
            print("5 : Build a JSON with N messages")
            print("10 : Stop the program")
            res = input("\nYour choice : ")
            if int(res) == 1:
                self.getAllMessages(repo)
                res = 0
            if int(res) == 2:
                nom = self.typeName()
                if nom is "":
                    print("\nNo name specified, please retry")
                else:
                    self.getMessageCounterName(repo, nom)
                res = 0
            if int(res) == 3:
                self.printArray(self.divideMbox(repo))
                res = 0
            if int(res) == 4:
                key = self.typeWord()
                if key is "":
                    print("\nNo name specified, please retry")
                else:
                    self.keyword(repo, key)
                res = 0
            if int(res) == 5:
                self.buildJSON(repo)
                res = 0
            if int(res) == 10:
                print("\nEND")
            if int(res) not in options:
                print("\nNot an action, please retry")
                res = 0
