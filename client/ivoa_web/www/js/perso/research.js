import threads from "./threads.js"
import modals from "./modals.js"
let fromReg = new RegExp("\\(From:[^)]*\\)", 'g')
let toReg = new RegExp("\\(To:[^)]*\\)", 'g')
let attachementsReg = new RegExp("\\(Attachements:[^)]*\\)", 'g')
let subjectReg = new RegExp("\\(Subject:[^)]*\\)", 'g')
let contentReg = new RegExp("\\(Content:[^)]*\\)", 'g')
let global_index = 1
let mime = {
    "text/plain" : ".txt",
    "text/x-python-script" : ".py",
    "application/x-javascript" : ".js",
    "text/html" : ".html",
    "image/gif" : ".gif",
    "video/mp4" : ".mp4",
    "application/x-tex" : ".latex",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document" : ".docx",
    "application/pdf" : ".pdf",
    "image/jpeg" : ".jpeg",
    "text/xml" : ".xml",
    "audio/mpeg" : ".mp3",
    "text/x-patch" : ".patch"
}
let charset = {
    "text/plain" : "base64,",
    "text/x-python-script" : "charset=utf-8,",
    "application/x-javascript" : "charset=utf-8,",
    "text/html" : "base64,",
    "image/gif" : "base64,",
    "video/mp4" : "base64,",
    "application/x-tex" : "charset=utf-8,",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document" : "base64,",
    "application/pdf" : "base64,",
    "image/jpeg" : "base64,",
    "image/png" : "base64,",
    "text/xml" : "charset=utf-8,",
    "audio/mpeg" : "base64,"
}

function addSearchAttribute(input) {
    let search_bar = $("#search_bar");
    search_bar.val(search_bar.val() + " " + input + " ")
    search_bar.focus();
    var cursorPos = search_bar.prop('selectionStart');
    search_bar.prop('selectionEnd', cursorPos - 2)
}

function emptycontainers(){
    $("#modal_container").empty()
    $("#accordionEx").empty()
}

function traitementMessage(hits,thread) {
    for (let i = 0; i < hits.length; i++) {
        let timestamp = new Date(hits[i]["_source"]["timestamp"] * 1000)
        let date = moment(timestamp).format("DD/MM/YYYY")
        let mailList = hits[i]["_source"]["maillist"]
        let url = ""
        url = location.protocol + '//' + location.host + location.pathname +"?num="+hits[i]["_source"]["num"]
        let res = modals.addAttachements(hits[i]["_source"]["attachements"],i)
        $("#accordionEx").append(
            "<fieldset id=\"ID"+i+"\" class=\"field-mails\">" +
            "<legend class=\"leg-mails\">" +
            "<a aria-controls=\"collapseOne1\" aria-expanded=\"false\" class=\"lienLegend\" data-toggle=\"collapse\" href=\"#result" + i + "\">"+
            "<strong>N°:" + (i+1) +"/"+hits.length+" </strong>"+
            date + " (" + mailList + ") <strong>From</strong> : " + hits[i]["_source"]["from"].replace(/</g,"&lt").replace(">","&gt") +
            "<strong>Subject</strong> : " + hits[i]["_source"]["subject"] + "" +
            "</a>" +
            "</legend>" +
            "<div aria-labelledby=\"headingOne1\" class=\"collapse\" data-parent=\"#accordionEx\" id=\"result" + i + "\"" + "role=\"tabpanel\">" +
            "<button class=\"btn btn-link\" data-target=\"#edu_result_"+i+"\" data-toggle=\"modal\" type=\"button\">" +
            "View Thread" +
            "</button>" +
            "<div class=\"m-2 card-body p-1 contenuMails result_body_"+i+"\">" +
            "<a href=\""+url+"\" target=\"_blank\">Link for this mail :" + url +"</a></br></br>"+
            "<i>FROM : </i>" + hits[i]["_source"]["from"].replace(/</g,"&lt").replace(">","&gt") +
            "<i>&emsp; TO : </i>" + hits[i]["_source"]["to"].replace(/</g,"&lt").replace(">","&gt") + "<br>" +
            "<i>SUBJECT : </i>"+ hits[i]["_source"]["subject"]+
            "<i>&emsp; DATE : </i>"+ date +"<br>" +
            res[0]+ "<br>"+
            "<br><pre>" + highlight(hits[i]["_source"]["body"].replace("\t","   ")) + "</pre><br>" +
            "</div>" + "" +
            "<button class=\"btn btn-link closeThread\" aria-controls=\"collapseOne1\" aria-expanded=\"true\" data-toggle=\"collapse\" href=\"#result" + i + "\">" +
            "Close Mail" +
            "</button>"+
            "<div>" +
            "</div>" +
            "</div>" +
            "</fieldset>")
        if(thread === "thread" && i === 0){
            threads.addModal(i,true,hits[i]["_source"]["numThread"],hits[i]["_source"]["maillist"])
        }else{
            threads.addModal(i,false,hits[i]["_source"]["numThread"],hits[i]["_source"]["maillist"])
        }
        res[1].forEach(elem => {
            Prism.highlightElement(document.getElementById(elem))
        })
        threads.findThread(mailList,hits[i]["_source"]["numThread"],i)
    }
}

