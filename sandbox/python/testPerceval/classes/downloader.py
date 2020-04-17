import os
import sys
import urllib.request
from os import path

class downloader(object):

    def downloadMails(self,mailList):
        base_path = os.path.dirname(os.path.realpath(__file__))
        mbox_path = base_path.replace("/python/testPerceval/classes", "/data/mbox")
        if '@iova.net' in mailList:
            mailList = mailList.replace("@iova.net","")
        print('http://mail.ivoa.net/pipermail/'+mailList+'.mbox/'+mailList+'.mbox')
        if path.exists(mbox_path + '/'+mailList+'.mbox') is False:
            print("\nBeginning Download...")
            url = 'http://mail.ivoa.net/pipermail/'+mailList+'.mbox/'+mailList+'.mbox'
            urllib.request.urlretrieve(url, mbox_path + '/'+mailList+'.mbox', reporthook=self.showProgress)
            print("\nDownload Finished !")
        else:
            print("\nArchive already downloaded !")
        print("\nThe archive is located at : " + mbox_path + '/' + mailList + '.mbox')
        return [mbox_path,mailList]

    def showProgress(self, count, bloc_size, total_size):
        percent = int(count * bloc_size * 100 / total_size)
        sys.stdout.write("\r" + "...%d%%" % percent)

