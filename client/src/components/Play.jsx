import React, { useState, useEffect, useContext } from 'react';
import { Navigate } from 'react-router-dom';

import UserContext from '../contexts/UserContext';

import { Spinner, Button, Alert, ProgressBar, Card } from 'react-bootstrap'

import { getStations, getConnections, setupGame, submitRoute } from '../api/api.js';
import NetworkDisplay from './NetworkDisplay.jsx';


function Play(props) {
  const user = useContext(UserContext);

  const [phase, setPhase] = useState('SETUP');

  const [gameInfo, setGameInfo] = useState(undefined);
  const [executionResults, setExecutionResults] = useState(undefined);
  
  const [stations, setStations] = useState([]);
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEdges, setShowEdges] = useState(true);

  if (!user?.id) {
    return <Navigate to="/login" />;
  }

  useEffect(() => {
    if (user?.id) {
      Promise.all([getStations(), getConnections()])
        .then(([stationsData, connectionsData]) => {
          setStations(stationsData);
          setConnections(connectionsData);
          setLoading(false);
        })
        .catch(err => {
          setError(err.message);
          setLoading(false);
        });
    }
  }, [user]);

  const handleStartGame = async function () {
    try {
      const data = await setupGame();
      setGameInfo({
        id: data.gameId, 
        startingStationId: data.startingStationId,
        destinationStationId: data.destinationStationId
      });
      setPhase('PLANNING');
    } catch (err) {
      setError(err.message);
    }
  };
  const handleRouteSubmit = async function (routeArray) {
    setPhase('EXECUTION');
    try {
      const formattedRoute = routeArray.map(id => ({ stationId: id }));
      const results = await submitRoute(gameInfo.id, formattedRoute);
      setExecutionResults(results);
    } catch (err) {
      setError(err.message);
    }
  };
  const handleExecutionDone = () => {
    setPhase('RESULTS');
  };
  const handlePlayAgain = () => {
    setGameInfo({ id: null, startingStationId: null, destinationStationId: null });
    setExecutionResults(null);
    setPhase('SETUP');
  };


  if (loading) {
    return <div className="text-center my-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2 text-muted">Loading game...</p>
          </div>
  }

  if (error) {
    return <Alert variant="danger" className="m-4">Error: {error}</Alert>;
  }

  return <>
      <div>
        {phase === 'SETUP' && (
          <GameSetup stations={stations} connections={connections} startGame={handleStartGame} />
        )}
        {phase === 'PLANNING' && (
          <GamePlanning 
            stations={stations}
            connections={connections}
            gameInfo={gameInfo} 
            onSubmit={handleRouteSubmit} 
          />
        )}
        {phase === 'EXECUTION' && (
          <GameExecution 
            results={executionResults} 
            done={handleExecutionDone} 
          />
        )}
        {phase === 'RESULTS' && (
          <GameResults 
            result={executionResults} 
            restartGame={handlePlayAgain} 
          />
        )}
      </div>
  </>
}

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
          <NetworkDisplay stations={props.stations} connections={props.connections} showEdges={true} />
        </div>
        
      </div>
    </div>
  );
}

