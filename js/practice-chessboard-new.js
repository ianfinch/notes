/**
 * Add a move to the notes section
 */
const addLine = text => {

    const div = document.createElement("div");
    const notes = document.getElementsByTagName("section")[0];
    const n = [...notes.children].filter(x => x.tagName === "DIV").length + 1;
    div.textContent = n + ". " + text;
    notes.appendChild(div);
};

/**
 * Add some text to the notes section
 */
const addText = text => {

    const div = document.createElement("div");
    const strong = document.createElement("strong");
    const notes = document.getElementsByTagName("section")[0];
    strong.textContent = text;
    div.appendChild(strong);
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
 * Add a move to the notes
 */
const addMoveToNotes = (player, move) => {

    if (player === "w") {

        addLine(move);

    } else {

        addToLastLine(" " + move);
    }
};

/**
 * Create a "play again" button
 */
const playAgainButton = moves => {

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
        startGame(moves);
    });

    return button;
};

/**
 * Add a play again button to the bottom of the notes section
 */
const addPlayAgainButton = moves => {

    const notes = document.getElementsByTagName("section")[0];
    notes.appendChild(playAgainButton(moves));
};

/**
 * Do end of game housekeeping
 */
const endOfGame = moves => {

    if (moves.remaining[0]) {

        addText("Line complete");
        moves.line = moves.remaining[0];
        moves.remaining = moves.remaining.toSpliced(0, 1);
        addPlayAgainButton(moves);

    } else {

        addText("All lines complete");
    }
};

/**
 * Select a random line from our set of lines
 */
const randomLine = lines => {

    const selection = Math.floor(Math.random() * lines.length);

    return [ lines[selection], lines.toSpliced(selection, 1) ];
};

/**
 * When a piece is moved, look for the next move in that line to make
 */
const pieceMovedHandler = (moves) => {

    const chessboardDiv = document.getElementsByClassName("chessboard")[0];

    return (oldLocation, newLocation, piece, newBoard, oldBoard, orientation) => {

        const player = piece.substr(0, 1);

        // The player should reflect the orientation, so cancel the move if
        // that's not the case
        if (orientation.substr(0, 1) !== player) {
            return "snapback";
        }

        // Now get the next move for the player
        const nextMove = moves.line[0];

        // Check the move made against this next move tree - first we
        // need to convert from the notation to a start/end pair
        const convertedMove = convertNotation(player, nextMove, oldBoard);
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
        // next move.  We will now remove that move from our line.
        moves.line = moves.line.toSpliced(0, 1);

        // Let the other player make their move - delay this slightly, so that
        // this onDrop handler has time to complete its board update before the
        // next move happens (otherwise the board update gets into a race)
        setTimeout(() => {

            // Run the opponent's move
            opponentPlays(player === "w" ? "b" : "w", newBoard, moves);
        }, 100);
    };
};

/**
 * Play the opponent's move
 */
const opponentPlays = (player, position, moves) => {

    // If we need a new board
    const initialBoard = {
        a1: "wR", b1: "wN", c1: "wB", d1: "wQ", e1: "wK", f1: "wB", g1: "wN", h1: "wR",
        a2: "wP", b2: "wP", c2: "wP", d2: "wP", e2: "wP", f2: "wP", g2: "wP", h2: "wP",
        a7: "bP", b7: "bP", c7: "bP", d7: "bP", e7: "bP", f7: "bP", g7: "bP", h7: "bP",
        a8: "bR", b8: "bN", c8: "bB", d8: "bQ", e8: "bK", f8: "bB", g8: "bN", h8: "bR"
    };

    // If we don't have a position, use the initial one
    if (position === null) {

        position = initialBoard;
    }

    // If there are is no next line, we've exhausted all the variations
    // If there's no next move, go on to the next line
    if (!moves.line || moves.line.length === 0) {

        endOfGame(moves);

    // Otherwise, move on to the next move
    } else {

        // Grab the next move
        const move = moves.line[0];
        moves.line = moves.line.toSpliced(0, 1);

        // Play the move
        const convertedMove = convertNotation(player, move, position);
        const chessboard = document.getElementsByClassName("chessboard")[0].chessboard;
        chessboard.move.apply(null, convertedMove.split(","));
        addMoveToNotes(player, move);

        // Check we still have moves to play
        if (moves.line.length === 0) {

            endOfGame(moves);

        // Set up the response for the next move
        } else {

            const chessboardDiv = document.getElementsByClassName("chessboard")[0];
            chessboardDiv.dropHandler = pieceMovedHandler(moves);
        }
    }
};

/**
 * Start the game
 */
const startGame = lines => {

    const chessboardDiv = document.getElementsByClassName("chessboard")[0];

    // We don't need the move end handler for this practice capability
    chessboardDiv.moveEndHandler = () => null;

    // Put the chessboard in the starting position
    chessboardDiv.chessboard.position("start");

    // If we are playing as white, set up the handler for white's initial move
    if (chessboardDiv.chessboard.orientation() === "white") {

alert("White TBD");
//        chessboardDiv.dropHandler = pieceMovedHandler(moveTree, []);

    // If we are playing as black, pick one of white's possible moves to start
    } else {

        opponentPlays("w", null, lines);
    }
};

/**
 * Initialise everything
 */
const initPractice = lines => {

    // Randomise the lines
    const randomised = lines.reduce(result => {

        const [selectedLine, remainingLines] = randomLine(result.original);
        result.randomised.push(selectedLine);
        result.original = remainingLines;
        return result;
        
    }, { randomised: [], original: lines }).randomised.map(x => x.split(/ /));

    // Now play
    startGame({ line: randomised[0], remaining: randomised.toSpliced(0, 1) });
};
