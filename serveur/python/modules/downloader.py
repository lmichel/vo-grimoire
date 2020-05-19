import os,sys
import urllib.request
from os import path

class downloader(object):

    def __init__(self,config):
        self.__config = config

    def showProgress(self,count, bloc_size, total_size):
        percent = int(count * bloc_size * 100 / total_size)
        sys.stdout.write("\r" + "...%d%%" % percent)

    def downloadMails(self,mailList, uri, url,mbox_path):
        try:
            os.remove(mbox_path + '/' + mailList + '/' + mailList + '.mbox')
        except FileNotFoundError:
            print("No file found.")
        if os.path.exists(mbox_path + '/' + mailList) is False:
            os.mkdir(mbox_path + '/' + mailList)
        print("Downloading the mbox file.")
        urllib.request.urlretrieve(uri + url, mbox_path + '/' + mailList + '/' + mailList + '.mbox',
                                   reporthook=self.showProgress)
        print("\nDownload Finished !")
        print("\nThe archive is located at : " + mbox_path + '/' + mailList + '/' + mailList + '.mbox')

    def analyzeJson(self):
        uri = self.__config.download_uri
        for mList in self.__config.mailing_lists:
            self.downloadMails(mList["index_name"], uri, mList["download_mbox"],self.__config.mbox_dir)