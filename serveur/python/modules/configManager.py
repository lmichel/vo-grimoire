import importlib
import sys,os
import pprint
import json

class configManager(object):

    def __init__(self):
        self.__download_uri = None
        self.__elastic_search_uri = None
        self.__mbox_dir = None
        self.__mailing_lists = None

    def readFile(self):
        base_path = os.path.dirname(os.path.realpath(__file__))
        config_path = base_path.replace("modules", "launcher")
        if os.path.exists(config_path + '/config.json'):
            with open(config_path + '/config.json') as conf_json:
                conf_dict = json.load(conf_json)
                self.__download_uri = conf_dict["download_uri"]
                self.__elastic_search_uri = conf_dict["elastic_search_url"]
                self.__mbox_dir = conf_dict["mbox_dir"]
                self.__mailing_lists = conf_dict["mailing_lists"]
                self.validateMboxPath()
                return conf_dict
        else:
            raise Exception("No config.json file")

    def validateMboxPath(self):
        if os.path.exists(self.__mbox_dir) is False:
            raise Exception("The path for mbox_dir is not valid")

    @property
    def download_uri(self):
        return self.__download_uri

    @property
    def elastic_search_uri(self):
        return self.__elastic_search_uri

    @property
    def mbox_dir(self):
        return self.__mbox_dir

    @property
    def mailing_lists(self):
        return self.__mailing_lists