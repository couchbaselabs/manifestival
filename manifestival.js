var products = [
  "couchbase-server"
];

console.log("manifestival awakes");

if (!window.scriptServer) {
    window.scriptServer = "127.0.0.1:8000";
}

var scripts = [
    "jquery-2.1.3.min.js",
    "underscore-1.7.0.min.js",
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

var facets = { product: {},
               release: {},
               edition: {},
               version: {},
               platform: {},
               arch: {},
               ext: {} };

var styleHTML =
    '<style id="facetChosen"></style>' +
    '<style id="artifactChosen"></style>' +
    '<style>' +
    '  body * { font-family: sans-serif; font-size: 10pt; }' +
    '  a { text-decoration: none; }' +
    '  a:hover { text-decoration: underline; }' +
    '  h1 { padding: 20px 10px 0 10px; }' +
    '  h1 a { color: black; }' +
    '  table * { vertical-align: top; }' +
    '  .facets { padding: 20px 20px 20px 20px; }' +
    '  .results { padding: 20px 20px 20px 20px; }' +
    '  .results li { display: none; padding: 10px 10px 10px 10px; min-width: 500px; }' +
    '  .results li.ext_xml { margin-top: 10px; border-top: 1px solid #999; padding-top: 20px; }' +
    '  .results li:hover { background-color: #eee; }' +
    '  .results li button.hint { display: none; float: right; width: 60px;'+
              ' margin: 0 0 0 0; background-color: #dfd; cursor: pointer;' +
              ' padding: 2px 5px 2px 5px; font-size: 7pt; text-align: right; }' +
    '  .results li:hover button.hint { display: inline-block; }' +
    '  .details { padding: 80px 20px 20px 40px; }' +
    '  .details table { border-left: 10px solid #eee; padding-left: 20px; }' +
    '  .details table th { text-align: left; padding-right: 10px; }' +
    '  .details table td { color: #999; }' +
    '  .details table td.na * { color: #ddd; }' +
    '  .details table td.diff { background-color: #fcc; font-weight: bold; }' +
    '  .details table td a.compare { float: right; background-color: #f9f; text-align: right; }' +
    '  .details table td a.compare:hover { background-color: #f3f; }' +
    '  .details table td.projects { vertical-align: bottom; padding-bottom: 10px; }' +
    '  .details table th button { display: block; width: 70px; height: 14px;' +
              ' margin-top: 20px; padding: 2px 0 2px 0;' +
              ' font-size: 6px; text-align: center; }' +
    '  ul { list-style-type: none; padding: 0 0 0 20px; }' +
    '  ul.all button { background-color: #dfd; }' +
    '  button.chosen { background-color: #dfd; }' +
    '  button { background-color: #ddd; width: 10em; padding: 5px 5px 5px 10px;' +
              ' text-align: left; font-size: 8pt; color: #000;}' +
    '  .inflight { padding-left: 30px; }' +
    '</style>';

function main() {
    console.log("manifestival main");

    var facetsUL = _.keys(facets).map(function(facet) {
        return '<div>' +
               '  <h2>' + facet + '</h2>' +
               '  <ul class="' + facet + ' all"></ul>' +
               '</div>';
    }).join("\n");

    $("body").html('<table>' +
                   '<tr>' +
                     '<td>' +
                       '<h1><a href="/manifestival.html">manifestival</a></h1>' +
                       '<div class="facets">' +
                         facetsUL +
                       '</div>' +
                     '</td>' +
                     '<td>' +
                       '<div class="results">' +
                       '  <ul></ul>' +
                       '  <div class="inflight">loading...</div>' +
                       '</div>' +
                     '</td>' +
                     '<td>' +
                       '<div class="details">' +
                       '</div>' +
                     '</td>' +
                   '</tr>' +
                   '</table>' +
                   styleHTML);

    for (var i = 0; i < products.length; i++) {
        loadProduct(products[i]);
    }
}

// ---------------------------------------------------------------

var inflightNum = 0;

function inflight(delta) {
    inflightNum += delta;
    if (inflightNum > 0) {
        var s = "";
        for (var i = 0; i < inflightNum && i < 20; i++) {
            s = s + ".";
        }
        $(".inflight").text("loading..." + s);
    } else {
        $(".inflight").text("");
    }
}

function loadProduct(product) { // Ex: "couchbase-server".
    console.log("loadProduct", product);

    inflight(1);
    $.ajax("/" + product, {
        success: function(h) {
            inflight(-1);
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

    inflight(1);
    $.ajax("/" + product + "/" + release, {
        success: function(h) {
            inflight(-1);
            var hrefs = h.match(/href="[0-9][0-9]+\/"/g);
            if (hrefs) {
                var n = 0;
                for (var i = hrefs.length - 1; i >= 0; i--) {
                    var build = hrefs[i].split('"')[1].replace('/', ''); // Ex: "1129".
                    if (n < 10) {
                        loadProductReleaseBuild(product, release, build);
                    } else {
                        (function(product, release, build) {
                            setTimeout(function() {
                                loadProductReleaseBuild(product, release, build);
                            }, 500 + (Math.floor(n / 10) * 200));
                        })(product, release, build);
                    }
                    n++;
                }
            }
        }
    });
}

function loadProductReleaseBuild(product, release, build) {
    console.log("loadProductReleaseBuild", product, release, build);

    inflight(1);
    $.ajax("/" + product + "/" + release + "/" + build, {
        success: function(h) {
            inflight(-1);
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

    // Ex: "enterprise", "community", null;
    var edition = (noProduct.match(/^[a-z]+/) || [])[0];
    // Ex: "3.5.0".
    var version = noProduct.replace(/^[a-z\-_]+/, '').split(/[\-_]/)[0];
    // Ex: "centos6.x86_64", "macos_x86_64", "ubuntu12.04_amd64", "windows_amd64", "manifest".
    var platformArch = _.last(noProduct.split("-"));
    // Ex: "centos6", "macos", "ubuntu14", "windows", "manifest".
    var platform = platformArch.split("_")[0].replace(/x86/, "").replace(/\.$/, "");
    // Ex: "64", "32", "manifest".
    var arch = _.last(platformArch.split("_")).replace("amd64", "64").replace("x86", "32");

    if (arch == "" || platform == "") { // Early builds might not follow naming convention.
        return;
    }

    if (!artifact.match(/^changelog-/)) {
        addFacet("arch", arch);
        addFacet("edition", edition);
        addFacet("ext", ext);
        addFacet("platform", platform);
        addFacet("product", product);
        addFacet("release", release);
        addFacet("version", version);
    }

    artifacts.push({
        artifact: artifact,
        basename: basename,
        arch: arch,
        build: build,
        edition: edition,
        ext: ext,
        platform: platform,
        product: product,
        release: release,
        version: version
    });

    updateResultsLazy(500);
}

function addFacet(facet, value) {
    if (!value || facets[facet][value]) {
        return;
    }
    facets[facet][value] = true;

    $("ul." + facet).html(_.keys(facets[facet]).sort().map(function(v) {
        return '<li><button id="' + facet + '_' + v + '"' +
                          ' onclick="facetChosen(\'' + facet + '\', \'' + v + '\')">' + v +
                   '</button>' +
               '</li>';
    }).join(""));
}

// ---------------------------------------------------------------

var updateResultsRequested = false;

function updateResultsLazy(msecs) {
    if (!updateResultsRequested) {
        updateResultsRequested = true;
        setTimeout(function() {
            updateResultsRequested = false;
            updateResults();
        }, msecs);
    }
}

function updateResults() {
    artifacts.sort(function(a, b) {
        if (b.build < a.build) return -1;
        if (b.build > a.build) return 1;
        if (a.artifact < b.artifact) return -1;
        if (a.artifact > b.artifact) return 1;
        return 0;
    });

    var h = _.map(artifacts, function(a, i) {
        return '<li id="artifact_' + i + '"' +
                  ' class="build_' + (a.build) +
                         ' arch_all arch_' + nodot(a.arch) +
                         ' edition_all edition_' + nodot(a.edition) +
                         ' ext_all ext_' + nodot(a.ext) +
                         ' platform_all platform_' + nodot(a.platform) +
                         ' product_all product_' + nodot(a.product) +
                         ' release_all release_' + nodot(a.release) +
                         ' version_all version_' + nodot(a.version) + '"' +
                  ' onclick="artifactChosen(' + i + ')">' +
                 '<button class="hint">details &gt;&gt;</button>' +
                 '<a href="/' +
                     a.product + '/' + a.release + '/' + a.build + '/' +
                     a.artifact + '">' +
                     a.artifact + '</a>' +
               '</li>';
    }).join("");

    $('.results ul').html(h);

    updateFacetResults();
}

function nodot(s) { return (s || "").replace(/\./g, "_"); }

// ---------------------------------------------------------------

function facetChosen(facet, value) {
    console.log("facetChosen", facet, value);
    var id = facet + '_' + value;
    $(document.getElementById(id)).toggleClass('chosen'); // Since id might have embedded '.' chars.
    if ($('ul.' + facet + ' button').hasClass('chosen')) {
        $('ul.' + facet).removeClass('all');
    } else {
        $('ul.' + facet).addClass('all');
    }

    updateFacetResults();
}

function updateFacetResults() {
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

    var facetKeys = _.keys(wantFacets);
    var facetVals = [];
    var cursor = [];
    for (var i = 0 ; i < facetKeys.length; i++) {
        facetVals.push(_.keys(wantFacets[facetKeys[i]]));
        cursor.push(0);
    }

    var joined = [];
    function join(cursor, col) {
        if (col < cursor.length) {
            joined.push(_.map(cursor, function(vi, ki) {
                return facetKeys[ki] + '_' + nodot(facetVals[ki][vi]);
            }).join('.'));
            if (cursor[col] < facetVals[col].length - 1) {
                var cursor2 = _.initial(cursor, 0);
                cursor2[col] += 1;
                join(cursor2, col);
            }
            join(_.initial(cursor, 0), col+1);
        }
    }
    join(cursor, 0);
    joined = _.uniq(joined);
    console.log("joined", joined);

    var h = _.map(joined, function(j) {
        return '.results li.' + j + ' { display: block; }';
    }).join("\n");

    $('#facetChosen').html(h);
}

// ---------------------------------------------------------------

var manifestXMLs = {}; // Keyed by manifest path, value is AJAX xml doc.

var artifactsCur = []; // Currently chosen indexes into artifacts.

function artifactChosen(artifactIdx) {
    var a = artifacts[artifactIdx];
    var p = artifactManifestPath(a);

    console.log("artifactChosen", artifactIdx, a, p);

    artifactsCur.push(artifactIdx);
    artifactsCur = _.uniq(artifactsCur, false, function(artifactIdx) {
        return artifactManifestPath(artifacts[artifactIdx]);
    });
    artifactsCur = _.sortBy(artifactsCur, function(artifactIdx) {
        return artifacts[artifactIdx].build;
    });
    artifactsCur.reverse();

    updateArtifactsChosen();

    if (!manifestXMLs[p]) {
        $.ajax(p, {
            success: function(xml) {
                manifestXMLs[p] = xml;
                updateComparison(artifactsCur);
            }
        });
    } else {
        updateComparison(artifactsCur);
    }
}

function artifactUnchosen(artifactIdx) {
    artifactsCur = _.without(artifactsCur, artifactIdx);
    updateArtifactsChosen();
    updateComparison(artifactsCur);
}

function updateArtifactsChosen() {
    $('#artifactChosen').html(_.map(artifactsCur, function(artifactIdx) {
        var a = artifacts[artifactIdx];
        return '.results li.build_' + a.build + ' { background-color: #efe; }';
    }).join("\n"));
}

function artifactManifestPath(a) {
    return '/' + a.product + '/' + a.release + '/' + a.build +
           '/' + a.product + '-' + a.version + '-' + a.build + '-manifest.xml';
}

function updateComparison(artifactIdxs) {
    if (artifactIdxs.length <= 0) {
        $(".details").html("");
        return;
    }

    var projects = { /* projectName => { i => projectEl }. */ };
    var remotes = { /* remoteName => remoteEl }. */ };
    var defaultEl = null;

    _.each(artifactIdxs, function(artifactIdx, i) {
        var a = artifacts[artifactIdx];
        var p = artifactManifestPath(a);
        var x = manifestXMLs[p];
        _.each($(x).find('project'), function(el) {
            el = $(el);
            var projectName = el.attr('name');
            projects[projectName] = projects[projectName] || [];
            projects[projectName][i] = el;
            return name;
        });
        _.each($(x).find('remote'), function(el) {
            el = $(el);
            remotes[el.attr('name')] = el;
        });
        _.each($(x).find('default'), function(el) {
            defaultEl = $(el);
        });
    });

    var tbl = _.map(_.keys(projects).sort(), function(projectName) {
        function revision(i) {
            var r = revisionFull(i);
            if (r) {
                return r.substring(0, 6);
            }
            return null;
        }

        function revisionFull(i) {
            var el = projects[projectName][i];
            if (el && el.attr("revision")) {
                return el.attr("revision");
            }
            return null;
        }

        var projectURL = "";
        var projectLink = projectName;
        for (var i = 0; i < projects[projectName].length; i++) {
            var projectEl = projects[projectName][i];
            if (projectEl) {
                var remoteName = $(projectEl).attr('remote') || defaultEl.attr("remote");
                var remoteEl = remotes[remoteName];
                if (remoteEl) {
                    var fetch = remoteEl.attr("fetch") || "";
                    projectURL = 'http://' + fetch.replace("git://", "").replace("ssh://git@", "") + projectName;
                    projectLink = '<a href="' + projectURL + '">' + projectName + '</a>';
                    break;
                }
            }
        }

        return '<tr><th>' + projectLink + '</th>' +
            _.map(artifactIdxs, function(artifactIdx, i) {
                var curLink = "N/A";
                var cur = revision(i);
                if (cur && projectURL) {
                    curLink = '<a href="' + projectURL + '/commit/' + cur + '">' + cur + '</a>';
                }
                var sameL = (i <= 0 || cur == revision(i - 1));
                var sameR = (i >= artifactIdxs.length - 1 || cur == revision(i + 1));
                var same = sameL && sameR;
                var compareLink = "";
                if (!sameR) {
                    var curRevFull = revisionFull(i);
                    var rightRevFull = revisionFull(i + 1);
                    if (curRevFull && rightRevFull) {
                        compareLink = '<a class="compare" href="' + projectURL + '/compare/' +
                            rightRevFull + '...' +
                            curRevFull + '">&nbsp;&#8596;&nbsp;</a>';
                    }
                }

                return '<td class="' + (!cur && 'na') + ' ' + (!same && 'diff') + '">' +
                          compareLink + curLink +
                       '</td>';
            }).join('') + '</tr>';
    }).join('');

    var hdr =
        '<tr><td></td><td>builds</td></tr>' +
        '<tr><td class="projects">projects</td>' +
        _.map(artifactIdxs, function(artifactIdx, i) {
            var a = artifacts[artifactIdx];
            var p = artifactManifestPath(a);
            return '<th>' +
                     '<a href="' + p + '">' + a.build + '</a>' +
                     '<button onclick="artifactUnchosen(' + artifactIdx + ')">X</button>' +
                   '</th>';
    }).join('') + '</tr>';

    $(".details").html('<table>' + hdr + tbl + '</table>');
}
