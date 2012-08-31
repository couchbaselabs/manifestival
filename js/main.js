function on_index_html(html) {
    // Look for patterns like:  href="couchbase-server-community_x86_64_2.0.0c-709-rel.rpm.manifest.xml"

    var urls = {}
    var data = {} // Hierarchy of maps, keyed by name / version / build / arch / pkg.

    var hrefs = html.match(/href="[^\"]+\.manifest\.xml"/g);
    for (var i = 0; i < hrefs.length; i++) {
        var href = hrefs[i];
        var url = href.split('"')[1];
        var s = url.split('_');
        var name = s[0];
        var arch = s.slice(1, s.length - 1).join("_");
        var suffix = s[s.length - 1].split('-');
        var version = suffix[0];
        var build = suffix[1];
        if (suffix && suffix[2]) {
            var pkg = suffix[2].split('.')[suffix[2].split('.').length - 3];
            console.debug(url, name, arch, version, build, pkg);

            var p = { "url": url,
                      "name": name,
                      "version": version,
                      "build": build,
                      "arch": arch,
                      "pkg": pkg };
            urls[url] = p;

            add_entry(data, [name, version, build, arch, pkg], p);
        }
    }

    console.debug($('#content'));
    console.debug(urls);
    console.debug(data);
}

function add_entry(hier, path, val) {
    for (var i = 0; i < path.length - 1; i++) {
        var m = hier[path[i]];
        if (!m) {
            m = hier[path[i]] = {};
        }
        hier = m;
    }
    hier[path.length - 1] = val;
}

function on_ready() {
    $.get("../../index.html", null,
          function(response, textStatus, jqXHR){
              on_index_html(response);
          });
}

$(document).ready(on_ready);
