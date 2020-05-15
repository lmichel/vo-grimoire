let compteur = 0

function findResponders(mailList, responders, i,total,compteur) {
    console.log("RESPS : " + responders)
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
        console.log("RESPONDERS QUERY")
        console.log(query)
        return axios.get("http://192.168.1.48:9200/" + mailList + "/_search", {
            params: {
                source: JSON.stringify(query),
                source_content_type: 'application/json'
            }
        }).then((res) => {
            addModalResponders(res.data.hits.hits, total, compteur,i)
        }).catch(function (e) {
            console.log(e)
        })
    }
}

function addModalResponders(resps, total,num,i) {
    let compteur = num
    let total2 = total
    resps.forEach(elem =>{
        for (let i = 1; i < compteur; i++) {
            total2 += "&nbsp"
        }
        let date = moment(elem["_source"]["timestamp"] * 1000).format("DD/MM/YYYY")
        $("#accordionEx" + i).append("<fieldset class=\"field-modal\">\n" +
            "    <legend class=\"lef-modal\">\n" +
            "        <a aria-controls=\"collapseOne1\" aria-expanded=\"true\" class=\"lienLegend\" data-toggle=\"collapse\" href=\"#result_" + compteur + "\">" +
            total2 + "           <strong>N°:" + compteur + " </strong>" + date + "<strong> From : </strong> " + elem["_source"]["from"].replace("<", "&lt").replace(">", "&gt") + "" +
            "<strong> Subject : </strong>" + elem["_source"]["subject"] +
            "        </a>\n" +
            "    </legend>\n" +
            "    <div aria-labelledby=\"headingOne1\" class=\"collapse\" data-parent=\"#accordionEx" + compteur + "\" id=\"result_" + compteur + "\" role=\"tabpanel\" style=\"\">\n" +
            "<div class=\"m-2 card-body p-1\">\n" +
            "    <i>From : </i>\n" + elem["_source"]["from"] +
            "    <i>&emsp;To : </i>\n" + elem["_source"]["to"] +
            "    <pre>\n" +
            elem["_source"]["body"] +
            "    </pre>\n" +
            "</div>"+
            "    </div>\n" +
            "</fieldset>")
    })
}

function findReferences(mailList, refs, num) {
    let total =""
    if (refs !== "none" && refs !== "") {
        let ref = refs.trim().split(/([^<>]*)/)
        console.log('REFS SPLIT')
        console.log(ref)
        if (ref.length !== 0 && ref[0] !== "") {
            let query = {
                "query": {
                    "bool": {
                        "should": []
                    }
                },
                "sort": {
                    "timestamp": {"order": "asc"}
                }
            }
            ref.forEach(elem => {
                if (elem.includes("<") === false && elem.includes(">") === false && elem.includes("\n") === false && elem.includes("\t") === false) {
                    query["query"]["bool"]["should"].push({
                        "match_phrase": {
                            "id": elem
                        }
                    })
                }
            })
            console.log("REFERENCES QUERY")
            console.log(query)
            return axios.get("http://192.168.1.48:9200/" + mailList + "/_search", {
                params: {
                    source: JSON.stringify(query),
                    source_content_type: 'application/json'
                }
            }).then((res) => {
                console.log("REFERENCES RES")
                console.log(res)
                total = addModalReferences(res.data.hits.hits, num)
            }).catch(function (e) {
                console.log(e)
            })
        }
    }
    return total
}

function addModalReferences(refs, num) {
    let total = ""
    compteur = 1
    refs.forEach(elem => {
        for (let i = 1; i < compteur; i++) {
            total += "&nbsp"
        }
        let date = moment(elem["_source"]["timestamp"] * 1000).format("DD/MM/YYYY")
        $("#accordionEx" + num).append("<fieldset class=\"field-modal\">\n" +
            "    <legend class=\"lef-modal\">\n" +
            "        <a aria-controls=\"collapseOne1\" aria-expanded=\"true\" class=\"lienLegend\" data-toggle=\"collapse\" href=\"#result_" + compteur + "\">" +
            total + "           <strong>N°:" + compteur + " </strong>" + date + "<strong> From : </strong> " + elem["_source"]["from"].replace("<", "&lt").replace(">", "&gt") + "" +
            "<strong> Subject : </strong>" + elem["_source"]["subject"] +
            "        </a>\n" +
            "    </legend>\n" +
            "    <div aria-labelledby=\"headingOne1\" class=\"collapse\" data-parent=\"#accordionEx" + compteur + "\" id=\"result_" + compteur + "\" role=\"tabpanel\" style=\"\">\n" +
            "<div class=\"m-2 card-body p-1\">\n" +
            "    <i>From : </i>\n" + elem["_source"]["from"] +
            "    <i>&emsp;To : </i>\n" + elem["_source"]["to"] +
            "    <pre>\n" +
            elem["_source"]["body"] +
            "    </pre>\n" +
            "</div>"+
        "    </div>\n" +
        "</fieldset>"
    )
        compteur += 1
    })
    return [total,compteur]
}

function addModal(num) {
    $("#modal_container").append("<div aria-hidden=\"true\" aria-labelledby=\"exampleModalCenterTitle\" class=\"modal fade\" id=\"edu_result_" + num + "\" role=\"dialog\"\n" +
        "     tabindex=\"-1\">\n" +
        "    <div class=\"modal-dialog modal-dialog-centered modal_ivoa\" role=\"document\">\n" +
        "        <div class=\"modal-content\">\n" +
        "            <div class=\"modal-header\">\n" +
        "                <h5 class=\"modal-title\" id=\"exampleModalCenterTitle2\">Thread Content</h5>\n" +
        "                <button aria-label=\"Close\" class=\"close\" data-dismiss=\"modal\" type=\"button\">\n" +
        "                    <span class=\"thread_content\"" + num + " aria-hidden=\"true\">&times;</span>\n" +
        "                </button>\n" +
        "            </div>\n" +
        "            <div class=\"modal-body\" id=\"modal-body-" + num + "\">" +
        "<div id=\"accordionEx" + num + "\" aria-multiselectable=\"true\" class=\"accordion md-accordion\" role=\"tablist\"></div>" +
        "            </div>\n" +
        "            <div class=\"modal-footer\">\n" +
        "                <button class=\"btn btn-secondary\" data-dismiss=\"modal\" type=\"button\">Close</button>\n" +
        "            </div>\n" +
        "        </div>\n" +
        "    </div>\n" +
        "</div>")
}

function testRequest() {
    return axios.get("http://192.168.1.48:9200/dm/_search", {
        params: {
            source: JSON.stringify({
                "query": {
                    "match_phrase":{
                        "id":"CAAsB-qL7Sj_YOMS-JkB3F-OrcVSZ+stoK3=dg__nKAti2Ozjrg@mail.gmail.com"
                    }
                },
                "size": 10
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
    findReferences: findReferences,
    testRequest: testRequest,
    addModal: addModal
}