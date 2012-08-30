$(document).ready(function(){
        $.get("../../index.html", null,
              function(response, textStatus, jqXHR){
                  alert(response);
              });
    });
