function on_index_html(html) {
    // Look for patterns like:  href="couchbase-server-community_x86_64_2.0.0c-709-rel.rpm"
    var m = html.match(/href="([.]+)"/g);
    alert(m);
}

$(document).ready(function(){
        $.get("../../index.html", null,
              function(response, textStatus, jqXHR){
                  on_index_html(response);
              });
    });
