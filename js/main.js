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
    var names = keys(hier).sort();
    for (var i0 = 0; i0 < names.length; i0++) {
        var name = names[i0];
        r[r.length] = '<div class="name">' + name + '<div class="versions">';
        var versions = hier[name];
        var k1 = keys(versions).sort();
        for (var i1 = 0; i1 < k1.length; i1++) {
            var version = k1[i1];
            r[r.length] = '<div class="version">' + version + '<div class="builds">';
            var builds = versions[version];
            var k2 = keys(builds).sort().reverse();
            for (var i2 = 0; i2 < k2.length; i2++) {
                var build = k2[i2];
                r[r.length] = '<div class="build">' + build + '<div class="archs">';
                var archs = builds[build];
                var k3 = keys(archs).sort();
                for (var i3 = 0; i3 < k3.length; i3++) {
                    var arch = k3[i3];
                    r[r.length] = '<div class="arch">' + arch + '<div class="pkgs">';
                    var pkgs = archs[arch];
                    var k4 = keys(pkgs).sort();
                    for (var i4 = 0; i4 < k4.length; i4++) {
                        var pkg = k4[i4];
                        var p = pkgs[pkg];
                        var u = (p.url || '').replace('.manifest.xml', '');
                        r[r.length] = '<div class="pkg"><a href="' + u + '">' + pkg + '</a></div>';
                    }
                    r[r.length] = '</div></div>';
                }
                r[r.length] = '</div></div>';
            }
            r[r.length] = '</div></div>';
        }
        r[r.length] = '</div></div>';
    }
    return r;
}

function keys(m) {
    var keys = [];
    for (var key in m) {
        keys[keys.length] = key;
    }
    return keys;
}

function on_ready() {
    $.get("../../index.html", null,
          function(response, textStatus, jqXHR){
              on_index_html(response);
          });
}

$(document).ready(on_ready);
