var converter = new showdown.Converter();
converter.setOption("tables", true);
converter.setOption("tasklists", true);

/**
 * Add a nav bar to the page
 */
const addNavBar = () => {

    if (typeof global$nav === "undefined") {
        return;
    }

    const container = document.createElement("div");
    container.setAttribute("id", "container");

    const nav = document.createElement("div");
    nav.setAttribute("id", "nav");

    const pre = document.createElement("pre");
    pre.classList.add("markdown");
    pre.textContent = global$nav.content.join("\n");
    nav.appendChild(pre);

    const content = document.getElementById("content");

    container.appendChild(nav);
    container.appendChild(content);
    document.getElementsByTagName("body")[0].appendChild(container);
};

/**
 * Uppercase the first letter of a string
 */
const upperCaseFirstLetter = str => {

    return str.split(/ /)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
};

/**
 * Convert wikilinks into conventional markdown links
 */
const convertWikilink = str => {

    let link = str.replace("[[", "")
                  .replace("]]", "");

    let label = link.replace(/\.html$/, "")
                    .replace(/\/index$/, "")
                    .replace(/^.*\//, "")
                    .replace(/-/g, " ");

    label = upperCaseFirstLetter(label);

    return "[" + label + "](" + link + ")";
};

/**
 * Function to perform markdown conversion to HTML
 *
 * Given an element which contains the text to be converted, perform the
 * conversion, add the HTML into the document, and hide the original text
 */
const convertMarkdownElement = mdElem => {

    // We want the content of the passed in DOM element
    let md = mdElem.textContent;

    // Handle wikilinks
    md = md.replace(/\[\[[^\]]*\]\]/g, convertWikilink);

    // If an object 'vars' is defined, use that to perform variable substitution
    // for patterns of the form {% ... %} within the markdown
    if (window.vars) {

        Object.keys(window.vars).forEach(key => {

            const regex = new RegExp("{% *" + key + " *%}", "g");
            md = md.replace(regex, window.vars[key]);
        });
    
    }

    // Actually do the markdown to HTML conversion
    var html = converter.makeHtml(md);

    // Add the generated HTML to the page and hide the markdown
    mdElem.insertAdjacentHTML("beforebegin", html);
    mdElem.style.display = "none";
};

/**
 * Actually do the markdown conversion
 */
const convertMarkdown = () => {

    [...document.getElementsByClassName("markdown")].forEach(convertMarkdownElement);
};

/**
 * If there's an <h1> ... </h1> in the content, put it into the title.
 * If there is more than one, just grab the first
 */
const setPageTitle = () => {

    const headersInContent = document.getElementById("content").getElementsByTagName("h1");
    if (headersInContent && headersInContent.length > 0) {
    
        // First find our top level heading in the content
        const h1 = [...headersInContent][0];

        // Update the title
        const title = document.getElementsByTagName("title")[0];
        if (title) {
            title.textContent = h1.textContent;
        }
    }
};

/**
 * Add a 'highlighted' class to any section which has a <strong> tag inside its
 * <h2> tag (i.e. is ## __something__ in the markdown)
 */
const highlightSections = () => {

    [...document.getElementsByTagName("section")].forEach(section => {

        const h2 = [...section.getElementsByTagName("h2")];
        if (h2.length > 0) {

            if ([...h2[0].getElementsByTagName("strong")].length > 0) {

                section.classList.add("highlighted");
            }
        }
    });
};

/**
 * Mark up task items which are waiting for someone else to do something
 *
 * My convention is that if the task begins with letters and a colon, that
 * indicates it is someone's name and I am waiting for them to complete this
 * task
 */
const taskItemsWaiting = () => {

    [...document.getElementsByClassName("task-list-item")].forEach(elem => {

        if (elem.textContent.match(/^ *[A-Za-z]*:/)) {
            elem.classList.add("waiting-for");
        }
    });
};

/**
 * Modify the default input boxes that showdown creates
 */
const tidyInputElements = () => {

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
};

/**
 * Run all the updates after page has loaded
 */
addEventListener("load", () => {

    // Handle conversion
    addNavBar();
    convertMarkdown();
    setPageTitle();
    highlightSections();
    taskItemsWaiting();
    tidyInputElements();

    // Publish an event to allow post-conversion activities
    window.dispatchEvent(new Event("markdownConverted"));
});
