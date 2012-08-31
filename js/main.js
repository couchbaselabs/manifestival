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

    var r = gen(hier, [false, false, true, true]);
    var t = [];
    var names = map_keys(hier).sort();
    for (var i = 0; i < names.length; i++) {
        t.push('<li><a href="#' + names[i] + '">' + names[i] + '</a></li>');
    }
    var h = '<ul>' + t.join('') + '</ul>';

    h = h + '<table>' +
        '<tr><th>name</th><th>version</th><th>build</th><th>arch</th><th colspan="5">pkg</th></tr>' +
        '<tr>' + r.join('') + '</tr></table>';

    $('#content').html(h);
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

function gen(hier, reversals) {
    var keys = map_keys(hier).sort();
    if (reversals[0]) {
        keys = keys.reverse();
    }
    var child_reversals = reversals.slice(1);
    var r = [];
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        var val = hier[key];
        if (reversals.length > 0) {
            var child_r = gen(val, child_reversals);
            if (i > 0) {
                r.push('</tr><tr>');
            }
            var child_n = (child_r.join('').match(/<tr>/g) || []).length + 1;
            r.push('<td rowspan="' + child_n + '"><a name="' + key + '">' + key + '</a></td>');
            r = r.concat(child_r);
        } else {
            if (val.url) {
                if (i == 0) {
                    r.push('<td><a href="../../' + val.url + '">manifest</a></td>');
                }
                var pkg_url = val.url.replace('.manifest.xml', '');
                r.push('<td><a href="../../' + pkg_url + '">' + key + '</a></td>');
            }
        }
    }
    return r;
}

function map_keys(m) {
    var keys = [];
    for (var key in m) {
        keys[keys.length] = key;
    }
    return keys;
}

function on_ready() {
    if (document.URL.match(/^file:/)) {
        on_index_html('<a href="couchbase-server-community_x86_64_2.0.0c-709-rel.rpm.manifest.xml">' +
                      '<a href="couchbase-server-community_x86_64_2.0.0c-710-rel.rpm.manifest.xml">' +
                      '<a href="couchbase-server-community_x86_64_2.0.0c-710-rel.deb.manifest.xml">' +
                      '<a href="couchbase-server-community_x86_64_2.0.0c-710-rel.exe.manifest.xml">' +
                      '<a href="couchbase-server-community_x86_64_2.0.0c-711-rel.rpm.manifest.xml">' +
                      '<a href="couchbase-server-community_x86_64_2.0.0c-711-rel.deb.manifest.xml">' +
                      '<a href="couchbase-server-community_x86_64_2.0.0c-711-rel.exe.manifest.xml">' +
                      '<a href="couchbase-server-community_x86_64_2.0.0-170-rel.rpm.manifest.xml">' +
                      '<a href="couchbase-server-community_x86_64_2.0.0-171-rel.deb.manifest.xml">');
        return;
    }

    $.get("../../index.html", null,
          function(response, textStatus, jqXHR){
              on_index_html(response);
          });
}

$(document).ready(on_ready);
