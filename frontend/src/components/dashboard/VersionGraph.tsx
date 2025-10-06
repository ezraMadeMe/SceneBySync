import React from 'react';
import type { Version } from '@/types';

// In a real app, this would be imported from a shared types file.
interface VersionWithParent extends Version {
  parentId?: string;
  children?: VersionWithParent[];
  x?: number;
  y?: number;
  row?: number;
}

interface VersionGraphProps {
  versions: VersionWithParent[];
  baseVersion: string;
  targetVersion: string;
  onNodeClick?: (versionId: string, e: React.MouseEvent) => void;
}

const NODE_RADIUS = 15;
const X_SPACING = 70;
const Y_SPACING = 40;
const STROKE_WIDTH = 2;

const VersionGraph: React.FC<VersionGraphProps> = ({ versions, baseVersion, targetVersion, onNodeClick }) => {
  const versionMap: { [id: string]: VersionWithParent } = {};
  versions.forEach(v => {
    versionMap[v.id] = { ...v, children: [] };
  });

  const roots: VersionWithParent[] = [];
  versions.forEach(v => {
    if (v.parentId && versionMap[v.parentId]) {
      versionMap[v.parentId].children?.push(versionMap[v.id]);
    } else {
      roots.push(versionMap[v.id]);
    }
  });

  // Simple horizontal layout algorithm
  const rows: (VersionWithParent[])[] = [];
  const placeNode = (node: VersionWithParent, row: number) => {
    node.row = row;
    if (!rows[row]) {
      rows[row] = [];
    }
    rows[row].push(node);
    node.children?.forEach((child, i) => {
      // Place main branch on the same row, new branches on new rows
      placeNode(child, row + i);
    });
  };
  roots.forEach(root => placeNode(root, 0));

  let xPos = X_SPACING / 2;
  const nodes: VersionWithParent[] = [];
  versions.forEach(v_ordered => {
    const node = versionMap[v_ordered.id];
    if(node) {
        node.x = xPos;
        xPos += X_SPACING;
        nodes.push(node);
    }
  });

  nodes.forEach(node => {
      if(node.row !== undefined) {
          node.y = node.row * Y_SPACING + Y_SPACING / 2;
      }
  });


  const edges: { path: string, id: string }[] = [];
  nodes.forEach(node => {
    node.children?.forEach(child => {
      if (node.x !== undefined && node.y !== undefined && child.x !== undefined && child.y !== undefined) {
        const path = `M ${node.x} ${node.y} L ${child.x} ${child.y}`;
        edges.push({ path, id: `${node.id}-${child.id}` });
      }
    });
  });

  const width = xPos;
  const height = (Math.max(...nodes.map(n => n.row || 0)) + 1) * Y_SPACING;

  return (
    <svg height={height} width={width} style={{ minWidth: '100%' }}>
      {edges.map(edge => (
        <path key={edge.id} d={edge.path} stroke="#4b5563" strokeWidth={STROKE_WIDTH} fill="none" />
      ))}
      {nodes.map(node => {
        if (node.x === undefined || node.y === undefined) return null;
        const isBase = node.id === baseVersion;
        const isTarget = node.id === targetVersion;
        
        let strokeColor = '#4b5563'; // gray
        if (isBase) strokeColor = '#3b82f6'; // blue
        if (isTarget) strokeColor = '#10b981'; // green

        return (
          <g key={node.id} transform={`translate(${node.x}, ${node.y})`} className="cursor-pointer group" onClick={(e) => onNodeClick?.(node.id, e)}>
            <circle r={NODE_RADIUS} fill="#2d3748" stroke={strokeColor} strokeWidth={STROKE_WIDTH + 1} />
            <text fill="white" fontSize="10" textAnchor="middle" y="3" className="font-mono select-none">{node.id}</text>
            <title>{node.id}: {node.message}</title>
          </g>
        );
      })}
    </svg>
  );
};

export default VersionGraph;
