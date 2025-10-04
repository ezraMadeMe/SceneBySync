import React from 'react';
import { Tag } from 'lucide-react';

interface KeywordDialogProps {
  showKeywordDialog: boolean;
  setShowKeywordDialog: (show: boolean) => void;
  newKeyword: { name: string; description: string; color: string };
  setNewKeyword: (keyword: { name: string; description: string; color: string }) => void;
  handleAddKeyword: () => void;
}

const KeywordDialog: React.FC<KeywordDialogProps> = ({ 
  showKeywordDialog, 
  setShowKeywordDialog, 
  newKeyword, 
  setNewKeyword, 
  handleAddKeyword 
}) => {
  if (!showKeywordDialog) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Tag className="w-5 h-5" />
          새 키워드 생성
        </h3>
        
        <div className="space-y-4 mb-4">
          <div>
            <label className="text-sm text-gray-400 mb-2 block">키워드 이름</label>
            <input
              type="text"
              value={newKeyword.name}
              onChange={(e) => setNewKeyword({ ...newKeyword, name: e.target.value })}
              placeholder="예: 준호 밤"
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
            />
          </div>
          
          <div>
            <label className="text-sm text-gray-400 mb-2 block">설명 (선택)</label>
            <textarea
              value={newKeyword.description}
              onChange={(e) => setNewKeyword({ ...newKeyword, description: e.target.value })}
              placeholder="이 키워드에 대한 설명..."
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm h-20 resize-none"
            />
          </div>
          
          <div>
            <label className="text-sm text-gray-400 mb-2 block">색상</label>
            <div className="flex gap-2">
              {['#8B5CF6', '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#EC4899'].map(color => (
                <button
                  key={color}
                  onClick={() => setNewKeyword({ ...newKeyword, color })}
                  className={`w-8 h-8 rounded-full transition-all ${
                    newKeyword.color === color ? 'ring-2 ring-white scale-110' : ''
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => {
              setShowKeywordDialog(false);
              setNewKeyword({ name: '', description: '', color: '#8B5CF6' });
            }}
            className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleAddKeyword}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors"
          >
            생성
          </button>
        </div>
      </div>
    </div>
  );
};

export default KeywordDialog;
