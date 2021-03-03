load();
document.getElementById("gen").style.display = "";

function load() {
    document.getElementById("email").value = "";
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "/gen");
    xhr.send();
    xhr.onload = function () {
        document.getElementById("email").value = xhr.responseText;
    }
}

function openMail(mail) {
    window.open("/mailbox/#" + mail, "_self");
}