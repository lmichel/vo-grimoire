import os
from perceval.backends.core.mbox import MBox
from modules.elasticer import elasticer
import time

class percevaler(object):

    def __init__(self,config):
        self.__config = config

    def buildReposAndIndex(self):
        elastic = elasticer(self.__config)
        # elastic.deleteMails(self.__config.elastic_search_uri)
        for mList in self.__config.mailing_lists:
            repo = self.createRepo(mList["index_name"])
            allIds = elastic.saveMailsToElastic(repo, mList["index_name"], self.__config.elastic_search_uri,
                                                  mList["prefix"])
            time.sleep(5)
            elastic.addThreads(allIds[0], allIds[1], self.__config.elastic_search_uri)
            elastic.mergeIndex(self.__config.elastic_search_uri, mList["index_name"], allIds[1])

    def createRepo(self,mailList):
        mbox_uri = mailList + ".mbox"
        repo = MBox(uri=mbox_uri, dirpath=self.__config.mbox_dir + '/' + mailList)
        return repo