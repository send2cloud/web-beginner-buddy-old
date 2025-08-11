import React from 'react';
import { ConnectionData, NodeData } from '../types';

interface ConnectionV2Props {
  connection: ConnectionData;
  fromNode: NodeData;
  toNode: NodeData;
  theme: 'light' | 'dark';
}

export const ConnectionV2: React.FC<ConnectionV2Props> = ({
  connection,
  fromNode,
  toNode,
  theme: _theme
}) => {
  const fromX = fromNode.x + fromNode.width / 2;
  const fromY = fromNode.y + fromNode.height / 2;
  const toX = toNode.x + toNode.width / 2;
  const toY = toNode.y + toNode.height / 2;

  const length = Math.sqrt(Math.pow(toX - fromX, 2) + Math.pow(toY - fromY, 2));
  const angle = Math.atan2(toY - fromY, toX - fromX) * 180 / Math.PI;

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: fromX,
        top: fromY,
        width: length,
        height: connection.style.width,
        backgroundColor: connection.style.color,
        transformOrigin: '0 50%',
        transform: `rotate(${angle}deg)`,
        zIndex: 5
      }}
    >
      {/* Arrow head */}
      <div
        className="absolute right-0 top-1/2 transform -translate-y-1/2"
        style={{
          width: 0,
          height: 0,
          borderLeft: `8px solid ${connection.style.color}`,
          borderTop: '4px solid transparent',
          borderBottom: '4px solid transparent'
        }}
      />
    </div>
  );
};