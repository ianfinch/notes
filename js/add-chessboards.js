let boardNumber = 1;

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
 * Function to update the chessboard in the current section with the FEN passed as a parameter
 */
const updateChessboard = (fen, link) => {

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
            board.chessboard.position(fen);
        }
    }
};

[...document.getElementById("content").getElementsByTagName("a")].forEach(link => {

    const basedir = location.href.replace(/[^\/]*$/, "");
    const fenString = link.href.replace(basedir, "");

    if (fenString.match(/^fen#/)) {

        const fen = decodeURI(fenString.replace(/^fen#/, ""));

        link.removeAttribute("href");
        link.addEventListener("click", e => updateChessboard(fen, e.target));
    }
});
