import sys,os
sys.path.append(os.path.abspath('../classes'))
from testPerceval import analyzePerceval
if __name__ == '__main__':
    per = analyzePerceval()
    per.intro()
    dir = per.downloadMails()
    repo = per.createRepo(dir)
    per.run(repo)