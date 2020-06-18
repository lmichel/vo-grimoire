import os,sys
import urllib.request
from os import path
from modules.configManager import configManager
from modules.logger import LoggerSetup
LoggerSetup.set_warning_level()
log = LoggerSetup.get_logger()
log.propagate = False
# This class will download all the mbox archives for each mailing list in config
# It checks if folder exist and delete mbox archives if they are already present
class downloader(object):
    # Simple method to show the progress of a download
    def showProgress(self,count, bloc_size, total_size):
        percent = int(count * bloc_size * 100 / total_size)
        sys.stdout.write("\r" + "...%d%%" % percent)

    # Method who will download the archive for the mailing list specified in parameter
    # It checks if the file is already downloaded and if yes then delete it
    # Create directories if needed
    def downloadMails(self,mailList, uri, url,mbox_path):
        try:
            os.remove(mbox_path + '/' + mailList + '/' + mailList + '.mbox')
        except FileNotFoundError as e:
            log.error(e)
        try:
            if os.path.exists(mbox_path + '/' + mailList) is False:
                os.mkdir(mbox_path + '/' + mailList)
            log.warn("Downloading the mbox file from " + uri + url)
            urllib.request.urlretrieve(uri + url, mbox_path + '/' + mailList + '/' + mailList + '.mbox')
            #,                                                    reporthook=self.showProgress
            print("")
            log.warn("Download Finished !")
            log.warn("The archive is located at : " + mbox_path + '/' + mailList + '/' + mailList + '.mbox')
        except Exception as e:
            log.error(e)


    # This is the method who will call downloadMails for each mailing list
    def analyzeJson(self):
        uri = configManager.download_uri()
        for mList in configManager.mailing_lists():
            self.downloadMails(mList["index_name"], uri, mList["download_mbox"],configManager.mbox_dir())
