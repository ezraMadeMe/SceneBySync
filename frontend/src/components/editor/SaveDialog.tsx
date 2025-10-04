import React from 'react';
import { GitBranch } from 'lucide-react';

interface SaveDialogProps {
  showSaveDialog: boolean;
  setShowSaveDialog: (show: boolean) => void;
  newVersionInfo: {
    versionNumber: string;
    commitMessage: string;
    branchName: string;
  };
  setNewVersionInfo: (info: { versionNumber: string; commitMessage: string; branchName: string }) => void;
  handleSave: () => void;
}

const SaveDialog: React.FC<SaveDialogProps> = ({ 
  showSaveDialog, 
  setShowSaveDialog, 
  newVersionInfo, 
  setNewVersionInfo, 
  handleSave 
}) => {
  if (!showSaveDialog) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <GitBranch className="w-5 h-5 text-purple-400" />
          새 버전 생성
        </h3>

        <div className="space-y-4 mb-6">
          <div>
            <label className="text-sm text-gray-400 mb-2 block">버전 번호</label>
            <input
              type="text"
              value={newVersionInfo.versionNumber}
              onChange={(e) => setNewVersionInfo({ ...newVersionInfo, versionNumber: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
              placeholder="예: v2.2"
            />
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-2 block">브랜치</label>
            <input
              type="text"
              value={newVersionInfo.branchName}
              onChange={(e) => setNewVersionInfo({ ...newVersionInfo, branchName: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
              placeholder="예: feature/new-ending"
            />
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-2 block">커밋 메시지 *</label>
            <textarea
              value={newVersionInfo.commitMessage}
              onChange={(e) => setNewVersionInfo({ ...newVersionInfo, commitMessage: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm h-24 resize-none"
              placeholder="변경 사항을 설명하세요..."
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowSaveDialog(false)}
            className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded text-sm transition-colors"
          >
            생성
          </button>
        </div>
      </div>
    </div>
  );
};

export default SaveDialog;
