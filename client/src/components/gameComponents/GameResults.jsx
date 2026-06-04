import { useState } from 'react';
import { Button } from 'react-bootstrap';

function GameResults(props) {
  // The final score is displayed. The user can click the button to play again
  const result = props.result;
  const restartGame = props.restartGame;

  return (
    <div className="text-center">
      <h2 className="display-4">{result?.finalScore || 0} Coins</h2>
      <p className="lead">{result?.valid ? "Good job reaching your destination!" : "You lost all your coins."}</p>
      
      <Button  size="lg" className="mt-3" onClick={restartGame}>
        Play Again
      </Button>
    </div>
  );
}

export default GameResults;