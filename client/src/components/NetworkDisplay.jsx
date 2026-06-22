import React, { useState, useEffect, useContext, useMemo } from 'react';
import { Container } from 'react-bootstrap';
import { Navigate } from 'react-router-dom';
import ForceGraph2D from 'react-force-graph-2d';

// Adjust these imports as needed for your actual project
// import UserContext from '../contexts/UserContext';
// import { getStations, getConnections } from '../api/api.js';

export default function NetworkDisplay(props) {
  const { stations, connections, lines, showEdges } = props;

  // Cached data with useMemo
  // Color map for each line
  const lineColorMap = useMemo(() => {
    const map = {};
      const predefinedColors = [
      'rgba(231, 76, 60, 0.9)',  // Red
      'rgba(52, 152, 219, 0.9)', // Blue
      'rgba(46, 204, 113, 0.9)', // Green
      'rgba(241, 196, 15, 0.9)'  // Yellow
    ];

    if (lines) {
      lines.forEach((line, index) => {
        if (index < predefinedColors.length) {
          map[line.lineId] = predefinedColors[index];
        } else {
          const randomHue = Math.floor(Math.random() * 360);
          map[line.lineId] = `hsla(${randomHue}, 80%, 50%, 0.8)`;
        }
      });
    }
    return map;
  }, [lines]);
  
  // Created the structure to use with ForceGraph2D
  const graphData = useMemo(() => {
    const nodes = stations.map(station => {
      return {
        id: station.stationId,
        name: station.stationName,
        color: '#e74c3c'
      };
    });

    const links = [];
    const seenLinks = new Set();

    connections.forEach(connection => {
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

    // Curvature logic
    const linkGroups = {};
    links.forEach(link => {
      const segmentId = `${link.source}-${link.target}`;
      if (!linkGroups[segmentId]) {
        linkGroups[segmentId] = [];
      }
      linkGroups[segmentId].push(link);
    });

    Object.values(linkGroups).forEach(group => {
      const count = group.length;
      group.forEach((link, i) => {
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
        className="position-relative border border-2 border-secondary rounded shadow-sm overflow-hidden"
        style={{ width: `${graphWidth}px`, height: `${graphHeight}px`, backgroundColor: '#f8f9fa' }}
      >
        
        {/* Legend */}
        {lines && lines.length > 0 && (
          <div 
            className="position-absolute top-0 start-0 p-3 bg-white border-end border-bottom"
            style={{ zIndex: 10, opacity: 0.9, borderBottomRightRadius: '8px' }}
          >
            <h6 className="mb-2 fw-bold text-muted" style={{ fontSize: '14px' }}>Metro Lines</h6>
            <ul className="list-unstyled mb-0">
              {lines.map((line) => (
                <li key={line.lineId} className="d-flex align-items-center mb-1">
                  <span
                    style={{
                      display: 'inline-block',
                      width: '12px',
                      height: '12px',
                      backgroundColor: lineColorMap[line.lineId],
                      marginRight: '8px',
                      borderRadius: '50%'
                    }}
                  ></span>
                  <span style={{ fontSize: '13px', color: '#333' }}>
                    {line.lineName || `Line ${line.lineId}`}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Graph Network */}
        <ForceGraph2D
          width={graphWidth}
          height={graphHeight}
          graphData={graphData}
          linkVisibility={() => showEdges}
          linkColor={link => link.color}
          linkCurvature={link => link.curvature}
          linkWidth={3}
          
          // Custom Canvas Rendering for Nodes + Text
          nodeCanvasObject={(node, ctx, globalScale) => {
            const label = node.name;
            const fontSize = 12 / globalScale;
            ctx.font = `${fontSize}px Sans-Serif`;
            
            const nodeRadius = 5;

            // Node
            ctx.beginPath();
            ctx.arc(node.x, node.y, nodeRadius, 0, 2 * Math.PI, false);
            ctx.fillStyle = node.color;
            ctx.fill();

            // Labels
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