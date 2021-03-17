const http = require("http");
const fs = require("fs");
const gmailnator = require("gmailnator");
const cheerio = require("cheerio");
const utils = require("./utils");
const { parse } = require("url");
const port = process.env.PORT || 2345

http.createServer(requestListener).listen(port);
console.log("listening on port " + port)

function requestListener(request, response) {
    var url = parse(request.url, true);
    if (fs.existsSync(__dirname + "/web/static" + url.pathname + "index.html")) {
        fs.readFile(__dirname + "/web/static" + url.pathname + "index.html", function (err, resp) {
            if (err) {
                if (err.stack) {var txt = err.stack;}
                else if (err.message) {var txt = err.message;}
                else if (err.code) {var txt = err.code;}
                else if (err) {var txt = err;}
                response.writeHead(500, {
                    "Content-Type": "text/plain"
                });
                response.end(txt);
            } else {
                response.writeHead(200, {
                    "Content-Type": "text/html"
                });
                response.end(resp);
            }
        });
    } else if (fs.existsSync(__dirname + "/web/static" + url.pathname)) {
        fs.readFile(__dirname + "/web/static" + url.pathname, function (err, resp) {
            if (err) {
                if (err.stack) {var txt = err.stack;}
                else if (err.message) {var txt = err.message;}
                else if (err.code) {var txt = err.code;}
                else if (err) {var txt = err;}
                response.writeHead(500, {
                    "Content-Type": "text/plain"
                });
                response.end(txt);
            } else {
                response.writeHead(200, {
                    "Content-Type": contentType(url.pathname)
                });
                response.end(resp);
            }
        });
    } else {
        var pathClean = url.pathname.split("/").slice(1);
        var path = url.pathname;
        switch(pathClean[0]) {
            case "gen":
                gmailnator.generateEmail(function(err, resp) {
                    if (err) {
                        if (err.stack) {var txt = err.stack;}
                        else if (err.message) {var txt = err.message;}
                        else if (err.code) {var txt = err.code;}
                        else if (err) {var txt = err;}
                        response.writeHead(500, {
                            "Content-Type": "text/plain"
                        });
                        response.end(txt);
                    } else {
                        response.writeHead(200, {
                            "Content-Type": "text/plain"
                        });
                        response.end(resp);
                    }
                })
            return;

            case "check":
                if (pathClean[1]) {
                    gmailnator.checkEmails(pathClean[1], function(err, resp) {
                        if (err) {
                            if (err.stack) {var txt = err.stack;}
                            else if (err.message) {var txt = err.message;}
                            else if (err.code) {var txt = err.code;}
                            else if (err) {var txt = err;}
                            response.writeHead(500, {
                                "Content-Type": "text/plain"
                            });
                            response.end(txt);
                        } else {
                            response.writeHead(200, {
                                "Content-Type": "application/json"
                            });
                            response.end(JSON.stringify(resp));
                        }
                    })
                } else {
                    response.writeHead(302, {
                        "Location": "/"
                    });
                    response.end();
                }
            return;

            case "read":
                if (url.query.link && url.query.csrf) {
                    gmailnator.getMessage(atob(url.query.link), url.query.csrf, function(err, resp) {
                        if (err) {
                            if (err.stack) {var txt = err.stack;}
                            else if (err.message) {var txt = err.message;}
                            else if (err.code) {var txt = err.code;}
                            else if (err) {var txt = err;}
                            response.writeHead(500, {
                                "Content-Type": "text/plain"
                            });
                            response.end(txt);
                        } else {
                            var $ = cheerio.load(resp);
                            $("a").attr("rel", "noreferrer nofollow");
                            response.writeHead(200, {
                                "Content-Type": "text/html"
                            });
                            response.end($.html());
                        }
                    })
                } else {
                    response.writeHead(302, {
                        "Location": "/"
                    });
                    response.end();
                }
            return;

            case "parse":
                if (url.query.link && url.query.csrf) {
                    gmailnator.getMessage(atob(url.query.link), url.query.csrf, function(err, resp) {
                        if (err) {
                            if (err.stack) {var txt = err.stack;}
                            else if (err.message) {var txt = err.message;}
                            else if (err.code) {var txt = err.code;}
                            else if (err) {var txt = err;}
                            response.writeHead(500, {
                                "Content-Type": "text/plain"
                            });
                            response.end(txt);
                        } else {
                            if (!fs.existsSync(__dirname + "/temp/")) {fs.mkdirSync(__dirname + "/temp/");}
                            var loc = __dirname + "/temp/" + randomId()
                            fs.writeFile(loc, resp, function(err) {
                                if (err !== null) {
                                    if (err.stack) {var txt = err.stack;}
                                    else if (err.message) {var txt = err.message;}
                                    else if (err.code) {var txt = err.code;}
                                    else if (err) {var txt = err;}
                                    response.writeHead(500, {
                                        "Content-Type": "text/plain"
                                    });
                                    response.end(txt);
                                } else {
                                    utils.getVerify(loc, async function(err, resp) {
                                        if (err) {
                                            if (err.stack) {var txt = err.stack;}
                                            else if (err.message) {var txt = err.message;}
                                            else if (err.code) {var txt = err.code;}
                                            else if (err) {var txt = err;}
                                            response.writeHead(500, {
                                                "Content-Type": "text/plain"
                                            });
                                            response.end(txt);
                                        } else {
                                            var resp = JSON.stringify(resp);
                                            response.writeHead(200, {
                                                "Content-Type": "application/json"
                                            });
                                            response.end(resp);
                                            try {
                                                fs.unlinkSync(loc);
                                            } catch (error) {
                                                console.log("couldn't delete temp file: '" + loc + "' due to an error.");
                                                console.log(error);
                                            }
                                        }
                                    })
                                }
                            })
                        }
                    })
                } else {
                    response.writeHead(302, {
                        "Location": "/"
                    });
                    response.end();
                }
            return;

            default:
                fs.readFile(__dirname + "/web/dynamic/error/404.html", function(err, resp) {
                    if (err) {
                        if (err.stack) {var txt = err.stack;}
                        else if (err.message) {var txt = err.message;}
                        else if (err.code) {var txt = err.code;}
                        else if (err) {var txt = err;}
                        response.writeHead(500, {
                            "Content-Type": "text/plain"
                        });
                        response.end(txt);
                    } else {
                        response.writeHead(404, {
                            "Content-Type": "text/html"
                        });
                        response.end(resp);
                    }
                });
            return;
        }
    }
}

function contentType(file) {
    switch (file.split(".")[file.split(".").length - 1]) {
        case "html":
            return "text/html";
        case "css":
            return "text/css";
        case "json":
            return "application/json";
        case "js":
            return "application/javascript";
        case "jpg":
            return "image/jpeg";
        case "png":
            return "image/png";
        case "gif":
            return "images/gif";
        default:
            return "text/plain";
    }
}

function randomId() {
    var result = "";
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
    for (var c = 0; c < 10; c++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

function btoa(string) {
    return Buffer.from(string, "utf-8").toString("base64");
}

function atob(string) {
    return Buffer.from(string, "base64").toString("utf-8");
}