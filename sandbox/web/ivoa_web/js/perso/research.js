function addSearchAttribute(input){
    let search_bar = $("#search_bar");
    search_bar.val(search_bar.val() + " " + input +" ")
    search_bar.focus();
}

export default {
    addSearchAttribute : addSearchAttribute,
}