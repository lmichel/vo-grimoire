// let fromReg = '\(From:\d*\w*\)';
let fromReg = new RegExp("\\(From:[^)]*\\)",'g')
// let toReg = '\(To:\d*\w*\)';
let toReg = new RegExp("\\(To:[^)]*\\)",'g')
// let subjectReg= '\(Subject:\d*\w*\)'
let subjectReg = new RegExp("\\(Subject:[^)]*\\)",'g')
// let contentReg = '\(Content:\d*\w*\)'
let contentReg = new RegExp("\\(Content:[^)]*\\)",'g')
function addSearchAttribute(input){
    let search_bar = $("#search_bar");
    search_bar.val(search_bar.val() + " " + input +" ")
    search_bar.focus();
    var cursorPos = search_bar.prop('selectionStart');
    search_bar.prop('selectionEnd',cursorPos - 2)
}

function testAxios(){
    // return axios.get("http://192.168.1.48:9200/edu/_search",{
    //     data: JSON.stringify({
    //             "size":1,
    //             "query":{
    //                 "match_all":{}
    //             },
    //         }
    //     ),
    //     responseType: 'json',
    // }).then((res)=>{
    //     traitementMessage(res.data.hits.hits);
    // }).catch(function(e){console.log(e)})
    return axios.get("http://83.194.254.94:9200/edu/_search",{
        data: JSON.stringify({
                "size":1,
                "query":{
                    "match_all":{}
                },
            }
        ),
        responseType: 'json',
    }).then((res)=>{
        traitementMessage(res.data.hits.hits);
    }).catch(function(e){console.log(e)})
}

function traitementMessage(hits){
    for (let i=0; i<hits.length; i++){
        $("#accordionEx").append("<fieldset>\n" +
            "<legend>\n" +
            "<a aria-controls=\"collapseOne1\" aria-expanded=\"false\" class=\"lienLegend\"\n" +
            "data-toggle=\"collapse\" href=\"#result"+i+"\">\n" +
            "    28/04/2020 (apps) Tutoring Enzo Cis...\n" +
            "</a>\n" +
            "</legend>\n" +
            "<div aria-labelledby=\"headingOne1\" class=\"collapse\" data-parent=\"#accordionEx\" id=\"result"+i+"\"\n" +
            "role=\"tabpanel\">\n" +
            "    <div class=\"m-2 card-body p-1\">\n" +
            "    <i>FROM :</i> <br> &emsp;"+ hits[i]["_source"]["from"] +"<br>\n" +
            "<i>TO :</i> <br> &emsp;"+ hits[i]["_source"]["to"] +"<br>\n" +
            "<i>SUBJECT :</i> <br> &emsp;"+ hits[i]["_source"]["subject"] +"<br>\n" +
            "<i>DATE :</i> <br> &emsp;"+ hits[i]["_source"]["date"] +" <br>\n" +
            "<i>CONTENT :</i> <br> &emsp;<pre>"+ hits[i]["_source"]["body"]["plain"] +"</pre><br>\n" +
            "</div>\n" +
            "<div>\n" +
            "<button class=\"btn btn-link\" data-target=\"#edu_result_1\" data-toggle=\"modal\" type=\"button\">\n" +
            "    View Thread\n" +
            "</button>\n" +
            "</div>\n" +
            "</div>\n" +
            "</fieldset>")
    }
}

function formQuery(){
    let totalString = $("#search_bar").val();
    let fromRes = totalString.match(fromReg)
    let toRes = totalString.match(toReg)
    let subjectRes = totalString.match(subjectReg)
    let contentRes = totalString.match(contentReg)
    totalString = totalString.replace(fromReg,"")
    totalString = totalString.replace(toReg,"")
    totalString = totalString.replace(subjectReg,"")
    totalString = totalString.replace(contentReg,"")
    totalString = totalString.trim()
    let numberInput = $("#inputQuerySize");
    let mailListInput = $("#mailList");
    let startPeriodInput = $("#datepicker");
    let endPeriodInput = $("#datepicker2");
    let querySize = 100
    if (numberInput.val() != null && numberInput.val() > 0){
        querySize = numberInput.val();
    }
    let mailList = ""
    switch (mailListInput.val()) {
        case "Choose Mailing List (apps by default)":
            mailList = "apps"
            break;
        case "Applications":
            mailList = "apps"
            break;
        case "Data Access Layer":
            mailList = "dal"
            break;
        case "Data Model":
            mailList = "dm"
            break;
        case "Grid & Web Services":
            mailList  = "grid"
            break;
        case "Registry":
            mailList = "registry"
            break;
        case "Semantics":
            mailList = "semantics"
            break;
        default:
            mailList = "apps"
            break;
    }
    let startTimestamp = 0;
    let endTimestamp = 0;
    if (startPeriodInput.val() != null){
        startTimestamp = new Date(startPeriodInput.val()).getTime()
        if(isNaN(startTimestamp)) startTimestamp = 0;
    }
    if (endPeriodInput.val() != null){
        endTimestamp = new Date(endPeriodInput.val()).getTime()
        if (isNaN(endTimestamp)) endTimestamp = 0;
    }
    console.log("Mailing List : " + mailList)
    console.log("Number of mails : " + querySize)
    console.log("Start Period : " + startTimestamp)
    console.log("End Period : " + endTimestamp)

    let query = {
        "size": querySize,
        "query":{
            "bool":{
                "must":[]
            }
        }
    }
    if (fromRes !== null) fromRes.forEach(element => {
        query["query"]["bool"]["must"].push({
            "match":{"from": element.replace("(From:","").replace(")","").trim()}
        })
    })
    if (toRes !== null) toRes.forEach(element => {
        query["query"]["bool"]["must"].push({
            "match":{"to": element.replace("(To:","").replace(")","").trim()}
        })
    })
    if (subjectRes !== null) subjectRes.forEach(element => {
        query["query"]["bool"]["must"].push({
            "match":{"to": element.replace("(Subject:","").replace(")","").trim()}
        })
    })
    if (contentRes !== null) contentRes.forEach(element => {
        query["query"]["bool"]["must"].push({
            "match":{"content": element.replace("(Content:","").replace(")","").trim()}
        })
    })
    if (totalString !== ""){
        query["query"]["bool"]["must"].push({
            "match_phrase":{"content": totalString}
        })
    }
    console.log(query);
}

export default {
    addSearchAttribute : addSearchAttribute,
    testAxios : testAxios,
    formQuery : formQuery,
}