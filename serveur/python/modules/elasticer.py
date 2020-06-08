import elasticsearch
from datetime import datetime
from modules.configManager import configManager
import email
import json
import mailbox
import re
import base64
from modules.logger import LoggerSetup
LoggerSetup.set_warning_level()
log = LoggerSetup.get_logger()
log.propagate = False
# This class is made for indexing the mails in Elastic Search
class elasticer(object):

    # This method save the mail in Elastic Search
    # Delete the duplicates
    # Choose the index name in function of existing indexes
    def saveMailsToElastic(self, mbox, mailList, es_url, prefix_name, global_index):
        es = elasticsearch.Elasticsearch([es_url])
        index_name = ""
        if global_index == "none":
            index_name = self.chooseName(es_url, mailList)
            size = {
                "settings": {
                    "index": {
                        "max_result_window": configManager.sizeRequest()
                    }
                }
            }
            es.indices.create(index=index_name,body=size)
        else:
            index_name = global_index
        prefix = 0
        compteur = 0
        useful = 1
        allMails = {}
        allIds = []
        uselessMails = 0
        encodingErrors = 0
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
                            'numThread': "none",
                            'attachements_name': "",
                            'attachements': {},}
                    id_part = 0
                    first_plain_present = 0
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
                                temp = part.get_payload(decode=True).decode('utf-8','ignore').replace("\t","").replace("\n\r","\n").replace("\r\n","\n")
                                item["body"] = re.sub(r'\\n*','\n',temp)
                            except LookupError:
                                item["body"] = "Cannot decode the message"
                                encodingErrors += 1
                            first_plain_present += 1
                        elif 'message' not in content_type:
                            try:
                                if filename is not None:
                                    item["attachements"][part.get_content_type() + "__" + encode + "__" + filename] = part.get_payload()
                                    item["attachements_name"] += " " + filename.split(".")[1]
                                id_part += 1
                            except IndexError as e:
                                log.warn("Ignoring useless attachement")
                    item["attachements"] = json.dumps(item["attachements"])
                    if 'From' in message:
                        item['from'] = message.get("From", failobj="None").encode('utf-8', 'ignore').decode('utf-8', 'ignore').replace("=?[^=]*?=","")
                    if 'Date' in message and message['Date'] is not None:
                        item['date'] = message['Date'].encode('utf-8', 'ignore').decode('utf-8', 'ignore')
                    if 'To' in message and message['To'] is not None:
                        item['to'] = message['To']
                    if 'Subject' in message and message['Subject'] is not None:
                        try:
                            item['subject'] = message['Subject'].encode('utf-8', 'ignore').decode('utf-8', 'ignore')
                        except Exception as e:
                            log.warn("Error In Subject")
                    if 'In-Reply-To' in message and message['In-Reply-To'] is not None:
                        item['in-reply-to'] = message['In-Reply-To'].encode('utf-8', 'ignore').decode('utf-8','ignore')
                    if 'References' in message and message['References'] is not None:
                        item['references'] = message['References'].encode('utf-8', 'ignore').decode('utf-8','ignore')
                    if useful == 1:
                        allIds.append(item["id"])
                        allMails[message["Message-ID"]] = item
                        compteur += 1
                        valides += 1
                        es.index(index=index_name, doc_type='keyword', body=item,request_timeout=30)
                    else:
                        uselessMails += 1
                        useful = 1
                else:
                    refus += 1
            except KeyError as e:
                log.error(e)
        log.warn("Total Mails in MBOX : " + str(prefix))
        log.warn("Duplicates Mails in MBOX : " + str(refus))
        log.warn("Useless Mails of MBOX : " + str(uselessMails))
        log.warn("Number of Mails indexed in ES : " + str(valides))
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
        log.warn("Threads are indexed.")
        return compteur

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
                      body={"doc": {"numThread": es_result["hits"]["hits"][0]["_source"]["maillist"] + "_" +str(numThread)}})

    # This method delete all the index in Elastic Search
    def deleteMails(self,es_url):
        es = elasticsearch.Elasticsearch([es_url])
        for index in es.indices.get('*'):
            if '_mails' in index:
                es.indices.delete(index=index,ignore=[400,404])
                log.warn("Index : " + index + " deleted.")

    # This method return the name of index to store mails into
    # Eg : edu_new if edu_temp exists
    # Eg : edu_temp if edu_new exists
    def chooseName(self,es_url, mailList):
        es = elasticsearch.Elasticsearch([es_url])
        if es.indices.exists(index=mailList + "_temp_mails") and es.indices.exists(index=mailList + "_new_mails") is False:
            return mailList + "_new_mails"
        else:
            return mailList + "_temp_mails"

    # This method will delete the older index
    # And will put an allias for the new index
    # The allias name will be the mailing list prefix
    def mergeIndex(self,es_url, mailList, index_name):
        compteur = 0
        es = elasticsearch.Elasticsearch([es_url])
        if es.indices.exists(index=mailList + "_temp_mails"):
            compteur += 1
        if es.indices.exists(index=mailList + "_new_mails"):
            compteur += 1
        if compteur < 2:
            es.indices.put_alias(index=index_name, name=mailList)
        if es.indices.exists(index=mailList + "_temp_mails") and mailList + "_new_mails" in index_name:
            es.indices.delete(index=mailList + "_temp_mails", ignore=[400, 404])
            es.indices.put_alias(index=mailList + "_new_mails", name=mailList)
        if es.indices.exists(index=mailList + "_new_mails") and mailList + "_temp_mails" in index_name:
            es.indices.delete(index=mailList + "_new_mails", ignore=[400, 404])
            es.indices.put_alias(index=mailList + "_temp_mails", name=mailList)

    # Returns timestamp of a message date
    def returnTimestamp(self,message):
        try:
            date_string = message['Date']
            if '(' in date_string:
                date_string = date_string.split('(')[0]
            date = datetime.strptime(date_string.strip(), '%a, %d %b %Y %H:%M:%S %z')
            return date.timestamp()
        except ValueError:
            return 0

    def createIndex(self, es_url):
        size = {
            "settings": {
                "index": {
                    "max_result_window": configManager.sizeRequest()
                }
            }
        }
        es = elasticsearch.Elasticsearch([es_url])
        if es.indices.exists(index="ivoa_all_new_mails"):
            es.indices.create(index="ivoa_all_temp_mails",body=size)
            return "ivoa_all_temp_mails"
        elif es.indices.exists(index="ivoa_all_temp_mails"):
            es.indices.create(index="ivoa_all_new_mails",body=size)
            return "ivoa_all_new_mails"
        else:
            es.indices.create(index="ivoa_all_new_mails",body=size)
            return "ivoa_all_new_mails"

    def newMergeIndex(self,es_url,index_name):
        es = elasticsearch.Elasticsearch([es_url])
        if index_name == "ivoa_all_new_mails":
            es.indices.delete(index="ivoa_all_temp_mails", ignore=[400,404])
            es.indices.put_alias(index="ivoa_all_new_mails",name="ivoa_all")
            return 1
        if index_name == "ivoa_all_temp_mails":
            es.indices.delete(index="ivoa_all_new_mails", ignore=[400,404])
            es.indices.put_alias(index="ivoa_all_temp_mails", name="ivoa_all")
            return 1



