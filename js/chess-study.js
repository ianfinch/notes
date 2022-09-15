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
};

init();
