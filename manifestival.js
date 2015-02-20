var products = [
  "couchbase-server"
];

console.log("manifestival awakes");

var scriptServer = "127.0.0.1:8000"
var scripts = [
    "jquery-2.1.3.min.js",
    "js-yaml-3.2.6.min.js",
    "underscore-1.7.0.min.js",
    "velocity-1.2.2/velocity.min.js",
    "velocity-1.2.2/velocity.ui.min.js"
];

function loadScripts() {
    var s = scripts.shift();
    if (!s) {
        return main();
    }
    var e = document.createElement("script");
    e.id = "script-" + s;
    e.src = "http://" + scriptServer + "/js/" + s;
    if (e.addEventListener) {
        e.addEventListener("load", loadScripts, false);
    } else if (e.readyState) {
        e.onreadystatechange = loadScripts;
    }
    document.body.appendChild(e);
}

loadScripts();

// ---------------------------------------------------------------

function main() {
    console.log("manifestival main");
    for (var i = 0; i < products.length; i++) {
        loadProduct(products[i]);
    }
}

function loadProduct(product) { // Ex: "couchbase-server".
    console.log("loadProduct", product);
    $.ajax("/" + product, {
        success: function(h) {
            var hrefs = h.match(/href="[a-z][a-z\-_0-9]+\/"/g);
            for (var i = 0; hrefs && i < hrefs.length; i++) {
                var release = hrefs[i].split('"')[1].replace('/', ''); // Ex: "sherlock".
                loadProductRelease(product, release);
            }
        }
    });
}

function loadProductRelease(product, release) {
    console.log("loadProductRelease", product, release);
    $.ajax("/" + product + "/" + release, {
        success: function(h) {
            var hrefs = h.match(/href="[0-9][0-9]+\/"/g);
            for (var i = 0; hrefs && i < hrefs.length; i++) {
                var build = hrefs[i].split('"')[1].replace('/', ''); // Ex: "1129".
                loadProductReleaseBuild(product, release, build);
            }
        }
    });
}

function loadProductReleaseBuild(product, release, build) {
    console.log("loadProductReleaseBuild", product, release, build);
}
