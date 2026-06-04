import { useState, useEffect } from 'react';
import { Spinner, ListGroup, Badge, Button } from 'react-bootstrap';


function GameExecution(props) {
  const results = props.results;
  const done = props.done;
  
  // State to keep track of how many events are currently revealed
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    // Only start the interval if we have valid results and there are more events to reveal
    if (results?.valid && results?.events && visibleCount < results.events.length) {
      const timer = setInterval(() => {
        setVisibleCount((prevCount) => {
          // If we haven't reached the end, reveal the next one
          if (prevCount < results.events.length) {
            return prevCount + 1;
          }
          return prevCount;
        });
      }, 1500); // Reveals a new event every 1.5 seconds

      // Cleanup function to clear the interval if the component unmounts
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
            {/* Slice the array to only map over the currently visible events */}
            {events.slice(0, visibleCount).map((event) => (
              <ListGroup.Item 
                key={event.eventId} 
                className="d-flex justify-content-between align-items-center fade-in-item"
              >
                <span>{event.description}</span>
                
                {/* Dynamically color the coin badge based on positive/negative values */}
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
          
          {/* Show a mini-spinner while waiting for the next event to reveal */}
          {!isFinishedRevealing && (
            <div className="mt-3 text-center text-muted">
               <Spinner animation="grow" size="sm" /> 
               <span className="ms-2">Revealing next event...</span>
            </div>
          )}
        </div>
      )}
      
      {/* Only show the "See Final Results" button once all events are revealed (or if the route was invalid) */}
      {isFinishedRevealing && (
        <Button variant="primary" className="mt-4" onClick={done}>
          See Final Results
        </Button>
      )}
    </div>
  );
}

export default GameExecution;