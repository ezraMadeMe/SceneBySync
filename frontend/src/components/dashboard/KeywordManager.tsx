import React, { useState } from 'react';
import { Tag, Plus, FileText, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import type { Keyword, SceneComparison } from '@/types';

interface KeywordManagerProps {
  keywords: Keyword[];
  selectedKeyword: string | null;
  setSelectedKeyword: (keywordId: string | null) => void;
  setShowKeywordDialog: (show: boolean) => void;
  setKeywordToEdit: (keywordId: string | null) => void;
  setShowSceneSelector: (show: boolean) => void;
  handleDeleteKeyword: (keywordId: string) => void;
  sceneComparison: SceneComparison[];
  setSelectedScene: (sceneNum: string | null) => void;
}

const KeywordManager: React.FC<KeywordManagerProps> = ({ 
  keywords, 
  selectedKeyword, 
  setSelectedKeyword, 
  setShowKeywordDialog, 
  setKeywordToEdit, 
  setShowSceneSelector, 
  handleDeleteKeyword,
  sceneComparison,
  setSelectedScene
}) => {
  const [expandedKeywords, setExpandedKeywords] = useState<Set<string>>(new Set());

  const toggleKeywordExpansion = (keywordId: string) => {
    setExpandedKeywords(prev => {
      const newSet = new Set(prev);
      if (newSet.has(keywordId)) {
        newSet.delete(keywordId);
      } else {
        newSet.add(keywordId);
      }
      return newSet;
    });
  };

  return (
    <div className="">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Tag className="w-5 h-5 text-purple-400" />
          키워드 관리
        </h2>
        <button
          onClick={() => setShowKeywordDialog(true)}
          className="p-1.5 hover:bg-gray-700 rounded-full"
          title="새 키워드 추가"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div className="border-t border-gray-700">
        {keywords.map(keyword => {
          const isSelected = selectedKeyword === keyword.id;
          const isExpanded = expandedKeywords.has(keyword.id);
          const scenesForKeyword = sceneComparison.filter(sc => keyword.sceneNumbers.includes(sc.sceneNum));

          return (
            <div
              key={keyword.id}
              className={`border-b border-gray-700 transition-all ${isSelected ? 'bg-gray-800' : ''}`}
            >
              {/* Keyword Header */}
              <div 
                className="p-3 flex items-center justify-between cursor-pointer hover:bg-gray-700/50"
                onClick={() => toggleKeywordExpansion(keyword.id)}
              >
                <div className="flex items-center gap-3 flex-1">
                  <div 
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: keyword.color }}
                  />
                  <div className="flex-1">
                    <span className="font-semibold text-white">{keyword.name}</span>
                    <p className="text-xs text-gray-400 truncate">{keyword.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-2">
                  <span className="text-xs font-mono bg-gray-700 px-2 py-1 rounded-full">{keyword.sceneNumbers.length}</span>
                  {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                </div>
              </div>

              {/* Expanded Scene List */}
              {isExpanded && (
                <div className="border-t border-gray-700 p-2 space-y-1">
                  {scenesForKeyword.length > 0 ? (
                    scenesForKeyword.map(scene => (
                      <div 
                        key={scene.sceneNum}
                        onClick={() => setSelectedScene(scene.sceneNum)}
                        className="p-2 hover:bg-purple-900/30 cursor-pointer text-sm flex justify-between items-center"
                      >
                        <span>씬 #{scene.sceneNum}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full bg-opacity-20 ${{
                          added: 'bg-green-500 text-green-300',
                          removed: 'bg-red-500 text-red-300',
                          modified: 'bg-yellow-500 text-yellow-300',
                          unchanged: 'bg-gray-500 text-gray-300',
                          moved: 'bg-blue-500 text-blue-300'
                        }[scene.type]}`}>
                          {scene.type}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="p-2 text-xs text-gray-500 text-center">이 키워드에 해당하는 씬이 없습니다.</p>
                  )}
                  <div className="flex gap-2 pt-2 border-t border-gray-700">
                    <button
                      onClick={() => {
                        setKeywordToEdit(keyword.id);
                        setShowSceneSelector(true);
                      }}
                      className="flex-1 px-3 py-1.5 text-xs bg-gray-600 hover:bg-gray-500 flex items-center justify-center gap-2"
                      title="키워드에 씬 추가/제거"
                    >
                      <FileText className="w-3 h-3" />
                      씬 편집
                    </button>
                    <button
                      onClick={() => handleDeleteKeyword(keyword.id)}
                      className="px-3 py-1.5 bg-red-800 hover:bg-red-700"
                      title="키워드 삭제"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default KeywordManager;