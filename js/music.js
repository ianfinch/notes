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
 * Calculate the steps needed to transpose to a new key
 */
const stepsToTranspose = (newKey, visual) => {

    const keySig = visual[0].getKeySignature();
    const oldKey = keySig.root + keySig.acc;
    const steps = {
        "C":  0,
        "C#": 1,
        "Db": 1,
        "D":  2,
        "D#": 3,
        "Eb": 3,
        "E":  4,
        "F":  5,
        "F#": 6,
        "Gb": 6,
        "G":  7,
        "G#": 8,
        "Ab": 8,
        "A":  9,
        "A#": 10,
        "Bb": 10,
        "B":  11
    };

    // Check for raising an octave
    let octave = 0;
    if (newKey.match(/'$/)) {

        newKey = newKey.replace("'", "");
        octave = 1;
    }

    return steps[newKey] - steps[oldKey] + 12 * octave;
};

/**
 * Render the music
 */
const renderManuscript = transpose => {

    const notation = addConfig(getNotation());
    const visual = ABCJS.renderAbc("sheet", notation, { add_classes: true });

    if (transpose) {

        const transposed = ABCJS.strTranspose(notation, visual, stepsToTranspose(transpose, visual));
        ABCJS.renderAbc("sheet", transposed, { add_classes: true })
    }
};

/**
 * Do the conversion / rendering
 */
addEventListener("markdownConverted", () => {

    renderManuscript();

    // Give us a way to change the key signature
    document.getElementsByTagName("body")[0].addEventListener("click", () => {

        const newKey = prompt("Enter the key to transpose to");
        renderManuscript(newKey);
    });
});
