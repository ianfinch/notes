let boardNumber = 1;

/**
 * Find a piece on the chessboard
 */
const findPieces = (piece, position) => {

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
const isValidRookMove = (from, to, position) => {

    // Check same column
    if (from.substr(0, 1) === to.substr(0, 1)) {

        return true;
    }

    // Check same row
    if (from.substr(1) === to.substr(1)) {

        const firstFile = from.substr(0, 1) < to.substr(0, 1) ? from.substr(0, 1) : to.substr(0, 1);
        const lastFile = from.substr(0, 1) > to.substr(0, 1) ? from.substr(0, 1) : to.substr(0, 1);

        const blockingPieces = [ "a", "b", "c", "d", "e", "f", "g", "h" ].map(file => {

            if (file <= firstFile || file >= lastFile) {
                return null;
            }

            return position[file + from.substr(1)];
        }).filter(x => x);

        // If there are pieces in the way, we can't move this piece
        if (blockingPieces.length !== 0) {
            return false;
        }

        // If we get here, everything is okay
        return true;
    }

    // No available move
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
 * Is a move a valid King move?
 */
const isValidKingMove = (from, to) => {

    const [fromFile, fromRank] = from.split("");
    const [toFile, toRank] = to.split("");

    // Check king has moved
    if (fromFile === toFile && fromRank === toRank) {
        return false;
    }

    // King can only move one square ... check rank first
    if (Math.abs(fromRank - toRank) > 1) {
        return false;
    }

    // Check file next
    const files = "abcdefgh";
    if (Math.abs(files.indexOf(fromFile) - files.indexOf(toFile)) > 1) {
        return false;
    }

    // Everything is okay
    return true;
};

/**
 * Is a move a valid move?
 */
const isValidMove = (piece, from, to, position) => {

    if (piece === "R") {
        return isValidRookMove(from, to, position);
    }

    if (piece === "B") {
        return isValidBishopMove(from, to);
    }

    if (piece === "N") {
        return isValidKnightMove(from, to);
    }

    if (piece === "Q") {
        return isValidRookMove(from, to, position) || isValidBishopMove(from, to);
    }

    if (piece === "K") {
        return isValidKingMove(from, to);
    }

    return false;
};

/**
 * Convert a move from notation to start and end square
 */
const convertNotation = (player, move, position) => {

    // If the move has a check indicator, remove that for this analysis
    move = move.replace(/[+#]$/, "");

    // Pawn move
    if (move.match(/^[a-h][1-8]/)) {

        const [file, rankString] = move.split("");
        const rank = rankString - 0;

        if (player === "w") {

            // Standard pawn move
            if (position[file + (rank - 1)] === "wP") {
                return file + (rank - 1) + "-" + move;
            }

            // Initial double pawn move
            if (rank === 4 && position[file + (rank - 2)] === "wP") {
                return file + (rank - 2) + "-" + move;
            }

        } else {

            if (position[file + (rank + 1)] === "bP") {
                return file + (rank + 1) + "-" + move;
            }

            if (rank === 5 && position[file + (rank + 2)] === "bP") {
                return file + (rank + 2) + "-" + move;
            }

        }

    // Pawn captures
    } else if (move.match(/^[a-h]x[a-h][1-8]/)) {

        const [from, takes, to, rankString] = move.split("");
        const rank = rankString - 0;

        if (player === "w") {
            return from + (rank - 1) + "-" + to + rank;
        }

        return from + (rank + 1) + "-" + to + rank;

    // Simple piece moves
    } else if (move.match(/^[KQRBN][a-h]?x?[a-h][1-8]/)) {

        const simplifiedMove = move.replace("x", "");
        const piece = simplifiedMove.substr(0, 1);
        const start = findPieces(player + piece, position);
        const end = simplifiedMove.substr(-2);
        const startHint = simplifiedMove.length === 3 ? null : simplifiedMove.substr(1, 1);

        // There may be multiple pieces of this type on the board, so
        // find the one which can make the legal move.  First, if there is a
        // starting file specified, filter down to matching options, then
        // examine all pieces of this type and see which ones could move to
        // this finishing position
        const selectedStart = start.filter(possibleStart => {

            if (!startHint) {
                return possibleStart;
            }

            return possibleStart.substr(0, 1) === startHint;

        }).reduce((result, possibleStart) => {

            if (isValidMove(piece, possibleStart, end, position)) {
                return possibleStart;
            }

            return result;
        }, null);

        // And make the move
        return selectedStart + "-" + end;

    // Castling
    } else if (move === "O-O") {

        if (player === "w") {
            return "e1-g1,h1-f1";
        }

        return "e8-g8,h8-f8";

    } else if (move === "O-O-O") {

        if (player === "w") {
            return "e1-c1,a1-d1";
        }

        return "e8-c8,a8-d8";
    }

    return null;
};

/**
 * Update chessboard based on a move
 */
const displayMove = (moveString, chessboard) => {

    const [player, move] = moveString.split("#");
    const position = chessboard.position();

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

    // Otherwise, convert the notation into a move
    } else {

        //convertNotation(player, move, position).split(",").forEach(moveToMake => chessboard.move(moveToMake));
        chessboard.move.apply(null, convertNotation(player, move, position).split(","));
    }

};

/**
 * Generate list of moves from a move table
 */
const movesFromTable = tbody => {

    return [...tbody.children].map(tr => {

        const tdList = [...tr.children].map(x => x.textContent);
        const moves = [ "w#" + tdList[1], "b#" + tdList[2] ];
        return moves;
    }).flat().filter(x => x.match(/#[a-hRNBQKO]/)).join(",");
};

/**
 * Function to update the chessboard in the current section with the FEN passed as a parameter
 */
const updateChessboard = (moves, link) => {

    // Find the table for this link
    let tbody = link;
    while (tbody.localName && tbody.localName !== "tbody") {
        tbody = tbody.parentNode;
    }

    // Check we found a tbody
    if (tbody.localName && tbody.localName === "tbody") {

        // Add any moves from the table to the passed in moves
        const additionalMoves = movesFromTable(tbody);
        if (additionalMoves) {

            moves = moves + "," + additionalMoves;
        }

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
    }
};

/**
 * Set up any chessboards, based on <PRE> ... </PRE> tags
 */
const initChessboards = () => {

    [...document.getElementById("content").getElementsByTagName("pre")].forEach(pre => {

        // We don't want the <pre> ... </pre> blocks which include our markdown, so
        // filter them out
        if (!pre.style.display || pre.style.display !== "none") {

            // Create a div for the board
            const board = document.createElement("div");
            board.id = "board-" + boardNumber;
            board.classList.add("chessboard");
            boardNumber++;

            // Move the items in the section to a new DIV
            const section = pre.parentElement;
            const column = document.createElement("div");
            column.classList.add("section-content");

            // Move display elements across to the new DIV
            [...section.childNodes]
                .filter(x => x.nodeName !== "PRE")
                .forEach(child => column.appendChild(child));

            // Add the <pre> ... </pre> blocks to the end
            [...section.childNodes]
                .filter(x => x.nodeName === "PRE")
                .forEach(child => column.appendChild(child));

            // Add the new DIV to the section
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

            // Set the move end handler
            board.moveEndHandler = triggerMakeMove(board);

            // Set the drop handler
            board.dropHandler = () => null;

            // Find where our chess pieces are
            const cssBase = [...document.styleSheets].map(css => {

                if (css.href.match(/\/chessboard-[^/]*\.min\.css/)) {
                    return css.href;
                }

                return null;
            }).filter(x => x)[0].replace(/\/css\/[^/]*/, "");

            // Display the chessboard
            board.chessboard = Chessboard(board.id, {
                draggable: true,
                moveSpeed: 500,
                onDrop: (a, b, c, d, e, f) => { return board.dropHandler(a, b, c, d, e, f); },
                onMoveEnd: () => { board.moveEndHandler(); },
                orientation: nextPlayer,
                pieceTheme: cssBase + "/img/chesspieces/wikipedia/{piece}.png",
                position: fen,
                showNotation: false
            });

            // Hide the pre block
            pre.style.display = "none";
        }
    });
};

/**
 * Handle links (<a> ... </a> tags)
 */
const initChessboardLinks = () => {

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
};

/**
 * Initialise the chessboard after the markdown conversion is complete
 */
addEventListener("markdownConverted", () => {

    initChessboards();
    initChessboardLinks();
    window.dispatchEvent(new Event("chessboardConverted"));
});
