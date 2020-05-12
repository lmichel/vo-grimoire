function findThread(id, mailList,num,subject) {
    // let string = subject.replace(/((Re:\s*)*(RE:\s*)*(\[(\w)*\])*)/,"")
    let string = subject.replace("Re:","")
    string = string.toLowerCase()
    string = string.trim()
    console.log(num + " SUBJECT : " + subject)
    console.log(num + " REGEXP : "+ string)
    return axios.get("http://192.168.1.48:9200/" + mailList + "_threads/_search", {
        params: {
            source: JSON.stringify({
                "query": {
                    "match_phrase": {
                        "subject": string
                    }
                }
            }),
            source_content_type: 'application/json'
        }
    }).then((res) => {
        if (res === undefined){
            addModalThread("",num,"No Thread for this mail")
        }else {
            addModalThread(res.data.hits.hits[0]["_source"]["content"], num,"")
        }
    }).catch(function (e) {
        addModalThread("",num,"No Thread for this mail")
    })
}

function addModalThread(content,num,string) {
    let total
    if (string === "" && content !== ""){
        total = traitementThread(content).replace("<","&lt").replace(">","&gt")
        // console.log((num+1) + " contient un thread")
    }else{
        total = string
    }
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
        "            <div class=\"modal-body\"><pre>\n" + total +
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
        // console.log(thread)
        let total = ""
        if (thread.message !== null && thread.message.msg !== null) {
            total += thread.message.msg + "\n"
        }
        if (thread.children !== null) {
            for (let childrenKey in thread.children) {
                if (thread.children[childrenKey].message !== null) total += thread.children[childrenKey].message.msg + "\n"
                if (thread.children[childrenKey].children !== null) {
                    total += printChildsRecursive(thread.children[childrenKey].children, total)
                }
            }
        }
        return total
    } catch(e){
        console.log(e)
        return "TEST"
    }
}

function printChildsRecursive(childs,total){
    for (let childsKey in childs) {
        if (childs[childsKey].message !== null && childs[childsKey].message.msg !== null){
            total += childs[childsKey].message.msg + "\n"
        }
        if (childs[childsKey].children !== null){
            total += printChildsRecursive(childs[childsKey].children,total) + "\n"
        }
    }
    return total
}

// function testRequest(){
//     return axios.get("http://192.168.1.48:9200/dm_threads/_search", {
//         params: {
//             source: JSON.stringify({
//                 "query": {
//                     "match_phrase": {
//                         "subject": "plea for pragmatism"
//                     }
//                 }
//             }),
//             source_content_type: 'application/json'
//         }
//     }).then((res) => {
//         console.log(res.data.hits.hits)
//     }).catch(function (e) {
//         console.log(e)
//     })
// }

function testRequest(){
    return axios.get("http://192.168.1.48:9200/dm_threads/_search", {
        params: {
            source: JSON.stringify({
                "query":{
                    "match_phrase":{
                        "content": "iw7ng5cnvsvkox1t28ohndt0.1299089625925@email.android.com"
                    }
                }
            }),
            source_content_type: 'application/json'
        }
    }).then((res) => {
        console.log(res.data.hits.hits)
    }).catch(function (e) {
        console.log(e)
    })
}

export default {
    findThread: findThread,
    addModalThread: addModalThread,
    traitementThread: traitementThread,
    printChildsRecursive: printChildsRecursive,
    testRequest: testRequest,
}