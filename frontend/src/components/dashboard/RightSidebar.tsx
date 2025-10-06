import React from 'react';
import { Search, FileText, MessageSquare } from 'lucide-react';
import type { SceneComparison, SelectedSceneDiff, Comment } from '@/types';

interface RightSidebarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  contentSearchQuery: string;
  setContentSearchQuery: (query: string) => void;
  filterByType: string;
  setFilterByType: (type: string) => void;
  selectedKeyword: string | null;
  setSelectedKeyword: (keywordId: string | null) => void;
  filteredScenes: SceneComparison[];
  showUnchangedScenes: boolean;
  setShowUnchangedScenes: (show: boolean) => void;
  selectedSceneDiff: SelectedSceneDiff | null;
  showUnchangedLines: boolean;
  setShowUnchangedLines: (show: boolean) => void;
  sceneStats: { total: number; added: number; removed: number; modified: number; moved: number; unchanged: number };
  comments: Comment[];
}

const RightSidebar: React.FC<RightSidebarProps> = ({ 
  searchQuery, 
  setSearchQuery, 
  contentSearchQuery, 
  setContentSearchQuery, 
  filterByType, 
  setFilterByType, 
  selectedKeyword, 
  setSelectedKeyword, 
  filteredScenes, 
  showUnchangedScenes, 
  setShowUnchangedScenes, 
  selectedSceneDiff, 
  showUnchangedLines, 
  setShowUnchangedLines, 
  sceneStats, 
  comments 
}) => {
  return (
    <div className="col-span-3 bg-gray-800 h-[calc(100vh-140px)] overflow-y-auto">
      {/* 검색 및 필터 */}
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-sm font-semibold mb-3">검색 & 필터</h2>
        
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">씬 헤더 검색</label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="씬 제목 검색..."
                className="w-full bg-gray-700 border border-gray-600 rounded px-9 py-2 text-sm"
              />
            </div>
            {searchQuery && (
              <p className="text-xs text-gray-400 mt-1">
                검색 중: "{searchQuery}"
              </p>
            )}
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1 block">내용 검색 (대본 전체)</label>
            <div className="relative">
              <FileText className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={contentSearchQuery}
                onChange={(e) => setContentSearchQuery(e.target.value)}
                placeholder="대사, 지문 내용 검색..."
                className="w-full bg-gray-700 border border-gray-600 rounded px-9 py-2 text-sm"
              />
            </div>
            {contentSearchQuery && (
              <p className="text-xs text-green-400 mt-1">
                "{contentSearchQuery}" 포함된 씬 {filteredScenes.length}개
              </p>
            )}
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1 block">변경 유형</label>
            <select
              value={filterByType}
              onChange={(e) => setFilterByType(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
            >
              <option value="all">모든 씬</option>
              <option value="added">추가된 씬</option>
              <option value="removed">삭제된 씬</option>
              <option value="modified">변경된 씬</option>
              <option value="moved">이동된 씬</option>
              <option value="unchanged">변경 없는 씬</option>
            </select>
          </div>

          {(searchQuery || contentSearchQuery || selectedKeyword) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setContentSearchQuery('');
                setSelectedKeyword(null);
              }}
              className="w-full px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-xs transition-colors"
            >
              모든 필터 초기화
            </button>
          )}
        </div>
      </div>

      {/* 옵션 */}
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-sm font-semibold mb-3">표시 옵션</h2>
        
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showUnchangedScenes}
              onChange={(e) => setShowUnchangedScenes(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm">변경 없는 씬 표시</span>
          </label>
          
          {selectedSceneDiff && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showUnchangedLines}
                onChange={(e) => setShowUnchangedLines(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">변경 없는 줄 표시</span>
            </label>
          )}
        </div>
      </div>

      {/* 통계 */}
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-sm font-semibold mb-3">변경 통계</h2>
        
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span>전체 씬:</span>
            <span className="font-mono font-bold">{sceneStats.total}</span>
          </div>
          <div className="flex justify-between text-green-400">
            <span>추가:</span>
            <span className="font-mono">+{sceneStats.added}</span>
          </div>
          <div className="flex justify-between text-red-400">
            <span>삭제:</span>
            <span className="font-mono">-{sceneStats.removed}</span>
          </div>
          <div className="flex justify-between text-yellow-400">
            <span>변경:</span>
            <span className="font-mono">~{sceneStats.modified}</span>
          </div>
          {sceneStats.moved > 0 && (
            <div className="flex justify-between text-purple-400">
              <span>이동:</span>
              <span className="font-mono">→{sceneStats.moved}</span>
            </div>
          )}
          <div className="flex justify-between text-gray-400">
            <span>변경 없음:</span>
            <span className="font-mono">{sceneStats.unchanged}</span>
          </div>
        </div>
      </div>

      {/* 주석 통계 */}
      <div className="p-4">
        <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <MessageSquare className="w-4 h-4" />
          주석 현황
        </h2>
        
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span>전체 주석:</span>
            <span className="font-mono">{comments.length}</span>
          </div>
          <div className="flex justify-between text-yellow-400">
            <span>미해결:</span>
            <span className="font-mono">{comments.filter(c => !c.resolved).length}</span>
          </div>
          <div className="flex justify-between text-green-400">
            <span>해결됨:</span>
            <span className="font-mono">{comments.filter(c => c.resolved).length}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RightSidebar;
