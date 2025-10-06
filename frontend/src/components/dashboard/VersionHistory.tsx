import React from 'react';
import { Clock } from 'lucide-react';
import type { Version } from '@/types';
import VersionGraph from './VersionGraph';

// Mock data with parentId for demonstration
const demoVersionsWithParents = [
  { id: 'v1', parentId:'null', message: 'Initial commit', author: 'User A', date: '2023-10-01', tags: [] },
  { id: 'v2', parentId: 'v1', message: 'Added character descriptions', author: 'User B', date: '2023-10-02', tags: [] },
  { id: 'v3', parentId: 'v1', message: 'Alternative opening', author: 'User C', date: '2023-10-02', tags: ['feature-branch'] },
  { id: 'v4', parentId: 'v2', message: 'Revised scene 5', author: 'User A', date: '2023-10-03', tags: [] },
  { id: 'v5', parentId: 'v4', message: 'Final polish', author: 'User B', date: '2023-10-04', tags: ['release'] },
];


const VersionHistory: React.FC<VersionHistoryProps> = ({ versions, baseVersion, targetVersion }) => {
  return (
    <div className="bg-gray-800 p-4">
      <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
        <Clock className="w-4 h-4" />
        버전 히스토리
      </h2>
      
      <div className="overflow-x-auto py-4">
        {/* In a real app, you'd pass the actual versions data with parent IDs */}
        <VersionGraph versions={demoVersionsWithParents} baseVersion={baseVersion} targetVersion={targetVersion} />
      </div>
    </div>
  );
};

export default VersionHistory;
