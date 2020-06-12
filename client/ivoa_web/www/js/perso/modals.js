import texts from "./texts.js";

function addThreadAttachements(attachements,numMail){
    let a = ""
    let ids = []
    if (attachements){
        let compteur = 0
        for (const [key, value] of Object.entries(JSON.parse(attachements))){
            let type = key.split("__")[0]
            let nom = key.split("__")[2]
            let encode = key.split("__")[1]
            let temp = "<br><div class='btn mt-2' style='cursor:default;border:1px solid; color:#6c757d;'><span>ATT : "+nom+" </span>"
            if (type.includes("text/")){
                let res = addTextAttachementModal(type,encode,nom.split(".")[0],value,nom,"text_modal_thread_"+numMail+"_"+compteur)
                temp += res[0]
                ids.push(res[1])
            }else if (type.includes("png") || type.includes("jpeg")){
                let res = addImageAttachementModal(type,encode,nom.split(".")[0],value,nom,"image_modal_thread_"+numMail+"_"+compteur)
                temp += res
            }else if (type.includes("pdf") || nom.includes(".pdf")){
                let res = addPdfAttachementModal(type,encode,nom.split(".")[0],value,nom,"pdf_modal_thread_"+numMail+"_"+compteur)
                temp += res
            }
            temp += "<a style='border-color: transparent;display: inline-block' class='btn btn-outline-secondary' title='Click here to download "+nom+"' href='data:"+type+";"+encode+','+encodeURI(value)+"' download='"+nom+
                "' ><span class=\"fa fa-download\"> Download </span></a>"
            a+= temp + "</div>"
        }
    }
    return [a,ids]
}

function addAttachements(attachements,numMail){
    let a = ""
    let ids = []
    let noms = ""
    if (attachements){
        let compteur = 0
        for (const [key, value] of Object.entries(JSON.parse(attachements))){
            let type = key.split("__")[0]
            let nom = key.split("__")[2]
            let encode = key.split("__")[1]
            if (!noms.includes(nom.split(".")[0])){
                let temp = "<br><div class='btn mt-2' style='cursor:default;border:1px solid; color:#6c757d;'><span>ATT : "+nom+" </span>"
                if (type.includes("text/")){
                    let res = addTextAttachementModal(type,encode,nom.split(".")[0],value,nom,"text_modal_"+numMail+"_"+compteur)
                    temp += res[0]
                    ids.push(res[1])
                }else if (type.includes("png") || type.includes("jpeg") || nom.includes("gif")){
                    let res = addImageAttachementModal(type,encode,nom.split(".")[0],value,nom,"image_modal_"+numMail+"_"+compteur)
                    temp += res
                }else if (type.includes("pdf") || nom.includes(".pdf")){
                    let res = addPdfAttachementModal(type,encode,nom.split(".")[0],value,nom,"pdf_modal_"+numMail+"_"+compteur)
                    temp += res
                }
                temp += "<a onclick='trackAction(\"Download attachement\")'style='border-color: transparent;display: inline-block' class='btn btn-outline-secondary' title='Click here to download "+nom+"' href='data:"+type+";"+encode+','+encodeURI(value).replace(/</g,"&lt").replace(/>/g,"&gt")+"' download='"+nom+
                    "' ><span class=\"fa fa-download\"> Download </span></a>"
                a+= temp + "</div>"
                noms += nom.split(".")[0]
            }
        }
    }
    return [a,ids]
}

