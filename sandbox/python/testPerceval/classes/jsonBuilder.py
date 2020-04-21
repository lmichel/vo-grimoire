import os
import json
from os import path
from datetime import datetime
class jsonBuilder(object):

    def buildJSON(self,repo):
        base_path = os.path.dirname(os.path.realpath(__file__))
        json_path = base_path.replace("/python/testPerceval/classes","/data/json/")
        n = input('\nType the number of messages you want to be saved : ')
        n = int(n)
        tab = list(repo.fetch())
        # index = 0
        tabRes = []
        for index in range(0, n):
            if index < len(tab):
                tabRes.append(tab[index])
            index = index + 1
        # index = 0
        with open(json_path + 'json_' + str(n) + '_messages.json' , 'w' , encoding='utf-8') as f:
            for index in range(0, n):
                if index < len(tabRes):
                    json.dump(tabRes[index], f, ensure_ascii=False, indent=4)
                index = index + 1
        print("\nJSON file created !")

    def buildResJSON(self,input):
        now = datetime.now()
        nom_fichier = now.strftime("%Y-%m-%d-%Hh%M")
        base_path = os.path.dirname(os.path.realpath(__file__))
        json_path = base_path.replace("/python/testPerceval/classes","/data/json/")
        with open(json_path + nom_fichier + '.json','w',encoding='utf-8') as f:
            json.dump(input,f)
        print("\nJSON CREATED")