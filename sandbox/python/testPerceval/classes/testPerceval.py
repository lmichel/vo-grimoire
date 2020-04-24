import json
import os
import sys
import urllib.request
import elasticsearch
from os import path
from downloader import downloader
from elasticer import elasticer
from percevaler import percevaler
from jsonBuilder import jsonBuilder
from perceval.backends.core.mbox import MBox
from datetime import datetime
import threadingMails

'''
This program is build to test GrimoireLab : Perceval and especially Perceval on .mbox files
You will be able to :
    - Display all the messages of an archive
    - Display the number of mails sent by someone
    - Display the first five mails of the archive
    - Search a keyword in the archive
    - Build a JSON with N messages
'''


class analyzePerceval(object):

    # This method allow you to see in the terminal the progress of the download
    def showProgress(self, count, bloc_size, total_size):
        percent = int(count * bloc_size * 100 / total_size)
        sys.stdout.write("\r" + "...%d%%" % percent)

    # This method create the repository for Perceval to work
    # You will need to specify the target mailing list
    # and the path where the archives are
    def createRepo(self, dir, mailList):
        mbox_uri = mailList + '@iova.net'
        mbox_dir = dir
        repo = MBox(uri=mbox_uri, dirpath=mbox_dir)
        return repo

    # Simple method to type the Name of a person
    def typeName(self):
        name = input("\nType the Name of the person : ")
        if name is None:
            print("\nMust Specify a name")
            return ""
        else:
            return name

    # Simple method to type words
    def typeWord(self):
        word = input("\nType the keyword : ")
        if word is None:
            print("\nMust Specify a name")
            return ""
        else:
            return word

    # Introduction of the program
    def intro(self):
        print("This is a program who test Perceval.")
        print("\nYou will be asked to type a number corresponding of the action you want to do.")
        print("\nThe program will start to download the archive if not already downloaded.")

    def isInt(self, input):
        try:
            int(input)
            return 0
        except ValueError:
            return 1

    # Method who let the user choose an action
    def run(self, repo, mailList):
        options = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 100]
        # self.countAllMessage(repo)
        res = 0
        while res == 0:
            print("\nType the number of action you want to do.")
            print("\n--- Actions ---")
            print("1 : Print all messages")
            print("2 : Count the mails send by someone")
            print("3 : Print the 5 firsts messages")
            print("4 : Search a keyword")
            print("5 : Build a JSON with N messages")
            print("6 : Save the mails to Elastic")
            print("8 : Delete indexes in ElasticSearch")
            print("9 : Print Info on how to launch ElasticSearch")
            print("10 : Execute a default query")
            print("11 : Print a random thread")
            print("12 : Build Threads And Index It")
            print("100 : Stop the program")
            res = input("\nYour choice : ")
            if self.isInt(res) == 0:
                if int(res) == 1:
                    percevaler().getAllMessage(repo)
                    res = 0
                if int(res) == 2:
                    nom = self.typeName()
                    if nom is "":
                        print("\nNo name specified, please retry")
                    else:
                        percevaler().getMessageCounterName(repo, nom)
                    res = 0
                if int(res) == 3:
                    percevaler().printArray(percevaler().first5Messages(repo))
                    res = 0
                if int(res) == 4:
                    key = self.typeWord()
                    if key is "":
                        print("\nNo name specified, please retry")
                    else:
                        percevaler().keyword(repo, key)
                    res = 0
                if int(res) == 5:
                    jsonBuilder().buildJSON(repo=repo)
                    res = 0
                if int(res) == 6:
                    elasticer().saveMailsToElastic(repo, mailList)
                    res = 0
                if int(res) == 8:
                    elasticer().deleteMails(mailList)
                    res = 0
                if int(res) == 9:
                    print("\nEnable ElasticSearch service : sudo /bin/systemctl enable elasticsearch.service")
                    print("\nStart ElasticSearch service : sudo systemctl start elasticsearch.service")
                    res = 0
                if int(res) == 10:
                    elasticer().doQuery(mailList)
                    res = 0
                if int(res) == 11:
                    elasticer().findThread(mailList)
                    res = 0
                if int(res) == 12:
                    subject_table = threadingMails.runThread(repo)
                    elasticer().addThread(subject_table, mailList)
                    res = 0
                if int(res) == 100:
                    print("\nEND")
                if int(res) not in options:
                    print("\nNot an action, please retry")
                    res = 0
            else:
                print("\nThis was not an Int, please retry")
                res = 0
