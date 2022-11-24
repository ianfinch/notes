/**
 * Use mermaid.js to generate diagrams
 */

/**
 * Initialise the diagram rendering
 */
const init = () => {
    // Any code blocks with class 'diagram' should be replaced by pre blocks with class 'mermaid'
    [...document.getElementsByTagName("code")]
        .filter(x => x.classList.contains("diagram"))
        .forEach(codeBlock => {

            codeBlock.parentNode.classList.add("mermaid");
            codeBlock.parentNode.innerHTML = codeBlock.innerHTML;
        });

    mermaid.initialize({
        theme: "forest"
    });
};

init();
