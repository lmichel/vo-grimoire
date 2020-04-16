import json
import os.path
import sys
import urllib.request
from os import path

from perceval.backends.core.mbox import MBox

class analyzePerceval(object):

    def downloadMails(self):
        base_path = os.path.dirname(os.path.realpath(__file__))
        print(base_path)
        mbox_path = base_path.replace("/python/testPerceval/classes","/data/mbox")
        if path.exists(mbox_path + '/mails.mbox') is False:
            print("\nBeginning Download...")
            url = 'http://mail.ivoa.net/pipermail/dm.mbox/dm.mbox'
            urllib.request.urlretrieve(url, mbox_path + '/mails.mbox', reporthook=self.showProgress)
            print("\nDownload Finished !")
        else:
            print("\nArchive already downloaded !")
        return mbox_path

    def showProgress(self, count, bloc_size, total_size):
        percent = int(count * bloc_size * 100 / total_size)
        sys.stdout.write("\r" + "...%d%%" % percent)

    def createRepo(self,dir):
        print(dir)
        mbox_uri = 'dm@iova.net'
        mbox_dir = dir
        repo = MBox(uri=mbox_uri, dirpath=mbox_dir)
        return repo

    def typeName(self):
        name = input("\nType the Name of the person : ")
        if name is None:
            print("\nMust Specify a name")
            return ""
        else:
            return name

    def typeWord(self):
        word = input("\nType the keyword : ")
        if word is None:
            print("\nMust Specify a name")
            return ""
        else:
            return word

    def getAllMessages(self, repo):
        print("\nWORK IN PROGRESS !")
        for message in repo.fetch():
            print(json.dumps(message, indent=4))

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

    def keyword(self, repo, keyword):
        try:
            for message in repo.fetch():
                if keyword.lower() in message['data']['body']['plain'].lower():
                    print('\n' + message['data']['body']['plain'])
        except:
            print('\n')

    def divideMbox(self, repo):
        index = 0
        tab = list(repo.fetch())
        tabRes = []
        for index in range(0, 4):
            index = index + 1
            tabRes.append(tab[:index])
        return tabRes

    def printArray(self, arr):
        print("\nWORK IN PROGRESS !")
        try:
            for message in arr:
                print(json.dumps(message, indent=4))
        except:
            print('\n')

    def intro(self):
        print("This is a program who test Perceval.")
        print("\nYou will be asked to type a number corresponding of the action you want to do.")
        print("\nThe program will start to download the archive if not already downloaded.")

    def run(self, repo):
        options = [0, 1, 2, 3, 4, 10]
        res = 0
        while res == 0:
            print("\nType the number of action you want to do.")
            print("\n--- Actions ---")
            print("1 : Print all messages")
            print("2 : Count the mails send by someone")
            print("3 : Print the 5 firsts messages")
            print("4 : Search a keyword")
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
            if int(res) == 10:
                print("\nEND")
            if int(res) not in options:
                print("\nNot an action, please retry")
                res = 0
