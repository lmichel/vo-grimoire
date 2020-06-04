let compteur = 0
let global_index = 1
import modals from "./modals.js"

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
    if (global_index === 1) {
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
    } else {
        return axios.get(elastic_search_url + mailList + "/_search", {
            params: {
                source: JSON.stringify(query),
                source_content_type: 'application/json'
            }
        }).then((res) => {
            addThreadModal(res.data.hits.hits, num + 1)
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
        $("#accordionEx" + num).append(
            "<fieldset class=\"field-modal\" style=\"margin-left:" + compteur + "%\">" +
            "<legend class=\"lef-modal\">" +
            "<a aria-controls=\"collapseOne1\" aria-expanded=\"true\" class=\"lienLegend\" data-toggle=\"collapse\" href=\"#result_" + compteur + "\">" + total +
            "<strong>N°:" + compteur + " </strong>" + date + "<strong> From : </strong> " + elem["_source"]["from"].replace("<", "&lt").replace(">", "&gt") + "" +
            "<strong> Subject : </strong>" + elem["_source"]["subject"] +
            "</a>" +
            "</legend>" +
            "<div aria-labelledby=\"headingOne1\" class=\"collapse\" data-parent=\"#accordionEx" + num + "\" id=\"result_" + compteur + "\" role=\"tabpanel\" style=\"\">" +
            "<div class=\"m-2 card-body p-1\">" +
            "<i>From : </i>" + elem["_source"]["from"] +
            "<i>&emsp;To : </i>" + elem["_source"]["to"] + "<br>" + modals.addThreadAttachements(elem["_source"]["attachements"],num) + "<br>" +
            "<pre>" + elem["_source"]["body"].replace(/<img[^>]*>/, "") +
            "</pre>" +
            "</div>" +
            "</div>" +
            "</fieldset>"
        )
        compteur += 1
    })
    return [total, compteur]
}

function addModal(num, thread, numThread) {
    let url = ""
    url = location.protocol + '//' + location.host + location.pathname +"?thread="+numThread
    $("#modal_container").append(
        "<div aria-hidden=\"true\" aria-labelledby=\"exampleModalCenterTitle\" class=\"modal fade\" id=\"edu_result_" + num + "\" role=\"dialog\" tabindex=\"-1\">" +
        "<div class=\"modal-dialog modal-dialog-centered modal_ivoa\" role=\"document\">" +
        "<div class=\"modal-content\">" +
        "<div class=\"modal-header\">" +
        "<h5 class=\"modal-title\" id=\"exampleModalCenterTitle2\"><a class=\"modal-title\" href=\"" + url + "\" target=\"_blank\">Link for this thread :" + url + "</a></h5>" +
        "<button aria-label=\"Close\" class=\"close\" data-dismiss=\"modal\" type=\"button\">" +
        "<span class=\"thread_content\"" + num + " aria-hidden=\"true\">&times;</span>" +
        "</button>" +
        "</div>" +
        "<div class=\"modal-body\" id=\"modal-body-" + num + "\">" +
        "<div id=\"accordionEx" + num + "\" aria-multiselectable=\"true\" class=\"accordion md-accordion\" role=\"tablist\"></div>" +
        "</div>" +
        "<div class=\"modal-footer\">" +
        "<button class=\"btn btn-secondary\" data-dismiss=\"modal\" type=\"button\">Close</button>" +
        "</div>" +
        "</div>" +
        "</div>" +
        "</div>")
    if (thread === true) {
        $("#edu_result_" + num).modal('show')
    }
}

export default {
    addModal: addModal,
    findThread: findThread
}