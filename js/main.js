function on_index_html(html) {
    // Look for patterns like:  href="couchbase-server-community_x86_64_2.0.0c-709-rel.rpm"
    var hrefs = html.match(/href="[^\"]+"/g);
    for (var i = 0; i < hrefs.length; i++) {
        href = hrefs[i];
        console.debug(href);
    }
}

$(document).ready(function(){
        $.get("../../index.html", null,
              function(response, textStatus, jqXHR){
                  on_index_html(response);
              });
    });
