import threads from "./threads.js"
import modals from "./modals.js"
import texts from "./texts.js"

let fromReg = new RegExp("\\(From:[^)]*\\)", 'g')
let toReg = new RegExp("\\(To:[^)]*\\)", 'g')
let attachementsReg = new RegExp("\\(Attachements:[^)]*\\)", 'g')
let subjectReg = new RegExp("\\(Subject:[^)]*\\)", 'g')
let contentReg = new RegExp("\\(Content:[^)]*\\)", 'g')
let global_index = 1
let end_query = true

function traitementMessage(hits, thread) {
    for (let i = 0; i < hits.length; i++) {
        let timestamp = new Date(hits[i]["_source"]["timestamp"] * 1000)
        let date = moment(timestamp).format("DD/MM/YYYY")
        let mailList = hits[i]["_source"]["maillist"]
        let url = ""
        url = location.protocol + '//' + location.host + location.pathname + "?num=" + hits[i]["_source"]["num"]
        let res = modals.addAttachements(hits[i]["_source"]["attachements"], i)
        $("#accordionEx").append(
            "<fieldset id=\"ID" + i + "\" class=\"field-mails\">" +
            "<legend class=\"leg-mails\">" +
            "<a aria-controls=\"collapseOne1\" aria-expanded=\"false\" class=\"lienLegend\" data-toggle=\"collapse\" href=\"#result" + i + "\">" +
            "<strong>N°:" + (i + 1) + "/" + hits.length + " </strong>" +
            date + " <i><strong>-" + mailList.toUpperCase() + "-</strong></i> " + "<strong>From</strong> : " + texts.escapeBrackets(hits[i]["_source"]["from"]) +
            " <strong>Subject</strong> : " + texts.escapeBrackets(hits[i]["_source"]["subject"]) + "" +
            "</a>" +
            "</legend>" +
            "<div aria-labelledby=\"headingOne1\" class=\"collapse\" data-parent=\"#accordionEx\" id=\"result" + i + "\"" + " role=\"tabpanel\">" +
            "<div class='m-2 p-1'>" +
            "<div class='btn' style='cursor:default;border:1px solid; color:#6c757d;'>" +
            "<button style='border-color: transparent' type=\"button\" class=\"btn btn-outline-secondary\" title='Click here to view all the mails of a thread'>" +
            "<span class=\"fa fa-list\" data-target=\"#edu_result_" + i + "\" onclick='trackAction(\"User clicked View Thread\")' data-toggle=\"modal\" type=\"button\"> View Thread</span>" +
            "</button>" +
            "<button style='border-color:transparent' type=\"button\" onclick='trackAction(\"User clicked Copy URL\")' class=\"btn btn-outline-secondary btn_url_mails\" value='" + url + "___" + hits[i]["_source"]["pipermail"] + "' title='Click here to copy the url of the mail to your clipboard'>" +
            "<span class=\"fa\"> Mail URL</span>" +
            "</button>" +
            "<a title='Open a new tab on the IVOA pipermail page' target='blank' href='" + hits[i]["_source"]["pipermail"] + "' style='color: #6c757d;'><span class=\"fa\">IVOA Pipermail Page</span></a>" +

            "</div>" +
            res[0] +
            "</div>" +
            "<div class=\"m-2 card-body p-1 contenuMails result_body_" + i + "\">" +
            "<i>FROM : </i>" + texts.escapeBrackets(hits[i]["_source"]["from"]) +
            "<i>&emsp; TO : </i>" + texts.escapeBrackets(hits[i]["_source"]["to"]) + "<br>" +
            "<i>SUBJECT : </i>" + texts.escapeBrackets(hits[i]["_source"]["subject"]) +
            "<i>&emsp; DATE : </i>" + date + "<br>" +
            "<br><pre>" + texts.highlight(hits[i]["_source"]["body"]) + "</pre><br>" +
            "</div>" + "" +
            "<div class='m-2 p-1'>" +
            "<div class='btn' style='cursor:default;border:1px solid; color:#6c757d;'>" +
            "<button style='border-color: transparent' class=\"btn btn-outline-danger\" aria-controls=\"collapseOne1\" aria-expanded=\"true\" data-toggle=\"collapse\" href=\"#result" + i + "\">" +
            "<i class=\"fa fa-window-close\" aria-hidden=\"true\">  Close Mail</i>" +
            "</button>" +
            "</div>" +
            "</div>" +
            "</div>" +
            "</fieldset>")
        if (thread === "thread" && i === 0) {
            threads.addModal(i, true, hits[i]["_source"]["numThread"], hits[i]["_source"]["maillist"])
        } else {
            threads.addModal(i, false, hits[i]["_source"]["numThread"], hits[i]["_source"]["maillist"])
        }
        res[1].forEach(elem => {
            Prism.highlightElement(document.getElementById(elem))
        })
        threads.findThread(mailList, hits[i]["_source"]["numThread"], i)
    }
    $(".btn_url_mails").click(function () {
        $("#url").html(this.value.split("___")[0] + "<br><br>" + "<a href='"+this.value.split("___")[1]+"' target='_blank'>Pipermail URL</a>")
        console.log(this.value.split("___")[0] + "\n\n" + this.value.split("___")[1])
        $("#alertModal").modal("show")
    })
    end_query = true
    return 0
}


