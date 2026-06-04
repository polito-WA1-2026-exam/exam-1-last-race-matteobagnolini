import React, { useState, useEffect, useContext, useMemo } from 'react';
import { Container } from 'react-bootstrap';
import { Navigate } from 'react-router-dom';
import ForceGraph2D from 'react-force-graph-2d';

import UserContext from '../contexts/UserContext';
import { getStations, getConnections } from '../api/api.js';

export default function NetworkDisplay(props) {
  const stations = props.stations;
  const connections = props.connections;
  const showEdges = props.showEdges;

  const graphData = useMemo(() => {
    const nodes = stations.map(station => ({
      id: station.stationId,
      name: station.stationName
    }));
    const links = connections.map(connection => ({
      source: connection.startingStationId,
      target: connection.arrivingStationId,
      lineId: connection.metroLineId
    }));
    return { nodes, links };
  }, [stations, connections]);

  // Define the size of your graph container
  const graphWidth = 700;
  const graphHeight = 500;

  return (
    <div className="d-flex justify-content-center align-items-center">
      <div 
        className="border border-2 border-secondary rounded shadow-sm overflow-hidden"
        style={{ width: `${graphWidth}px`, height: `${graphHeight}px`, backgroundColor: '#f8f9fa' }}
      >
        <ForceGraph2D
          width={graphWidth}   // Explicitly constrain the canvas width
          height={graphHeight} // Explicitly constrain the canvas height
          graphData={graphData}
          linkVisibility={() => showEdges}
          linkColor={() => 'rgba(150, 150, 150, 0.6)'}
          
          // Custom Canvas Rendering for Nodes + Text
          nodeCanvasObject={(node, ctx, globalScale) => {
            const label = node.name;
            const fontSize = 12 / globalScale;
            ctx.font = `${fontSize}px Sans-Serif`;
            
            const nodeRadius = 6;

            // 1. Draw the Node (Circle)
            ctx.beginPath();
            ctx.arc(node.x, node.y, nodeRadius, 0, 2 * Math.PI, false);
            ctx.fillStyle = '#e74c3c';
            ctx.fill();

            // 2. Draw the Text Label
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            ctx.fillStyle = '#333';
            
            ctx.fillText(label, node.x, node.y - nodeRadius - (2 / globalScale));
          }}
        />
      </div>
    </div>
  );
}