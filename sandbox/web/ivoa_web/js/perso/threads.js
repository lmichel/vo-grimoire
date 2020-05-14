let compteur = 0

function findResponders(mailList,responders,i){
    let resps = responders.trim().split(" ")
    if (resps.length !== 0 && resps[0] !== "") {
        let query = {
            "query": {
                "bool": {
                    "should": []
                }
            }
        }
        resps.forEach(elem => {
            query["query"]["bool"]["should"].push({
                "match_phrase": {
                    "id": elem
                }
            })
        })
        console.log(query)
        return axios.get("http://192.168.1.48:9200/" + mailList + "/_search", {
            params: {
                source: JSON.stringify(query),
                source_content_type: 'application/json'
            }
        }).then((res) => {
            addModalResponders(res.data.hits.hits,i)
        }).catch(function (e) {
            console.log(e)
        })
    }
}

function addModalResponders(resps,num){
    let total = ""
    resps.forEach(elem => {
        total += elem["_source"]["from"] + "\n"
    })
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
function findThread(id, mailList,num,subject) {
    // let string = subject.replace(/((Re:\s*)*(RE:\s*)*(\[(\w)*\])*)/,"")
    let string = subject.replace("Re:","")
    string = string.toLowerCase()
    string = string.trim()
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
            compteur += 1
            console.log(compteur)
        }
    }).catch(function (e) {
        addModalThread("",num,"No Thread for this mail")
    })
}

function addModalThread(content,num,string) {
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

function testRequest(){
    return axios.get("http://192.168.1.48:9200/dm/_search", {
        params: {
            source: JSON.stringify({
                "query":{
                    "bool":{
                        "must_not":{
                            "match_phrase":{
                                "responders":"none"
                            }
                        }
                    }
                },
                "size":4000
            })
           ,
            source_content_type: 'application/json'
        }
    }).then((res) => {
        console.log(res.data.hits.hits)
    }).catch(function (e) {
        console.log(e)
    })
}

export default {
    findResponders: findResponders,
    testRequest: testRequest,
}