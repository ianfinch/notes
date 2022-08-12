/**
 * Support the practice chessboard functionality
 *
 * A practice chessboard page has a nested list representing a tree of possible
 * moves.  We will convert that tree into a data structure and then use that to
 * identify next moves as we practice openings.
 *
 * Takes a <ul> ... </ul> DOM element as its argument
 */
const simplifyDomList = root => {

    // Go through the child nodes
    const result = [...root.children].map(child => {

        const item = {};

        // We are only interested in list items
        if (child.nodeName !== "LI") {
            return null;
        }

        // Go through the child nodes, looking for text or a sub-list
        [...child.childNodes].forEach(elem => {

            // Add any text to the result
            if (elem.nodeName === "#text") {
                Object.assign(item, analyseMove(elem.data));
            }

            // Stick any sub-list under "variations"
            if (elem.nodeName === "UL") {
                item.variations = simplifyDomList(elem);
            }
        });

        // Generate an ID to link the DOM node with the element in the data
        // structure
        const id = "" + Math.round(Math.random() * 100000000);
        item.id = id;
        child.id = id;

        return item;
    });

    return result;
}

/**
 * Break down a pair of moves (white then black) into an object
 */
const analyseMove = move => {

    const parts =  move
                    .match(/([0-9]+)\. +([^ ]+)( +)?([^ ]+)?( +)?(.+)?/)
                    .slice(1)
                    .filter(x => x && x !== " ");

    // If the move is just a black move, return it
    if (parts[1] === "…") {

        const result = {
            n: parts[0],
            b: parts[2],
            comment: parts[3]
        };
        return result;
    }

    // If the move is just a white move, return it
    if (!parts[2]) {

        const result = {
            n: parts[0],
            w: parts[1],
            comment: parts[3]
        };
        return result;
    }

    // Otherwise return both
    const result = {
        n: parts[0],
        w: parts[1],
        b: parts[2],
        comment: parts[3]
    };
    return result;
};

/**
 * Find the first <ul> ... </ul> on the page
 */
const findMoveTree = debug => {

    const moves = document.getElementsByTagName("ul")[0];
    const variations = simplifyDomList(moves);
    moves.style.display = "none";
    return [{ variations }];
};

/**
 * Add text to the notes section
 */
const addLine = text => {

    const div = document.createElement("div");
    div.textContent = text;
    const notes = document.getElementsByTagName("section")[0];
    notes.appendChild(div);
};

/**
 * Add text to the last line of the notes section
 */
const addToLastLine = text => {

    const notes = document.getElementsByTagName("section")[0];
    const lastDiv = [...notes.getElementsByTagName("div")].slice(-1)[0];
    lastDiv.textContent = lastDiv.textContent + text;
};

/**
 * What moves are available?
 */
const availableMoves = (player, tree) => {

    if (Array.isArray(tree[0])) {
        alert("ARRAY TBD");
        return false;
    }

    return {
        moves: [ tree[0][player] ],
        continuation: tree
    };
};

/**
 * Remove a player's move from a move object and return the updated move tree
 */
const removeMove = (moveTree, player) => {

    // Remove the move for the player who has just played (note: that move is
    // the first element in the move tree)
    const toBeRemoved = moveTree[0];
    const head = Object.keys(toBeRemoved).reduce((result, item) => {

        if (item !== player) {
            result[item] = toBeRemoved[item];
        }

        return result;
    }, {});

    // Grab the tail of the move tree for later use
    const tail = moveTree.slice(1);

    // If there are no more moves in the head item, discard it completely
    if (!head.w && !head.b) {

        // If there is a "variations" subtree, switch to that as our main move tree
        if (head.variations) {

            // If there is only one item, it's not really a set of variations,
            // so include it directly
            if (head.variations.length === 1) {
                return head.variations;
            }

            // If the moves have different numbers, they aren't variations but
            // a sequence of moves, so include them directly
            const moveNumbers = [...new Set(head.variations.map(x => x.n))];
            if (moveNumbers.length > 1) {
                return head.variations;
            }

            // Otherwise, mark it as a set of varations
            return [{ variations: head.variations }];
        }

        // Otherwise, return the tail of the main tree
        return tail;
    }

    // Otherwise, combine this new head with the tail of the move tree
    return [ head ].concat(tail);
};

/**
 * Add a move to the notes
 */
const addMoveToNotes = (player, move) => {

    if (player === "w") {

        addLine(move.n + ". " + move.w);

    } else {

        addToLastLine(" " + move.b);
    }
};

