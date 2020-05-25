import sys,os
path = os.path.dirname(os.path.realpath(__file__))
sys.path.append(path + "/..")
from modules.configManager import configManager
from modules.downloader import downloader
from modules.percevaler import percevaler
from modules import elasticer
if __name__ == '__main__':
    config = configManager()
    print(configManager.mbox_dir())
    downloader = downloader()
    downloader.analyzeJson()
    # percevaler = percevaler()
    # percevaler.buildReposAndIndex()
