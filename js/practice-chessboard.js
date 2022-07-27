/**
 * Support the practice chessboard functionality
 *
 * A practice chessboard page has a nested list representing a tree of possible
 * moves.  We will convert that tree into a data structure and then use that to
 * identify next moves as we practice openings.
 */

/**
 * Create the items in the current list DOM node
 */
const getListItems = root => {

    return [...root.children].map(listItem => {

        return extractListItem([...listItem.childNodes]);
    }).flat();
};

/**
 * Break down a pair of moves (white then black) into an object
 */
const analyseMove = move => {

    const parts =  move
                    .match(/([0-9]+)\. +([^ ]+)( +)?([^ ]+)?( +)?(.+)?/)
                    .slice(1)
                    .filter(x => x && x !== " ");

    if (parts[1] === "…") {

        return {
            n: parts[0],
            b: parts[2],
            comment: parts[3]
        };
    }

    return {
        n: parts[0],
        w: parts[1],
        b: parts[2],
        comment: parts[3]
    };
};

/**
 * Analyse the content of an individual list item
 */
const extractListItem = item => {

    return item.map(elem => {

        if (elem.nodeName === "#text") {

            return analyseMove(elem.data);

        } else if (elem.nodeName === "UL") {

            return getListItems(elem);
        }

        return null;
    });
};

/**
 * Find the first <ul> ... </ul> on the page
 */
const findMoveTree = () => {

    const moves = document.getElementsByTagName("ul")[0];
    const result = getListItems(moves);
    moves.style.display = "none";
    return result;
};

/**
 * Add text to the notes section
 */
const addNote = text => {

    const div = document.createElement("div");
    div.textContent = text;
    const notes = document.getElementsByTagName("section")[0];
    notes.appendChild(div);
};

addNote(JSON.stringify(
findMoveTree()
));
