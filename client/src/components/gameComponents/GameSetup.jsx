import { Button } from 'react-bootstrap';

import NetworkDisplay from '../NetworkDisplay.jsx'; 

function GameSetup(props) {
  return (
    <div className="container">
      <div className="row align-items-center">
        
        <div className="col-md-6 text-start mb-4 mb-md-0">
          <h2>Ready to ride the rails?</h2>
          <p className="text-muted">
            Review the network map to the right. When you start, the connections will disappear and the 90-second timer will begin.
          </p>
          <Button variant="primary" size="lg" onClick={props.startGame}>
            Start New Game
          </Button>
        </div>

        <div className="col-md-6">
          <NetworkDisplay stations={props.stations} connections={props.connections} lines={props.lines} showEdges={true} />
        </div>
        
      </div>
    </div>
  );
}

export default GameSetup;