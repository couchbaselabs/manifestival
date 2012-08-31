function on_index_html(html) {
    // Look for patterns like:  href="couchbase-server-community_x86_64_2.0.0c-709-rel.rpm.manifest.xml"

    var urls = {}
    var hier = {} // Hierarchy of maps, keyed by name / version / build / arch / pkg.

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

            add_entry(hier, [name, version, build, arch, pkg], p);
        }
    }

    $('#content').html(gen(hier));
}

function add_entry(hier, path, val) {
    for (var i = 0; i < path.length - 1; i++) {
        var m = hier[path[i]];
        if (!m) {
            m = hier[path[i]] = {};
        }
        hier = m;
    }
    hier[path[path.length - 1]] = val;
}

function gen(hier) {
    var r = [];
    r[r.length] = '<ul>';
    for (var name in hier) {
        r[r.length] = '<li>' + name + '<ul>';
        var versions = hier[name];
        for (var version in versions) {
            r[r.length] = '<li>' + version + '<ul>';
            var builds = versions[version];
            for (var build in builds) {
                r[r.length] = '<li>' + build + '<ul>';
                var archs = builds[build];
                for (var arch in archs) {
                    r[r.length] = '<li>' + arch;
                    var pkgs = archs[arch];
                    for (var pkg in pkgs) {
                        var p = pkgs[pkg];
                        r[r.length] = '<a href="' + p.url + '">' + pkg + '</a>';
                    }
                    r[r.length] = '</li>';
                }
                r[r.length] = '</ul></li>';
            }
            r[r.length] = '</ul></li>';
        }
        r[r.length] = '</ul></li>';
    }
    r[r.length] = '</ul>';
    return r;
}

function on_ready() {
    $.get("../../index.html", null,
          function(response, textStatus, jqXHR){
              on_index_html(response);
          });
}

$(document).ready(on_ready);
