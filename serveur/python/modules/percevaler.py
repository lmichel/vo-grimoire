import os
import mailbox
import json
import time
from modules.elasticer import elasticer
from modules.configManager import configManager
from modules.logger import LoggerSetup
LoggerSetup.set_warning_level()
log = LoggerSetup.get_logger()
log.propagate = False
class percevaler(object):

    def buildReposAndIndex(self):
        elastic = elasticer()
        if configManager.reset():
            elastic.deleteMails(configManager.elastic_search_uri())
            # log.warn("Mails Deleted.")
        index = ""
        compteur = 0
        if configManager.globalIndex() == 1:
            index = elastic.createIndex(configManager.elastic_search_uri())
        for mList in configManager.mailing_lists():
            log.warn("The program is doing the " + mList["index_name"] + " mbox.")
            mbox = self.createRepo(mList["index_name"])
            if configManager.globalIndex() == 1:
                allIds=elastic.saveMailsToElastic(mbox,mList["index_name"], configManager.elastic_search_uri(),mList["prefix"],index)
                time.sleep(5)
                compteur = elastic.addThreads(allIds[0], index, configManager.elastic_search_uri(),mList["index_name"])
            else:
                allIds = elastic.saveMailsToElastic(mbox, mList["index_name"], configManager.elastic_search_uri(),
                                                  mList["prefix"],'none')
                time.sleep(5)
                elastic.addThreads(allIds[0], allIds[1], configManager.elastic_search_uri(),mList["index_name"])
                elastic.mergeIndex(configManager.elastic_search_uri(), mList["index_name"], allIds[1])
        if configManager.globalIndex() == 1:
            elastic.newMergeIndex(configManager.elastic_search_uri(),index)

    def createRepo(self,mailList):
        mbox = mailbox.mbox(configManager.mbox_dir() + '/' + mailList + '/' + mailList + ".mbox")
        return mbox
