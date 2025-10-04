import React from 'react';
import { FileEdit } from 'lucide-react';

interface EditorPanelProps {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  editingContent: string;
  handleTextChange: (newText: string) => void;
  newVersionInfo: {
    versionNumber: string;
  };
}

const EditorPanel: React.FC<EditorPanelProps> = ({
  textareaRef,
  editingContent,
  handleTextChange,
  newVersionInfo
}) => {
  return (
    <div className="flex-1 bg-gray-800/50 backdrop-blur-sm rounded-lg p-3 sm:p-4 flex flex-col min-w-0 border border-gray-700/50 h-full">
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <h2 className="text-sm sm:text-base font-semibold flex items-center gap-2 text-purple-300">
          <FileEdit className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="hidden sm:inline">편집 중</span>
          <span className="sm:hidden">편집</span>
        </h2>
        <div className="flex items-center gap-2 text-xs px-2 py-1 bg-gray-900/50 rounded border border-gray-700/50">
          <span className="text-gray-400">Base: v{newVersionInfo.versionNumber}</span>
        </div>
      </div>

      <textarea
        ref={textareaRef}
        value={editingContent}
        onChange={(e) => handleTextChange(e.target.value)}
        className="flex-1 w-full bg-gray-900/50 border border-gray-700/50 rounded-lg p-3 sm:p-4 font-mono text-xs sm:text-sm resize-none focus:ring-2 focus:ring-purple-500/50 focus:outline-none focus:bg-gray-900 focus:border-purple-500/30 transition-all placeholder:text-gray-600 overflow-y-auto"
        placeholder="시나리오를 입력하세요..."
        spellCheck={false}
      />
    </div>
  );
};

export default EditorPanel;
