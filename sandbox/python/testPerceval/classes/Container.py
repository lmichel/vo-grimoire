from collections import deque
class Container(object):
# This class have multiple attributes
# message : messase linked to this container
# parent : the precedent message in the thread
# children : all the messages after current in the thread

    def __init__(self):
        self.message = None
        self.parent = None
        self.children = []

    # Return true if message of the container is None
    def isMessageNone(self):
        return self.message is None

    # Add a child to the container and adapt the parent in consequence
    def add_child(self,ch_cont):
        if ch_cont.parent:
            ch_cont.parent.remove_child(ch_cont)
        self.children.append(ch_cont)
        ch_cont.parent = self

    # Remove a specified child from the container
    def remove_child(self,ch_cont):
        self.children.remove(ch_cont)
        ch_cont.parent = None

    # Return true if container is a child of self in any case, in order to not add a infinite loop
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


