import importlib
import sys,os
import pprint
import json
# This class read the config.json file
# It stores the data of the json file in attributes in a static way
class configManager(object):

    # Constructor of the configManager
    def __init__(self):
        self.__download_uri = None
        self.__elastic_search_uri = None
        self.__mbox_dir = None
        self.__mailing_lists = None
        self.__resetindex = None
        configManager.readFile()

    # This method will read the config.json file and implement values in the attributes
    @staticmethod
    def readFile():
        base_path = os.path.dirname(os.path.realpath(__file__))
        # os.path.join pour join les deux url
        # path = os.path.join(base_path, config[...])
        # base_path = os.path.dirname(os.path.realpath(__file__))
        # os.path.realpath
        config_path = base_path.replace("modules", "launcher")
        if os.path.exists(config_path + '/config.json'):
            with open(config_path + '/config.json') as conf_json:
                conf_dict = json.load(conf_json)
                configManager.__download_uri = conf_dict["download_uri"]
                configManager.__elastic_search_uri = conf_dict["elastic_search_url"]
                configManager.__mbox_dir = conf_dict["mbox_dir"]
                print(os.path.join(base_path,configManager.__mbox_dir))
                print(os.path.exists(os.path.join(base_path,configManager.__mbox_dir)))
                print(os.path.exists(configManager.__mbox_dir))
                configManager.__resetindex = conf_dict["reset_index"]
                configManager.__mailing_lists = conf_dict["mailing_lists"]
                configManager.validateMboxPath()
                return conf_dict
        else:
            raise Exception("No config.json file")

    # Getter of reset_index
    @staticmethod
    def reset():
        if configManager.__resetindex == 1:
            return True
        else:
            return False

    # Return true if the mbox path is valid
    @staticmethod
    def validateMboxPath():
        if os.path.exists(configManager.__mbox_dir) is False:
            raise Exception("The path for mbox_dir is not valid")

    # Getter of download_uri
    @staticmethod
    def download_uri():
        return configManager.__download_uri

    # Getter of elastic_search_uri
    @staticmethod
    def elastic_search_uri():
        return configManager.__elastic_search_uri

    # Getter of mbox_dir
    @staticmethod
    def mbox_dir():
        return configManager.__mbox_dir

    # Getter of mailling_lists
    @staticmethod
    def mailing_lists():
        return configManager.__mailing_lists