import threads from "./threads.js"
let fromReg = new RegExp("\\(From:[^)]*\\)", 'g')
let toReg = new RegExp("\\(To:[^)]*\\)", 'g')
let subjectReg = new RegExp("\\(Subject:[^)]*\\)", 'g')
let contentReg = new RegExp("\\(Content:[^)]*\\)", 'g')
let elastic_search_url = "http://192.168.1.48:9200/"
function addSearchAttribute(input) {
    let search_bar = $("#search_bar");
    search_bar.val(search_bar.val() + " " + input + " ")
    search_bar.focus();
    var cursorPos = search_bar.prop('selectionStart');
    search_bar.prop('selectionEnd', cursorPos - 2)
}

function traitementMessage(hits,thread) {
    for (let i = 0; i < hits.length; i++) {
        let timestamp = new Date(hits[i]["_source"]["timestamp"] * 1000)
        let date = moment(timestamp).format("DD/MM/YYYY")
        let mailList = hits[i]["_source"]["maillist"]
        let url = ""
        if(window.location.href.includes('?')){
            url = window.location.href+"&num="+hits[i]["_source"]["num"]
        }else{
            url = window.location.href+"?num="+hits[i]["_source"]["num"]
        }
        $("#accordionEx").append("<fieldset id=\"ID"+i+"\" class=\"field-mails\">\n" +
            "<legend class=\"leg-mails\">\n" +
            "<a aria-controls=\"collapseOne1\" aria-expanded=\"false\" class=\"lienLegend\"\n" +
            "data-toggle=\"collapse\" href=\"#result" + i + "\">\n"+ "<strong>N°:" + (i+1) +"/"+hits.length+" </strong>"+
            date + " (" + mailList + ") <strong>From</strong> : " + hits[i]["_source"]["from"].replace(/</g,"&lt").replace(">","&gt") + " <strong>Subject</strong> : " + hits[i]["_source"]["subject"] + "\n" +
            "</a>\n" +
            "</legend>\n" +
            "<div aria-labelledby=\"headingOne1\" class=\"collapse\" data-parent=\"#accordionEx\" id=\"result" + i + "\"\n" +
            "role=\"tabpanel\">\n" +
            "<button class=\"btn btn-link\" data-target=\"#edu_result_"+i+"\" data-toggle=\"modal\" type=\"button\">\n" +
            "    View Thread\n" +
            "</button>\n" +
            "    <div class=\"m-2 card-body p-1 contenuMails result_body_"+i+"\">\n" +
            "    <a href=\""+url+"\" target=\"_blank\">Link for this mail :" + url +"</a></br></br>"+
            "    <i>FROM : </i>" + hits[i]["_source"]["from"].replace(/</g,"&lt").replace(">","&gt") +
            "<i>&emsp; TO : </i>" + hits[i]["_source"]["to"].replace(/</g,"&lt").replace(">","&gt") + "<br>" +
            "<i>SUBJECT : </i>"+ hits[i]["_source"]["subject"]+
            "<i>&emsp; DATE : </i>"+ date +" <br>" +
            "<br><pre>" + highlight(hits[i]["_source"]["body"]) + "</pre><br>" +
            "</div>\n" + "" +
            "<button class=\"btn btn-link closeThread\" aria-controls=\"collapseOne1\" aria-expanded=\"true\" data-toggle=\"collapse\" href=\"#result" + i + "\">\n" +
            "    Close Mail\n" +
            "</button>\n"+
            "<div>\n" +
            "</div>\n" +
            "</div>\n" +
            "</fieldset>")
        if(thread === "thread" && i === 0){
            threads.addModal(i,true)
        }else{
            threads.addModal(i,false)
        }
        // if (hits[i]["_source"]["attachements"].length > 0){
        //     for (const [key, value] of Object.entries(hits[i]["_source"]["attachements"])){
        //         let type = key.split("__")[0]
        //         if (type === 'image/png'){
        //             // $(".result_body_"+i).append("<img alt='attachement_png' class='img-fluid' height='50%' src='data:image/png;base64, " + encodeURI(value) + "' width='50%'>")
        //         }
        //     }
        // }
        threads.findThread(mailList,hits[i]["_source"]["numThread"],i)
    }
}

