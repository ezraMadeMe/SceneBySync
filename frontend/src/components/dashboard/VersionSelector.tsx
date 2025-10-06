import React from 'react';
import { GitBranch, ArrowRight, Tag, RotateCcw } from 'lucide-react';
import type { Version } from '@/types'; // Assuming types are in a central file
 // Assuming types are in a central file

interface VersionSelectorProps {
  baseVersion: string;
  setBaseVersion: (version: string) => void;
  targetVersion: string;
  setTargetVersion: (version: string) => void;
  versions: Version[];
  vTarget: Version | undefined;
  handleRevert: (versionId: string) => void;
}

const VersionSelector: React.FC<VersionSelectorProps> = ({ 
  baseVersion, 
  setBaseVersion, 
  targetVersion, 
  setTargetVersion, 
  versions, 
  vTarget, 
  handleRevert 
}) => {
  return (
    <div className="bg-gray-800 p-4">
      <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
        <GitBranch className="w-4 h-4" />
        버전 비교 설정
      </h2>
      
      <div className="space-y-3">
        <div>
          <label className="text-xs text-gray-400 mb-1 block">기준 버전 (Base)</label>
          <select
            value={baseVersion}
            onChange={(e) => setBaseVersion(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
          >
            {versions.map(v => (
              <option key={v.id} value={v.id}>{v.id} - {v.message}</option>
            ))}
          </select>
        </div>
        
        <div className="flex items-center justify-center">
          <ArrowRight className="w-4 h-4 text-blue-400" />
        </div>
        
        <div>
          <label className="text-xs text-gray-400 mb-1 block">비교 대상 (Target)</label>
          <select
            value={targetVersion}
            onChange={(e) => setTargetVersion(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
          >
            {versions.map(v => (
              <option key={v.id} value={v.id}>{v.id} - {v.message}</option>
            ))}
          </select>
        </div>
      </div>

      {vTarget && (
        <div className="mt-3 pt-3 border-t border-gray-700">
          <div className="flex flex-wrap gap-1 mb-2">
            {vTarget.tags.map(tag => (
              <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-900 bg-opacity-30 text-blue-300 text-xs rounded">
                <Tag className="w-3 h-3" />
                {tag}
              </span>
            ))}
          </div>
          <button
            onClick={() => handleRevert(targetVersion)}
            className="w-full mt-2 flex items-center justify-center gap-2 px-3 py-1.5 bg-orange-600 hover:bg-orange-700 rounded text-sm transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            이 버전으로 복원
          </button>
        </div>
      )}
    </div>
  );
};

export default VersionSelector;
