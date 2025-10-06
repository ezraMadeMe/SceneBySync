import React, { useState, useMemo } from 'react';
import type { MouseEvent } from 'react';
import { FileText, Search, X, ChevronRight, ChevronLeft } from 'lucide-react';
import type { Keyword, SceneComparison } from '@/types';

interface SceneSelectorDialogProps {
  showSceneSelector: boolean;
  setShowSceneSelector: (show: boolean) => void;
  keywordToEdit: string | null;
  setKeywordToEdit: (keywordId: string | null) => void;
  keywords: Keyword[];
  sceneComparison: SceneComparison[];
  toggleSceneInKeyword: (keywordId: string, sceneNum: string) => void;
}

const SceneSelectorDialog: React.FC<SceneSelectorDialogProps> = ({ 
  showSceneSelector, 
  setShowSceneSelector, 
  keywordToEdit, 
  setKeywordToEdit, 
  keywords, 
  sceneComparison, 
  toggleSceneInKeyword 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAvailable, setSelectedAvailable] = useState<Set<string>>(new Set());
  const [lastAvailableClicked, setLastAvailableClicked] = useState<string | null>(null);
  const [selectedInKeyword, setSelectedInKeyword] = useState<Set<string>>(new Set());
  const [lastInKeywordClicked, setLastInKeywordClicked] = useState<string | null>(null);

  const keyword = keywords.find(k => k.id === keywordToEdit);

  const availableScenes = useMemo(() => {
    if (!keyword) return [];
    const selectedSceneNums = new Set(keyword.sceneNumbers);
    return sceneComparison
      .filter(scene => !selectedSceneNums.has(scene.sceneNum))
      .filter(scene => {
        if (!searchQuery) return true;
        const header = getSceneHeader(scene);
        return header.toLowerCase().includes(searchQuery.toLowerCase()) || scene.sceneNum.includes(searchQuery);
      });
  }, [sceneComparison, keyword, searchQuery]);

  const selectedScenes = useMemo(() => {
    if (!keyword) return [];
    const selectedSceneNums = new Set(keyword.sceneNumbers);
    return sceneComparison.filter(scene => selectedSceneNums.has(scene.sceneNum));
  }, [sceneComparison, keyword]);

  if (!showSceneSelector || !keywordToEdit) {
    return null;
  }

  const getSceneHeader = (scene: SceneComparison) => {
    return scene.scene1?.header || scene.scene2?.header || '';
  }

  const handleSelection = (
    e: MouseEvent,
    sceneNum: string,
    list: 'available' | 'inKeyword'
  ) => {
    const [items, setItems, setLastClicked, fullList] = list === 'available'
      ? [selectedAvailable, setSelectedAvailable, setLastAvailableClicked, availableScenes]
      : [selectedInKeyword, setSelectedInKeyword, setLastInKeywordClicked, selectedScenes];
    
    const lastClicked = list === 'available' ? lastAvailableClicked : lastInKeywordClicked;

    if (e.shiftKey && lastClicked) {
      const lastIndex = fullList.findIndex(s => s.sceneNum === lastClicked);
      const currentIndex = fullList.findIndex(s => s.sceneNum === sceneNum);
      if (lastIndex === -1 || currentIndex === -1) { // Should not happen
        setItems(new Set([sceneNum]));
        setLastClicked(sceneNum);
        return;
      }
      const start = Math.min(lastIndex, currentIndex);
      const end = Math.max(lastIndex, currentIndex);
      const newSelection = new Set(items);
      for (let i = start; i <= end; i++) {
        newSelection.add(fullList[i].sceneNum);
      }
      setItems(newSelection);
    } else if (e.ctrlKey || e.metaKey) {
      const newSelection = new Set(items);
      if (newSelection.has(sceneNum)) {
        newSelection.delete(sceneNum);
      } else {
        newSelection.add(sceneNum);
      }
      setItems(newSelection);
      setLastClicked(sceneNum);
    } else {
      setItems(new Set([sceneNum]));
      setLastClicked(sceneNum);
    }
  };

  const moveSelectedToKeyword = () => {
    if (!keywordToEdit) return;
    selectedAvailable.forEach(sceneNum => {
      toggleSceneInKeyword(keywordToEdit, sceneNum);
    });
    setSelectedAvailable(new Set());
    setLastAvailableClicked(null);
  };

  const moveSelectedFromKeyword = () => {
    if (!keywordToEdit) return;
    selectedInKeyword.forEach(sceneNum => {
      toggleSceneInKeyword(keywordToEdit, sceneNum);
    });
    setSelectedInKeyword(new Set());
    setLastInKeywordClicked(null);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 max-w-5xl w-full mx-4 flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between pb-4 border-b border-gray-700">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <FileText className="w-5 h-5" />
              씬 편집: {keyword?.name}
            </h3>
            <button onClick={() => { setShowSceneSelector(false); setKeywordToEdit(null); }}>
                <X className="w-6 h-6 text-gray-500 hover:text-white" />
            </button>
        </div>
        
        {/* Content */}
        <div className="flex-grow grid grid-cols-[1fr_auto_1fr] gap-4 overflow-hidden py-4">
          {/* Left Panel: Available Scenes */}
          <div className="flex flex-col h-full overflow-hidden">
            <h4 className="text-base font-semibold mb-3">전체 씬 목록 ({availableScenes.length})</h4>
            <div className="relative mb-2 flex-shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="씬 번호 또는 제목으로 검색..."
                className="w-full bg-gray-700 border border-gray-600 pl-9 pr-4 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
              />
            </div>
            <div className="flex-grow overflow-y-auto space-y-1 -mr-2 pr-2 border border-gray-700 p-1">
              {availableScenes.map(scene => {
                const isSelected = selectedAvailable.has(scene.sceneNum);
                return (
                  <div
                    key={scene.sceneNum}
                    onClick={(e) => handleSelection(e, scene.sceneNum, 'available')}
                    className={`p-2 cursor-pointer transition-colors ${isSelected ? 'bg-purple-600/50' : 'hover:bg-gray-600/50'}`}
                  >
                    <span className="font-mono text-sm text-purple-300">#{scene.sceneNum}</span>
                    <span className="ml-2 text-sm text-gray-300">{getSceneHeader(scene)}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Middle Panel: Arrow Buttons */}
          <div className="flex flex-col items-center justify-center gap-4">
            <button
              onClick={moveSelectedToKeyword}
              disabled={selectedAvailable.size === 0}
              className="p-2 bg-gray-700 hover:bg-purple-600 disabled:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
            <button
              onClick={moveSelectedFromKeyword}
              disabled={selectedInKeyword.size === 0}
              className="p-2 bg-gray-700 hover:bg-purple-600 disabled:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          </div>

          {/* Right Panel: Selected Scenes */}
          <div className="flex flex-col h-full overflow-hidden">
            <h4 className="text-base font-semibold mb-3">키워드에 포함된 씬 ({selectedScenes.length})</h4>
            <div className="flex-grow overflow-y-auto space-y-1 -mr-2 pr-2 border border-gray-700 p-1">
              {selectedScenes.length > 0 ? selectedScenes.map(scene => {
                const isSelected = selectedInKeyword.has(scene.sceneNum);
                return (
                  <div
                    key={scene.sceneNum}
                    onClick={(e) => handleSelection(e, scene.sceneNum, 'inKeyword')}
                    className={`p-2 flex items-center justify-between cursor-pointer transition-colors ${isSelected ? 'bg-purple-600/50' : 'hover:bg-gray-600/50'}`}
                  >
                    <div>
                      <span className="font-mono text-sm text-purple-300">#{scene.sceneNum}</span>
                      <span className="ml-2 text-sm text-gray-300">{getSceneHeader(scene)}</span>
                    </div>
                  </div>
                )
              }) : (
                <div className="text-center text-gray-500 pt-10">
                  <p>왼쪽 목록에서 씬을 선택하고<br/>화살표 버튼을 눌러 추가하세요.</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="flex-shrink-0 pt-4 border-t border-gray-700 flex justify-end">
          <button
            onClick={() => {
              setShowSceneSelector(false);
              setKeywordToEdit(null);
            }}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-sm font-semibold transition-colors"
          >
            완료
          </button>
        </div>
      </div>
    </div>
  );
};

export default SceneSelectorDialog;
