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
        const [fen, nextPlayer] = pre.textContent.split(" ");

        // Display the chessboard
        board.chessboard = Chessboard(board.id, {
            orientation: nextPlayer === "w" ? "black" : "white",
            pieceTheme: "../../img/chesspieces/wikipedia/{piece}.png",
            position: fen,
            showNotation: false
        });

        // Hide the pre block
        pre.style.display = "none";
    }

});
