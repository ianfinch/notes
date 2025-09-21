/**
 * Use abc music notation to create lead sheets
 */

/**
 * Get the abc notation
 */
const getNotation = () => {

    const notationBlocks = [...document.getElementsByTagName("pre")].filter(x => x.classList.length === 0);
    const result = notationBlocks.map(x => x.textContent).join("\n");
    notationBlocks.forEach(x => x.style.display = "none");
    return result;
};

/**
 * Add any standard config to the notation
 */
addConfig = notation => {

    return "%%musicspace 20\n" +
           "%%staffsep 80\n" +
           notation;
};

/**
 * Do the conversion / rendering
 */
addEventListener("markdownConverted", () => {

    const notation = addConfig(getNotation());
    const visual = ABCJS.renderAbc("sheet", notation, { add_classes: true });

    // Give us a way to change the key signature
    [...document.getElementsByClassName("abcjs-key-signature")].forEach(keySignature => {

        keySignature.addEventListener("click", () => {

            // TBD ... transposition is hard-coded, and isn't re-applied
            const transposed = ABCJS.strTranspose(notation, visual, 5);
            ABCJS.renderAbc("sheet", transposed, { add_classes: true })
        });
    });
});
