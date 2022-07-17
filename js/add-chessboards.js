let boardNumber = 1;

/**
 * Find a piece on the chessboard
 */
const findPieces = (piece, chessboard) => {

    const position = chessboard.position();

    return Object.keys(position).reduce((result, square) => {

        if (position[square] === piece) {
            result.push(square);
            return result;
        }

        return result;
    }, []);
};

/**
 * Update the chessboard display, using a FIFO stack so that one move is
 * displayed at a time
 */
const moveStack = [];
const makeMove = chessboard => {

    if (!moveStack.length) {
        return null;
    }

    const nextMove = moveStack.shift();
    displayMove(nextMove, chessboard);

};

/**
 * Trigger the next move, to be used as an event handler
 */
const triggerMakeMove = board => {

    return () => {
        makeMove(board.chessboard);
    };
};

/**
 * Add a move to the move stack
 */
const queueMove = move => {
    moveStack.push(move);
};

/**
 * Clear down the move stack
 */
const clearPendingMoves = () => {

    while (moveStack.length) {
        moveStack.shift();
    }
};

/**
 * Is a move a valid rook move?
 */
const isValidRookMove = (from, to) => {

    if (from.substr(0, 1) === to.substr(0, 1) ||
        from.substr(1) === to.substr(1)) {

        return true;
    }

    return false;
};

/**
 * Is a move a valid bishop move?
 */
const isValidBishopMove = (from, to) => {

    const [toFile, toRank] = to.split("");
    const files = "abcdefgh";

    const moves = files.split("").map(file => {

        const result = [];
        const delta = files.indexOf(toFile) - files.indexOf(file);
        const positiveDelta = toRank - 0 + delta;
        const negativeDelta = toRank - delta;

        if (delta === 0) {
            return result;
        }

        if (positiveDelta > 0 && positiveDelta < 9) {
            result.push(file + positiveDelta);
        }

        if (negativeDelta > 0 && negativeDelta < 9) {
            result.push(file + negativeDelta);
        }

        return result;

    }).flat();

    if (moves.includes(from)) {
        return true;
    }

    return false;
};

/**
 * Is a move a valid knight move?
 */
const isValidKnightMove = (from, to) => {

    const [toFile, toRank] = to.split("");
    const files = "abcdefgh";

    const currentFileIndex = files.indexOf(toFile);
    const moves = files.split("").map(file => {

        if (file === toFile) {
            return null;
        }

        const delta = Math.abs(files.indexOf(file) - currentFileIndex);
        if (delta <= 2) {
            return [file, 3 - delta];
        }

        return null;
    }).filter(x => x).map(([file, delta]) => {

        return [
            file + (toRank - delta),
            file + (toRank - 0 + delta)
        ];
    }).flat();

    if (moves.includes(from)) {
        return true;
    }

    return false;
};

/**
 * Is a move a valid move?
 */
const isValidMove = (piece, from, to) => {

    if (piece === "R") {
        return isValidRookMove(from, to);
    }

    if (piece === "B") {
        return isValidBishopMove(from, to);
    }

    if (piece === "N") {
        return isValidKnightMove(from, to);
    }

    if (piece === "Q") {
        return isValidRookMove(from, to) || isValidBishopMove(from, to);
    }

    return false;
};

/**
 * Update chessboard based on a move
 */
