import * as dao from './dao.js';

// BFS Graph Traversal
const getDistances = (startId, connections) => {
  const adj = {};
  
  connections.forEach(c => {
    const u = String(c.startingStationId);
    const v = String(c.arrivingStationId);
    if (!adj[u]) adj[u] = [];
    if (!adj[v]) adj[v] = [];
    adj[u].push(v);
    adj[v].push(u);
  });

  const distances = {};
  const queue = [{ id: String(startId), dist: 0 }];
  distances[String(startId)] = 0;

  while (queue.length > 0) {
    const curr = queue.shift();
    const neighbors = adj[curr.id] || [];
    
    for (let neighbor of neighbors) {
      if (distances[neighbor] === undefined) {
        distances[neighbor] = curr.dist + 1;
        queue.push({ id: neighbor, dist: curr.dist + 1 });
      }
    }
  }
  return distances;
};

// Core Game Functions

export const setupGame = (stations, connections) => {
  if (stations.length < 2) {
    throw new Error('Not enough stations available');
  }

  const startIdx = Math.floor(Math.random() * stations.length);
  const startingStationId = stations[startIdx].stationId;

  const distances = getDistances(startingStationId, connections);
  const validDestinations = stations.filter(s => distances[String(s.stationId)] >= 3);
  
  if (validDestinations.length === 0) {
    throw new Error('Network configuration does not support a path of length >= 3');
  }

  const destIdx = Math.floor(Math.random() * validDestinations.length);
  const destinationStationId = validDestinations[destIdx].stationId;

  return { startingStationId, destinationStationId };
};

export const evaluateRoute = (game, connections, availableEvents, route) => {    
  let isValid = true;
  let finalScore = 20;
  const triggeredEvents = [];
  const visitedSegments = new Set();

  if (String(route[0].stationId) !== String(game.startingStationId) || 
      String(route[route.length - 1].stationId) !== String(game.destinationStationId)) {
    isValid = false;
  }

  if (isValid) {
    for (let i = 0; i < route.length - 1; i++) {
      const fromId = String(route[i].stationId);
      const toId = String(route[i + 1].stationId);
      const segmentKey = [fromId, toId].sort().join('-');
      
      if (visitedSegments.has(segmentKey)) {    // each segment (connection) can be used at most 1 time
        isValid = false;
        break;
      }
      visitedSegments.add(segmentKey);

      const validConnections = connections.filter(c =>
        (String(c.startingStationId) === fromId && String(c.arrivingStationId) === toId) ||
        (String(c.startingStationId) === toId && String(c.arrivingStationId) === fromId)
      );

      if (validConnections.length === 0) {  // check if the connection exists
        isValid = false;
        break;
      }

      const randomEvent = availableEvents[Math.floor(Math.random() * availableEvents.length)];
      const eventEffect = randomEvent.coins; 
      
      triggeredEvents.push({
        eventId: String(randomEvent.eventId),
        description: randomEvent.description,
        coins: eventEffect
      });
      
      finalScore += eventEffect;
    }
  }

  if (!isValid) {
    return { valid: false, finalScore: 0, events: [] };
  }

  finalScore = Math.max(0, finalScore);

  return {
    valid: true, finalScore: finalScore, events: triggeredEvents
  };
};
