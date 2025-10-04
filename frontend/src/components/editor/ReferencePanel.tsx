import React from 'react';
import { Eye, Copy, PlusCircle, Pencil } from 'lucide-react';
import type { Scene, LineDiff } from '@/types';

interface ReferencePanelProps {
  scenesC: Scene[];
  scenesB: Scene[];
  getSceneDiffInfo: (sceneNum: string) => { isNewInC: boolean; isModifiedInC: boolean };
  selectedSceneNum: string | null;
  computeSceneDiff: (sceneB: Scene, sceneC: Scene) => LineDiff[] | null;
  copySceneFromC: (sceneNum: string) => void;
  copyLineFromC: (lineText: string) => void;
  sceneRefsC: React.MutableRefObject<Record<string, HTMLDivElement | null>>;
}

const ReferencePanel: React.FC<ReferencePanelProps> = ({
  scenesC,
  scenesB,
  getSceneDiffInfo,
  selectedSceneNum,
  computeSceneDiff,
  copySceneFromC,
  copyLineFromC,
  sceneRefsC
}) => {
  return (
    <div className="w-full xl:w-[450px] 2xl:w-[500px] bg-gray-800/50 backdrop-blur-sm rounded-lg p-3 sm:p-4 flex flex-col border border-gray-700/50 h-full">
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <h2 className="text-sm sm:text-base font-semibold flex items-center gap-2 text-green-300">
          <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>참고 v3.0</span>
        </h2>
        <span className="text-xs text-gray-400 px-2 py-1 bg-gray-900/50 rounded border border-gray-700/50">
          {scenesC.length}개
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2.5 sm:space-y-3 pr-1 min-h-0">
        {scenesC.map(sceneC => {
          const sceneB = scenesB.find(s => s.sceneNum === sceneC.sceneNum);
          const diffInfo = getSceneDiffInfo(sceneC.sceneNum);
          const isSelected = selectedSceneNum === sceneC.sceneNum;
          const diff = sceneB ? computeSceneDiff(sceneB, sceneC) : null;

          return (
            <div
              key={sceneC.sceneNum}
              ref={(el: HTMLDivElement | null) => { sceneRefsC.current[sceneC.sceneNum] = el; }}
              className={`bg-gray-700/50 rounded-lg overflow-hidden border transition-all ${
                isSelected ? 'ring-2 ring-green-500/50 border-green-500/30' : 'border-gray-700/50'
              }`}
            >
              <div className="p-2.5 sm:p-3 bg-gray-700/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs sm:text-sm font-semibold text-green-300">
                    #{sceneC.sceneNum}
                  </span>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    {diffInfo.isNewInC && (
                      <div className="p-1 bg-green-500/10 border border-green-500/20 text-green-400 rounded-full" title="NEW">
                        <PlusCircle className="w-3 h-3" />
                      </div>
                    )}
                    {diffInfo.isModifiedInC && (
                      <div className="p-1 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 rounded-full" title="MODIFIED">
                        <Pencil className="w-3 h-3" />
                      </div>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copySceneFromC(sceneC.sceneNum);
                      }}
                      className="p-1 hover:bg-gray-600 rounded-lg transition-colors"
                      title="전체 씬 복사"
                    >
                      <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                </div>
                <div className="text-xs text-gray-400 truncate">{sceneC.location}</div>
              </div>

              {/* Diff 표시 */}
              <div className="p-2.5 sm:p-3 space-y-0.5">
                {diff ? (
                  diff.map((item, idx) => {
                    if (item.type === 'removed') {
                      return (
                        <div
                          key={idx}
                          className="font-mono text-xs text-red-300/80 bg-red-500/10 rounded px-2 py-1 line-through border border-red-500/10"
                        >
                          - {item.content}
                        </div>
                      );
                    } else if (item.type === 'added') {
                      return (
                        <div
                          key={idx}
                          className="group flex items-start gap-2 font-mono text-xs text-green-300 bg-green-500/10 rounded px-2 py-1 border border-green-500/10 hover:bg-green-500/15 transition-colors"
                        >
                          <span className="flex-1">+ {item.content}</span>
                          <button
                            onClick={() => copyLineFromC(item.content!)}
                            className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-green-600/20 rounded transition-all flex-shrink-0"
                            title="이 줄 복사"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    } else if (item.type === 'modified') {
                      return (
                        <div key={idx} className="space-y-0.5">
                          <div className="font-mono text-xs text-red-300/80 bg-red-500/10 rounded px-2 py-1 line-through border border-red-500/10">
                            - {item.oldContent}
                          </div>
                          <div className="group flex items-start gap-2 font-mono text-xs text-yellow-300 bg-yellow-500/10 rounded px-2 py-1 border border-yellow-500/10 hover:bg-yellow-500/15 transition-colors">
                            <span className="flex-1">~ {item.newContent}</span>
                            <button
                              onClick={() => copyLineFromC(item.newContent!)}
                              className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-yellow-600/20 rounded transition-all flex-shrink-0"
                              title="이 줄 복사"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    } else {
                      return (
                        <div
                          key={idx}
                          className="font-mono text-xs text-gray-300/70 px-2 py-1"
                        >
                          {item.content}
                        </div>
                      );
                    }
                  })
                ) : (
                  // B에 없는 완전히 새로운 씬
                  sceneC.content.map((line, idx) => (
                    <div
                      key={idx}
                      className="group flex items-start gap-2 font-mono text-xs text-green-300 bg-green-500/10 rounded px-2 py-1 border border-green-500/10 hover:bg-green-500/15 transition-colors"
                    >
                      <span className="flex-1">+ {line.text}</span>
                      <button
                        onClick={() => copyLineFromC(line.text)}
                        className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-green-600/20 rounded transition-all flex-shrink-0"
                        title="이 줄 복사"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReferencePanel;