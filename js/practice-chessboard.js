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
const findMoveTree = () => {

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
 * Find the next moves from a move tree and play one of them
 */
const opponentPlays = (player, moveTree, position) => {

    let nextMove = moveTree[0];

    // If no move is available, we have reached the end of this play
    if (!nextMove || (!nextMove[player] && !nextMove.variations)) {
        addLine("Variation complete");
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
    chessboard.move(convertedMove);
    addMoveToNotes(player, nextMove);

    return removeMove(moveTree, player);
};

/**
 * When a piece is moved, look for this option in our move tree and select a
 * response to it.  We pass the move tree into this function to get our actual
 * handler, with the move tree in the enclosure.
 */
const pieceMovedHandler = moveTree => {

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
                document.getElementsByClassName("chessboard")[0].chessboard.move(multiMove[1]);
            }, 100);
        }

        // If we get this far, the move which was played matches the expected
        // next move from our move tree.  We will now remove that move from our
        // move tree.
        const nextMoveTree = removeMove(moveTree, player);

        // Let the other player make their move - delay this slightly, so that
        // this onDrop handler has time to complete before the next move
        // happens
        setTimeout(() => {

            // Run the opponent's move
            const afterOpponentsMove = opponentPlays(player === "w" ? "b" : "w", nextMoveTree, newBoard);

            // Update the drop handler with the new move tree resulting from the
            // opponent's next move
            document.getElementsByClassName("chessboard")[0].dropHandler = pieceMovedHandler(afterOpponentsMove);
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

    // If we are playing as white, set up the handler for white's initial move
    if (chessboardDiv.chessboard.orientation() === "white") {

        chessboardDiv.dropHandler = pieceMovedHandler(moveTree);

    // If we are playing as black, pick one of white's possible moves to start
    } else {

        const initialBoard = {
            a1: "wR", b1: "wN", c1: "wB", d1: "wQ", e1: "wK", f1: "wB", g1: "wN", h1: "wR",
            a2: "wP", b2: "wP", c2: "wP", d2: "wP", e2: "wP", f2: "wP", g2: "wP", h2: "wP",
            a7: "bP", b7: "bP", c7: "bP", d7: "bP", e7: "bP", f7: "bP", g7: "bP", h7: "bP",
            a8: "bR", b8: "bN", c8: "bB", d8: "bQ", e8: "bK", f8: "bB", g8: "bN", h8: "bR"
        };

        const afterOpponentsMove = opponentPlays("w", moveTree, initialBoard);
        chessboardDiv.dropHandler = pieceMovedHandler(afterOpponentsMove);
    }
};

init();
