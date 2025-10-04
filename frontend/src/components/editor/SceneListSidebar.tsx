import React from 'react';
import { FileText, Search, X, PlusCircle, Pencil } from 'lucide-react';
import type { Scene } from '@/types';

interface SceneListSidebarProps {
  scenesEditing: Scene[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredScenes: Scene[];
  getSceneDiffInfo: (sceneNum: string) => { isNewInC: boolean; isModifiedInC: boolean };
  selectedSceneNum: string | null;
  scrollToScene: (sceneNum: string) => void;
  showSceneList: boolean;
  setShowSceneList: (show: boolean) => void;
}

const SceneListSidebar: React.FC<SceneListSidebarProps> = ({
  scenesEditing,
  searchQuery,
  setSearchQuery,
  filteredScenes,
  getSceneDiffInfo,
  selectedSceneNum,
  scrollToScene,
  showSceneList,
  setShowSceneList
}) => {
  return (
    <>
      {/* Overlay */}
      {showSceneList && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setShowSceneList(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-80 sm:w-96 bg-gray-800/95 backdrop-blur-sm rounded-none lg:rounded-r-lg shadow-2xl border-r border-gray-700 z-50 transform transition-transform duration-300 ease-in-out flex-shrink-0 ${
          showSceneList ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col`}
      >
        <div className="p-3 sm:p-4 flex flex-col h-full">
          <div className="mb-3 sm:mb-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
                <span>씬 목록</span>
                <span className="text-xs text-gray-400">({scenesEditing.length})</span>
              </h2>
              <button
                onClick={() => setShowSceneList(false)}
                className="p-1.5 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 검색 */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="씬 번호/장소 검색..."
                className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg pl-9 pr-8 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none focus:bg-gray-700 focus:border-gray-500 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-600 rounded transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* 씬 목록 */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {filteredScenes.map(scene => {
              const diffInfo = getSceneDiffInfo(scene.sceneNum);
              const isSelected = selectedSceneNum === scene.sceneNum;

              return (
                <div
                  key={scene.sceneNum}
                  onClick={() => {
                    scrollToScene(scene.sceneNum);
                    setShowSceneList(false);
                  }}
                  className={`group p-3 rounded-lg text-sm cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-purple-500/20 border border-purple-500/50 shadow-lg shadow-purple-500/10'
                      : 'bg-gray-700/50 hover:bg-gray-700 border border-transparent hover:border-gray-600/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-mono font-semibold text-purple-300 mb-1.5 flex items-center gap-2">
                        <span>#{scene.sceneNum}</span>
                      </div>
                      <div className="text-xs text-gray-300 truncate">
                        {scene.location}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 flex-shrink-0">
                      {diffInfo.isNewInC && (
                        <div className="flex items-center gap-1 px-2 py-0.5 bg-green-500/10 border border-green-500/20 text-green-400 text-xs rounded-full">
                          <PlusCircle className="w-3 h-3" />
                        </div>
                      )}
                      {diffInfo.isModifiedInC && (
                        <div className="flex items-center gap-1 px-2 py-0.5 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs rounded-full">
                          <Pencil className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredScenes.length === 0 && (
              <div className="text-center py-12 text-gray-400 text-sm">
                검색 결과가 없습니다
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default SceneListSidebar;
