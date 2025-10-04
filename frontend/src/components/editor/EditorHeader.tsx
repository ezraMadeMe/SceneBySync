import React from 'react';
import { GitBranch, Save, Eye, EyeOff, ArrowRight, Menu } from 'lucide-react';

interface EditorHeaderProps {
  newVersionInfo: {
    versionNumber: string;
  };
  showReference: boolean;
  setShowReference: (show: boolean) => void;
  hasChanges: boolean;
  setShowSaveDialog: (show: boolean) => void;
  showSceneList: boolean;
  setShowSceneList: (show: boolean) => void;
}

const EditorHeader: React.FC<EditorHeaderProps> = ({
  newVersionInfo,
  showReference,
  setShowReference,
  hasChanges,
  setShowSaveDialog,
  showSceneList,
  setShowSceneList
}) => {
  return (
    <header className="bg-gray-800/95 backdrop-blur-sm border-b border-gray-700 p-3 sm:p-4 sticky top-0 z-50">
      <div className="max-w-full mx-auto flex items-center justify-between gap-2 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={() => setShowSceneList(!showSceneList)}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
            title="씬 목록 토글"
          >
            <Menu className="w-5 h-5 text-purple-400" />
          </button>

          <GitBranch className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400 flex-shrink-0" />
          <h1 className="text-base sm:text-xl font-bold hidden sm:block">ScriptVault Editor</h1>
          <h1 className="text-base font-bold sm:hidden">Editor</h1>
        </div>

        {/* Version Flow - Desktop */}
        <div className="hidden lg:flex items-center gap-2 text-xs sm:text-sm bg-gray-900/50 rounded-lg px-3 py-2 border border-gray-700/50">
          <div className="flex items-center gap-2 px-2 py-1 bg-blue-500/10 rounded border border-blue-500/20">
            <span className="text-blue-300 font-medium">v2.1</span>
          </div>
          <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
          <div className="flex items-center gap-2 px-2 py-1 bg-purple-500/10 rounded border border-purple-500/20">
            <span className="text-purple-300 font-medium">{newVersionInfo.versionNumber}</span>
          </div>
          <div className="w-px h-4 bg-gray-700 mx-1" />
          <div className="flex items-center gap-2 px-2 py-1 bg-green-500/10 rounded border border-green-500/20">
            <Eye className="w-3 h-3 text-green-400" />
            <span className="text-green-300 font-medium">v3.0</span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setShowReference(!showReference)}
            className="flex items-center gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-gray-700/50 hover:bg-gray-600 rounded-lg transition-all border border-gray-600/50 hover:border-gray-500"
          >
            {showReference ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span className="text-xs sm:text-sm hidden sm:inline">참고 버전</span>
          </button>

          <button
            onClick={() => setShowSaveDialog(true)}
            disabled={!hasChanges}
            className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-all text-xs sm:text-sm font-medium ${
              hasChanges
                ? 'bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-500/20'
                : 'bg-gray-700/50 cursor-not-allowed opacity-50'
            }`}
          >
            <Save className="w-4 h-4" />
            <span className="hidden sm:inline">저장</span>
          </button>
        </div>
      </div>

      {/* Version Flow - Mobile */}
      <div className="lg:hidden mt-2 flex items-center gap-1.5 text-xs overflow-x-auto pb-1">
        <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-500/10 rounded border border-blue-500/20 whitespace-nowrap">
          <span className="text-blue-300 font-medium">v2.1</span>
        </div>
        <ArrowRight className="w-3 h-3 text-gray-500 flex-shrink-0" />
        <div className="flex items-center gap-1.5 px-2 py-1 bg-purple-500/10 rounded border border-purple-500/20 whitespace-nowrap">
          <span className="text-purple-300 font-medium">{newVersionInfo.versionNumber}</span>
        </div>
        <div className="w-px h-3 bg-gray-700 mx-0.5 flex-shrink-0" />
        <div className="flex items-center gap-1.5 px-2 py-1 bg-green-500/10 rounded border border-green-500/20 whitespace-nowrap">
          <Eye className="w-3 h-3 text-green-400" />
          <span className="text-green-300 font-medium">v3.0</span>
        </div>
      </div>
    </header>
  );
};

export default EditorHeader;
