function highlight(content){
    console.log(content.includes(">"))
    let cont = JSON.stringify(content).split(/(?=\\n)/g)
    let total = ""
    cont.forEach(elem => {
        if(elem.includes(">")){
            if(elem.includes(">>")){
                if (elem.includes(">>>")){
                    if(elem.includes(">>>>")){
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
    console.log(url)
    let el = document.createElement('textarea');
    el.value = url;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
}

export default {
    highlight,
    copyText,
}