function addSearchAttribute(input) {
    let search_bar = $("#search_bar");
    search_bar.val(search_bar.val() + " " + input + " ")
    search_bar.focus();
    var cursorPos = search_bar.prop('selectionStart');
    search_bar.prop('selectionEnd', cursorPos - 2)
}

function emptycontainers() {
    $("#modal_container").empty()
    $("#accordionEx").empty()
}

function return_timestamp(elem) {
    // console.log("TIMESTAMP : "  + elem)
    let temp = 0
    if (elem !== null) {
        temp = new Date(elem).getTime()
        if (isNaN(temp)) temp = 0
    }
    return temp
}

function formQuery(exec) {
    if (end_query === true) {
        if (exec === 1) {
            end_query = false
            $("#query_status").text("Fetching data")
            texts.orangeClass()
        }
        let mailListInput = $("#mailList");
        let totalString = $("#search_bar").val();
        let mailList = ""
        mailList = mailListInput.val()
        let startTimestamp = return_timestamp($("#datepicker").val());
        let endTimestamp = return_timestamp($("#datepicker2").val());
        // console.log("DEBUT : " + startTimestamp)
        // console.log("FIN : " + endTimestamp)
        if (endTimestamp === 0) endTimestamp = 9999999999999
        if (totalString === "") {
            if (mailList !== "" && mailList !== "ivoa_all") {
                let query_all = {
                    "size": 20,
                    "query": {
                        "bool": {
                            "must": [
                                {
                                    "term": {
                                        "maillist": {
                                            "value": mailList
                                        }
                                    }
                                },
                            ]
                        }
                    },
                    "sort": {
                        "timestamp": {"order": "asc"}
                    }
                }
                if (startTimestamp >= 0 && endTimestamp !== 0) {
                    query_all["query"]["bool"]["must"].push({
                        "range": {
                            "timestamp": {
                                "gte": startTimestamp / 1000,
                                "lte": endTimestamp / 1000,
                            }
                        }
                    })
                }
                if (exec === 1) {
                    executeQuery(query_all, mailList)
                }
                return query_all
            } else {
                let query_all = {
                    "size": 20,
                    "sort": {
                        "timestamp": {"order": "asc"}
                    }
                }
            }
            if (startTimestamp >= 0 && endTimestamp !== 0) {
                let query_all = {
                    "size": 20,
                    "query": {
                        "bool": {
                            "must": {
                                "range": {
                                    "timestamp": {
                                        "gte": startTimestamp / 1000,
                                        "lte": endTimestamp / 1000,
                                    }
                                }
                            }
                        }
                    },
                    "sort": {
                        "timestamp": {"order": "asc"}
                    }
                }
                if (exec === 1) {
                    executeQuery(query_all, mailList)
                }
                return query_all
                // $("#query_status").text("Error : you need to specify a current list and not 'All' for empty search field query")
                // texts.redClass()
                // end_query = true
                // return 0
            }
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
        let querySize = $("input[name='optradio']:checked").val()
        // let querySize = 20
        // if (numberInput.val() != null && numberInput.val() > 0 && numberInput.val() <= 110) {
        //     querySize = numberInput.val();
        // }
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
            if (global_index === 1) {
                if (mailList !== "ivoa_all") {
                    query["query"]["bool"]["must"].push({
                        "term": {"maillist": {"value": mailList}}
                    })
                }
            }
            if (fromRes !== null) fromRes.forEach(element => {
                let all = element.replace("(From:", "").replace(")", "").trim().toLowerCase().split(" ")
                let should = {
                    "bool": {
                        "should": []
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
                    "bool": {
                        "should": []
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
                    "bool": {
                        "should": []
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
                    "bool": {
                        "should": []
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
                    "bool": {
                        "should": []
                    }
                }
                all.forEach(second_element => {
                    should["bool"]["should"].push({
                        "wildcard": {"body": {"value": "*" + second_element + "*"}}
                    })
                })
                query["query"]["bool"]["must"].push(should)
            })
            if (totalString.replace(/\s*/g, "") !== "") totalString.split(" ").forEach(element => {
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
            if (startTimestamp >= 0 && endTimestamp !== 0) {
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
            if (global_index === 1) {
                if (mailList !== "ivoa_all") {
                    query["query"]["bool"]["must"].push({
                        "term": {"maillist": {"value": mailList}}
                    })
                }
            }
            if (fromRes !== null) fromRes.forEach(element => {
                let all = element.replace("(From:", "").replace(")", "").trim().toLowerCase().split(" ")
                let should = {
                    "bool": {
                        "should": []
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
                    "bool": {
                        "should": []
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
                    "bool": {
                        "should": []
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
                    "bool": {
                        "should": []
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
                    "bool": {
                        "should": []
                    }
                }
                all.forEach(second_element => {
                    should["bool"]["should"].push({
                        "wildcard": {"body": {"value": "*" + second_element + "*"}}
                    })
                })
                query["query"]["bool"]["should"].push(should)
            })
            if (totalString.replace(/\s*/g, "") !== "") totalString.split(" ").forEach(element => {
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
            if (startTimestamp >= 0 && endTimestamp !== 0) {
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
    } else {
        alert("Please Wait the end of current request before executing new one.")
        return 0
    }
}

function executeQuery(query, mailList, thread) {
    emptycontainers()
    let query_status = $("#query_status")
    if (global_index === 1) {
        return axios.get(elastic_search_url + "ivoa_all/_search", {
            params: {
                source: JSON.stringify(query),
                source_content_type: 'application/json'
            }
        }).then((res) => {
            let size = res.data.hits.hits.length;
            let trunc_msg = "";
            if( size == 10 || size == 20 || size == 50 || size == 150 ){
		trunc_msg = "(truncated)";
            }
            query_status.text(res.data.hits.hits.length + " mails found " + trunc_msg)
            texts.greenClass()
            traitementMessage(res.data.hits.hits, thread);
        }).catch(function (e) {
            alert("The server did not respond, please modify your request")
            query_status.text("ERROR : " + e)
            texts.redClass()
            console.log(e)
            end_query = true
        })
    } else {
        return axios.get(elastic_search_url + mailList + "/_search", {
            params: {
                source: JSON.stringify(query),
                source_content_type: 'application/json'
            }
        }).then((res) => {
            let trunc_msg = "";
            if( size == 10 || size == 20 || size == 50 || size == 150 ){
                trunc_msg = "(truncated)";
            }
            query_status.text(res.data.hits.hits.length + " mails found " + trunc_msg)
            texts.greenClass()
            traitementMessage(res.data.hits.hits, thread);
        }).catch(function (e) {
            end_query = true
            alert("The server did not respond, please modify your request")
            query_status.text("ERROR : " + e)
            texts.redClass()
            console.log(e)
        })
    }
}

function seeQuery() {
    let query = formQuery(0)
    $("#body_query").val(JSON.stringify(query, null, 2))
}

function manageDates() {
    let d1 = $("#datepicker")
    let d2 = $("#datepicker2")
    if (d1.val() !== "" && d2.val() === "") {
        d2.val(d1.val())
    }
    if (d2.val() !== "" && d1.val() === "") {
        d1.val(d2.val())
    }
}

function getUrlVars() {
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for (var i = 0; i < hashes.length; i++) {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}

function defaultQuery() {
    let params = getUrlVars()
    if (params["num"] !== undefined) {
        let query = {
            "query": {
                "term": {
                    "num": {
                        "value": params["num"]
                    }
                }
            }
        }
        let group =  params["num"].split("_")[0];
		$('#mailList').val(group);
        executeQuery(query,group)
    } else if (params["thread"] !== undefined) {
        let query = {
            "query": {
                "term": {
                    "numThread": {
                        "value": params["thread"]
                    }
                }
            },
            "sort": {
                "timestamp": {"order": "asc"}
            },
            "size": 1
        }
        let group =  params["thread"].split("_")[0];
		$('#mailList').val(group);
        executeQuery(query, group, "thread")
    } else if (params["search"] !== undefined) {
	    $('#search_bar').val(decodeURIComponent(params["search"].replace(/\+/g, ' ')));
        formQuery(1)
    }
}

export default {
    addSearchAttribute: addSearchAttribute,
    formQuery: formQuery,
    seeQuery: seeQuery,
    executeQuery: executeQuery,
    manageDates: manageDates,
    defaultQuery: defaultQuery,
}
