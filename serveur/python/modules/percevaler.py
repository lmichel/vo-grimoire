import os
import mailbox
import json
import time
from modules.elasticer import elasticer
from modules.configManager import configManager

class percevaler(object):

    def buildReposAndIndex(self):
        elastic = elasticer()
        if configManager.reset():
            elastic.deleteMails(configManager.elastic_search_uri())
            print("Mails Deleted.")
        index = ""
        compteur = 0
        if configManager.globalIndex() == 1:
            index = elastic.createIndex(configManager.elastic_search_uri())
            print("INDEX : " + index)
        for mList in configManager.mailing_lists():
            mbox = self.createRepo(mList["index_name"])
            if configManager.globalIndex() == 1:
                print("GLOBAL_INDEX")
                allIds=elastic.saveMailsToElastic(mbox,mList["index_name"], configManager.elastic_search_uri(),mList["prefix"],index)
                time.sleep(5)
                compteur = elastic.addThreads(allIds[0], index, configManager.elastic_search_uri(), compteur)
            else:
                allIds = elastic.saveMailsToElastic(mbox, mList["index_name"], configManager.elastic_search_uri(),
                                                  mList["prefix"],'none')
                time.sleep(5)
                elastic.addThreads(allIds[0], allIds[1], configManager.elastic_search_uri(),0)
                elastic.mergeIndex(configManager.elastic_search_uri(), mList["index_name"], allIds[1])
        if configManager.globalIndex() == 1:
            elastic.newMergeIndex(configManager.elastic_search_uri(),index)

    def createRepo(self,mailList):
        mbox = mailbox.mbox(configManager.mbox_dir() + '/' + mailList + '/' + mailList + ".mbox")
        return mbox