function formQuery(exec) {
    let mailListInput = $("#mailList");
    let totalString = $("#search_bar").val();
    if (totalString === "") {
        return 0
    }
    let attachementsRes = totalString.match(attachementsReg)
    let fromRes = totalString.match(fromReg)
    let toRes = totalString.match(toReg)
    let subjectRes = totalString.match(subjectReg)
    let contentRes = totalString.match(contentReg)
    totalString = totalString.replace(fromReg, "")
    totalString = totalString.replace(toReg, "")
    totalString = totalString.replace(subjectReg, "")
    totalString = totalString.replace(contentReg, "")
    totalString = totalString.replace(attachementsReg, "")
    totalString = totalString.trim()
    let numberInput = $("#inputQuerySize");
    let startPeriodInput = $("#datepicker");
    let endPeriodInput = $("#datepicker2");
    let querySize = 20
    if (numberInput.val() != null && numberInput.val() > 0 && numberInput.val() <= 100) {
        querySize = numberInput.val();
    }
    let mailList = ""
    if (mailListInput.val() === "ivoa_all" && global_index !== 1) {
        alert("No mailing list.")
        return 0
    }
    mailList = mailListInput.val()
    let startTimestamp = 0;
    let endTimestamp = 0;
    if (startPeriodInput.val() != null) {
        startTimestamp = new Date(startPeriodInput.val()).getTime()
        if (isNaN(startTimestamp)) startTimestamp = 0;
    }
    if (endPeriodInput.val() != null) {
        endTimestamp = new Date(endPeriodInput.val()).getTime()
        if (isNaN(endTimestamp)) endTimestamp = 0;
    }
    let query = ""
    if ($("#query_method").val() === "and") {
        query = {
            "size": querySize,
            "query": {
                "bool": {
                    "must": []
                }
            }
        }
        if (global_index === 1){
            if (mailList !== "ivoa_all"){
                query["query"]["bool"]["must"].push({
                    "term" : {"maillist":{"value":mailList}}
                })
            }
        }
        if (fromRes !== null) fromRes.forEach(element => {
            let all = element.replace("(From:", "").replace(")", "").trim().toLowerCase().split(" ")
            let should = {
                "bool":{
                    "should":[]
                }
            }
            all.forEach(second_element => {
                should["bool"]["should"].push({
                    "wildcard": {"from": {"value": "*" + second_element + "*"}}
                })
            })
            query["query"]["bool"]["must"].push(should)
        })
        if (attachementsRes !== null) attachementsRes.forEach(element => {
            let all = element.replace("(Attachements:", "").replace(")", "").trim().toLowerCase().split(" ")
            let should = {
                "bool":{
                    "should":[]
                }
            }
            all.forEach(second_element => {
                should["bool"]["should"].push({
                    "wildcard": {"attachements_name": {"value": "*" + second_element + "*"}}
                })
            })
            query["query"]["bool"]["must"].push(should)
        })
        if (toRes !== null) toRes.forEach(element => {
            let all = element.replace("(To:", "").replace(")", "").trim().toLowerCase().split(" ")
            let should = {
                "bool":{
                    "should":[]
                }
            }
            all.forEach(second_element => {
                should["bool"]["should"].push({
                    "wildcard": {"to": {"value": "*" + second_element + "*"}}
                })
            })
            query["query"]["bool"]["must"].push(should)
        })
        if (subjectRes !== null) subjectRes.forEach(element => {
            let all = element.replace("(Subject:", "").replace(")", "").trim().toLowerCase().split(" ")
            let should = {
                "bool":{
                    "should":[]
                }
            }
            all.forEach(second_element => {
                should["bool"]["should"].push({
                    "wildcard": {"subject": {"value": "*" + second_element + "*"}}
                })
            })
            query["query"]["bool"]["must"].push(should)
        })
        if (contentRes !== null) contentRes.forEach(element => {
            let all = element.replace("(Content:", "").replace(")", "").trim().toLowerCase().split(" ")
            let should = {
                "bool":{
                    "should":[]
                }
            }
            all.forEach(second_element => {
                should["bool"]["should"].push({
                    "wildcard": {"body": {"value": "*" + second_element + "*"}}
                })
            })
            query["query"]["bool"]["must"].push(should)
        })
        if (totalString.match(/^[0-9a-zA-Z]+$/)) totalString.split(" ").forEach(element => {
            query["query"]["bool"]["must"].push({
                "bool": {
                    "should": [
                        {"wildcard": {"from": {"value": "*" + element.toLowerCase() + "*"}}},
                        {"wildcard": {"to": {"value": "*" + element.toLowerCase() + "*"}}},
                        {"wildcard": {"subject": {"value": "*" + element.toLowerCase() + "*"}}},
                        {"wildcard": {"body": {"value": "*" + element.toLowerCase() + "*"}}},
                    ]
                }
            })
        })
        if (startTimestamp !== 0 && endTimestamp !== 0) {
            query["query"]["bool"]["must"].push({
                "range": {
                    "timestamp": {
                        "gte": startTimestamp / 1000,
                        "lte": endTimestamp / 1000,
                    }
                }
            })
        }
    } else if ($("#query_method").val() === "or") {
        query = {
            "size": querySize,
            "query": {
                "bool": {
                    "should": []
                }
            }
        }
        if (global_index === 1){
            if (mailList !== "ivoa_all"){
                query["query"]["bool"]["must"].push({
                    "term" : {"maillist":{"value":mailList}}
                })
            }
        }
        if (fromRes !== null) fromRes.forEach(element => {
            let all = element.replace("(From:", "").replace(")", "").trim().toLowerCase().split(" ")
            let should = {
                "bool":{
                    "should":[]
                }
            }
            all.forEach(second_element => {
                should["bool"]["should"].push({
                    "wildcard": {"from": {"value": "*" + second_element + "*"}}
                })
            })
            query["query"]["bool"]["should"].push(should)
        })
        if (attachementsRes !== null) attachementsRes.forEach(element => {
            let all = element.replace("(Attachements:", "").replace(")", "").trim().toLowerCase().split(" ")
            let should = {
                "bool":{
                    "should":[]
                }
            }
            all.forEach(second_element => {
                should["bool"]["should"].push({
                    "wildcard": {"attachements_name": {"value": "*" + second_element + "*"}}
                })
            })
            query["query"]["bool"]["should"].push(should)
        })
        if (toRes !== null) toRes.forEach(element => {
            let all = element.replace("(To:", "").replace(")", "").trim().toLowerCase().split(" ")
            let should = {
                "bool":{
                    "should":[]
                }
            }
            all.forEach(second_element => {
                should["bool"]["should"].push({
                    "wildcard": {"to": {"value": "*" + second_element + "*"}}
                })
            })
            query["query"]["bool"]["should"].push(should)
        })
        if (subjectRes !== null) subjectRes.forEach(element => {
            let all = element.replace("(Subject:", "").replace(")", "").trim().toLowerCase().split(" ")
            let should = {
                "bool":{
                    "should":[]
                }
            }
            all.forEach(second_element => {
                should["bool"]["should"].push({
                    "wildcard": {"subject": {"value": "*" + second_element + "*"}}
                })
            })
            query["query"]["bool"]["should"].push(should)
        })
        if (contentRes !== null) contentRes.forEach(element => {
            let all = element.replace("(Content:", "").replace(")", "").trim().toLowerCase().split(" ")
            let should = {
                "bool":{
                    "should":[]
                }
            }
            all.forEach(second_element => {
                should["bool"]["should"].push({
                    "wildcard": {"body": {"value": "*" + second_element + "*"}}
                })
            })
            query["query"]["bool"]["should"].push(should)
        })
        if (totalString.match(/^[0-9a-zA-Z]+$/)) totalString.split(" ").forEach(element => {
            query["query"]["bool"]["should"].push({
                "bool": {
                    "should": [
                        {"wildcard": {"from": {"value": "*" + element.toLowerCase() + "*"}}},
                        {"wildcard": {"to": {"value": "*" + element.toLowerCase() + "*"}}},
                        {"wildcard": {"subject": {"value": "*" + element.toLowerCase() + "*"}}},
                        {"wildcard": {"body": {"value": "*" + element.toLowerCase() + "*"}}},
                    ]
                }
            })
        })
        if (startTimestamp !== 0 && endTimestamp !== 0) {
            query["query"]["bool"]["must"] = {
                "range": {
                    "timestamp": {
                        "gte": startTimestamp / 1000,
                        "lte": endTimestamp / 1000,
                    }
                }
            }
        }
    }
    switch ($("#sort_method").val()) {
        case "date_asc":
            query["sort"] = [
                {"timestamp": {"order": "asc"}},
            ]
            break;
        case "date_desc":
            query["sort"] = [
                {"timestamp": {"order": "desc"}},
            ]
            break;
    }
    if (exec === 1) {
        executeQuery(query, mailList)
    }
    return query
}

