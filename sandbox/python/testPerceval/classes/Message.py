import json

class Message(object):

    def __init__(self):
        self.msg = None
        self.message_id = None
        self.references = []
        self.subject = None

    def toJSON(self):
        return json.dumps(self, default=lambda o: o.__dict__,sort_keys=True, indent=4)


