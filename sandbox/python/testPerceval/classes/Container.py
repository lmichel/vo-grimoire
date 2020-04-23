from collections import deque
class Container(object):

    def __init__(self):
        self.message = None
        self.parent = None
        self.children = []

    def isMessageNone(self):
        return self.message is None

    def add_child(self,ch_cont):
        if ch_cont.parent:
            ch_cont.parent.remove_child(ch_cont)
        self.children.append(ch_cont)
        ch_cont.parent = self

    def remove_child(self,ch_cont):
        self.children.remove(ch_cont)
        ch_cont.parent = None

    def has_childs(self, container):
        toSee = deque()
        toSee.append(self)
        haveSeen = set()
        while toSee:
            temp = toSee.pop()
            if temp is container:
                return True
            haveSeen.add(temp)
            for ch in temp.children:
                if ch not in haveSeen:
                    toSee.append(ch)
        return False


