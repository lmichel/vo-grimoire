let regexMail = new RegExp(/<[^>]*>/, 'g')
function highlight(content){
    let cont = JSON.stringify(content).split(/(?=\\n)/g)
    let total = ""
    // console.log(JSON.stringify(content))
    cont.forEach(elem => {
        if(elem.replace(/ /g,"").includes(">")){
            if(elem.replace(/ /g,"").includes(">>")){
                if (elem.replace(/ /g,"").includes(">>>")){
                    if(elem.replace(/ /g,"").includes(">>>>")){
                        total += "<span class='ggggthan'>"+escapeSlashQuote(supMails(elem.replace(/\\n/g,"")))+"</span>"+"\n"
                    }else{
                        total += "<span class='gggthan'>"+escapeSlashQuote(supMails(elem.replace(/\\n/g,"")))+"</span>"+"\n"
                    }
                }else{
                    total += "<span class='ggthan'>"+escapeSlashQuote(supMails(elem.replace(/\\n/g,"")))+"</span>"+"\n"
                }
            }else{
                total += "<span class='gthan'>"+escapeSlashQuote(supMails(elem.replace(/\\n/g,"")))+"</span>"+"\n"
            }
        }else{
            // if(elem !== ""){
                total += escapeSlashQuote(supMails(elem.replace(/\\n/g,""))) + "\n"
            // }
        }
    })
    return total.toString().substring(1,(total.toString().length)-2).replace(/\\t/g,"")
}

function supMails(val){
    // let res = val
    return val.replace("@","__AT__")
}

function copyText(url){
    let el = document.createElement('textarea');
    el.value = url;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
}

function escapeBrackets(text){
    return text.replace(/</g,"&lt").replace(/>/g,"&gt")
}

function escapeSlashQuote(text){
    return text.replace(/\\"/g,"\"")
}

function redClass(){
    $("#query_status").toggleClass("red")
    $("#query_status").removeClass("orange")
    $("#query_status").removeClass("green")
}

function greenClass(){
    $("#query_status").removeClass("red")
    $("#query_status").removeClass("orange")
    $("#query_status").toggleClass("green")
}

function orangeClass(){
    $("#query_status").removeClass("red")
    $("#query_status").add("orange")
    $("#query_status").removeClass("green")
}

export default {
    highlight,
    copyText,
    escapeBrackets,
    redClass,
    greenClass,
    orangeClass
}