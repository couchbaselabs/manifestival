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

var artifacts = [];

var facets = {
    arch: {},
    ext: {},
    platform: {},
    product: {},
    release: {}
};

var styleHTML =
    '<style>' +
    '  body * { font-family: sans-serif; font-size: 10pt; }' +
    '  .facets { float: left; padding: 20px 20px 20px 20px; }' +
    '  .results { float: left; padding: 20px 20px 20px 20px; }' +
    '  .results li { padding-bottom: 5px; }' +
    '  ul { list-style-type: none; }' +
    '  ul.all button { background-color: #dfd; }' +
    '  button.chosen { background-color: #dfd; }' +
    '  button { background-color: #ddd; width: 10em; padding: 5px 5px 5px 10px;' +
              ' text-align: left; font-size: 8pt; }' +
    '</style>';

function main() {
    console.log("manifestival main");

    var facetsUL = _.keys(facets).map(function(facet) {
        return '<div>' +
               '  <h2>' + facet + '</h2>' +
               '  <ul class="' + facet + ' all">loading...</ul>' +
               '</div>';
    }).join("\n");

    $("body").html('<div class="facets">' +
                     facetsUL +
                   '</div>' +
                   '<div class="results"><ul>loading...</ul></div>' +
                   styleHTML);

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

    addFacet("arch", arch);
    addFacet("ext", ext);
    addFacet("platform", platform);
    addFacet("product", product);
    addFacet("release", release);

    artifacts.push({
        artifact: artifact,
        basename: basename,
        arch: arch,
        build: build,
        ext: ext,
        platform: platform,
        product: product,
        release: release,
    });
}

function addFacet(facet, value) {
    if (facets[facet][value]) {
        return;
    }
    facets[facet][value] = true;

    $("ul." + facet).html(_.keys(facets[facet]).sort().map(function(v) {
        return '<li><button id="' + facet + '_' + v + '"' +
                          ' onclick="facetChosen(\'' + facet + '\', \'' + v + '\')">' + v +
                   '</button>' +
               '</li>';
    }).join(""));

    updateResults();
}

function facetChosen(facet, value) {
    console.log("facetChosen", facet, value);
    var id = facet + '_' + value;
    $(document.getElementById(id)).toggleClass('chosen'); // Since id might have embedded '.' chars.
    if ($('ul.' + facet + ' button').hasClass('chosen')) {
        $('ul.' + facet).removeClass('all');
    } else {
        $('ul.' + facet).addClass('all');
    }

    updateResults();
}

function updateResults() {
    var wantFacets = getWantFacets();
    console.log("wantFacets", wantFacets);

    var foundArtifacts = _.filter(artifacts, function(a) {
        return (wantFacets.arch.all || wantFacets.arch[a.arch]) &&
            (wantFacets.ext.all || wantFacets.ext[a.ext]) &&
            (wantFacets.platform.all || wantFacets.platform[a.platform]) &&
            (wantFacets.product.all || wantFacets.product[a.product]) &&
            (wantFacets.release.all || wantFacets.release[a.release]);
    });
    console.log("foundArtifacts", foundArtifacts);

    var h = _.map(foundArtifacts.reverse(), function(a) {
        return '<li><a href="/' +
                       a.product + '/' + a.release + '/' + a.build + '/' +
                       a.artifact + '">' +
                       a.artifact + '</a></li>';
    }).join("");

    $('.results ul').html(h);
}

function getWantFacets() {
    var wantFacets = {};

    $('div.facets ul').each(function(i, el) {
        var classNames = el.className.split(' ');

        var facet = _.without(classNames, 'all');
        wantFacets[facet] = {};

        var all = _.contains(classNames, 'all');
        if (all) {
            wantFacets[facet]['all'] = true;
        }

        $('div.facets ul.' + facet + ' button').each(function(i, el) {
            if ($(el).hasClass('chosen')) {
                var v = el.id.split('_')[1];
                if (v && v.length > 0) {
                    wantFacets[facet][v] = true;
                }
            }
        });
    });

    return wantFacets;
}
