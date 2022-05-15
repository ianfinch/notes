var converter = new showdown.Converter();
converter.setOption("tables", true);

var html = converter.makeHtml(document.getElementById("markdown").textContent)
            .replaceAll("<h2 ", "</section><h2 ")
            .replaceAll("<h2 ", "<section><h2 ");

document.getElementById("content").insertAdjacentHTML("afterbegin", html);
document.getElementById("markdown").style.display = "none";
