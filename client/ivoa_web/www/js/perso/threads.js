let compteur = 0
let global_index = 1
let elastic_search_url = "http://192.168.1.48:9200/"
// let elastic_search_url = "http://saada.unistra.fr/elasticsearch/"
function findThread(mailList, numThread, num) {
    let query = {
        "query": {
            "term": {
                "numThread": {
                    "value": numThread
                }
            }
        },
        "sort": {
            "timestamp": {"order": "asc"}
        }
    }
    if(global_index === 1){
        return axios.get(elastic_search_url + "ivoa_all/_search", {
            params: {
                source: JSON.stringify(query),
                source_content_type: 'application/json'
            }
        }).then((res) => {
            addThreadModal(res.data.hits.hits, num)
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
            addThreadModal(res.data.hits.hits, num)
        }).catch(function (e) {
            console.log(e)
        })
    }
}

function addThreadModal(refs, num) {
    let total = ""
    compteur = 1
    refs.forEach(elem => {
        let date = moment(elem["_source"]["timestamp"] * 1000).format("DD/MM/YYYY")
        $("#accordionEx" + num).append("<fieldset class=\"field-modal\" style=\"margin-left:" + compteur + "%\">\n" +
            "    <legend class=\"lef-modal\">\n" +
            "        <a aria-controls=\"collapseOne1\" aria-expanded=\"true\" class=\"lienLegend\" data-toggle=\"collapse\" href=\"#result_" + compteur + "\">" +
            total + "           <strong>N°:" + compteur + " </strong>" + date + "<strong> From : </strong> " + elem["_source"]["from"].replace("<", "&lt").replace(">", "&gt") + "" +
            "<strong> Subject : </strong>" + elem["_source"]["subject"] +
            "        </a>\n" +
            "    </legend>\n" +
            "    <div aria-labelledby=\"headingOne1\" class=\"collapse\" data-parent=\"#accordionEx" + compteur + "\" id=\"result_" + compteur + "\" role=\"tabpanel\" style=\"\">\n" +
            "<div class=\"m-2 card-body p-1\">\n" +
            "    <i>From : </i>\n" + elem["_source"]["from"] +
            "    <i>&emsp;To : </i>\n" + elem["_source"]["to"] + "<br>" + addAttachements(elem["_source"]["attachements"]) + "<br>" +
            "    <pre>\n" +
            elem["_source"]["body"].replace(/<img[^>]*>/,"") +
            "    </pre>\n" +
            "</div>" +
            "    </div>\n" +
            "</fieldset>"
        )
        compteur += 1
    })
    return [total, compteur]
}

function addAttachements(attachements){
    let a = ""
    if (attachements){
        for (const [key, value] of Object.entries(JSON.parse(attachements))){
            let type = key.split("__")[0]
            let nom = key.split("__")[2]
            let encode = key.split("__")[1]
            if (type.includes("text/")){
                a += addTextAttachementModal(type,encode,nom.split(".")[0],value,nom)
            }
            if(nom.length > 1){
                a += "<a href='data:"+type+";"+encode+','+encodeURI(value)+"' download='"+nom+"' >"+nom+"</a>" + "\n"
            }else{
                a += "<a href='data:"+type+";"+encode+','+encodeURI(value)+"' download='"+nom+"' >"+"No Name : " + nom+"</a>" + "\n"
            }
        }
    }
    return a
}

function addTextAttachementModal(type,encode,nom,value,fullName){
    let extension = ""
    if (fullName.includes(".")){
        extension = fullName.split(".")[1]
    }else{
        extension = "html"
    }
    let content = ""
    if (encode.includes("base64")){
        content = atob(value)
    }else{
        content = decodeURI(value)
    }
    let id = nom + "_prism"
    return ["<a class=\"btn btn-secondary text-white mt-3 mb-3 d-block\" data-target=\"#thread_"+nom+"\" data-toggle=\"modal\" target=\"_blank\">Show "+fullName+"</a>\n" +
    "<div aria-hidden=\"true\" aria-labelledby=\"exampleModalCenterTitle\" class=\"modal fade\" id=\"thread_"+nom+"\" role=\"dialog\" tabindex=\"-1\">\n" +
    "    <div class=\"modal-dialog modal-dialog-centered modal_ivoa\" role=\"document\">\n" +
    "        <div class=\"modal-content\">\n" +
    "            <div class=\"modal-header\">\n" +
    "                <h5 class=\"modal-title\" id=\"exampleModalCenterTitle2\">"+fullName+"</h5>\n" +
    "                <button aria-label=\"Close\" class=\"close\" data-dismiss=\"modal\" type=\"button\">\n" +
    "                    <span class=\"thread_content\" aria-hidden=\"true\"></span>\n" +
    "                </button>\n" +
    "            </div>\n" +
    "            <div class=\"modal-body\">\n" +
    "<pre><code id='"+id+"' class='language-"+extension+"'>"+content.replace(/</g,"&lt").replace(/>/g,"&gt")+"</code></pre>" +
    "            </div>\n" +
    "            <div class=\"modal-footer\">\n" +
    "                <button class=\"btn btn-secondary\" data-dismiss=\"modal\" type=\"button\">Close</button>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>",id]
}

function addModal(num, thread) {
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
    if (thread === true) {
        $("#edu_result_" + num).modal('show')
    }
}

// function testRequest() {
//     return axios.get("http://192.168.1.48:9200/dm/_search", {
//         params: {
//             source: JSON.stringify({
//                 "query":{
//                 "match_phrase":{
//                     "numThread": "<200512200833.JAA04298@alinda.u-strasbg.fr>"
//                 }}
//             })
//             ,
//             source_content_type: 'application/json'
//         }
//     }).then((res) => {
//         console.log(res.data.hits.hits)
//     }).catch(function (e) {
//         console.log(e)
//     })
// }

export default {
    addModal: addModal,
    findThread: findThread
}