function executeQuery(query, mailList,thread) {
    emptycontainers()
    if (global_index === 1){
        return axios.get(elastic_search_url + "ivoa_all/_search", {
            params: {
                source: JSON.stringify(query),
                source_content_type: 'application/json'
            }
        }).then((res) => {
            traitementMessage(res.data.hits.hits,thread);
        }).catch(function (e) {
            console.log(e)
        })
    }else{
        return axios.get(elastic_search_url + mailList + "/_search", {
            params: {
                source: JSON.stringify(query),
                source_content_type: 'application/json'
            }
        }).then((res) => {
            traitementMessage(res.data.hits.hits,thread);
        }).catch(function (e) {
            console.log(e)
        })
    }
}

function seeQuery() {
    let query = formQuery(0)
    $("#body_query").val(JSON.stringify(query, null, 2))
}

function manageDates(){
    let d1 = $("#datepicker")
    let d2 = $("#datepicker2")
    console.log(d1.val())
    console.log(d2.val())
    if (d1.val() !== "" && d2.val() === ""){
        d2.val(d1.val())
        console.log("D1")
    }
    if (d2.val() !== "" && d1.val() === ""){
        d1.val(d2.val())
        console.log("D2")
    }
    formQuery(1)
}

function getUrlVars(){
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}

