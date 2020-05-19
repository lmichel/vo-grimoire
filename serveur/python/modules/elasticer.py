import elasticsearch
from datetime import datetime

class elasticer(object):

    def __init__(self,config):
        self.__config = config

    def saveMailsToElastic(self, repo, mailList, es_url, prefix_name):
        es = elasticsearch.Elasticsearch([es_url])
        index_name = self.chooseName(es_url, mailList)
        es.indices.create(index_name)
        prefix = 0
        compteur = 0
        isUseful = 1
        allIds = []
        refus = 0
        valides = 0
        for message in repo.fetch():
            prefix += 1
            try:
                if message['data']['Message-ID'] not in allIds:
                    item = {'from': message['data']['From'].encode('utf-8', 'ignore').decode('utf-8', 'ignore'),
                            'body': 'none',
                            'in-reply-to': 'none',
                            'timestamp': self.returnTimestamp(message),
                            'id': message['data']['Message-ID'].encode('utf-8', 'ignore').decode('utf-8', 'ignore'),
                            'references': 'none',
                            'subject': 'none',
                            'data': 'none',
                            'to': 'none',
                            'num': prefix_name + str(prefix),
                            'maillist': mailList.encode('utf-8', 'ignore').decode('utf-8', 'ignore'),
                            'numThread': -1}
                    if 'plain' in message['data']['body']:
                        item['body'] = message['data']['body']['plain'].encode('utf-8', 'ignore').decode('utf-8',
                                                                                                         'ignore')
                    if 'html' in message['data']['body']:
                        if item['body'] == 'none':
                            item['body'] = message['data']['body']['html'].encode('utf-8', 'ignore').decode('utf-8',
                                                                                                            'ignore')
                    if 'From' in message['data'] and 'body' in message['data']:
                        item['from'] = message['data']['From'].encode('utf-8', 'ignore').decode('utf-8', 'ignore')
                    else:
                        isUseful = 0
                    if 'Date' in message['data']:
                        item['date'] = message['data']['Date'].encode('utf-8', 'ignore').decode('utf-8', 'ignore')
                    if 'To' in message['data']:
                        item['to'] = message['data']['To'].encode('utf-8', 'ignore').decode('utf-8', 'ignore')
                    if 'Subject' in message['data'] and message['data']['Subject'] is not None:
                        item['subject'] = message['data']['Subject'].encode('utf-8', 'ignore').decode('utf-8', 'ignore')
                    if 'In-Reply-To' in message['data']:
                        item['in-reply-to'] = message['data']['In-Reply-To'].encode('utf-8', 'ignore').decode('utf-8',
                                                                                                              'ignore')
                    if 'References' in message['data']:
                        item['references'] = message['data']['References'].encode('utf-8', 'ignore').decode('utf-8',
                                                                                                            'ignore')
                    if isUseful == 1:
                        allIds.append(item["id"])
                        compteur += 1
                        valides += 1
                        es.index(index=index_name, doc_type='keyword', body=item)
                    else:
                        print("\nMail ignoré")
                        isUseful = 1
                else:
                    refus += 1
            except KeyError:
                print("Useless Mail")
        print("Compteur : " + str(compteur))
        print("Refusés : " + str(refus))
        print("Validés : " + str(valides))
        return allIds, index_name

    def addThreads(self,allIds, mailList, es_url):
        es = elasticsearch.Elasticsearch([es_url])
        compteur = 0
        threads = {}
        for id in allIds:
            res = [value for key, value in threads.items() if id in key]
            if len(res) > 0:
                self.modifyThreads(mailList, id, res[0], es_url)
            else:
                queryCourant = {
                    "query": {
                        "match_phrase": {
                            "id": id
                        }
                    }
                }
                es_result_id_courant = es.search(index=mailList, body=queryCourant)
                total = ""
                for mes in es_result_id_courant["hits"]["hits"]:
                    refs = mes["_source"]["references"]
                    reply = mes["_source"]["in-reply-to"]
                    resps = self.findResponders(id, mailList, es_url)
                    total += refs + reply + resps + "\n"
                threads[total] = compteur
                self.modifyThreads(mailList, id, compteur, es_url)
                compteur += 1
        print("Fin Ajout Threads")

    def findResponders(self,id, mailList, es_url):
        es = elasticsearch.Elasticsearch([es_url])
        query = {
            "query": {
                "bool": {
                    "should": [
                        {"match_phrase": {"in-reply-to": id}},
                        {"match_phrase": {"references": id}}
                    ]
                }
            }
        }
        es_result_responders = es.search(index=mailList, body=query)
        responders = ""
        for mes in es_result_responders["hits"]["hits"]:
            responders += mes["_source"]["id"] + "\n"
        return responders

    def modifyThreads(self,mailList, id, numThread, es_url):
        es = elasticsearch.Elasticsearch([es_url])
        query = {
            "query": {
                "match_phrase": {
                    "id": id
                }
            }
        }
        es_result = es.search(index=mailList, body=query)
        if len(es_result["hits"]["hits"]) > 0:
            es.update(index=mailList, doc_type='keyword', id=es_result["hits"]["hits"][0]["_id"],
                      body={"doc": {"numThread": numThread}})

    def deleteMails(self,es_url):
        es = elasticsearch.Elasticsearch([es_url])
        es.indices.delete(index="edu_temp", ignore=[400, 404])
        es.indices.delete(index="edu_new", ignore=[400, 404])
        es.indices.delete(index="kdd_new", ignore=[400, 404])
        es.indices.delete(index="edu_temp", ignore=[400, 404])
        es.indices.delete(index="kdd_temp", ignore=[400, 404])
        es.indices.delete(index="dm", ignore=[400, 404])
        es.indices.delete(index="dal", ignore=[400, 404])

    def chooseName(self,es_url, mailList):
        es = elasticsearch.Elasticsearch([es_url])
        if es.indices.exists(index=mailList + "_temp") and es.indices.exists(index=mailList + "_new") is False:
            print("CHOOSE NAME : _new")
            return mailList + "_new"
        else:
            print("CHOOSE NAME : _temp")
            return mailList + "_temp"

    def mergeIndex(self,es_url, mailList, index_name):
        compteur = 0
        es = elasticsearch.Elasticsearch([es_url])
        if es.indices.exists(index=mailList + "_temp"):
            compteur += 1
        if es.indices.exists(index=mailList + "_new"):
            compteur += 1
        if compteur < 2:
            es.indices.put_alias(index=index_name, name=mailList)
        if es.indices.exists(index=mailList + "_temp") and mailList + "_new" in index_name:
            print("MERGE INDEX : _temp")
            es.indices.delete(index=mailList + "_temp", ignore=[400, 404])
            es.indices.put_alias(index=mailList + "_new", name=mailList)
        if es.indices.exists(index=mailList + "_new") and mailList + "_temp" in index_name:
            print("MERGE INDEX : _new")
            es.indices.delete(index=mailList + "_new", ignore=[400, 404])
            es.indices.put_alias(index=mailList + "_temp", name=mailList)

    def returnTimestamp(self,message):
        date_string = message['data']['Date']
        if '(' in date_string:
            date_string = date_string.split('(')[0]
        date = datetime.strptime(date_string.strip(), '%a, %d %b %Y %H:%M:%S %z')
        return date.timestamp()