/**
 * Create a "play again" button
 */
const playAgainButton = () => {

    const button = document.createElement("button");
    button.textContent = "play again";

    // When the button is clicked, start a new line
    button.addEventListener("click", e => {

        // Clear the previous commentary
        const section = document.getElementsByTagName("section")[0];
        [...section.children].forEach(elem => {

            if (elem.nodeName === "DIV" || elem.nodeName === "BUTTON") {

                section.removeChild(elem);
            }
        });

        // Start the new game
        init();
    });

    return button;
};

/**
 * Add a play again button to the bottom of the notes section
 */
const addPlayAgainButton = () => {

    const notes = document.getElementsByTagName("section")[0];
    notes.appendChild(playAgainButton());
};

/**
 * Remove a game from the move tree in the DOM
 */
const pruneMoveTree = movesPlayed => {

    // Work back from the leaf nodes, pruning the tree.  This means that as we
    // remove leaf nodes, we can check whether that causes their parent nodes
    // to become leaves and we can remove them too.
    [...movesPlayed].reverse().forEach(elemId => {

        const elem = document.getElementById(elemId);

        // See whether this element is followed by another list item
        let siblingListItem = elem.nextSibling;
        while (siblingListItem && siblingListItem.nodeName !== "LI" && siblingListItem.nextSibling) {
            siblingListItem = siblingListItem.nextSibling;
        }

        // We could end up with some whitespace text node, which we're not
        // interested in
        if (siblingListItem && siblingListItem.nodeName === "#text") {
            siblingListItem = null;
        }

        // The sibling needs to be a higher-numbered move than the current one,
        // so we check for that and disregard any siblings with the same move
        // number
        if (siblingListItem) {

            const currentMoveNumber = elem.firstChild.textContent.split(".")[0];
            const siblingMoveNumber = siblingListItem.firstChild.textContent.split(".")[0];
            if (currentMoveNumber === siblingMoveNumber) {
                siblingListItem = null;
            }
        }

        // Remove the node if it has no sub-lists of moves, and no next moves
        // at the same level.  This may leave us with an empty list at the
        // level above, so we need to check for that and remove the
        // encompassing list if that's the case.
        if (elem.childElementCount === 0 && siblingListItem === null) {

            const ul = elem.parentNode;
            ul.removeChild(elem);

            if (ul.childElementCount === 0) {
                ul.parentNode.removeChild(ul);
            }
        }
    });

};

/**
 * Do end of game housekeeping
 */
const endOfGame = movesPlayed => {

    addLine("Variation complete");
    pruneMoveTree(movesPlayed);

    if ([...document.getElementsByTagName("ul")].length === 0) {
        addLine("All variations completed");
    } else {
        addPlayAgainButton();
    }
};

/**
 * Find the next moves from a move tree and play one of them
 */
const opponentPlays = (player, moveTree, position, movesPlayed) => {

    let nextMove = moveTree[0];

    // Check we've still got a move to play
    if (!nextMove || (!nextMove[player] && !nextMove.variations)) {

        endOfGame(movesPlayed);
        return null;
    }

    // If there is no move for this player, select from the variations
    if (!nextMove[player]) {

        // Pick a random variation
        const selectedMove = Math.floor(Math.random() * nextMove.variations.length);
        nextMove = nextMove.variations[selectedMove];

        // Also use this line as the new move tree
        moveTree = [ nextMove ];
    }

    // Play the specified move
    const convertedMove = convertNotation(player, nextMove[player], position);
    const chessboard = document.getElementsByClassName("chessboard")[0].chessboard;
    chessboard.move.apply(null, convertedMove.split(","));
    addMoveToNotes(player, nextMove);

    // Keep track of moves we've played
    if (movesPlayed[movesPlayed.length - 1] !== nextMove.id) {
        movesPlayed =  movesPlayed.concat([ nextMove.id ]);
    }

    return {
        moveTree: removeMove(moveTree, player),
        movesPlayed
    };
};

/**
 * When a piece is moved, look for this option in our move tree and select a
 * response to it.  We pass the move tree into this function to get our actual
 * handler, with the move tree in the enclosure.
 */