function defaultQuery(){
    let params = getUrlVars()
    if (params["num"] !== undefined){
        let query = {
            "query":{
                "term":{
                    "num":{
                        "value" : params["num"]
                    }
                }
            }
        }
        executeQuery(query,params["num"].split("_")[0])
    }else if (params["thread"] !== undefined){
        let query = {
            "query":{
                "term":{
                    "numThread":{
                        "value": params["thread"]
                    }
                }
            },
            "sort":{
                "timestamp": {"order": "asc"}
            },
            "size": 1
        }
        console.log(query)
        executeQuery(query,params["thread"].split("_")[0],"thread")
    }
}

function highlight(content){
    let replace = content.replace(/<img[^>]*>/,"")
    let cont = JSON.stringify(replace).split(/(?=\\n)/g)
    let total = ""
    cont.forEach(elem => {
            if (elem.startsWith('>')){
                if(elem.substring(1).includes('>')){
                    total += "<span class=\"greaterthan\">></span>"
                    total += "<span class=\"greatergreaterthan\">"+elem.substring(1).replace("\\n","")+"</span>" + "\n"
                }else{
                    total += "<span class=\"greaterthan\">"+elem.replace("\\n","")+ "</span>" + "\n"
                }
            }else {
                total += elem.replace("\\n","") + "\n"
            }
    })
    return total.toString().substring(1,(total.toString().length)-2)
}

export default {
    addSearchAttribute: addSearchAttribute,
    formQuery: formQuery,
    seeQuery: seeQuery,
    executeQuery: executeQuery,
    manageDates: manageDates,
    defaultQuery: defaultQuery,
    highlight:highlight,
}