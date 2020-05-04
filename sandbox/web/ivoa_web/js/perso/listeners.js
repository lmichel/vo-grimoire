import research from "./research.js";

$(document).ready(function(){
    $("#from_but").click(function(){
        research.addSearchAttribute("(From:)")
    })
    $("#to_but").click(function(){
        research.addSearchAttribute("(To:)")
    })
    $("#subject_but").click(function(){
        research.addSearchAttribute("(Subject:)")
    })
    $("#content_but").click(function(){
        research.addSearchAttribute("(Content:)")
    })
    $("#buttonQuery").click(function(){
        research.testAxios()
    })
    $("#executeQuery").click(function(){
        research.formQuery()
    })
    $("#search_button").click(function(){
        research.formQuery()
    })
})
