import { useState, useEffect } from 'react';
import { Spinner, ListGroup, Badge, Button } from 'react-bootstrap';

function GameExecution(props) {
  const results = props.results;
  const done = props.done;
  
  // current visible events
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    // Only start the interval if we have valid results and there are more events to reveal
    if (results?.valid && results?.events && visibleCount < results.events.length) {
      const timer = setInterval(() => {
        setVisibleCount((prevCount) => {
          if (prevCount < results.events.length) {
            return prevCount + 1;
          }
          return prevCount;
        });
      }, 1500);

      return () => clearInterval(timer);
    }
  }, [results, visibleCount]);

  if (!results) {
    return (
      <div className="text-center">
        <Spinner animation="border" /> Validating route...
      </div>
    );
  }

  const events = results.events || [];
  const isFinishedRevealing = visibleCount >= events.length || !results.valid;

  return (
    <div className="text-center">
      <h2>Journey Execution</h2>
      <p className="mb-4">
        {results.valid ? "Route is valid! Let's see what happened..." : "Invalid Route! You got lost."}
      </p>
      
      {/* Event List Container */}
      {results.valid && events.length > 0 && (
        <div className="text-start mx-auto" style={{ maxWidth: '600px' }}>
          <ListGroup>
            {events.slice(0, visibleCount).map((event, index) => (
              <ListGroup.Item 
                // Key = eventId + index. There may be more than one same events
                key={`${event.eventId}-${index}`} 
                className="d-flex justify-content-between align-items-center fade-in-item"
              >
                <span>{event.description}</span>
                
                <Badge 
                  bg={event.coins >= 0 ? "success" : "danger"} 
                  pill 
                  className="ms-3"
                  style={{ fontSize: '0.9em' }}
                >
                  {event.coins > 0 ? "+" : ""}{event.coins} coins
                </Badge>
              </ListGroup.Item>
            ))}
          </ListGroup>
          
          {/* mini spinner to show game execution */}
          {!isFinishedRevealing && (
            <div className="mt-3 text-center text-muted">
               <Spinner animation="grow" size="sm" /> 
               <span className="ms-2">Revealing next event...</span>
            </div>
          )}
        </div>
      )}
      
      {isFinishedRevealing && (
        <Button variant="primary" className="mt-4" onClick={done}>
          See Final Results
        </Button>
      )}
    </div>
  );
}

export default GameExecution;