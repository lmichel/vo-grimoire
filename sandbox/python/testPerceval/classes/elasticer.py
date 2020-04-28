import elasticsearch
import json
import os
import sys
import re
import jsonpickle
from jsonBuilder import jsonBuilder
from os import path
from datetime import datetime


class elasticer(object):

    def saveMailsToElastic(self, repo, mailList):
        es = elasticsearch.Elasticsearch(['http://localhost:9200'])
        es.indices.create(mailList)
        nbErreurs = 0
        isUseful = 1
        for message in repo.fetch():
            try:
                item = {'from': message['data']['From'],
                        'body': message['data']['body'],
                        'in-reply-to': 'none',
                        'timestamp': self.returnTimestamp(message),
                        'id': message['data']['Message-ID'],
                        'references': 'none',
                        'subject': 'none',
                        'maillist':mailList}
                if 'From' in message['data'] and 'body' in message['data']:
                    item['from'] = message['data']['From']
                    item['body'] = message['data']['body']
                else:
                    isUseful = 0
                if 'Subject' in message['data']:
                    item['subject'] = message['data']['Subject']
                if 'In-Reply-To' in message['data']:
                    item['in-reply-to'] = message['data']['In-Reply-To']
                if 'References' in message['data']:
                    item['references'] = message['data']['References']
                if isUseful == 1:
                    es.index(index=mailList, doc_type='keyword', body=item)
                else:
                    print("\nMail ignoré")
                    isUseful = 1
            except KeyError:
                print("Useless Mail")

    def doQuery(self, mailList):
        choix = input("\nDo you want your results to be printed or storaged in a Json :"
                      "\n 1 : Print in console"
                      "\n 2 : Store it in a Json"
                      "\n 3 : Both"
                      "\nChoice : ")
        if self.isInt(choix) == 0:
            if int(choix) not in [1, 2, 3]:
                print("Option not valid, the result will be only printed")
                choix = 1
        else:
            print("Option not valid, the result will be only printed")
            choix = 1
        json_name = input("\nType the name of the Json query you want : ")
        base_path = os.path.dirname(os.path.realpath(__file__))
        json_path = base_path.replace("/python/testPerceval/classes", "/data/queries/")
        if path.exists(json_path + json_name + '.json') is False:
            print('\nThis query does not exist, please type different name without .json')
        else:
            es = elasticsearch.Elasticsearch(['http://localhost:9200'])
            with open(json_path + json_name + '.json', 'r', encoding='utf-8') as f:
                json_query = json.load(f)
                print("MAILLIST : " + mailList)
                print(json_query)
                es_result = es.search(index=mailList, body=json_query)
                compteur = 0
                for message in es_result['hits']['hits']:
                    compteur += 1
                    if int(choix) == 1 or int(choix) == 3:
                        print("\n RESULT N°" + str(compteur))
                        print("\nFrom : " + message['_source']['from'])
                        print("\nId : " + message['_source']['id'])
                        print("\nReferences : " + message['_source']['references'])
                if int(choix) == 2 or int(choix) == 3:
                    jsonBuilder().buildResJSON(es_result['hits']['hits'])

    def printThread(self):
        json_name = input("\nType the name of the Json query you want : ")
        base_path = os.path.dirname(os.path.realpath(__file__))
        json_path = base_path.replace("/python/testPerceval/classes", "/data/queries/")
        if path.exists(json_path + json_name + '.json') is False:
            print('\nThis query does not exist, please type different name without .json')
        else:
            es = elasticsearch.Elasticsearch(['http://localhost:9200'])
            with open(json_path + json_name + '.json', 'r', encoding='utf-8') as f:
                json_query = json.load(f)
                print(json_query)
                es_result = es.search(index="mails", doc_type="message", body=json_query)
                compteur = 0
                for message in es_result['hits']['hits']:
                    compteur += 1
                    if message['_source']['references'] not in 'none':
                        references = message['_source']['references'].split(" ")
                        query = {
                            "query": {
                                "bool": {
                                    "should": []
                                }
                            }
                        }
                        for ref in references:
                            query["query"]["bool"]["should"].append({
                                "term": {
                                    "id.keyword": ref.replace("\n", "")
                                }
                            })
                        thread_result = es.search(index="mails", doc_type="message", body=query)
                        for result in thread_result['hits']['hits']:
                            print("\n" + json.dumps(result['_source']['id']))
                        res = thread_result
                        jsonBuilder().buildResJSON(res)

    def deleteMails(self, mailList):
        es = elasticsearch.Elasticsearch(['http://localhost:9200'])
        # Faudra ajouter les ignore
        es.indices.delete(index='mails', ignore=[400, 404])
        es.indices.delete(index=mailList, ignore=[400, 404])
        es.indices.delete(index=mailList + "_threads", ignore=[400, 404])

    def launchElastic(self):
        os.system("sudo systemctl start elasticsearch.service")

    def returnTimestamp(self, message):
        date_string = message['data']['Date']
        if '(' in date_string:
            date_string = date_string.split('(')[0]
        date = datetime.strptime(date_string.strip(), '%a, %d %b %Y %H:%M:%S %z')
        return date.timestamp()

    def isInt(self, input):
        try:
            int(input)
            return 0
        except ValueError:
            return 1

    def addThread(self, sub_table, mailList):
        es = elasticsearch.Elasticsearch(['http://localhost:9200'])
        for elem in sub_table:
            try:
                thread_item = {'subject': elem,
                               'content': jsonpickle.encode(sub_table[elem])}
                es.index(index=mailList + "_threads", doc_type='message', body=thread_item)
            except KeyError:
                print("\nWrong Structure")

    def findThread(self,mailList):
        es = elasticsearch.Elasticsearch(['http://localhost:9200'])
        mail = self.returnRandom(mailList)
        query = {
            "query": {
                "match_phrase": {
                    "content": mail['id']
                }
            },
            "size": 1
        }
        es_result = es.search(index=mailList + '_threads', doc_type="message", body=query)
        if es_result is not None and len(es_result['hits']['hits']) > 0 :
            es_result = jsonpickle.decode(es_result['hits']['hits'][0]['_source']['content'])
            self.printThread(es_result)
        else:
            print("NO RESULT")

    def printThread(self, thread):
        compteur = 0
        if thread.message is not None:
            compteur += 1
            print(str(compteur) + ' : ' + thread.message.toString())
        for child in thread.children:
            compteur += 1
            print(str(compteur) + ' : ' + child.message.toString())
            if child.children is not None:
                self.printChildsRecursive(child.children)

    def printChildsRecursive(self, childs):
        for elem in childs:
            if elem.message is not None:
                print(elem.message.toString())
            if elem.children is not None:
                self.printChildsRecursive(elem.children)

    def returnRandom(self,mailList):
        es = elasticsearch.Elasticsearch(['http://localhost:9200'])
        query = {
            "query": {
                "function_score": {
                    "random_score": {}
                }
            },
            "size": 1
        }
        es_result = es.search(index=mailList,body=query)
        return es_result['hits']['hits'][0]['_source']
re_regex = re.compile("""(
  (Re(\[\d+\])?:) | (\[ [^]]+ \])
\s*)+
""", re.I | re.VERBOSE)
