import sys,os
import time
import json
sys.path.append(os.path.abspath('../classes'))
from testPerceval import analyzePerceval
from testEs import testEs
if __name__ == '__main__':
    per = analyzePerceval()
    base_path = os.path.dirname(os.path.realpath(__file__))
    mbox_path = base_path.replace("/python/testPerceval/test", "/data/mbox")
    print(mbox_path)
    repo = per.createRepo(mbox_path,'dm')
    testEs().deleteMails('dm')
    print("Delete Fini")
    ids = testEs().saveMailsToElastic(repo,'dm')
    print("Début Attente")
    time.sleep(10)
    testEs().addResponders(ids,'dm')
    print("Fin Attente")
    testEs().addThreads(ids,'dm')