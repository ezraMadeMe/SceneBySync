import React from 'react';
import { Clock, User } from 'lucide-react';
import type { Version } from '@/types';

interface VersionHistoryProps {
  versions: Version[];
  baseVersion: string;
  targetVersion: string;
}

const VersionHistory: React.FC<VersionHistoryProps> = ({ versions, baseVersion, targetVersion }) => {
  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
        <Clock className="w-4 h-4" />
        버전 히스토리
      </h2>
      
      <div className="space-y-2">
        {versions.map((version) => {
          const isBase = version.id === baseVersion;
          const isTarget = version.id === targetVersion;
          
          return (
            <div
              key={version.id}
              className={`p-3 rounded-lg border transition-all ${
                isBase || isTarget
                  ? 'bg-blue-900 bg-opacity-20 border-blue-700'
                  : 'bg-gray-700 border-gray-600'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-sm font-bold">{version.id}</span>
                <span className="text-xs text-gray-400">{version.date.split(' ')[0]}</span>
              </div>
              <p className="text-sm mb-2">{version.message}</p>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <User className="w-3 h-3" />
                <span>{version.author}</span>
              </div>
              {isBase && (
                <div className="mt-2 text-xs text-blue-400">📍 기준 버전</div>
              )}
              {isTarget && (
                <div className="mt-2 text-xs text-green-400">🎯 비교 대상</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default VersionHistory;
