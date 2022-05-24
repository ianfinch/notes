var converter = new showdown.Converter();
converter.setOption("tables", true);

const md = document.getElementById("markdown").textContent;

var html = converter.makeHtml(md)
            .replaceAll("<h2 ", "</section><h2 ")
            .replaceAll("<h2 ", "<section><h2 ");

document.getElementById("content").insertAdjacentHTML("afterbegin", html);
document.getElementById("markdown").style.display = "none";