const pieceMovedHandler = (moveTree, movesPlayed) => {

    const chessboardDiv = document.getElementsByClassName("chessboard")[0];

    return (oldLocation, newLocation, piece, newBoard, oldBoard, orientation) => {

        const player = piece.substr(0, 1);

        // The player should reflect the orientation, so cancel the move if
        // that's not the case
        if (orientation.substr(0, 1) !== player) {
            return "snapback";
        }

        // Now try to find a next move for the player - it will be at the top of
        // the move tree
        let nextMove = moveTree[0];
        if (Array.isArray(nextMove)) {
            alert("Next move is an array");
            return "snapback";
        }

        // If there is no move for this player, see if we have variations to
        // choose from
        if (!nextMove[player]) {

            if (nextMove.variations) {

                // Pick a random variation
                const selectedMove = Math.floor(Math.random() * nextMove.variations.length);
                nextMove = nextMove.variations[selectedMove];

                // Also use this line as the new move tree
                moveTree = [ nextMove ];

            } else {

                alert("Next move not defined for player " + player);
                return "snapback";
            }
        }

        // Check the move made against the next move from our tree - first we
        // need to convert from the notation in the tree to a start/end pair
        const convertedMove = convertNotation(player, nextMove[player], oldBoard);
        if (!convertedMove) {
            return "snapback";
        }

        // Now split the string into the start and end parts and check whether
        // this is the expected move.  Note that castling can return a
        // comma-separated pair of moves (and we only care about the first part
        // of that), so we also need to handle that when we split the string
        const multiMove = convertedMove.split(",");
        const [moveFrom, moveTo] = multiMove[0].split("-");
        if (moveFrom !== oldLocation || moveTo !== newLocation) {
            return "snapback";
        }

        // Can update our notes now, since we know the move will happen
        addMoveToNotes(player, nextMove);

        // If there are additional moves (e.g. moving the rook for castling)
        // then make those moves happen (with a delay to make them happen
        // outside this handler)
        if (multiMove[1]) {

            setTimeout(() => {
                chessboardDiv.chessboard.move(multiMove[1]);
            }, 100);
        }

        // If we get this far, the move which was played matches the expected
        // next move from our move tree.  We will now remove that move from our
        // move tree.
        const nextMoveTree = removeMove(moveTree, player);

        // Also want to keep track of which moves were played
        if (movesPlayed[movesPlayed.length - 1] !== nextMove.id) {
            movesPlayed =  movesPlayed.concat([ nextMove.id ]);
        }

        // Let the other player make their move - delay this slightly, so that
        // this onDrop handler has time to complete its board update before the
        // next move happens (otherwise the board update gets into a race)
        setTimeout(() => {

            // Run the opponent's move
            const afterOpponentsMove = opponentPlays(player === "w" ? "b" : "w", nextMoveTree, newBoard, movesPlayed);
            // Update the drop handler with the new move tree resulting from the
            // opponent's next move
            if (afterOpponentsMove === null) {
                chessboardDiv.dropHandler = () => null;
            } else if (afterOpponentsMove.moveTree.length === 0) {
                endOfGame(afterOpponentsMove.movesPlayed);
            } else {
                chessboardDiv.dropHandler = pieceMovedHandler(afterOpponentsMove.moveTree, afterOpponentsMove.movesPlayed);
            }
        }, 100);
    };
};

/**
 * Initialise everything
 */
const init = () => {

    const moveTree = findMoveTree();
    const chessboardDiv = document.getElementsByClassName("chessboard")[0];

    // We don't need the move end handler for this practice capability
    chessboardDiv.moveEndHandler = () => null;

    // Put the chessboard in the starting position
    chessboardDiv.chessboard.position("start");

    // If we are playing as white, set up the handler for white's initial move
    if (chessboardDiv.chessboard.orientation() === "white") {

        chessboardDiv.dropHandler = pieceMovedHandler(moveTree, []);

    // If we are playing as black, pick one of white's possible moves to start
    } else {

        const initialBoard = {
            a1: "wR", b1: "wN", c1: "wB", d1: "wQ", e1: "wK", f1: "wB", g1: "wN", h1: "wR",
            a2: "wP", b2: "wP", c2: "wP", d2: "wP", e2: "wP", f2: "wP", g2: "wP", h2: "wP",
            a7: "bP", b7: "bP", c7: "bP", d7: "bP", e7: "bP", f7: "bP", g7: "bP", h7: "bP",
            a8: "bR", b8: "bN", c8: "bB", d8: "bQ", e8: "bK", f8: "bB", g8: "bN", h8: "bR"
        };

        const whiteMove = opponentPlays("w", moveTree, initialBoard, []);
        if (whiteMove.moveTree.length === 0) {
            endOfGame(whiteMove.movesPlayed);
        } else {
            chessboardDiv.dropHandler = pieceMovedHandler(whiteMove.moveTree, whiteMove.movesPlayed);
        }
    }
};

init();
