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

/**
 * Modify the default input boxes that showdown creates
 */
[...document.getElementsByTagName("input")].forEach(elem => {

    if (elem.type === "checkbox") {

        // Remove the inline style that showdown adds
        elem.style.removeProperty("margin-bottom");
        elem.style.removeProperty("margin-left");
        elem.style.removeProperty("margin-right");
        elem.style.removeProperty("margin-top");

        // Wrap the text in a <span> ... </span> for easier styling
        const parent = elem.parentNode;
        [...parent.childNodes].forEach(child => {

            if (child.nodeName === "#text") {

                const span = document.createElement("span");
                span.textContent = child.textContent;
                parent.removeChild(child);
                parent.appendChild(span);
            }
        });
    }
});

/**
 * Enable two columns within bookmark sections (called from pages where two
 * column is wanted
 */
const twocolumn = () => {

    [...document.getElementsByTagName("ul")].forEach(ul => {
    
        // We don't want to put "to do" lists into two columns
        if (ul.getElementsByTagName("input").length === 0) {

            // Set two column using a class
            ul.classList.add("twocolumn");
        }
    });
};

/**
 * Add in icons to bookmark sections
 */
[...document.getElementsByClassName("bookmarks")].forEach(section => {

    [...section.getElementsByTagName("h2")].forEach(h2 => {

        let icon;
        if (h2.getElementsByTagName("em").length === 0) {

            icon = "link";

        } else {

            const em = h2.getElementsByTagName("em")[0];
            icon = em.textContent;
            h2.removeChild(em);
        }

        const i = document.createElement("i");
        i.classList.add("las");
        i.classList.add("la-" + icon);
        h2.appendChild(i);
    });
});
