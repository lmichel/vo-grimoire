import perceval.backends.core
import urllib.request,sys,json,os.path,mailbox
from perceval.backends.core.mbox import MBox
from os import path

class analyzePerceval(object) :

    def downloadMails(self):
        if path.exists('../mails/mails.mbox') is False :
            print("\nBeginning Download...")
            url = 'http://mail.ivoa.net/pipermail/dm.mbox/dm.mbox'
            urllib.request.urlretrieve(url,'../mails/mails.mbox')
            print("\nDownload Finished !")
        else:
            print("\nArchive already downloaded !")

    def createRepo(self):
        mbox_uri = 'dm@iova.net'
        mbox_dir = '../mails'
        repo = MBox(uri=mbox_uri, dirpath=mbox_dir)
        return repo

    def typeName(self):
        name = input("Type the Name of the person : ")
        if name is None :
            print("Il faut spécifier un nom")
            return ""
        else :
            return name

    def getAllMessages(self,repo):
        print("WORK IN PROGRESS !")
        for message in repo.fetch():
            print(json.dumps(message,indent=4))

    def getMessageCounterName(self,repo,nom):
        print("WORK IN PROGRESS !")
        compteur = 0
        for message in repo.fetch():
            if nom.lower() in message['data']['From'].lower():
                compteur = compteur + 1
        print("Nombre de messages de " + nom + " : " + str(compteur))

    def divideMbox(self,repo):
        index = 0
        tab = list(repo.fetch())
        tabRes = []
        for index in range(0, 4):
            index = index + 1
            tabRes.append(tab[:index])
        return tabRes

    def printArray(self,arr):
        print("WORK IN PROGRESS !")
        for message in arr :
            print(json.dumps(message,indent=4))

    def intro(self):
        print("This is a program who test Perceval.")
        print("\nYou will be asked to type a number corresponding of the action you want to do.")
        print("\nThe program will start to download the archive if not already downloaded.")

    def run(self,repo):
        options = [0,1,2,3,10]
        res = 0
        while res == 0 :
            print("\nType the number of action you want to do.")
            print("\n--- Actions ---")
            print("1 : Print all messages")
            print("2 : Count the mails send by someone")
            print("3 : Print the 5 firsts messages")
            print("10 : Stop the program")
            res = input("\nYour choice : ")
            if int(res) == 1 :
                self.getAllMessages(repo)
                res = 0
            if int(res) == 2 :
                nom = self.typeName()
                if nom is "" :
                    print("No name specified, please retry")
                else :
                    self.getMessageCounterName(repo,nom)
                res = 0
            if int(res) == 3 :
                self.printArray(self.divideMbox(repo))
                res = 0
            if int(res) == 10 :
                print("END")
            if int(res) not in options :
                print("Not an action, please retry")
                res = 0

if __name__ == "__main__":
    per = analyzePerceval()
    per.intro()
    per.downloadMails()
    repo = per.createRepo()
    per.run(repo)

