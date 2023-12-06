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
 * Add a move to the notes
 */
const addMoveToNotes = (player, move) => {

    if (player === "w") {

        addLine("1. " + move);

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
 * Do end of game housekeeping
 */
const endOfGame = () => {

    addLine("Line complete");

/*
    if ([...document.getElementsByTagName("ul")].length === 0) {
        addLine("All variations completed");
    } else {
*/
        addPlayAgainButton();
/*
    }
*/
};

/**
 * Select a random line from our set of lines
 */
const randomLine = lines => {

    const selection = Math.floor(Math.random() * lines.length);

    return [ lines[selection], lines.toSpliced(selection, 1) ];
};

/**
 * Play the opponent's move
 */
const opponentPlays = (player, position, moves) => {

    // Grab the next move
    const move = moves[0];
    moves = moves.toSpliced(0, 1);

    // Play the move
    const convertedMove = convertNotation(player, move, position);
    const chessboard = document.getElementsByClassName("chessboard")[0].chessboard;
    chessboard.move.apply(null, convertedMove.split(","));
    addMoveToNotes(player, move);
};

/**
 * Initialise everything
 */
const init = lines => {

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

        // Randomise the lines
        const randomised = lines.reduce(result => {

            const [selectedLine, remainingLines] = randomLine(result.original);
            result.randomised.push(selectedLine);
            result.original = remainingLines;
            return result;
            
        }, { randomised: [], original: lines }).randomised;

        const initialBoard = {
            a1: "wR", b1: "wN", c1: "wB", d1: "wQ", e1: "wK", f1: "wB", g1: "wN", h1: "wR",
            a2: "wP", b2: "wP", c2: "wP", d2: "wP", e2: "wP", f2: "wP", g2: "wP", h2: "wP",
            a7: "bP", b7: "bP", c7: "bP", d7: "bP", e7: "bP", f7: "bP", g7: "bP", h7: "bP",
            a8: "bR", b8: "bN", c8: "bB", d8: "bQ", e8: "bK", f8: "bB", g8: "bN", h8: "bR"
        };

        opponentPlays("w", initialBoard, randomised[0].split(/ /));

/*
        const whiteMove = opponentPlays("w", moveTree, initialBoard, []);
        if (whiteMove.moveTree.length === 0) {
            endOfGame(whiteMove.movesPlayed);
        } else {
            chessboardDiv.dropHandler = pieceMovedHandler(whiteMove.moveTree, whiteMove.movesPlayed);
        }
*/
    }
};
