function highlight(content){
    let cont = JSON.stringify(content).split(/(?=\\n)/g)
    let total = ""
    cont.forEach(elem => {
        if(elem.replace(/ /g,"").includes(">")){
            if(elem.replace(/ /g,"").includes(">>")){
                if (elem.replace(/ /g,"").includes(">>>")){
                    if(elem.replace(/ /g,"").includes(">>>>")){
                        total += "<span class='ggggthan'>"+elem.replace(/\\n/g,"")+"</span>"+"\n"
                    }else{
                        total += "<span class='gggthan'>"+elem.replace(/\\n/g,"")+"</span>"+"\n"
                    }
                }else{
                    total += "<span class='ggthan'>"+elem.replace(/\\n/g,"")+"</span>"+"\n"
                }
            }else{
                total += "<span class='gthan'>"+elem.replace(/\\n/g,"")+"</span>"+"\n"
            }
        }else{
            total += elem.replace(/\\n/g,"") + "\n"
        }
    })
    return total.toString().substring(1,(total.toString().length)-2).replace(/\\t/g,"")
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
    return test.replace(/(\")/g,"\"")
}

export default {
    highlight,
    copyText,
    escapeBrackets,
    escapeSlashQuote
}