const displayMove = (moveString, chessboard) => {

    const [player, move] = moveString.split("#");

    // Check for a FEN
    if (player === "fen") {

        // If this is the same as the current position, manually trigger
        // another move
        if (chessboard.position("fen") === move) {
            makeMove(chessboard);
            return;
        }

        // Otherwise, set the position
        chessboard.position(move);

    // Pawn move
    } else if (move.match(/^[a-h][1-8]/)) {

        const position = chessboard.position();
        const [file, rankString] = move.split("");
        const rank = rankString - 0;

        if (player === "w") {

            // Standard pawn move
            if (position[file + (rank - 1)] === "wP") {
                chessboard.move(file + (rank - 1) + "-" + move);

            // Initial double pawn move
            } else if (rank === 4 && position[file + (rank - 2)] === "wP") {
                chessboard.move(file + (rank - 2) + "-" + move);
            }

        } else {

            if (position[file + (rank + 1)] === "bP") {
                chessboard.move(file + (rank + 1) + "-" + move);

            } else if (rank === 5 && position[file + (rank + 2)] === "bP") {
                chessboard.move(file + (rank + 2) + "-" + move);
            }

        }

    // Pawn captures
    } else if (move.match(/^[a-h]x[a-h][1-8]/)) {

        const [from, takes, to, rankString] = move.split("");
        const rank = rankString - 0;

        if (player === "w") {
            chessboard.move(from + (rank - 1) + "-" + to + rank);
        } else {
            chessboard.move(from + (rank + 1) + "-" + to + rank);
        }

    // Simple piece moves
    } else if (move.match(/^[KQRBN]x?[a-h][1-8]/)) {

        const simplifiedMove = move.replace("x", "");
        const piece = simplifiedMove.substr(0, 1);
        const start = findPieces(player + piece, chessboard);
        const end = simplifiedMove.substr(1);

        // There may be multiple pieces of this type on the board, so
        // find which one can make the legal move
        const selectedStart = start.reduce((result, possibleStart) => {

            if (isValidMove(piece, possibleStart, end)) {
                return possibleStart;
            }

            return result;
        }, null);

        // And make the move
        chessboard.move(selectedStart + "-" + end);

    // Castling
    } else if (move === "O-O") {

        if (player === "w") {
            chessboard.move("e1-g1", "h1-f1");
        } else {
            chessboard.move("e8-g8", "h8-f8");
        }

    } else if (move === "O-O-O") {

        if (player === "w") {
            chessboard.move("e1-c1", "a1-d1");
        } else {
            chessboard.move("e8-c8", "a8-d8");
        }
    }
};

/**
 * Function to update the chessboard in the current section with the FEN passed as a parameter
 */
const updateChessboard = (moves, link) => {

    // Find the section this link is in
    let section = link;
    while (section.localName && section.localName !== "section") {
        section = section.parentNode;
    }

    // Check we found a section
    if (section.localName && section.localName === "section") {

        // Now find the chessboard
        const board = section.getElementsByClassName("chessboard")[0];
        if (board && board.chessboard) {

            // Store each of the moves
            clearPendingMoves();
            moves.split(/, */).forEach(move => queueMove(move));

            // Kick off the first move
            makeMove(board.chessboard);
        }
    }
};

/**
 * Set up any chessboards, based on <PRE> ... </PRE> tags
 */
[...document.getElementById("content").getElementsByTagName("pre")].forEach(pre => {

    // Only want the anonymous pre tags we've added
    if (!pre.id) {

        // Create a div for the board
        const board = document.createElement("div");
        board.id = "board-" + boardNumber;
        board.classList.add("chessboard");
        boardNumber++;

        // Move the items in the section to a new DIV
        const section = pre.parentElement;
        const column = document.createElement("div");
        column.classList.add("section-content");
        [...section.childNodes].forEach(child => {
            column.appendChild(child);
        });
        section.appendChild(column);

        // Add the board to the page
        section.appendChild(board);
        section.classList.add("contains-chessboard");

        // The content of the pre block is the FEN string
        // ChessboardJs only wants the first part of this
        const [fen] = pre.textContent.split(" ");

        // Check whether we need to flip the board
        const codeBlock = section.getElementsByTagName("code");
        const nextPlayer = codeBlock[0].classList.contains("black") ? "black" : "white";

        // Display the chessboard
        board.chessboard = Chessboard(board.id, {
            moveSpeed: 500,
            onMoveEnd: triggerMakeMove(board),
            orientation: nextPlayer,
            pieceTheme: "../../img/chesspieces/wikipedia/{piece}.png",
            position: fen,
            showNotation: false
        });

        // Hide the pre block
        pre.style.display = "none";
    }

});

/**
 * Handle links (<a> ... </a> tags)
 */
[...document.getElementById("content").getElementsByTagName("a")].forEach(link => {

    const basedir = location.href.replace(/[^\/]*$/, "");
    const data = link.href.replace(basedir, "");

    if (data.match(/^(fen|w|b)#/)) {

        const player = data.substr(0, 1);
        const move = decodeURI(data);
        link.removeAttribute("href");
        link.addEventListener("click", e => updateChessboard(move, e.target));
    }
});
