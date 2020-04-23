import json
import os
import sys
import urllib.request
import elasticsearch
from os import path
from downloader import downloader
from elasticer import elasticer
from percevaler import percevaler
from jsonBuilder import jsonBuilder
from perceval.backends.core.mbox import MBox
from datetime import datetime
import threadingMails
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

    # This method will save all the mails get by Perceval to elastic search
    # def saveToElastic(self,repo):
    #     es = elasticsearch.Elasticsearch(['http://localhost:9200'])
    #     es.indices.create('mails')
    #     nbErreurs = 0
    #     for message in repo.fetch():
    #         try:
    #             item = {'from':'none',
    #                     'body':'none',
    #                     'in-reply-to':'none',
    #                     'timestamp' : 'none',
    #                     'id':'none',
    #                     'thread-topic':'none',
    #                     'thread-index':'none',
    #                     'references':'none'}
    #             item['from'] = message['data']['From']
    #             item['timestamp'] = self.returnTimestamp(message)
    #             item['body'] = message['data']['body']
    #             item['id'] = message['data']['Message-ID']
    #             item['references'] = message['data']['References']
    #             if 'In-Reply-To' in message['data']:
    #                 item['in-reply-to'] = message['data']['In-Reply-To']
    #             if 'Thread-Topic' in message['data']:
    #                 item['thread-topic'] = message['data']['thread-topic']
    #             if 'Thread-Index' in message['data']:
    #                 item['thread-index'] = message['data']['thread-topic']
    #             es.index(index='mails', doc_type='message', body=item)
    #         except:
    #             nbErreurs += 1

    # def doQuery(self):
    #     json_name = input("\nType the name of the Json query you want : ")
    #     base_path = os.path.dirname(os.path.realpath(__file__))
    #     json_path = base_path.replace("/python/testPerceval/classes", "/data/queries/")
    #     if path.exists(json_path + json_name + '.json') is False :
    #         print('\nThis query does not exist, please type different name without .json')
    #     else :
    #         es = elasticsearch.Elasticsearch(['http://localhost:9200'])
    #         with open(json_path + json_name + '.json','r',encoding='utf-8') as f:
    #             json_query = json.load(f)
    #             es_result = es.search(index="mails", doc_type="message", body=json_query)
    #             compteur = 0
    #             for message in es_result['hits']['hits']:
    #                 compteur += 1
    #                 print("\n" +str(compteur)+ " : "+ message['_source']['body'])


    # Little test about queries on elastic search
    # def searchElastic(self):
    #     es = elasticsearch.Elasticsearch(['http://localhost:9200'])
    #     es_result = es.search(index='mails', doc_type='message', body ={
    #         'query':{
    #             'match':{'thread-topic':'none'}
    #         }
    #     })
    #     for message in es_result['hits']['hits']:
    #         print("\n" + json.dumps(message['_source']))

    # This method allow you to see in the terminal the progress of the download
    def showProgress(self, count, bloc_size, total_size):
        percent = int(count * bloc_size * 100 / total_size)
        sys.stdout.write("\r" + "...%d%%" % percent)

    # This method create the repository for Perceval to work
    # You will need to specify the target mailing list
    # and the path where the archives are
    def createRepo(self, dir, mailList):
        mbox_uri = mailList+'@iova.net'
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

    # # Simple method who prints all the messages of an archive
    # def getAllMessages(self, repo):
    #     print("\nWORK IN PROGRESS !")
    #     for message in repo.fetch():
    #         print(json.dumps(message, indent=4))

    # # This method counts the number of mails sent by the person with his name passed in parameter
    # def getMessageCounterName(self, repo, nom):
    #     print("\nWORK IN PROGRESS !")
    #     compteur = 0
    #     nbErreurs = 0
    #     for message in repo.fetch():
    #         try:
    #             if nom.lower() in message['data']['From'].lower():
    #                 compteur = compteur + 1
    #         except:
    #             nbErreurs += 1
    #     print("\nNumber of mails send by  " + nom + " : " + str(compteur))
    #
    # # This method print all the messages with the specified keyword in it
    # def keyword(self, repo, keyword):
    #     try:
    #         for message in repo.fetch():
    #             if keyword.lower() in message['data']['body']['plain'].lower():
    #                 print('\n' + message['data']['body']['plain'])
    #     except:
    #         print('\n')

    # # This method build an array with the first five messages of the archive
    # def divideMbox(self, repo):
    #     tab = list(repo.fetch())
    #     tabRes = []
    #     for index in range(4):
    #         tabRes.append(tab[index])
    #         print("Ajout")
    #         index += 1
    #     return tabRes
    #
    # # This method print an array in JSON format
    # def printArray(self, arr):
    #     print("\nWORK IN PROGRESS !")
    #     try:
    #         for message in arr:
    #             print("\n"+json.dumps(message, indent=4))
    #             date = daytime.strptime(message['data']['Date'],'%a, %w %b %Y %H:%M:%S %z')
    #             print(date)
    #     except:
    #         print('\n')
    #
    # def afficherPremiers(self,repo):
    #     print("DATE IS PRINTED")
    #     compteur = 0
    #     for message in repo.fetch():
    #         print("\n" + json.dumps(message, indent=4))
    #         date_string = message['data']['Date']
    #         date = datetime.strptime(date_string.strip(),'%a, %d %b %Y %H:%M:%S %z')
    #         print(date.timestamp())
    #         compteur += 1
    #         if compteur not in range(4):
    #             break

    # Introduction of the program
    def intro(self):
        print("This is a program who test Perceval.")
        print("\nYou will be asked to type a number corresponding of the action you want to do.")
        print("\nThe program will start to download the archive if not already downloaded.")

    def isInt(self,input):
        try:
            int(input)
            return 0
        except ValueError:
            return 1

    # Method who let the user choose an action
    def run(self, repo):
        options = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 100]
        # self.countAllMessage(repo)
        res = 0
        while res == 0:
            print("\nType the number of action you want to do.")
            print("\n--- Actions ---")
            print("1 : Print all messages")
            print("2 : Count the mails send by someone")
            print("3 : Print the 5 firsts messages")
            print("4 : Search a keyword")
            print("5 : Build a JSON with N messages")
            print("6 : Save the mails to Elastic")
            print("7 : Display all the senders of mails (ElasticSearch)")
            print("8 : Delete indexes in ElasticSearch")
            print("9 : Print Info on how to launch ElasticSearch")
            print("10 : Execute a default query")
            print("11 : TEST")
            print("100 : Stop the program")
            res = input("\nYour choice : ")
            if self.isInt(res) == 0:
                if int(res) == 1:
                    threadingMails.runThread(repo)
                    res = 0
                if int(res) == 2:
                    nom = self.typeName()
                    if nom is "":
                        print("\nNo name specified, please retry")
                    else:
                        percevaler().getMessageCounterName(repo, nom)
                    res = 0
                if int(res) == 3:
                    percevaler().printArray(percevaler().first5Messages(repo))
                    res = 0
                if int(res) == 4:
                    key = self.typeWord()
                    if key is "":
                        print("\nNo name specified, please retry")
                    else:
                        percevaler().keyword(repo, key)
                    res = 0
                if int(res) == 5:
                    jsonBuilder().buildJSON(repo=repo)
                    res = 0
                if int(res) == 6:
                    elasticer().saveMailsToElastic(repo)
                    res = 0
                if int(res) == 7:
                    elasticer().searchElastic()
                    res = 0
                if int(res) == 8:
                    elasticer().deleteMails()
                    res = 0
                if int(res) == 9:
                    print("\nEnable ElasticSearch service : sudo /bin/systemctl enable elasticsearch.service")
                    print("Start ElasticSearch service : sudo systemctl start elasticsearch.service")
                    res = 0
                if int(res) == 10:
                    elasticer().doQuery()
                    res = 0
                if int(res) == 11:
                    elasticer().printThread()
                    res = 0
                if int(res) == 100:
                    print("\nEND")
                if int(res) not in options:
                    print("\nNot an action, please retry")
                    res = 0
            else:
                print("\nThis was not an Int, please retry")
                res = 0
