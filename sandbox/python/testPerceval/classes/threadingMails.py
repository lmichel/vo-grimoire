from Container import Container
from Message import Message
from jsonBuilder import jsonBuilder
import re

# This method will rebuild the current tree to eliminate ambiguous relations
# For example if a container is not useful or is None, then the children of this one
# will be promote to top level
def pruneContainers(container):
    newChilds = []
    for cont in container.children:
        temp_list = pruneContainers(cont)
        newChilds.extend(temp_list)
        container.remove_child(cont)
    for cont in newChilds:
        container.add_child(cont)
    if container.isMessageNone() and len(container.children) == 0 :
        # If it is an empty container with no children, nuke it
        return []
    elif container.isMessageNone() and (len(container.children)==1 or container.parent is not None):
        temp_list = container.children[:]
        for cont in temp_list:
            container.remove_child(cont)
        return temp_list
    else:
        return [container]

# This is the regex expression to delete the Re[4] from the mails
re_regex = re.compile("""(
  (Re(\[\d+\])?:) | (\[ [^]]+ \])
\s*)+
""", re.I | re.VERBOSE)

# This method is an implementation of the jwz algorithm
def thread(messageList):
    id_table = {}
    #1
    for msg in messageList:
        #1A
        if msg.message_id in id_table:
            this_container = id_table[msg.message_id]
            this_container.message = msg
        else:
            this_container = Container()
            this_container.message = msg
            id_table[msg.message_id] = this_container
        previous = None
        #1A-END
        #1B AND 1C
        for ref in msg.references:
            container = id_table.get(ref, None)
            if container is None:
                container = Container()
                container.message_id = ref
                id_table[ref] = container
            if previous is not None:
                if container is this_container:
                    continue
                if container.has_childs(previous):
                    continue
                previous.add_child(container)
            previous = container
        if previous is not None:
            previous.add_child(this_container)
        #1B AND 1C-END
    #2
    root_set = []
    for value in id_table.values():
        if value.parent is None:
            root_set.append(value)
    #2-END
    #3
    del id_table
    #3-END
    #4
    new_root_set = []
    for container in root_set:
        temp_list = pruneContainers(container)
        new_root_set.extend(temp_list)
    root_set = new_root_set
    #4-END
    #5
    subject_table = {}
    #5A and 5B
    for container in root_set:
        if container.message:
            subject = container.message.subject
        else:
            if container.children[0].message is None or container.children[0].message.subject is None:
                continue
            subject = container.children[0].message.subject
        subject = re_regex.sub('',subject)
        if subject == "":
            continue
        temp = subject_table.get(subject, None)
        if (temp is None or (temp.message is not None and container.message is None) or (temp.message is not None and container.message is not None and len(temp.message.subject) > len(container.message.subject))):
            subject_table[subject] = container
    #5A and 5B-END
    #5C
    for container in root_set:
        if container.message:
            subject = container.message.subject
        else:
            if container.children[0].message is None or container.children[0].message.subject is None:
                continue
            subject = container.children[0].message.subject
        subject = re_regex.sub('',subject)
        temp_container = subject_table.get(subject,None)
        if temp_container is None or temp_container is container:
            continue
        if temp_container.isMessageNone() and container.isMessageNone():
            for cont in temp_container.children:
                container.add_child(cont)
        elif temp_container.isMessageNone() or container.isMessageNone():
            if temp_container.isMessageNone():
                temp_container.add_child(container)
            else:
                container.add_child(temp_container)
        elif len(temp_container.message.subject) < len(container.message.subject):
            temp_container.add_child(container)
        elif len(temp_container.message.subject) > len(container.message.subject):
            container.add_child(temp_container)
        else:
            new = Container()
            new.add_child(temp_container)
            new.add_child(container)
            subject_table[subject] = new
    #5C-END
    return subject_table

def printSubjectTable(subs):
    for elem in subs:
        print(elem)

def runThread(repo):
    messageList = []
    for message in repo.fetch():
        if 'plain' in message['data']['body'] and 'Message-ID' in message['data'] and 'References' in message['data'] and 'From' in message['data'] and 'Subject' in message['data']:
            if message['data']['Message-ID'] is not None and message['data']['References'] is not None and message['data']['From'] is not None and message['data']['Subject'] is not None:
                mes = Message()
                mes.msg = message['data']['From']
                mes.message_id = message['data']['Message-ID']
                mes.subject = message['data']['Subject']
                refs = message['data']['References'].split(" ")
                newRefs = []
                for elem in refs:
                    if elem not in newRefs:
                        newRefs.append(elem.replace("\n",""))
                # print("Les refs : " + str(newRefs))
                mes.references = newRefs
                messageList.append(mes)
    print('Threading the mails...')
    subject_table = thread(messageList)
    sorted(subject_table)
    jsonBuilder().buildThreadJSON(subject_table)