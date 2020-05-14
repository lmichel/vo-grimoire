import elasticsearch
import json
from datetime import datetime
class testEs(object):
    def saveMailsToElastic(self, repo, mailList):
        es = elasticsearch.Elasticsearch(['http://localhost:9200'])
        es.indices.create(mailList)
        compteur = 0
        isUseful = 1
        allIds = []
        for message in repo.fetch():
            try:
                item = {'from': message['data']['From'].encode('utf-8','ignore').decode('utf-8','ignore'),
                        'body': 'none',
                        'in-reply-to': 'none',
                        'timestamp': self.returnTimestamp(message),
                        'id': message['data']['Message-ID'].encode('utf-8','ignore').decode('utf-8','ignore'),
                        'references': 'none',
                        'subject': 'none',
                        'data': 'none',
                        'to': 'none',
                        'responders': 'none',
                        'maillist': mailList.encode('utf-8','ignore').decode('utf-8','ignore')}
                if 'plain' in message['data']['body']:
                    item['body'] = message['data']['body']['plain'].encode('utf-8','ignore').decode('utf-8','ignore')
                if 'html' in message['data']['body']:
                    if item['body'] == 'none':
                        item['body'] = message['data']['body']['html'].encode('utf-8','ignore').decode('utf-8','ignore')
                if 'From' in message['data'] and 'body' in message['data']:
                    item['from'] = message['data']['From'].encode('utf-8','ignore').decode('utf-8','ignore')
                else:
                    isUseful = 0
                if 'Date' in message['data']:
                    item['date'] = message['data']['Date'].encode('utf-8','ignore').decode('utf-8','ignore')
                if 'To' in message['data']:
                    item['to'] = message['data']['To'].encode('utf-8','ignore').decode('utf-8','ignore')
                if 'Subject' in message['data']:
                    item['subject'] = message['data']['Subject'].encode('utf-8','ignore').decode('utf-8','ignore')
                if 'In-Reply-To' in message['data']:
                    item['in-reply-to'] = message['data']['In-Reply-To'].encode('utf-8','ignore').decode('utf-8','ignore')
                if 'References' in message['data']:
                    item['references'] = message['data']['References'].encode('utf-8','ignore').decode('utf-8','ignore')
                if isUseful == 1:
                    allIds.append(item["id"])
                    compteur += 1
                    es.index(index=mailList, doc_type='keyword', body=item)
                else:
                    print("\nMail ignoré")
                    isUseful = 1
            except KeyError:
                print("Useless Mail")
        print("Compteur : " + str(compteur))
        return allIds

    def addResponders(self, allIds, mailList):
        es = elasticsearch.Elasticsearch(['http://localhost:9200'])
        compteur = 0
        for id in allIds:
            # print("TEST AVANT CHAQUE ID")
            # print("ID : " + id)
            query = {
                "query": {
                    "match_phrase": {
                        "id": id
                    }
                }
            }
            es_result = es.search(index=mailList,body=query)
            es_id = es_result['hits']['hits'][0]['_id']
            # print(es_id)
            fils_query = {
                "query": {
                    "match_phrase": {
                        "in-reply-to": id
                    }
                }
            }
            es_result_reps = es.search(index=mailList, body=fils_query)
            responders = ""
            for msg in es_result_reps['hits']['hits']:
                # print(msg['_source']['id'])
                responders += msg['_source']['id'] + " "
                compteur += 1
                print(str(compteur))
                print(responders)
            es.update(index=mailList, doc_type='keyword', id=es_id, body={"doc": {"responders": responders}})


    def deleteMails(self, mailList):
        es = elasticsearch.Elasticsearch(['http://localhost:9200'])
        # Faudra ajouter les ignore
        es.indices.delete(index=mailList, ignore=[400, 404])
        es.indices.delete(index="edu", ignore=[400, 404])
        es.indices.delete(index="dm", ignore=[400, 404])
        es.indices.delete(index="datacp", ignore=[400, 404])
        es.indices.delete(index=mailList + "_threads", ignore=[400, 404])

    def returnTimestamp(self, message):
        date_string = message['data']['Date']
        if '(' in date_string:
            date_string = date_string.split('(')[0]
        date = datetime.strptime(date_string.strip(), '%a, %d %b %Y %H:%M:%S %z')

        newDate = datetime.fromtimestamp(date.timestamp())

        return date.timestamp()