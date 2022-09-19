/**
 * Get the PGN from the code block
 */
const getPGN = () => {

    return document.getElementsByTagName("code")[0].textContent;
};

/**
 * Create a div for a PGN tag
 */
const tagElement = str => {

    const p = document.createElement("p");
    p.textContent = str;
    return p;
};

/**
 * Create a representation of the tags from a PGN
 */
const pgnTags = tags => {

    const div = document.createElement("div");
    div.classList.add("tags");

    const opening = tags.Opening;

    const whiteElo = tags.WhiteElo ? " (" + tags.WhiteElo + ")" : "";
    const white = tags.White + whiteElo;
    const blackElo = tags.BlackElo ? " (" + tags.BlackElo + ")" : "";
    const black = tags.Black + blackElo;

    const date = tags.UTCDate.value.split(".").reverse().join("/");
    const time = tags.UTCTime.value;

    const timeControlData = tags.TimeControl[0];
    const timeControl = "" + (timeControlData.seconds / 60) + "+" + timeControlData.increment;

    const h2 = document.createElement("h2");
    h2.textContent = opening;
    div.appendChild(h2);

    const h3 = document.createElement("h3");
    h3.textContent = white + " v " + black + ", " + date + " " + time + ", " + timeControl;
    div.appendChild(h3);

    return div;
};

/**
 * Take a position and generate a FEN for it
 */
const positionToFen = (orientation, position) => {

    // First build up a representation with spaces for empty squares
    const matrix = [1, 2, 3, 4, 5, 6, 7, 8].map(rank => {

        return ["a", "b", "c", "d", "e", "f", "g", "h"].map(file => {

            if (position[file + rank]) {

                // White piece, return the piece character in upper case
                const piece = position[file + rank];
                if (piece.substr(0, 1) === "w") {

                    return piece.substr(1);
                }

                // Black piece return as lower case
                return piece.substr(1).toLowerCase();
            }

            // No piece, return a space
            return " ";
        }).join("");
    });

    // Align the matrix with the orientation
    const orientedMatrix = orientation === "white" ? matrix.join("/") : matrix.reverse().join("/");

    // Now replace the empty squares with counts
    const fen = orientedMatrix.replace(/        /g, "8")
                               .replace(/       /g, "7")
                               .replace(/      /g, "6")
                               .replace(/     /g, "5")
                               .replace(/    /g, "4")
                               .replace(/   /g, "3")
                               .replace(/  /g, "2")
                               .replace(/ /g, "1")
    return fen;
};

/**
 * Create a set of FENs, one per move
 */
const createFens = (orientation, moves) => {

    // The starting position
    const board = {
        a1: "wR", b1: "wN", c1: "wB", d1: "wQ", e1: "wK", f1: "wB", g1: "wN", h1: "wR",
        a2: "wP", b2: "wP", c2: "wP", d2: "wP", e2: "wP", f2: "wP", g2: "wP", h2: "wP",
        a7: "bP", b7: "bP", c7: "bP", d7: "bP", e7: "bP", f7: "bP", g7: "bP", h7: "bP",
        a8: "bR", b8: "bN", c8: "bB", d8: "bQ", e8: "bK", f8: "bB", g8: "bN", h8: "bR"
    };

    // Go through the moves, generating a FEN for each one
    const result = {};
    moves.forEach(move => {

        // Convert the move to a 'from' and 'to' square
        const converted = convertNotation(move.turn, move.notation.notation, board);
        const [from, to] = converted.split("-");

        // Update the board to reflect the move
        const piece = board[from];
        delete board[from];
        board[to] = piece;
        result[move.moveNumber + move.turn] = positionToFen(orientation, board);
    });

    // Generate the FEN for this position
    return result;
};

/**
 * Clear any existing current move flags
 */
const clearCurrentMove = () => {

    [...document.getElementsByClassName("current-move")].forEach(elem => {
        elem.classList.remove("current-move");
    });
};

/**
 * Update the board based on the move which was clicked
 */
