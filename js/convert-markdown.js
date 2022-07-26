var converter = new showdown.Converter();
converter.setOption("tables", true);
converter.setOption("tasklists", true);

let md = document.getElementById("markdown").textContent;

/**
 * If an object 'vars' is defined, use that to perform variable substitution
 * for patterns of the form {% ... %} within the markdown
 */
if (window.vars) {

    Object.keys(window.vars).forEach(key => {

        const regex = new RegExp("{% *" + key + " *%}", "g");
        md = md.replace(regex, window.vars[key]);
    });

}

/**
 * Actually do the markdown to HTML conversion, wrapping <h2> headers in
 * sections
 */
var html = converter.makeHtml(md)
            .replaceAll("<h2 ", "</section><h2 ")
            .replaceAll("<h2 ", "<section><h2 ");

/**
 * Add the generated HTML to the page and hide the markdown
 */
document.getElementById("content").insertAdjacentHTML("afterbegin", html);
document.getElementById("markdown").style.display = "none";

/**
 * Add a 'highlighted' class to any section which has a <strong> tag inside its
 * <h2> tag (i.e. is ## __something__ in the markdown)
 */
[...document.getElementsByTagName("section")].forEach(section => {

    const h2 = [...section.getElementsByTagName("h2")];
    if (h2.length > 0) {

        if ([...h2[0].getElementsByTagName("strong")].length > 0) {

            section.classList.add("highlighted");
        }
    }
});
