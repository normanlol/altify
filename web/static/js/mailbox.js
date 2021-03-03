load();
sessionStorage.removeItem("emails");
document.getElementById("email").value = window.location.hash.split("#").slice(1)[0];
document.getElementById("mailbox").style.display = "";
setTimeout(function() {window.location.reload();}, 3600000);

function load() {
    document.getElementById("loading").style.display = "";
    document.getElementById("noMail").style.display = "none";
    var e = window.location.hash.split("#").slice(1)[0];
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "/check/" + e);
    xhr.send();
    xhr.onload = function () {
        var j = JSON.parse(xhr.responseText);
        if (j.emails.length == 0) {
            document.getElementById("loading").style.display = "none";
            document.getElementById("noMail").style.display = "";
        } else {
            document.getElementById("loading").style.display = "none";
            document.getElementById("emailList").style.display = "";
            for (var c in j.emails) {
                if (emailExists(j.emails[c].link)) {continue;}
                var div = document.createElement("DIV");
                var dd = document.createElement("DIV");
                div.classList.add("email");
                dd.classList.add("clickable")
                div.setAttribute("url", j.emails[c].link);
                div.setAttribute("csrf", j.csrf);
                dd.onclick = function () {
                    openEmail(this.parentElement.getAttribute("url"), this.parentElement.getAttribute("csrf"))
                }
                var who = document.createElement("H2");
                who.innerHTML = j.emails[c].subject;
                dd.appendChild(who);
                var sub = document.createElement("H3");
                sub.innerHTML = j.emails[c].description;
                dd.appendChild(sub);
                div.appendChild(dd);
                var parse = document.createElement("DIV");
                parse.classList.add("secondary");
                var p = document.createElement("BUTTON");
                p.innerHTML = "auto-get code";
                p.onclick = function() {
                    getCode(this);
                }
                parse.appendChild(p);
                div.appendChild(parse);
                document.getElementById("emailList").appendChild(div);
                if (sessionStorage.getItem("emails")) {
                    var k = JSON.parse(sessionStorage.getItem("emails"));
                    k.push(j.emails[c].link);
                    sessionStorage.setItem("emails", JSON.stringify(k));
                } else {
                    var k = [];
                    k.push(j.emails[c].link);
                    sessionStorage.setItem("emails", JSON.stringify(k));
                }
            }
        }
        setTimeout(function () {
            load();
        }, 15000)
    }
}

function emailExists(l) {
    var j = sessionStorage.getItem("emails");
    if (j == null) {return false;}
    var j = JSON.parse(j);
    for (var c in j) {
        if (j[c] == l) {return true;} else {continue;}
    }
    return false;
}

function openEmail(link, csrf) {
    window.open("/read/?link=" + btoa(link) + "&csrf=" + csrf, "_self");
}

function parseEmail(link, csrf, cb) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "/parse?link=" + btoa(link) + "&csrf=" + csrf);
    xhr.send();
    xhr.onload = function () {
        try {
            var j = JSON.parse(xhr.responseText);
            cb(null, j);
        } catch (err) {
            cb(err, null);
        }
    }
}

function getCode(element) {
    const p = document.createElement("P");
    p.innerHTML = "Loading...";
    element.parentElement.appendChild(p);
    element.style.display = "none";
    parseEmail(element.parentElement.parentElement.getAttribute("url"), element.parentElement.parentElement.getAttribute("csrf"), function(e, j) {
        if (e !== null) {
            p.parentElement.removeChild(p);
            var np = document.createElement("P");
            np.innerHTML = "Could not get.";
            element.parentElement.appendChild(np);
        } else {
            if (j[0].startsWith("http") || j[0].startsWith("//")) {
                p.parentElement.removeChild(p);
                var np = document.createElement("A");
                np.href = j[0];
                np.rel = "noreferrer nofollow";
                np.innerHTML = "Link";
                element.parentElement.appendChild(np);
            } else if (j[0] !== "") {
                p.parentElement.removeChild(p);
                var np = document.createElement("P");
                np.innerHTML = j[0];
                element.parentElement.appendChild(np);
            } else {
                p.parentElement.removeChild(p);
                var np = document.createElement("P");
                np.innerHTML = "Could not get.";
                element.parentElement.appendChild(np);
            }
        }
    });
}