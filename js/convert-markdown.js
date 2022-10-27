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
[...document.getElementsByClassName("markdown")].forEach(convertMarkdown);

/**
 * If there's an <h1> ... </h1> in the content, pull it up into the header and
 * the title.  If there is more than one, just grab the first
 */
const headersInContent = document.getElementById("content").getElementsByTagName("h1");
if (headersInContent && headersInContent.length > 0) {
    
    // First find our top level heading in the content
    const h1 = [...headersInContent][0];
    if (h1) {

        // Now look for an <h1> ... </h1> in the header
        const header = [...document.getElementsByTagName("header")][0];
        if (header) {

            [...header.children].forEach(elem => {

                // If we find one, replace it with the one from the content
                if (elem.nodeName === "H1") {

                    header.removeChild(elem);
                    header.appendChild(h1);

                }
            });

        // If there's no header, add one in
        } else {

            const header = document.createElement("header");
            header.appendChild(h1);
            [...document.getElementsByTagName("body")][0].insertAdjacentElement("afterbegin", header);
        }

        // Update the title too
        const title = document.getElementsByTagName("title")[0];
        if (title) {
            title.textContent = h1.textContent;
        }
    }
}

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
 * Mark up task items which are waiting for someone else to do something
 *
 * My convention is that if the task begins with letters and a colon, that
 * indicates it is someone's name and I am waiting for them to complete this
 * task
 */
[...document.getElementsByClassName("task-list-item")].forEach(elem => {

    if (elem.textContent.match(/^ *[A-Za-z]*:/)) {
        elem.classList.add("waiting-for");
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
        const span = document.createElement("span");
        [...parent.childNodes].forEach(child => {
            if (child.nodeName !== "INPUT") {
                span.appendChild(child);
            }
        });
        parent.appendChild(span);
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
 *
 * Accepts two parameters ... an array of headings to 'include' (to make two
 * columns) and an array of headings to 'exclude' (not to make two columns).
 * These are wrapped in an object.  Each element in the array is a regular
 * expression.
 *
 * If there is no 'include' array passed, then all items are included (apart
 * from those in the 'exclude' array).
 *
 * The include array is applied first, then the exclude array.  So the include
 * array can limit which headings are set as two columns, and the exclude array
 * can make some within that list back to one column again.
 */
const twocolumn = ({ include, exclude } = {}) => {

    // If we don't have an include list, include everything
    if (!include) {
        include = [ ".*" ];
    } else if (include.length === 0) {
        include.push(".*");
    }

    // If we don't have an exclude list, don't exclude anything
    if (!exclude) {
        exclude = [];
    }

    // Go through each list
    [...document.getElementsByTagName("ul")].forEach(ul => {

        // Find the title
        const h2 = ul.parentNode.children[0];
        if (h2.nodeName === "H2") {

            // Check that the heading is in our include list
            const isIncluded = include.filter(regexString => {

                const regex = RegExp(regexString);
                return regex.test(h2.textContent);
            }).length;

            if (isIncluded) {

                // Now check for exclusions
                const isExcluded = exclude.filter(regexString => {

                    const regex = RegExp(regexString);
                    return regex.test(h2.textContent);
                }).length;

                if (!isExcluded) {

                    // Set two column using a class
                    ul.classList.add("twocolumn");
                }
            }
        }
    });
};
