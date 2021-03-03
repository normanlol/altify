async function copy(text) {
    if (navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function() {
            if (document.getElementById("copied")) {
                document.getElementById("copied").style.display = "";
                setTimeout(function () {
                    document.getElementById("copied").style.display = "none";
                }, 2500)
            }
            return;
        }).catch(function(err) {
            var textArea = document.createElement("textarea");
            textArea.value = text;
            textArea.style.top = "0";
            textArea.style.left = "0";
            textArea.style.position = "fixed";
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            document.execCommand("copy");
            document.body.removeChild(textArea);
            if (document.getElementById("copied")) {
                document.getElementById("copied").style.display = "";
                setTimeout(function () {
                    document.getElementById("copied").style.display = "none";
                }, 2500)
            }
        })
    }
}