import json

class Message(object):
# This class represent a message
# Msg : message of the mail
# Message_id : id of the current mail
# References : references of the current mail
# Subject : subject of the current mail
    def __init__(self):
        self.msg = None
        self.message_id = None
        self.references = []
        self.subject = None

    def toString(self):
        return self.msg