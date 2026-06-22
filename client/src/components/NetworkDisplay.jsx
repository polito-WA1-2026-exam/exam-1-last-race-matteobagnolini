import React, { useState, useEffect, useContext, useMemo } from 'react';
import { Container } from 'react-bootstrap';
import { Navigate } from 'react-router-dom';
import ForceGraph2D from 'react-force-graph-2d';

import UserContext from '../contexts/UserContext';
import { getStations, getConnections } from '../api/api.js';

export default function NetworkDisplay(props) {
  const stations = props.stations;
  const connections = props.connections;
  const lines = props.lines;
  const showEdges = props.showEdges;

  // Cached data with useMemo
  
  // Color map for each line
  const lineColorMap = useMemo(() => {
    const map = {};
    if (lines) {
      lines.forEach((line, index) => {
        // Space out the colors evenly across the color wheel
        const hue = Math.floor((index * 137.5) % 360); 
        map[line.lineId] = `hsla(${hue}, 80%, 50%, 0.8)`;
      });
    }
    return map;
  }, [lines]);


  // Created the structure to use with ForceGraph2D
  const graphData = useMemo(() => {
    const nodes = stations.map(station => {
      const randHue = Math.floor(Math.random() * 360);
      return {
        id: station.stationId,
        name: station.stationName,
        color: '#e74c3c'
      };
    });

    const links = [];
    const seenLinks = new Set();

    connections.forEach(connection => {
      // 1. THE FIX: Normalize direction. Always draw from the smaller ID to the larger ID.
      // This ensures 2->3 and 3->2 share the exact same underlying vector, 
      // allowing opposite curvatures to properly push them apart.
      const minId = Math.min(connection.startingStationId, connection.arrivingStationId);
      const maxId = Math.max(connection.startingStationId, connection.arrivingStationId);
      
      const segmentId = `${minId}-${maxId}`;
      const uniqueLinkId = `${segmentId}-${connection.metroLineId}`;

      if (!seenLinks.has(uniqueLinkId)) {
        seenLinks.add(uniqueLinkId);
        links.push({
          source: minId, 
          target: maxId, 
          lineId: connection.metroLineId,
          color: lineColorMap[connection.metroLineId] || 'rgba(150, 150, 150, 0.6)' 
        });
      }
    });

    // 2. Curvature logic
    const linkGroups = {};
    links.forEach(link => {
      // We can use our normalized source/target directly now
      const segmentId = `${link.source}-${link.target}`;
      if (!linkGroups[segmentId]) {
        linkGroups[segmentId] = [];
      }
      linkGroups[segmentId].push(link);
    });

    Object.values(linkGroups).forEach(group => {
      const count = group.length;
      group.forEach((link, i) => {
        // I increased the multiplier from 0.2 to 0.4 so the gap between 
        // the red and green lines is much more obvious!
        link.curvature = count === 1 ? 0 : (i - (count - 1) / 2) * 0.4;
      });
    });

    return { nodes, links };
  }, [stations, connections, lineColorMap]);

  const graphWidth = 700;
  const graphHeight = 500;

  return (
    <div className="d-flex justify-content-center align-items-center">
      <div 
        className="border border-2 border-secondary rounded shadow-sm overflow-hidden"
        style={{ width: `${graphWidth}px`, height: `${graphHeight}px`, backgroundColor: '#f8f9fa' }}
      >
        <ForceGraph2D
          width={graphWidth}
          height={graphHeight}
          graphData={graphData}
          linkVisibility={() => showEdges}
          linkColor={link => link.color}
          linkCurvature={link => link.curvature}
          
          // Custom Canvas Rendering for Nodes + Text
          nodeCanvasObject={(node, ctx, globalScale) => {
            const label = node.name;
            const fontSize = 12 / globalScale;
            ctx.font = `${fontSize}px Sans-Serif`;
            
            const nodeRadius = 5;

            // 1. Draw the Node (Circle)
            ctx.beginPath();
            ctx.arc(node.x, node.y, nodeRadius, 0, 2 * Math.PI, false);
            ctx.fillStyle = node.color;
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