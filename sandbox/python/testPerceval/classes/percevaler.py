import json
from collections import deque
class percevaler(object):

    def getAllMessage(self,repo):
        print("\nWORK IN PROGRESS !")
        for message in repo.fetch():
            print(json.dumps(message, indent=4))

    def getMessageCounterName(self, repo, nom):
        print("\nWORK IN PROGRESS !")
        compteur = 0
        nbErreurs = 0
        for message in repo.fetch():
            try:
                if nom.lower() in message['data']['From'].lower():
                    compteur = compteur + 1
            except:
                nbErreurs += 1
        print("\nNumber of mails send by  " + nom + " : " + str(compteur))

    def keyword(self, repo, keyword):
        try:
            for message in repo.fetch():
                if keyword.lower() in message['data']['body']['plain'].lower():
                    print('\n' + message['data']['body']['plain'])
        except:
            print('\n')

    # This method build an array with the first five messages of the archive
    def first5Messages(self, repo):
        tab = list(repo.fetch())
        tabRes = []
        for index in range(4):
            tabRes.append(tab[index])
            print("Ajout")
            index += 1
        return tabRes

    # This method print an array in JSON format
    def printArray(self, arr):
        print("\nWORK IN PROGRESS !")
        try:
            for message in arr:
                print("\n"+json.dumps(message, indent=4))
                date = daytime.strptime(message['data']['Date'],'%a, %w %b %Y %H:%M:%S %z')
                print(date)
        except:
            print('\n')

    def afficherPremiers(self,repo):
        print("DATE IS PRINTED")
        compteur = 0
        for message in repo.fetch():
            print("\n" + json.dumps(message, indent=4))
            date_string = message['data']['Date']
            date = datetime.strptime(date_string.strip(),'%a, %d %b %Y %H:%M:%S %z')
            print(date.timestamp())
            compteur += 1
            if compteur not in range(4):
                break

    def countAllMessage(self,repo):
        compteur = 0
        for message in repo.fetch():
            compteur += 1
        print("\nTotal : " + str(compteur))