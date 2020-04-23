import json
from collections import deque
class percevaler(object):

    def isLinked(self,first,cont):
        list_container = deque()
        list_container.append(first)
        list_container_analyzed = set()
        while list_container:
            temp = stack.pop()
            if temp is cont:
                return True
            list_container_analyzed.add(temp)
            for child in temp.child:
                if child not in list_container_analyzed :
                    list_container.append(child)
        return False

    def addChild(self, prev,cont):
        if cont.parent is not None:
            cont.parent.remove_child(cont)
        prev.child.append(cont)
        cont.parent = prev

    def remove_child(self, child):
        self.child.remove(child)
        child.parent = None



    def jwzAlgorithm(self,repo):
        id_table = {}
        for message in repo.fetch():
            id = message['data']['Message-ID']
            message = Message(message['data']['Subject'], id, message['data']['References'])
            # Part A of the algorithm
            if message['data']['Message-ID'] in id_table:
                this_container = id_table[id]
                this_container.message = message
            else:
                this_container = Container(message,None,None,None)
                id_table[id] = container

            # Part B of the algorithm
            references = message['data']['References'].split(" ")
            previous = None
            for ref in references:
                if ref in id_table:
                    temp_cont = id_table[ref]
                else:
                    temp_cont = Container(None,None,None,None)
                    id_table[ref] = temp_cont

                if(previous is not None):
                    if temp_cont is this_container:
                        continue
                    if self.isLinked(temp_cont,previous):
                        continue
                    self.add_child(previous,container)
                previous = temp_cont
            if previous is not None:
                previous.add_child(this_container)
        root_set = []
        for cont in id_table.values():
            if cont.parent is None:
                root_set.append(cont)
        del id_table

































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