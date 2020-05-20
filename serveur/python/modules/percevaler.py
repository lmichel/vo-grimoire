import os
from perceval.backends.core.mbox import MBox
from modules.elasticer import elasticer
import time
from modules.configManager import configManager

class percevaler(object):

    def buildReposAndIndex(self):
        elastic = elasticer()
        if configManager.reset_index:
            elastic.deleteMails(configManager.elastic_search_uri())
            print("Mails Deleted.")
        for mList in configManager.mailing_lists():
            repo = self.createRepo(mList["index_name"])
            allIds = elastic.saveMailsToElastic(repo, mList["index_name"], configManager.elastic_search_uri(),
                                                  mList["prefix"])
            time.sleep(5)
            elastic.addThreads(allIds[0], allIds[1], configManager.elastic_search_uri())
            elastic.mergeIndex(configManager.elastic_search_uri(), mList["index_name"], allIds[1])

    def createRepo(self,mailList):
        mbox_uri = mailList + ".mbox"
        repo = MBox(uri=mbox_uri, dirpath=configManager.mbox_dir() + '/' + mailList)
        return repo