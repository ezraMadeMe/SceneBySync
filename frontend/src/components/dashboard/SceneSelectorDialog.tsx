import React from 'react';
import { FileText, Check } from 'lucide-react';
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
  if (!showSceneSelector || !keywordToEdit) return null;

  const keyword = keywords.find(k => k.id === keywordToEdit);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          씬 선택: {keyword?.name}
        </h3>
        
        <div className="space-y-2 mb-4">
          {sceneComparison.map(scene => {
            const isSelected = keyword?.sceneNumbers.includes(scene.sceneNum);
            
            return (
              <div
                key={scene.sceneNum}
                onClick={() => toggleSceneInKeyword(keywordToEdit, scene.sceneNum)}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-blue-900 bg-opacity-30 border-blue-700'
                    : 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm">
                    {scene.scene1?.header || scene.scene2?.header}
                  </span>
                  {isSelected && <Check className="w-5 h-5 text-blue-400" />}
                </div>
              </div>
            );
          })}
        </div>
        
        <button
          onClick={() => {
            setShowSceneSelector(false);
            setKeywordToEdit(null);
          }}
          className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors"
        >
          완료
        </button>
      </div>
    </div>
  );
};

export default SceneSelectorDialog;
