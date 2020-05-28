import elasticsearch
from datetime import datetime
from modules.configManager import configManager
import email
import json
import mailbox
import re
# This class is made for indexing the mails in Elastic Search
class elasticer(object):

    # This method save the mail in Elastic Search
    # Delete the duplicates
    # Choose the index name in function of existing indexes
    def saveMailsToElastic(self, mbox, mailList, es_url, prefix_name):
        es = elasticsearch.Elasticsearch([es_url])
        index_name = self.chooseName(es_url, mailList)
        es.indices.create(index_name)
        prefix = 0
        compteur = 0
        useful = 1
        allIds = []
        refus = 0
        valides = 0
        for message in mbox:
            prefix += 1
            try:
                if message['Message-ID'] not in allIds:
                    item = {'from': message['From'].encode('utf-8', 'ignore').decode('utf-8', 'ignore'),
                            'body': 'none',
                            'in-reply-to': 'none',
                            'timestamp': self.returnTimestamp(message),
                            'id': message['Message-ID'].encode('utf-8', 'ignore').decode('utf-8', 'ignore'),
                            'references': 'none',
                            'subject': 'none',
                            'data': 'none',
                            'to': 'none',
                            'num': prefix_name + str(prefix),
                            'maillist': mailList.encode('utf-8', 'ignore').decode('utf-8', 'ignore'),
                            'numThread': -1,
                            'attachements_name': "",
                            'attachements': {},}
                    id_part = 0
                    first_plain_present = 0
                    #         print("Content-Transfer-Encoding : " + part["Content-Transfer-Encoding"])
                    for part in message.walk():
                        content_type = part.get_content_maintype()
                        charset = part.get_content_charset()
                        if charset is None:
                            charset = 'utf-8'
                        filename = part.get_filename()
                        encode = part.__getitem__("Content-Transfer-Encoding")
                        if encode is None:
                            encode = 'utf-8'
                        if 'multipart' in content_type:
                            continue
                        if 'text/plain' in part.get_content_type() and first_plain_present == 0:
                            try:
                                item["body"] = part.get_payload().encode(charset,'ignore').decode('utf-8','ignore')
                            except LookupError:
                                print("Encodage non Trouvé")
                                useful = 0
                            first_plain_present += 1
                        elif 'message' not in content_type:
                            if filename is not None:
                                item["attachements"][part.get_content_type() + "__" + encode + "__" + filename] = part.get_payload()
                                item["attachements_name"] += " " + filename.split(".")[1]
                            else:
                                item["attachements"][part.get_content_type() + "__" + encode + "__" + str(id_part)] = part.get_payload()
                                item["attachements_name"] += " " + part.get_content_type()
                            id_part += 1
                    if 'From' in message:
                        item['from'] = message.__getitem__('From')
                    if 'Date' in message and message['Date'] is not None:
                        item['date'] = message['Date'].encode('utf-8', 'ignore').decode('utf-8', 'ignore')
                    if 'To' in message and message['To'] is not None:
                        item['to'] = message['To']
                    if 'Subject' in message and message['Subject'] is not None:
                        try:
                            item['subject'] = message['Subject'].encode('utf-8', 'ignore').decode('utf-8', 'ignore')
                        except Exception:
                            print(message["Subject"])
                    if 'In-Reply-To' in message and message['In-Reply-To'] is not None:
                        item['in-reply-to'] = message['In-Reply-To'].encode('utf-8', 'ignore').decode('utf-8','ignore')
                    if 'References' in message and message['References'] is not None:
                        item['references'] = message['References'].encode('utf-8', 'ignore').decode('utf-8','ignore')
                    if useful == 1:
                        allIds.append(item["id"])
                        compteur += 1
                        valides += 1
                        es.index(index=index_name, doc_type='keyword', body=item)
                    else:
                        print("Mail ignoré")
                        useful = 1
                else:
                    refus += 1
            except KeyError as e:
                print("ERROR : " + e)
        print("Compteur : " + str(prefix))
        print("Refusés : " + str(refus))
        print("Validés : " + str(valides))
        return allIds, index_name

    # This method build a dictionnary
    # Each key is a string with multiple message Id
    # Each element is a number of Thread
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

    # This method returns a string of all message id who contains the id of a certain mail
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

    # This method modify the numThread field of an element in Elastic Search
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

    # This method delete all the index in Elastic Search
    def deleteMails(self,es_url):
        es = elasticsearch.Elasticsearch([es_url])
        for index in es.indices.get('*'):
            es.indices.delete(index=index,ignore=[400,404])

    # This method return the name of index to store mails into
    # Eg : edu_new if edu_temp exists
    # Eg : edu_temp if edu_new exists
    def chooseName(self,es_url, mailList):
        es = elasticsearch.Elasticsearch([es_url])
        if es.indices.exists(index=mailList + "_temp") and es.indices.exists(index=mailList + "_new") is False:
            print("CHOOSE NAME : "+mailList+"_new")
            return mailList + "_new"
        else:
            print("CHOOSE NAME : "+mailList+"_temp")
            return mailList + "_temp"

    # This method will delete the older index
    # And will put an allias for the new index
    # The allias name will be the mailing list prefix
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
            print("MERGE INDEX : "+mailList+"_temp")
            es.indices.delete(index=mailList + "_temp", ignore=[400, 404])
            es.indices.put_alias(index=mailList + "_new", name=mailList)
        if es.indices.exists(index=mailList + "_new") and mailList + "_temp" in index_name:
            print("MERGE INDEX : "+mailList+"_new")
            es.indices.delete(index=mailList + "_new", ignore=[400, 404])
            es.indices.put_alias(index=mailList + "_temp", name=mailList)

    # Returns timestamp of a message date
    def returnTimestamp(self,message):
        try:
            date_string = message['Date']
            if '(' in date_string:
                date_string = date_string.split('(')[0]
            date = datetime.strptime(date_string.strip(), '%a, %d %b %Y %H:%M:%S %z')
            return date.timestamp()
        except ValueError:
            print("Une Date Ignorée")
            return 0

# if 'text' in part.get_content_type() and text_plain == 0 and 'text/html' not in part.get_content_type():
#     text_plain += 1
#     if 'iso-8859-1' in type:
#         item["body"] = part.get_payload().encode('iso-8859-1', 'ignore').decode('utf-8', 'ignore').replace("\r","").replace("\t","")
#     if 'ascii' in type:
#         item["body"] = part.get_payload().encode('ascii', 'ignore').decode('utf-8', 'ignore').replace("\r","").replace("\t","")
#     else:
#         item["body"] = part.get_payload().encode('utf-8', 'ignore').decode('utf-8', 'ignore').replace("\r","").replace("\t","")