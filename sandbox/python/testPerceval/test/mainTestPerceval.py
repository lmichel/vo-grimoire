import sys,os
sys.path.append(os.path.abspath('../classes'))
from testPerceval import analyzePerceval
from downloader import downloader
if __name__ == '__main__':
    per = analyzePerceval()
    per.intro()
    # dir = per.downloadMails()
    tab = downloader().downloadMails(input("Please type the mailing list that you want (eg : dm for dm@iova.net) : "))
    repo = per.createRepo(tab[0],tab[1])
    per.run(repo,mailList=tab[1])