const updateBoard = (fens, move, player) => {

    const chessboardDiv = document.getElementsByClassName("chessboard")[0];
    chessboardDiv.chessboard.position(fens[move + player]);

    // Highlight the move in the moves table
    clearCurrentMove();
    document.getElementById(move + player).classList.add("current-move");
};

/**
 * Display comments associated with the current move
 */
const displayComments = (comments, move, player) => {

    const commentElem = document.getElementsByClassName("comment-area")[0];
    const commentArea = commentElem.parentNode;

    // If we have a comment, display it
    if (comments.comment) {

        // Set the text to be the comment text
        commentElem.textContent = comments.comment;

        // Attach the comment area after the current move
        document.getElementById(move + player).parentNode.insertAdjacentElement("afterend", commentArea);

        // Display the comment
        if (commentArea.style.display === "none") {
            commentArea.style.removeProperty("display");
        }

    // If there are no comments, hide the comment area
    } else {

        // Clear the text area
        if (commentElem.textContent) {
            commentElem.textContent = "";
        }

        // Hide it
        if (commentArea.style.display !== "none") {
            commentArea.style.display = "none";
        }

        // Move it to the end of the table, to avoid messing up the alternating
        // row colours
        commentArea.parentNode.appendChild(commentArea);
    }
};

/**
 * Create a representation of the moves from a PGN
 */
const pgnMoves = (orientation, moves) => {

    // First generate the set of FENs associated with the moves
    const fens = createFens(orientation, moves);

    // Table which will hold the moves
    const table = document.createElement("table");
    table.classList.add("moves");

    // Go through the moves, building up the move table
    const result = moves.reduce((result, move) => {

        // Find the last row in the table
        const tableRows = [...result.children];
        let lastRow = tableRows[tableRows.length - 1];

        // If we don't have a last row, create one
        if (!lastRow) {
            lastRow = document.createElement("tr");
            result.appendChild(lastRow);
        }

        // If we already have two moves in our last row, create a new row
        if ([...lastRow.children].length === 3) {
            lastRow = document.createElement("tr");
            result.appendChild(lastRow);
        }

        // Do we need a row number
        if ([...lastRow.children].length === 0) {
            const th = document.createElement("th");
            th.textContent = move.moveNumber + ".";
            lastRow.appendChild(th);
        }

        // Add our move to the last row
        const td = document.createElement("td");
        td.textContent = move.notation.notation;
        td.id = move.moveNumber + move.turn;
        lastRow.appendChild(td);

        // Make the cell clickable
        td.addEventListener("click", () => {
            updateBoard(fens, move.moveNumber, move.turn);
            displayComments(move.commentDiag, move.moveNumber, move.turn);
        });

        return result;

    }, table);

    // Create an element for the comments
    const commentContainer = document.createElement("tr");
    const commentArea = document.createElement("td");
    commentArea.setAttribute("colspan", "3");
    commentArea.classList.add("comment-area");
    commentContainer.appendChild(commentArea);
    table.appendChild(commentContainer);
    commentContainer.style.display = "none";

    return result;
};

/**
 * Create a PGN table
 *
 * Parses the passed in PGN and creates a table containing the data
 */
const pgnTable = (orientation, pgnString) => {

    // Parse the PGN
    const pgnArray = PgnParser.parse(pgnString);

    // Check for multiple games
    if (pgnArray.length > 1) {
        alert("Note that the PGN contains " + pgnArray.length + " games");
    }

    // Get the first game
    const pgn = pgnArray[0];

    // Build up the result
    return {
        tags: pgnTags(pgn.tags),
        table: pgnMoves(orientation, pgn.moves)
    };

    return result;
};

/**
 * Reset the board back to the start position
 */
const resetBoard = () => {

    const chessboardDiv = document.getElementsByClassName("chessboard")[0];
    chessboardDiv.chessboard.position("start");
    clearCurrentMove();
};
/**
 * Advance the move by the specified increment
 */
