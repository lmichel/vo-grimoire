import research from "./research.js";
import threads from "./threads.js"
import texts from "./texts.js";
$(document).ready(function(){
    research.defaultQuery()
    $("#from_but").click(function(){
        research.addSearchAttribute("(From:)")
        trackAction("Click on From")
    })
    $("#to_but").click(function(){
        research.addSearchAttribute("(To:)")
        trackAction("Click on To")
    })
    $("#subject_but").click(function(){
        research.addSearchAttribute("(Subject:)")
        trackAction("Click on Subject")
    })
    $("#attachements_but").click(function(){
        research.addSearchAttribute("(Attachements:)")
        trackAction("Click on Attachements")
    })
    $("#content_but").click(function(){
        research.addSearchAttribute("(Content:)")
        trackAction("Click on Content")
    })
    $("#buttonQuery").click(function(){
        research.seeQuery()
        trackAction("Click See Query Button")
    })
    $("#executeQuery").click(function(){
        research.formQuery()
    })
    $("#do_research").click(function(){
        research.formQuery(1)
        trackAction("Do Query")
    })
    $("#launch_query").click(function(){
        research.formQuery(1)
        trackAction("Do Query(advanced parameters)")
    })
    $("#modif_query").click(function(){
        research.executeQuery(JSON.parse($("#body_query").val()),$("#mailList").val())
        trackAction("User-Modified Query executed")
    })
    $('input[type=text]').on('keydown', function(e) {
        if (e.which === 13) {
            research.formQuery(1)
            trackAction("Do Query")
        }
    });
    // $("#query_method").on("change",function(){
    //     research.formQuery(1)
    //     trackAction("User change query method")
    // })
    // $("#sort_method").on("change",function(){
    //     research.formQuery(1)
    //     trackAction("User changed sorting")
    // })
    // $("#inputQuerySize").on("change",function(){
    //     research.formQuery(1)
    //     trackAction("User changed query size")
    // })
    $("#datepicker").on("blur",function(){
        research.manageDates()
        trackAction("Date 1 modified")
    })
    $("#datepicker2").on("blur",function(){
        research.manageDates()
        trackAction("Date 2 modified")
    })
    // $("form").submit(function(e){
    //     e.preventDefault()
    //     return false
    // })
})