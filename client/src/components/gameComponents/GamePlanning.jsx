import { useState, useEffect } from 'react';
import { Button, ProgressBar } from 'react-bootstrap';

import NetworkDisplay from '../NetworkDisplay';


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
            <Button variant="success" onClick={() => onSubmit(route)} disabled={route.length <= 1}>
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

export default GamePlanning;