function addImageAttachementModal(type,encode,nom,value,fullName,id){
    return "<button onclick='trackAction(\"See Image Attachement\")' style='border-color: transparent;display: inline-block' title='Display in a modal box "+fullName+"' type=\"button\" class=\"btn btn-outline-secondary \" data-target=\"#"+id+"\" data-toggle=\"modal\">" +
        "<span class=\"fa fa-eye\"> Show "+fullName+"</span>" +
        "</button>" +
        "<div aria-hidden=\"true\" class=\"modal fade\" id=\""+id+"\" role=\"dialog\" tabindex=\"-1\">" +
        "    <div class=\"modal-dialog modal-dialog-centered modal_ivoa\" role=\"document\">" +
        "        <div class=\"modal-content\">" +
        "            <div class=\"modal-header\">" +
        "                <h5 class=\"modal-title\">"+fullName+"</h5>" +
        "<button aria-label=\"Close\" class=\"close\" onclick='$(\"#"+id+"\").click()' type=\"button\">" +
        "<span class=\"thread_content\" aria-hidden=\"true\">&times;</span>" +
        "</button>" +
        "            </div>" +
        "            <div class=\"modal-body\">" +
        " <img style='display:block;width:100%;height:100%' class='base64image' src='data:"+type+";"+encode+","+encodeURI(value)+"'  alt='base64image'/>" +
        "            </div>" +
        "            <div class=\"modal-footer\">" +
        "                <button class=\"btn btn-secondary\" onclick='$(\"#"+id+"\").click()' type=\"button\">Close</button>" +
        "            </div>" +
        "        </div>" +
        "    </div>" +
        "</div>"
}

function addPdfAttachementModal(type,encode,nom,value,fullName,id){
    return "<button onclick='trackAction(\"See Pdf Attachement\")' title='Display in a modal box "+fullName+"' type=\"button\" style='border-color: transparent;' class=\"btn btn-outline-secondary\" style='display: inline-block' data-target=\"#"+id+"\" data-toggle=\"modal\">" +
        "<span class=\"fa fa-eye\"> Show </span>" +
        "</button>" +
        "<div aria-hidden=\"true\" class=\"modal fade\" id=\""+id+"\" role=\"dialog\" tabindex=\"-1\">" +
        "    <div class=\"modal-dialog modal-dialog-centered modal_ivoa\" role=\"document\">" +
        "        <div class=\"modal-content\" style='height:60em'>" +
        "            <div class=\"modal-header\">" +
        "                <h5 class=\"modal-title\" >"+fullName+"</h5>" +
        "<button aria-label=\"Close\" class=\"close\" onclick='$(\"#"+id+"\").click()' type=\"button\">" +
        "<span aria-hidden=\"true\">&times;</span>" +
        "</button>" +
        "            </div>" +
        "            <div class=\"modal-body\"  style='height:50%'>" +
        "<object width='100%' height='100%' data='data:application/pdf;"+encode+","+encodeURI(value)+"' type='application/pdf' class='pdf_modal'>" +
        " <embed src='data:application/pdf;"+encode+","+encodeURI(value)+"' type='application/pdf' ></object>" +
        "            </div>" +
        "            <div class=\"modal-footer\">" +
        "                <button class=\"btn btn-secondary\" onclick='$(\"#"+id+"\").click()' type=\"button\">Close</button>" +
        "            </div>" +
        "        </div>" +
        "    </div>" +
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
    return ["<button onclick='trackAction(\"See Pdf Attachement\")' style='border-color: transparent;display: inline-block' title='Display in a modal box "+fullName+"' type=\"button\" class=\"btn btn-outline-secondary \" data-target=\"#"+id+"\" data-toggle=\"modal\">" +
    "<span class=\"fa fa-eye\"> Show "+fullName+"</span>" +
    "</button>" +
    "<div aria-hidden=\"true\" class=\"modal fade\" id=\""+id+"\" role=\"dialog\" tabindex=\"-1\">" +
    "    <div class=\"modal-dialog modal-dialog-centered modal_ivoa\" role=\"document\">" +
    "        <div class=\"modal-content\">" +
    "            <div class=\"modal-header\">" +
    "                <h5 class=\"modal-title\" >"+fullName+"</h5>" +
    "<button aria-label=\"Close\" class=\"close\" onclick='$(\"#"+id+"\").click()' type=\"button\">" +
    "<span class=\"thread_content\" aria-hidden=\"true\">&times;</span>" +
    "</button>" +
    "            </div>" +
    "            <div class=\"modal-body\">" +
    "<pre><code id='"+id2+"' class='language-"+extension+"'>"+texts.escapeBrackets(content)+"</code></pre>" +
    "            </div>" +
    "            <div class=\"modal-footer\">" +
    "                <button class=\"btn btn-secondary\" onclick='$(\"#"+id+"\").click()' type=\"button\">Close</button>" +
    "            </div>" +
    "        </div>" +
    "    </div>" +
    "</div>",id2]
}

export default {
    addAttachements,
    addThreadAttachements
}