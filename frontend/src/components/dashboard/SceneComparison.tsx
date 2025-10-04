import React from 'react';
import type { SceneComparison } from '@/types';
import { ListFilter, Layers, Plus, Minus, Pencil, MoveRight } from 'lucide-react';

interface SceneComparisonProps {
  filteredScenes: SceneComparison[];
  selectedScene: string | null;
  setSelectedScene: (sceneNum: string | null) => void;
  filterByType: string;
  setFilterByType: (t: string) => void;
  showUnchangedScenes: boolean;
  setShowUnchangedScenes: (s: boolean) => void;
}

const FilterButton: React.FC<{
  label: string;
  value: string;
  icon: React.ReactNode;
  currentFilter: string;
  setFilter: (value: string) => void;
  activeColor: string;
}> = ({ label, value, icon, currentFilter, setFilter, activeColor }) => {
  const isActive = currentFilter === value;
  return (
    <button
      onClick={() => setFilter(value)}
      title={label}
      className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-md transition-all border ${
        isActive 
          ? `${activeColor} bg-opacity-20 border-current shadow-sm` 
          : 'text-gray-300 bg-gray-700/50 border-transparent hover:bg-gray-700'
      }`}
    >
      {icon}
    </button>
  );
};

const SceneComparisonComponent: React.FC<SceneComparisonProps> = ({
  filteredScenes,
  selectedScene,
  setSelectedScene,
  filterByType,
  setFilterByType,
  showUnchangedScenes,
  setShowUnchangedScenes,
}) => {

  const badgeColors: Record<string, string> = {
    added: 'bg-green-500/10 text-green-400',
    removed: 'bg-red-500/10 text-red-400',
    modified: 'bg-yellow-500/10 text-yellow-400',
    moved: 'bg-blue-500/10 text-blue-400',
    unchanged: 'bg-gray-500/10 text-gray-400',
  };

  const getSceneHeader = (scene: SceneComparison) => {
    if (scene.type === 'added') return scene.scene2?.header || '';
    return scene.scene1?.header || scene.scene2?.header || '';
  }

  return (
    <div className="bg-gray-800/50 rounded-lg border border-gray-700/50 flex flex-col h-full">
      {/* Filter Header */}
      <div className="p-3 border-b border-gray-700/50">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
            <ListFilter className="w-5 h-5 text-gray-400" />
            <h3 className="text-sm font-semibold">필터 및 옵션</h3>
            </div>
            <span className="text-xs text-gray-400 font-mono">{filteredScenes.length}개 씬</span>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-sm">
            <label className="flex items-center gap-1.5 cursor-pointer hover:text-white">
            <input 
                type="checkbox" 
                checked={showUnchangedScenes} 
                onChange={(e) => setShowUnchangedScenes(e.target.checked)} 
                className="w-4 h-4 bg-gray-700 border-gray-600 rounded text-purple-500 focus:ring-purple-600" 
            />
            유지된 씬 표시
            </label>
            
            <div className="flex items-center gap-1.5">
                <FilterButton label="전체" value="all" icon={<Layers size={14}/>} currentFilter={filterByType} setFilter={setFilterByType} activeColor="text-gray-200" />
                <FilterButton label="추가" value="added" icon={<Plus size={14}/>} currentFilter={filterByType} setFilter={setFilterByType} activeColor="text-green-400" />
                <FilterButton label="삭제" value="removed" icon={<Minus size={14}/>} currentFilter={filterByType} setFilter={setFilterByType} activeColor="text-red-400" />
                <FilterButton label="수정" value="modified" icon={<Pencil size={14}/>} currentFilter={filterByType} setFilter={setFilterByType} activeColor="text-yellow-400" />
                <FilterButton label="이동" value="moved" icon={<MoveRight size={14}/>} currentFilter={filterByType} setFilter={setFilterByType} activeColor="text-blue-400" />
            </div>
        </div>
      </div>

      {/* Scene List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filteredScenes.map((scene) => {
          const isSelected = selectedScene === scene.sceneNum;
          return (
            <div
              key={scene.sceneNum}
              onClick={() => setSelectedScene(scene.sceneNum)}
              className={`flex items-center justify-between p-2.5 rounded-md cursor-pointer transition-colors ${
                isSelected ? 'bg-purple-600/30' : 'hover:bg-gray-700/50'
              }`}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <span className="font-mono text-sm text-gray-400">#{scene.sceneNum}</span>
                <p className="font-semibold text-sm text-gray-200 truncate">{getSceneHeader(scene)}</p>
              </div>
              <div className={`px-2 py-0.5 text-xs font-semibold rounded-full flex-shrink-0 ${badgeColors[scene.type]}`}>
                {scene.type.toUpperCase()}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SceneComparisonComponent;
