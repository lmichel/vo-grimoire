function findThread(id, mailList,num) {
    return axios.get("http://192.168.1.48:9200/" + mailList + "_threads/_search", {
        params: {
            source: JSON.stringify({
                "query": {
                    "match_phrase": {
                        "content": id
                    }
                }
            }),
            source_content_type: 'application/json'
        }
    }).then((res) => {
        if (res === undefined){
            addModalThread("No Thread for this mail",num)
        }else {
            addModalThread(res.data.hits.hits[0]["_source"]["content"], num)
        }
    }).catch(function (e) {
        addModalThread("No Thread for this mail",num)
    })
}

function addModalThread(content,num) {
    $("#modal_container").append("<div aria-hidden=\"true\" aria-labelledby=\"exampleModalCenterTitle\" class=\"modal fade\" id=\"edu_result_"+num+"\" role=\"dialog\"\n" +
        "     tabindex=\"-1\">\n" +
        "    <div class=\"modal-dialog modal-dialog-centered modal_ivoa\" role=\"document\">\n" +
        "        <div class=\"modal-content\">\n" +
        "            <div class=\"modal-header\">\n" +
        "                <h5 class=\"modal-title\" id=\"exampleModalCenterTitle2\">Thread Content</h5>\n" +
        "                <button aria-label=\"Close\" class=\"close\" data-dismiss=\"modal\" type=\"button\">\n" +
        "                    <span class=\"thread_content\""+num+" aria-hidden=\"true\">&times;</span>\n" +
        "                </button>\n" +
        "            </div>\n" +
        "            <div class=\"modal-body\"><pre>\n" + traitementThread(content).replace("<","&lt").replace(">","&gt")+
        "            </pre></div>\n" +
        "            <div class=\"modal-footer\">\n" +
        "                <button class=\"btn btn-secondary\" data-dismiss=\"modal\" type=\"button\">Close</button>\n" +
        "                <button class=\"btn btn-primary\" type=\"button\">Save changes</button>\n" +
        "            </div>\n" +
        "        </div>\n" +
        "    </div>\n" +
        "</div>")
}

function traitementThread(content){
    try {
        let thread = JSON.parse(content)
        let total = ""
        if (thread.message.msg !== undefined) {
            total += thread.message.msg + "\n"
        }
        if (thread.children !== undefined) {
            for (let childrenKey in thread.children) {
                if (childrenKey.message.msg !== undefined) total += childrenKey.message.msg + "\n"
                if (childrenKey.children !== undefined) {
                    total += printChildsRecursive(childrenKey.children, total)
                }
            }
        }
        return total
    } catch(e){
        return "No Thread for this message"
    }
}

function printChildsRecursive(childs,total){
    for (let childsKey in childs) {
        if (childsKey.message.msg !== undefined){
            total += childsKey.message.msg + "\n"
        }
        if (childsKey.children !== undefined){
            total += printChildsRecursive(childsKey.children,total) + "\n"
        }
    }
    return total
}

export default {
    findThread: findThread,
    addModalThread: addModalThread,
    traitementThread: traitementThread,
    printChildsRecursive: printChildsRecursive,
}