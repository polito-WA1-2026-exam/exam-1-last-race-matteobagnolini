import { useState, useEffect, useContext } from 'react';
import { Navigate } from 'react-router-dom';

import UserContext from '../contexts/UserContext';

import {  Alert, Spinner } from 'react-bootstrap'

import { getStations, getConnections, setupGame, submitRoute } from '../api/api.js';

import NetworkDisplay from './NetworkDisplay.jsx';
import GameSetup from './gameComponents/GameSetup.jsx';
import GamePlanning from './gameComponents/GamePlanning.jsx';
import GameExecution from './gameComponents/GameExecution.jsx';
import GameResults from './gameComponents/GameResults.jsx';


function Play(props) {
  const user = useContext(UserContext);

  const [phase, setPhase] = useState('SETUP');

  const [gameInfo, setGameInfo] = useState(undefined);
  const [executionResults, setExecutionResults] = useState(undefined);
  
  const [stations, setStations] = useState([]);
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

export default Play;