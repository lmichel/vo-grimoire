function addSearchAttribute(input){
    let search_bar = $("#search_bar");
    search_bar.val(search_bar.val() + " " + input +" ")
    search_bar.focus();
    var cursorPos = search_bar.prop('selectionStart');
    search_bar.prop('selectionEnd',cursorPos - 2)
}

export default {
    addSearchAttribute : addSearchAttribute,
}