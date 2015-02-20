var products = [
  "couchbase-server"
];

console.log("manifestival awakes");

if (!window.scriptServer) {
    window.scriptServer = "127.0.0.1:8000";
}

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

var m = {}; // Map of product.release.build.artifact hierarchy.

var facets = {
    arch: {},
    ext: {},
    platform: {},
    product: {},
    release: {}
};

function main() {
    console.log("manifestival main");

    $("body").html("loading data...");

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

    $.ajax("/" + product + "/" + release + "/" + build, {
        success: function(h) {
            var hrefs = h.match(/href="[a-z][a-z0-9\.\-_]+"/g);
            for (var i = 0; hrefs && i < hrefs.length; i++) {
                // Example artifacts...
                //   couchbase-server-3.5.0-1326-manifest.xml
                //   couchbase-server-enterprise-3.5.0-1326-centos6.x86_64.rpm
                //   couchbase-server-enterprise-3.5.0-1326-centos7.x86_64.rpm
                //   couchbase-server-enterprise_3.5.0-1326-debian7_amd64.deb
                //   couchbase-server-enterprise_3.5.0-1326-macos_x86_64.zip
                //   couchbase-server-enterprise_3.5.0-1326-ubuntu12.04_amd64.deb
                //   couchbase-server-enterprise_3.5.0-1326-ubuntu14.04_amd64.deb
                //   couchbase-server-enterprise_3.5.0-1326-windows_amd64.exe
                //   couchbase-server-enterprise_3.5.0-1326-windows_x86.exe
                var artifact = hrefs[i].split('"')[1];
                loadProductReleaseBuildArtifact(product, release, build, artifact);
            }
        }
    });
}

function loadProductReleaseBuildArtifact(product, release, build, artifact) {
    console.log("loadProductReleaseBuildArtifact", product, release, build, artifact);

    var dots = artifact.split(".");
    var ext = dots[dots.length - 1]; // "rpm", "deb", "zip", "exe", "xml".

    var basename = dots.slice(0, dots.length - 1).join("."); // "couchbase-server-enterprise-3.5.0-1326-centos6.x86_64".
    var noProduct = basename.substring(product.length + 1);  // "enterprise-3.5.0-1326-centos6.x86_64".

    // "centos6.x86_64", "macos_x86_64", "ubuntu12.04_amd64", "windows_amd64", "manifest".
    var platformArch = _.last(noProduct.split("-"));
    // "centos6", "macos", "ubuntu14", "windows", "manifest".
    var platform = platformArch.split("_")[0].replace(/x86/, "").replace(/\.$/, "");
    // "64", "32", "manifest".
    var arch = _.last(platformArch.split("_")).replace("amd64", "64").replace("x86", "32");

    if (arch == "" || platform == "") { // Early builds might not follow naming convention.
        return;
    }

    facets.arch[arch] = true;
    facets.ext[ext] = true;
    facets.platform[platform] = true;
    facets.product[product] = true;
    facets.release[release] = true;

    var p = m[product] = m[product] || {};
    var r = p[release] = p[release] || {};
    var b = r[build] = r[build] || {};

    b[artifact] = {
        artifact: artifact,
        basename: basename,
        arch: arch,
        build: build,
        ext: ext,
        platform: platform,
        product: product,
        release: release,
    };

    console.log(b[artifact]);
}

