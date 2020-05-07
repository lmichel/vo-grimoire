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
        research.seeQuery()
    })
    $("#executeQuery").click(function(){
        research.formQuery()
    })
    $("#search_button").click(function(){
        research.formQuery(1)
    })
    $("#modif_query").click(function(){
        console.log(JSON.parse($("#body_query").val()));
        research.executeQuery(JSON.parse($("#body_query").val()),$("#mailList").val())
    })
    $('input[type=text]').on('keydown', function(e) {
        if (e.which === 13) {
            research.formQuery(1)
        }
    });
})
