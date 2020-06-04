function addThreadAttachements(attachements,numMail){
    let a = ""
    let ids = []
    if (attachements){
        let compteur = 0
        for (const [key, value] of Object.entries(JSON.parse(attachements))){
            let type = key.split("__")[0]
            let nom = key.split("__")[2]
            let encode = key.split("__")[1]
            if (type.includes("text/")){
                let res = addTextAttachementModal(type,encode,nom.split(".")[0],value,nom,"text_modal_thread_"+numMail+"_"+compteur)
                a += res[0] + "<br>"
                ids.push(res[1])
            }else if (type.includes("png") || type.includes("jpeg")){
                let res = addImageAttachementModal(type,encode,nom.split(".")[0],value,nom,"image_modal_thread_"+numMail+"_"+compteur)
                a += res + "<br>"
            }else if (type.includes("pdf") || nom.includes(".pdf")){
                let res = addPdfAttachementModal(type,encode,nom.split(".")[0],value,nom,"pdf_modal_thread_"+numMail+"_"+compteur)
                a += res + "<br>"
            }
            a += "<a href='data:"+type+";"+encode+','+encodeURI(value).replace(/</g,"&lt").replace(/>/g,"&gt")+"' download='"+nom+"' >Download Link : "+nom+"</a>" + "\n"
        }
    }
    return [a,ids]
}

function addAttachements(attachements,numMail){
    let a = ""
    let ids = []
    if (attachements){
        let compteur = 0
        for (const [key, value] of Object.entries(JSON.parse(attachements))){
            let type = key.split("__")[0]
            let nom = key.split("__")[2]
            let encode = key.split("__")[1]
            if (type.includes("text/")){
                let res = addTextAttachementModal(type,encode,nom.split(".")[0],value,nom,"text_modal_"+numMail+"_"+compteur)
                a += res[0] + "<br>"
                ids.push(res[1])
            }else if (type.includes("png") || type.includes("jpeg")){
                let res = addImageAttachementModal(type,encode,nom.split(".")[0],value,nom,"image_modal_"+numMail+"_"+compteur)
                a += res + "<br>"
            }else if (type.includes("pdf") || nom.includes(".pdf")){
                let res = addPdfAttachementModal(type,encode,nom.split(".")[0],value,nom,"pdf_modal_"+numMail+"_"+compteur)
                a += res + "<br>"
            }
            a += "<a href='data:"+type+";"+encode+','+encodeURI(value).replace(/</g,"&lt").replace(/>/g,"&gt")+"' download='"+nom+"' >Download Link : "+nom+"</a>" + "\n"
        }
    }
    return [a,ids]
}

function addImageAttachementModal(type,encode,nom,value,fullName,id){
    return "<a class=\"btn btn-secondary text-white mt-3 mb-3 d-block\" data-target=\"#"+id+"\" data-toggle=\"modal\" target=\"_blank\">Show "+fullName+"</a>\n" +
        "<div aria-hidden=\"true\" aria-labelledby=\"exampleModalCenterTitle\" class=\"modal fade\" id=\""+id+"\" role=\"dialog\" tabindex=\"-1\">\n" +
        "    <div class=\"modal-dialog modal-dialog-centered modal_ivoa\" role=\"document\">\n" +
        "        <div class=\"modal-content\">\n" +
        "            <div class=\"modal-header\">\n" +
        "                <h5 class=\"modal-title\" id=\"exampleModalCenterTitle2\">"+fullName+"</h5>\n" +
        "                <button aria-label=\"Close\" class=\"close\" data-dismiss=\"modal\" type=\"button\">\n" +
        "                    <span class=\"thread_content\" aria-hidden=\"true\"></span>\n" +
        "                </button>\n" +
        "            </div>\n" +
        "            <div class=\"modal-body\">\n" +
        " <img style='display:block;width:100%;height:100%' class='base64image' src='data:"+type+";"+encode+","+encodeURI(value)+"'  alt='base64image'/>" +
        "            </div>\n" +
        "            <div class=\"modal-footer\">\n" +
        "                <button class=\"btn btn-secondary\" data-dismiss=\"modal\" type=\"button\">Close</button>\n" +
        "            </div>\n" +
        "        </div>\n" +
        "    </div>\n" +
        "</div>"
}

function addPdfAttachementModal(type,encode,nom,value,fullName,id){
    return "<a class=\"btn btn-secondary text-white mt-3 mb-3 d-block\" data-target=\"#"+id+"\" data-toggle=\"modal\" target=\"_blank\">Show "+fullName+"</a>\n" +
        "<div aria-hidden=\"true\" aria-labelledby=\"exampleModalCenterTitle\" class=\"modal fade\" id=\""+id+"\" role=\"dialog\" tabindex=\"-1\">\n" +
        "    <div class=\"modal-dialog modal-dialog-centered modal_ivoa\" role=\"document\">\n" +
        "        <div class=\"modal-content\" style='height:60em'>\n" +
        "            <div class=\"modal-header\">\n" +
        "                <h5 class=\"modal-title\" id=\"exampleModalCenterTitle2\">"+fullName+"</h5>\n" +
        "                <button aria-label=\"Close\" class=\"close\" data-dismiss=\"modal\" type=\"button\">\n" +
        "                    <span class=\"thread_content\" aria-hidden=\"true\"></span>\n" +
        "                </button>\n" +
        "            </div>\n" +
        "            <div class=\"modal-body\"  style='height:50%'>\n" +
        "<object width='100%' height='100%' data='data:application/pdf;"+encode+","+encodeURI(value)+"' type='application/pdf' class='pdf_modal'>" +
        " <embed src='data:application/pdf;"+encode+","+encodeURI(value)+"' type='application/pdf' ></object>" +
        "            </div>\n" +
        "            <div class=\"modal-footer\">\n" +
        "                <button class=\"btn btn-secondary\" data-dismiss=\"modal\" type=\"button\">Close</button>\n" +
        "            </div>\n" +
        "        </div>\n" +
        "    </div>\n" +
        "</div>"
}

function addTextAttachementModal(type,encode,nom,value,fullName,id){
    let extension = ""
    if (fullName.includes(".")){
        extension = fullName.split(".")[1]
    }else{
        extension = "html"
    }
    let content = ""
    if (encode.toLowerCase().includes("base64")){
        content = atob(value)
    }else{
        try{
            content = decodeURI(value)
        }catch {
            console.log("Erreur Pièce Jointe")
        }
    }
    let id2 = id + "_prism"
    return ["<a class=\"btn btn-secondary text-white mt-3 mb-3 d-block\" data-target=\"#"+id2+"\" data-toggle=\"modal\" target=\"_blank\">Show "+fullName+"</a>\n" +
    "<div aria-hidden=\"true\" aria-labelledby=\"exampleModalCenterTitle\" class=\"modal fade\" id=\""+id2+"\" role=\"dialog\" tabindex=\"-1\">\n" +
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
    "</div>",id2]
}

export default {
    addAttachements,
    addThreadAttachements
}