function formQuery(exec) {
    let mailListInput = $("#mailList");
    let totalString = $("#search_bar").val();
    if (totalString === "") {
        return 0
    }
    let fromRes = totalString.match(fromReg)
    let toRes = totalString.match(toReg)
    let subjectRes = totalString.match(subjectReg)
    let contentRes = totalString.match(contentReg)
    totalString = totalString.replace(fromReg, "")
    totalString = totalString.replace(toReg, "")
    totalString = totalString.replace(subjectReg, "")
    totalString = totalString.replace(contentReg, "")
    totalString = totalString.trim()
    let numberInput = $("#inputQuerySize");
    let startPeriodInput = $("#datepicker");
    let endPeriodInput = $("#datepicker2");
    let querySize = 50
    if (numberInput.val() != null && numberInput.val() > 0 && numberInput.val() <= 50) {
        querySize = numberInput.val();
    }
    let mailList = ""
    if (mailListInput.val() === "default") {
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
        if (fromRes !== null) fromRes.forEach(element => {
            let all = element.replace("(From:", "").replace(")", "").trim().toLowerCase().split(" ")
            all.forEach(second_element => {
                query["query"]["bool"]["must"].push({
                    "wildcard": {"from": {"value": "*" + second_element + "*"}}
                })
            })
        })
        if (toRes !== null) toRes.forEach(element => {
            let all = element.replace("(To:", "").replace(")", "").trim().toLowerCase().split(" ")
            all.forEach(second_element => {
                query["query"]["bool"]["must"].push({
                    "wildcard": {"to": {"value": "*" + second_element + "*"}}
                })
            })
        })
        if (subjectRes !== null) subjectRes.forEach(element => {
            let all = element.replace("(Subject:", "").replace(")", "").trim().toLowerCase().split(" ")
            all.forEach(second_element => {
                query["query"]["bool"]["must"].push({
                    "wildcard": {"subject": {"value": "*" + second_element + "*"}}
                })
            })
        })
        if (contentRes !== null) contentRes.forEach(element => {
            let all = element.replace("(Content:", "").replace(")", "").trim().toLowerCase().split(" ")
            all.forEach(second_element => {
                query["query"]["bool"]["must"].push({
                    "wildcard": {"body": {"value": "*" + second_element + "*"}}
                })
            })
        })
        if (totalString.split(" ") !== null) totalString.split(" ").forEach(element => {
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
        if (fromRes !== null) fromRes.forEach(element => {
            let all = element.replace("(From:", "").replace(")", "").trim().toLowerCase().split(" ")
            all.forEach(second_element => {
                query["query"]["bool"]["should"].push({
                    "wildcard": {"from": {"value": "*" + second_element + "*"}}
                })
            })
        })
        if (toRes !== null) toRes.forEach(element => {
            let all = element.replace("(To:", "").replace(")", "").trim().toLowerCase().split(" ")
            all.forEach(second_element => {
                query["query"]["bool"]["should"].push({
                    "wildcard": {"to": {"value": "*" + second_element + "*"}}
                })
            })
        })
        if (subjectRes !== null) subjectRes.forEach(element => {
            let all = element.replace("(Subject:", "").replace(")", "").trim().toLowerCase().split(" ")
            all.forEach(second_element => {
                query["query"]["bool"]["should"].push({
                    "wildcard": {"subject": {"value": "*" + second_element + "*"}}
                })
            })
        })
        if (contentRes !== null) contentRes.forEach(element => {
            let all = element.replace("(Content:", "").replace(")", "").trim().toLowerCase().split(" ")
            all.forEach(second_element => {
                query["query"]["bool"]["should"].push({
                    "wildcard": {"body": {"value": "*" + second_element + "*"}}
                })
            })
        })
        if (totalString.split(" ") !== null) totalString.split(" ").forEach(element => {
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
    $("#accordionEx").empty()
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

function seeQuery() {
    let query = formQuery(0)
    $("#body_query").val(JSON.stringify(query, null, 2))
}

function manageDates(){
    console.log($("#datepicker").val())
    console.log($("#datepicker2").val())
    if ($("#datepicker").val() !== "" && $("#datepicker2").val() === ""){
        $("#datepicker2").val($("#datepicker").val())
        console.log("D1")
    }
    if ($("#datepicker2").val() !== "" && $("#datepicker").val() === ""){
        $("#datepicker").val($("#datepicker2").val())
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
                        "value": params["thread"].split("_")[1]
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
    // if (content.includes("<img")){
    //     console.log(content)
    // }
    let cont = JSON.stringify(replace).split("\\n")
    let total = ""
    cont.forEach(elem => {
            if (elem.startsWith('>')){
                if(elem.substring(1).includes('>')){
                    total += "<span class=\"greaterthan\">></span>"
                    total += "<span class=\"greatergreaterthan\">"+elem.substring(1)+"</span>" + "\n"
                }else{
                    total += "<span class=\"greaterthan\">"+elem+ "</span>" + "\n"
                }
            }else{
                total += elem + "\n"
            }
    })
    return total.toString()
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