function GamePlanning(props) {
  const { stations, gameInfo, onSubmit } = props;

  const [timeLeft, setTimeLeft] = useState(90);
  const [route, setRoute] = useState([gameInfo.startingStationId]);
  
  // States for the two dropdowns
  const [segmentStart, setSegmentStart] = useState(gameInfo.startingStationId);
  const [segmentEnd, setSegmentEnd] = useState("");

  // Timer logic
  useEffect(() => {
    if (timeLeft <= 0) {
      onSubmit(route);
      return;
    }
    const timerId = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timerId);
  }, [timeLeft, route, onSubmit]);

  // Keep the "From" dropdown in sync with the last station in the route array
  useEffect(() => {
    if (route.length > 0) {
      setSegmentStart(route[route.length - 1]);
    }
  }, [route]);

  // Helper function to get station names from IDs
  const getStationName = (id) => {
    const station = stations.find(s => s.stationId === Number(id));
    return station ? station.stationName : `Unknown (${id})`;
  };

  const startName = getStationName(gameInfo.startingStationId);
  const destName = getStationName(gameInfo.destinationStationId);

  // Handle adding a new segment to the route without validating against existing connections
  const handleAddSegment = () => {
    if (!segmentStart || !segmentEnd) {
      alert("Please select both a starting and destination station.");
      return;
    }

    if (Number(segmentStart) !== route[route.length - 1]) {
      alert("The start of your new segment must connect to the end of your current route!");
      return;
    }

    if (segmentStart === segmentEnd) {
      alert("Starting and destination stations cannot be the same.");
      return;
    }

    // Add the new station ID to the continuous route array
    setRoute([...route, Number(segmentEnd)]);
    
    // Reset the "To" dropdown for the next segment
    setSegmentEnd("");
  };

  const handleUndo = () => {
    if (route.length > 1) {
      setRoute(route.slice(0, -1));
    }
  };

  return (
    <div className="container">
      <div className="row align-items-center">
        
        <div className="col-md-6 text-start mb-4 mb-md-0">
          <h4>Plan Your Route!</h4>
          
          <p className="fs-5 mb-4">
            From: <strong>{startName}</strong> <br />
            To: <strong>{destName}</strong>
          </p>
          
          <ProgressBar 
            now={(timeLeft / 90) * 100} 
            label={`${timeLeft}s`} 
            variant={timeLeft < 15 ? 'danger' : 'primary'} 
            className="mb-4 shadow-sm"
            style={{ height: '24px', fontSize: '0.9rem' }}
          />

          {/* Current Route Display */}
          <div className="mb-3 p-3 bg-light rounded border">
            <h6 className="text-muted mb-2">Current Route:</h6>
            <p className="text-primary fw-bold mb-0" style={{ wordWrap: 'break-word' }}>
              {route.map(id => getStationName(id)).join(' ➔ ')}
            </p>
          </div>

          {/* Two Dropdowns for Segment Selection */}
          <div className="mb-4">
            <div className="row g-2 mb-2">
              <div className="col-md-6">
                <label className="form-label text-muted small mb-1">From Station:</label>
                <select 
                  className="form-select" 
                  value={segmentStart} 
                  onChange={(e) => setSegmentStart(e.target.value)}
                  disabled // Disabled to force a continuous route, but visible to the user
                >
                  {stations.map(station => (
                    <option key={`start-${station.stationId}`} value={station.stationId}>
                      {station.stationName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label text-muted small mb-1">To Station:</label>
                <select 
                  className="form-select" 
                  value={segmentEnd} 
                  onChange={(e) => setSegmentEnd(e.target.value)}
                >
                  <option value="">-- Select Destination --</option>
                  {stations.map(station => (
                    <option key={`end-${station.stationId}`} value={station.stationId}>
                      {station.stationName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <Button variant="primary" className="w-100 mt-2" onClick={handleAddSegment}>
              Add Stop
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="d-flex gap-2">
            <Button variant="warning" onClick={handleUndo} disabled={route.length <= 1}>
              Undo Last
            </Button>
            <Button variant="success" onClick={() => onSubmit(route)}>
              Submit Route
            </Button>
          </div>
        </div>

        <div className="col-md-6">
          <NetworkDisplay stations={props.stations} connections={props.connections} showEdges={false} />
        </div>
      </div>
    </div>
  );
}

function GameExecution(props) {
  // The application displays if the route is valid or not. If it is valid, the events are displayed
  const results = props.results;
  const done = props.done;

  if (!results) {
    return <div className="text-center"><Spinner animation="border" /> Validating route...</div>;
  }

  // TODO: Implement the step-by-step event reveal here using a local index state and setInterval.
  return (
    <div className="text-center">
      <h2>Journey Execution</h2>
      <p>{results.valid ? "Route is valid! Let's see what happened..." : "Invalid Route! You got lost."}</p>
      
      <Button variant="primary" className="mt-3" onClick={done}>
        See Final Results
      </Button>
    </div>
  );
}

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

export default Play;