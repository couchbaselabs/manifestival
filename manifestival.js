console.log("manifestival awakes");

var scriptServer = "127.0.0.1:8000"
var scriptsWanted = [];
var scriptsReady = [];

function addScript(s) {
    scriptsWanted.push(s);
    var e = document.getElementById("script-" + s);
    if (!e) {
        e = document.createElement("script");
        e.id = "script-" + s;
        e.src = "http://" + scriptServer + "/js/" + s;
        function scriptReady() {
            scriptsReady.push(s);
            if (scriptsReady.length >= scriptsWanted.length) {
                main();
            }
        }
        if (e.addEventListener) {
            e.addEventListener("load", scriptReady, false);
        } else if (e.readyState) {
            e.onreadystatechange = scriptReady;
        }
        document.body.appendChild(e);
    }
}

addScript("jquery-2.1.3.min.js");
addScript("js-yaml-3.2.6.min.js");
addScript("underscore-1.7.0.min.js");
addScript("velocity-1.2.2/velocity.min.js");
addScript("velocity-1.2.2/velocity.ui.min.js");

function main() {
    console.log("manifestival is ready to PARTY!");
}
