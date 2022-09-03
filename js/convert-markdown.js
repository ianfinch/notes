var converter = new showdown.Converter();
converter.setOption("tables", true);
converter.setOption("tasklists", true);

/**
 * Function to perform markdown conversion to HTML
 *
 * Given an element which contains the text to be converted, perform the
 * conversion, add the HTML into the document, and hide the original text
 */
const convertMarkdown = mdElem => {

    // We want the content of the passed in DOM element
    let md = mdElem.textContent;

    // If an object 'vars' is defined, use that to perform variable substitution
    // for patterns of the form {% ... %} within the markdown
    if (window.vars) {

        Object.keys(window.vars).forEach(key => {

            const regex = new RegExp("{% *" + key + " *%}", "g");
            md = md.replace(regex, window.vars[key]);
        });
    
    }

    // Actually do the markdown to HTML conversion, wrapping <h2> headers in
    // sections
    var html = converter.makeHtml(md)
                .replaceAll("<h2 ", "</section><h2 ")
                .replaceAll("<h2 ", "<section><h2 ");

    // Add the generated HTML to the page and hide the markdown
    mdElem.insertAdjacentHTML("beforebegin", html);
    mdElem.style.display = "none";
}

/**
 * Actually do the markdown conversion
 */
convertMarkdown(document.getElementById("markdown"));

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
 * Add icons to bookmark sections
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

/**
 * Function which can be added to the HTML file to enable two columns within
 * bookmark sections
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
