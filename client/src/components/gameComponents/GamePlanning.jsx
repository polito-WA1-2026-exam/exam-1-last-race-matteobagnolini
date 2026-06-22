import { useState, useEffect } from 'react';
import { Button, ProgressBar, ListGroup } from 'react-bootstrap';
import NetworkDisplay from '../NetworkDisplay';

function GamePlanning({ stations, connections, gameInfo, onSubmit }) {
  const [timeLeft, setTimeLeft] = useState(90);
  const [selectedSegments, setSelectedSegments] = useState([]);

  const getStationName = (id) => {
    const stationId = typeof id === 'object' ? id.stationId || id.id : Number(id);
    const station = stations.find(s => s.stationId === stationId);
    return station ? station.stationName : `Unknown (${stationId})`;
  };

  const currentRouteIds = [gameInfo.startingStationId];
  selectedSegments.forEach(seg => {
    const lastId = currentRouteIds[currentRouteIds.length - 1];
    if (seg.startingStationId === lastId) {
      currentRouteIds.push(seg.arrivingStationId);
    } else if (seg.arrivingStationId === lastId) {
      currentRouteIds.push(seg.startingStationId);
    } else {
      currentRouteIds.push(seg.startingStationId, seg.arrivingStationId);
    }
  });

  useEffect(() => {
    if (timeLeft > 0) {
      const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timerId);
    } else {
      onSubmit(currentRouteIds);
    }
  }, [timeLeft]);

  const handleAddSegment = (conn) => {
    setSelectedSegments([...selectedSegments, conn]);
  };

  const handleUndo = () => {
    setSelectedSegments(selectedSegments.slice(0, -1));
  };

  const isSegmentSelected = (conn) => {
    return selectedSegments.some(
      (selected) => 
        selected.startingStationId === conn.startingStationId && 
        selected.arrivingStationId === conn.arrivingStationId
    );
  };

  const startName = getStationName(gameInfo.startingStationId);
  const destName = getStationName(gameInfo.destinationStationId);

  return (
    <div className="container">
      <div className="row align-items-center">
        
        {/* Route Planning Controls */}
        <div className="col-md-6 overflow-auto pe-2 mb-4 mb-md-0" style={{ maxHeight: '100vh' }}>
          
          {/* Top Info & Timer */}
          <div className="mb-4">
            <h4>Plan Your Route!</h4>
            <p className="fs-5 mb-3">
              From: <strong>{startName}</strong> <br />
              To: <strong>{destName}</strong>
            </p>
            <ProgressBar 
              now={(timeLeft / 90) * 100} 
              label={`${timeLeft}s`} 
              variant={timeLeft < 15 ? 'danger' : 'primary'} 
              style={{ height: '24px' }}
            />
          </div>

          {/* Current Route List */}
          {/* Swapped custom styling for a clean Bootstrap Card */}
          <div className="card bg-light mb-3">
            <div className="card-body p-3">
              <h6 className="text-muted mb-2">Current Route:</h6>
              {selectedSegments.length === 0 ? (
                <span className="text-muted fst-italic">No segments added yet.</span>
              ) : (
                <ListGroup variant="flush" style={{ maxHeight: '120px', overflowY: 'auto' }}>
                  {selectedSegments.map((seg, idx) => (
                    <ListGroup.Item key={`route-seg-${idx}`} className="py-2 text-primary fw-bold bg-white border rounded mb-1 shadow-sm">
                      {getStationName(seg.startingStationId)} ➔ {getStationName(seg.arrivingStationId)}
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </div>
          </div>

          {/* Available Segments List */}
          {/* Swapped custom wrapper for a Bootstrap Card, gave it a sensible maxHeight */}
          <div className="card mb-4">
            <div className="card-body p-3" style={{ maxHeight: '250px', overflowY: 'auto' }}>
              <h6 className="text-muted mb-2">Available Segments:</h6>
              {connections.map((conn, idx) => {
                const isSelected = isSegmentSelected(conn);
                const name1 = getStationName(conn.startingStationId);
                const name2 = getStationName(conn.arrivingStationId);

                return (
                  <Button 
                    key={`conn-${idx}`} 
                    variant={isSelected ? "secondary" : "outline-primary"} 
                    className="w-100 mb-2 d-flex justify-content-between align-items-center"
                    disabled={isSelected}
                    onClick={() => handleAddSegment(conn)}
                  >
                    <span>{name1} ➔ {name2}</span>
                    {isSelected && <span className="badge bg-light text-secondary rounded-pill">Added</span>}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="d-flex gap-2 mb-3">
            <Button variant="warning" onClick={handleUndo} disabled={selectedSegments.length === 0}>
              Undo Last
            </Button>
            <Button variant="success" onClick={() => onSubmit(currentRouteIds)} disabled={selectedSegments.length === 0}>
              Submit Route
            </Button>
          </div>
        </div>

        {/* Network Display */}
        <div className="col-md-6">
          <NetworkDisplay stations={stations} connections={connections} showEdges={false} />
        </div>
        
      </div>
    </div>
  );
}

export default GamePlanning;