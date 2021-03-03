const fs = require("fs");
const cheerio = require("cheerio");

exports.getVerify = function (file, cb) {
    fs.readFile(file, function(err, resp) {
        if (err) {
            cb(err, null);
        } else {
            var $ = cheerio.load(resp);
            var p = [];
            for (var c in $("a")) {
                if (
                    $("a")[c] !== undefined &&
                    $("a")[c].attribs !== undefined &&
                    $("a")[c].attribs.href !== undefined
                ) {
                    if ($("a")[c].attribs.href.includes("confirm") || $("a")[c].attribs.href.includes("verify")) {
                        p.push($("a")[c].attribs.href);
                    }
                }
            }
            if (p.length == 0) {
                var code = $(".h1 ").text().replace(" ", ""); /* twitter */
                p.push(code)
            }
        }
        cb(null, p);
    });
}