const stepMoveBy = increment => {

    return () => {

        // Grab all our possible moves
        const moveTable = [...document.getElementsByClassName("moves")][0];
        const moves = [...moveTable.getElementsByTagName("td")];

        // Find the current move
        const currentMove = [...document.getElementsByClassName("current-move")][0];

        // If we have no current move and we are going forwards, go to the first move
        if (!currentMove) {

            if (increment > 0 && moves[0]) {
                moves[0].click();
            }

        // If we are on the first move and going backwards, set starting position
        } else if (currentMove.id === "1w" && increment < 0) {

            resetBoard();

        // Otherwise, work out what the next move is
        } else {

            // Current and next player
            const currentPlayer = currentMove.id.substr(-1);
            const nextPlayer = currentPlayer === "w" ? "b" : "w";

            // Check whether next move is within the existing move pair
            let nextMove;
            if ((currentPlayer === "w" && increment > 0) ||
                (currentPlayer === "b" && increment < 0)) {

                nextMove = currentMove.id.substr(0, currentMove.id.length - 1) + nextPlayer;

            // Otherwise, need to increment move number and set back to white
            } else {

                const moveNumber = currentMove.id.substr(0, currentMove.id.length - 1);
                nextMove = (moveNumber - 0 + increment) + nextPlayer;
            }

            // Trigger the next move
            const nextMoveTd = document.getElementById(nextMove);
            if (nextMoveTd) {
                nextMoveTd.click();
            }
        }
    };
};

/**
 * Create the controls block
 */
const controlBlock = () => {

    const div = document.createElement("div");
    div.classList.add("move-controls");

    const toStart = document.createElement("button");
    const toStartGlyph = document.createElement("i");
    toStartGlyph.classList.add("las");
    toStartGlyph.classList.add("la-backward");
    toStart.appendChild(toStartGlyph);
    div.appendChild(toStart);

    // The start button goes back to the initial position
    toStart.addEventListener("click", resetBoard);

    const stepBack = document.createElement("button");
    const stepBackGlyph = document.createElement("i");
    stepBackGlyph.classList.add("las");
    stepBackGlyph.classList.add("la-step-backward");
    stepBack.appendChild(stepBackGlyph);
    div.appendChild(stepBack);

    // The step backward button moves the game back one move
    stepBack.addEventListener("click", stepMoveBy(-1));

    const stepForward = document.createElement("button");
    const stepForwardGlyph = document.createElement("i");
    stepForwardGlyph.classList.add("las");
    stepForwardGlyph.classList.add("la-step-forward");
    stepForward.appendChild(stepForwardGlyph);
    div.appendChild(stepForward);

    // The step forward button moves the game forward one move
    stepForward.addEventListener("click", stepMoveBy(1));

    const toEnd = document.createElement("button");
    const toEndGlyph = document.createElement("i");
    toEndGlyph.classList.add("las");
    toEndGlyph.classList.add("la-forward");
    toEnd.appendChild(toEndGlyph);
    div.appendChild(toEnd);

    // The end button goes to the final position
    toEnd.addEventListener("click", () => {

        const moveTable = [...document.getElementsByClassName("moves")][0];
        const moves = [...moveTable.getElementsByTagName("td")];
        const lastMove = moves[moves.length - 1];
        lastMove.click();
    });

    return div;
};

/**
 * Initialise everything
 */
const init = () => {

    // Find the chessboard
    const chessboardDiv = document.getElementsByClassName("chessboard")[0];

    // We don't need a handler for end of move
    chessboardDiv.moveEndHandler = () => null;

    // Assume we start at the start of a game
    chessboardDiv.chessboard.position("start");

    // Get the PGN and also derive the FEN for each move
    const pgn = getPGN();
    const moves = pgnTable(chessboardDiv.chessboard.orientation, pgn);

    // Add the tags from the PGN
    const header = [...document.getElementsByTagName("header")][0];
    header.insertAdjacentElement("afterend", moves.tags);

    // Add the moves from the PGN
    const section = [...document.getElementsByClassName("section-content")][0];
    section.insertAdjacentElement("afterbegin", controlBlock());
    section.insertAdjacentElement("afterbegin", moves.table);
};

init();
