import React, { useState, useRef, useEffect, useMemo } from 'react';
import { FileEdit, Eye, Copy, GripVertical, Plus, Trash2 } from 'lucide-react';
import type { Scene, LineDiff } from '@/types';

interface SceneBlock {
  sceneNum: string;
  header: string;
  content: string;
  startIndex: number;
  endIndex: number;
}

interface SplitEditorViewProps {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  editingContent: string;
  handleTextChange: (newText: string) => void;
  newVersionInfo: {
    versionNumber: string;
  };
  showReference: boolean;
  scenesC: Scene[];
  scenesB: Scene[];
  getSceneDiffInfo: (sceneNum: string) => { isNewInC: boolean; isModifiedInC: boolean };
  selectedSceneNum: string | null;
  computeSceneDiff: (sceneB: Scene, sceneC: Scene) => LineDiff[] | null;
  copySceneFromC: (sceneNum: string) => void;
  copyLineFromC: (lineText: string) => void;
  sceneRefsC: React.MutableRefObject<Record<string, HTMLDivElement | null>>;
}

const SplitEditorView: React.FC<SplitEditorViewProps> = ({
  textareaRef,
  editingContent,
  handleTextChange,
  newVersionInfo,
  showReference,
  scenesC,
  scenesB,
  getSceneDiffInfo,
  selectedSceneNum,
  computeSceneDiff,
  copySceneFromC,
  copyLineFromC,
  sceneRefsC
}) => {
  const [leftWidth, setLeftWidth] = useState(50); // percentage
  const [isDragging, setIsDragging] = useState(false);
  const [selectedSceneBlock, setSelectedSceneBlock] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse content into scene blocks
  const sceneBlocks = useMemo<SceneBlock[]>(() => {
    const blocks: SceneBlock[] = [];
    const lines = editingContent.split('\n');
    let currentBlock: { header: string; lines: string[]; startIndex: number } | null = null as {
      header: string;
      lines: string[];
      startIndex: number;
    } | null;

    lines.forEach((line, index) => {
      if (line.trim().startsWith('#')) {
        // Save previous block
        if (currentBlock) {
          const sceneNumMatch = currentBlock.header.match(/^#(\d+)\./);
          blocks.push({
            sceneNum: sceneNumMatch ? sceneNumMatch[1] : '',
            header: currentBlock.header,
            content: currentBlock.lines.join('\n'),
            startIndex: currentBlock.startIndex,
            endIndex: index - 1
          });
        }
        // Start new block
        currentBlock = {
          header: line,
          lines: [],
          startIndex: index
        };
      } else if (currentBlock) {
        currentBlock.lines.push(line);
      }
    });

    // Save last block
    if (currentBlock) {
      const sceneNumMatch = currentBlock.header.match(/^#(\d+)\./);
      blocks.push({
        sceneNum: sceneNumMatch ? sceneNumMatch[1] : '',
        header: currentBlock.header,
        content: currentBlock.lines.join('\n'),
        startIndex: currentBlock.startIndex,
        endIndex: lines.length - 1
      });
    }

    return blocks;
  }, [editingContent]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!showReference) return;
    setIsDragging(true);
    e.preventDefault();
  };

  const handleSceneBlockClick = (index: number) => {
    setSelectedSceneBlock(index);
  };

  const renumberScenes = (content: string): string => {
    const lines = content.split('\n');
    let sceneNumber = 1;

    const renumberedLines = lines.map(line => {
      if (line.trim().startsWith('#')) {
        const withoutNumber = line.replace(/^#\d+\./, `#${sceneNumber}.`);
        sceneNumber++;
        return withoutNumber;
      }
      return line;
    });

    return renumberedLines.join('\n');
  };

  const handleInsertSceneAbove = () => {
    if (selectedSceneBlock === null) return;

    const block = sceneBlocks[selectedSceneBlock];
    const lines = editingContent.split('\n');
    const newSceneNum = parseInt(block.sceneNum) || 1;

    const newScene = `#${newSceneNum}. 새 씬 - 낮\n\n`;
    lines.splice(block.startIndex, 0, ...newScene.split('\n').slice(0, -1));

    const updatedContent = renumberScenes(lines.join('\n'));
    handleTextChange(updatedContent);
    setSelectedSceneBlock(selectedSceneBlock + 1);
  };

  const handleInsertSceneBelow = () => {
    if (selectedSceneBlock === null) return;

    const block = sceneBlocks[selectedSceneBlock];
    const lines = editingContent.split('\n');
    const newSceneNum = parseInt(block.sceneNum) + 1 || 1;

    const newScene = `\n#${newSceneNum}. 새 씬 - 낮\n\n`;
    lines.splice(block.endIndex + 1, 0, ...newScene.split('\n').slice(1));

    const updatedContent = renumberScenes(lines.join('\n'));
    handleTextChange(updatedContent);
  };

  const handleSceneHeaderChange = (index: number, newHeader: string) => {
    const block = sceneBlocks[index];
    const lines = editingContent.split('\n');
    lines[block.startIndex] = newHeader;
    handleTextChange(lines.join('\n'));
  };

  const handleSceneContentChange = (index: number, newContent: string) => {
    const block = sceneBlocks[index];
    const lines = editingContent.split('\n');

    // Remove old content lines
    lines.splice(block.startIndex + 1, block.endIndex - block.startIndex);

    // Insert new content lines
    const newContentLines = newContent.split('\n');
    lines.splice(block.startIndex + 1, 0, ...newContentLines);

    handleTextChange(lines.join('\n'));
  };

  const handleDeleteScene = () => {
    if (selectedSceneBlock === null) return;
    if (!confirm('이 씬을 삭제하시겠습니까?')) return;

    const block = sceneBlocks[selectedSceneBlock];
    const lines = editingContent.split('\n');

    // Remove from startIndex to endIndex (inclusive)
    lines.splice(block.startIndex, block.endIndex - block.startIndex + 1);

    handleTextChange(lines.join('\n'));
    setSelectedSceneBlock(null);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current || !showReference) return;

      const container = containerRef.current;
      const containerRect = container.getBoundingClientRect();
      const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;

      // Limit between 20% and 80%
      const clampedWidth = Math.min(Math.max(newLeftWidth, 20), 80);
      setLeftWidth(clampedWidth);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, showReference]);

  const manuscriptStyle = {
    fontFamily: "'Noto Serif KR', 'Batang', serif",
    lineHeight: '2.0',
    backgroundImage: 'repeating-linear-gradient(to bottom, transparent, transparent 35px, #4a4a4a 36px)',
    backgroundSize: '100% 36px',
    backgroundAttachment: 'local',
  };

  return (
    <div ref={containerRef} className="flex-1 bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700/50 h-full overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-gray-700/50 bg-gray-900/30">
        <div className="flex">
          {/* Left Header - Editor */}
          <div
            className="p-3 flex items-center justify-between border-r border-gray-700/50 gap-3"
            style={showReference ? { width: `${leftWidth}%` } : { width: '100%' }}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
                <FileEdit className="w-5 h-5 text-purple-400 flex-shrink-0" />
                <h2 className="text-base font-semibold text-purple-300 truncate">
                  편집 중 ({newVersionInfo.versionNumber})
                </h2>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
                {selectedSceneBlock !== null && (
                  <div className="flex items-center gap-1 flex-shrink-0 p-1 bg-gray-700/50 rounded-md border border-gray-600/50">
                    <button
                      onClick={handleInsertSceneAbove}
                      className="p-1.5 hover:bg-blue-500/20 rounded text-blue-400 hover:text-blue-300 transition-colors"
                      title="위에 씬 추가"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={handleInsertSceneBelow}
                      className="p-1.5 hover:bg-green-500/20 rounded text-green-400 hover:text-green-300 transition-colors"
                      title="아래에 씬 추가"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={handleDeleteScene}
                      className="p-1.5 hover:bg-red-500/20 rounded text-red-400 hover:text-red-300 transition-colors"
                      title="씬 삭제"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
                <div className="text-xs px-2 py-1 bg-blue-900/30 rounded border border-blue-800/50">
                  <span className="text-blue-300 font-semibold">Base: v2.1</span>
                </div>
            </div>
          </div>

          {/* Right Header - Reference */}
          {showReference && (
            <div className="p-3 flex items-center justify-between flex-1">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-green-400" />
                <h2 className="text-base font-semibold text-green-300">
                  참고 (v3.0)
                </h2>
              </div>
              <div className="text-xs px-2 py-1 bg-green-900/30 rounded border border-green-800/50">
                <span className="text-green-300 font-semibold">{scenesC.length}개 씬</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className={`flex-1 overflow-hidden ${showReference ? 'flex' : ''}`}>
        {/* Left Panel - Editor (Scene Blocks) */}
        <div
          className="h-full flex flex-col overflow-y-auto bg-gradient-to-b from-gray-900 to-gray-900/95"
          style={showReference ? { width: `${leftWidth}%` } : { width: '100%' }}
        >
          <div className="max-w-full px-8 sm:px-1 py-4">
            {sceneBlocks.length > 0 ? (
              sceneBlocks.map((block, index) => (
                <div
                  key={index}
                  onClick={() => handleSceneBlockClick(index)}
                  className={`mb-8 transition-all rounded-lg p-4 ${
                    selectedSceneBlock === index ? 'bg-purple-500/5' : ''
                  }`}
                >
                  {/* Scene Number Badge */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`px-3 py-1 rounded-full text-sm font-bold flex-shrink-0 transition-all cursor-pointer ${
                      selectedSceneBlock === index
                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}>
                      씬 #{block.sceneNum || '?'}
                    </div>
                    <div className="flex-1 h-px bg-gradient-to-r from-gray-600 to-transparent"></div>
                  </div>

                  {/* Scene Title */}
                  <div className="mb-4">
                    <input
                      type="text"
                      value={block.header.replace(/^#\d+\.\s*/, '')}
                      onChange={(e) => {
                        e.stopPropagation();
                        const newHeader = `#${block.sceneNum}. ${e.target.value}`;
                        handleSceneHeaderChange(index, newHeader);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className={`w-full bg-transparent border-b-2 outline-none font-bold text-2xl pb-2 transition-all ${
                        selectedSceneBlock === index
                          ? 'border-purple-500 text-white'
                          : 'border-gray-700 text-gray-200 focus:border-purple-500/50'
                      }`}
                      placeholder="씬 제목을 입력하세요"
                      style={{ fontFamily: "'Noto Sans KR', 'Malgun Gothic', sans-serif" }}
                    />
                  </div>

                  {/* Scene Content */}
                  <div>
                    <textarea
                      value={block.content}
                      onInput={(e) => {
                        const target = e.target as HTMLTextAreaElement;
                        target.style.height = 'auto';
                        const lineCount = target.value.split('\n').length;
                        const minLines = 4;
                        const rows = Math.max(minLines, lineCount);
                        target.style.height = `${rows * 36}px`;
                      }}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleSceneContentChange(index, e.target.value);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className={`w-full bg-transparent border-none outline-none text-lg transition-all p-0 resize-none ${
                        selectedSceneBlock === index
                          ? 'text-gray-100'
                          : 'text-gray-300'
                      }`}
                      placeholder="지문, 대사, 액션을 입력하세요..."
                      spellCheck={false}
                      style={{
                        ...manuscriptStyle,
                        minHeight: '144px'
                      }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="max-w-2xl mx-auto text-center py-20">
                <div className="mb-6">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-purple-500/10 flex items-center justify-center">
                    <FileEdit className="w-10 h-10 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-300 mb-2">시나리오를 작성해보세요</h3>
                  <p className="text-sm text-gray-500">새로운 씬을 추가하여 이야기를 시작하세요</p>
                </div>
                <button
                  onClick={() => {
                    handleTextChange('#1. 첫 번째 씬 - 낮\n\n');
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg transition-all shadow-lg shadow-purple-500/30 font-medium"
                >
                  첫 번째 씬 작성하기
                </button>
              </div>
            )}
          </div>

          {/* Hidden textarea for compatibility */}
          <textarea
            ref={textareaRef}
            value={editingContent}
            onChange={(e) => handleTextChange(e.target.value)}
            className="hidden"
            spellCheck={false}
          />
        </div>

        {/* Resizable Divider */}
        {showReference && (
          <div
            className={`group relative flex items-center justify-center bg-gray-700/30 hover:bg-purple-500/20 transition-colors cursor-col-resize ${
              isDragging ? 'bg-purple-500/30' : ''
            }`}
            style={{ width: '12px', flexShrink: 0 }}
            onMouseDown={handleMouseDown}
          >
            <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-0.5 bg-gray-600/50 group-hover:bg-purple-400/50 transition-colors" />
            <GripVertical className={`w-4 h-4 text-gray-500 group-hover:text-purple-400 transition-colors relative z-10 ${
              isDragging ? 'text-purple-400' : ''
            }`} />
          </div>
        )}

        {/* Right Panel - Reference */}
        {showReference && (
          <div className="h-full overflow-y-auto bg-gray-900/30 flex-1">
            <div className="max-w-full mx-auto px-1 sm:px-2 py-4 space-y-6">
              {scenesC.map(sceneC => {
                const sceneB = scenesB.find(s => s.sceneNum === sceneC.sceneNum);
                const diffInfo = getSceneDiffInfo(sceneC.sceneNum);
                const isSelected = selectedSceneNum === sceneC.sceneNum;
                const diff = sceneB ? computeSceneDiff(sceneB, sceneC) : null;

                return (
                  <div
                    key={sceneC.sceneNum}
                    ref={(el: HTMLDivElement | null) => { sceneRefsC.current[sceneC.sceneNum] = el; }}
                    className={`transition-all p-2 rounded-lg ${
                      isSelected ? 'bg-green-500/5' : ''
                    }`}
                  >
                    {/* Scene Number & Title */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`px-3 py-1 rounded-full text-sm font-bold flex-shrink-0 transition-all ${
                        isSelected
                          ? 'bg-green-600 text-white shadow-lg shadow-green-500/30'
                          : 'bg-gray-700 text-gray-300'
                      }`}>
                        씬 #{sceneC.sceneNum}
                      </div>
                      <h3 className="font-bold text-lg text-white flex-1">{sceneC.location}</h3>
                      <div className="flex items-center gap-1.5">
                        {diffInfo.isNewInC && (
                          <span className="px-2 py-0.5 bg-green-500/10 border border-green-500/20 text-green-400 text-xs rounded-full">
                            NEW
                          </span>
                        )}
                        {diffInfo.isModifiedInC && (
                          <span className="px-2 py-0.5 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs rounded-full">
                            MOD
                          </span>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            copySceneFromC(sceneC.sceneNum);
                          }}
                          className="p-1.5 hover:bg-gray-600/50 rounded-lg transition-colors"
                          title="전체 씬 복사"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Diff Content */}
                    <div className="space-y-1 text-base leading-relaxed" style={{ fontFamily: "'Noto Serif KR', 'Batang', serif" }}>
                      {diff ? (
                        diff.map((item, idx) => {
                          if (item.type === 'removed') {
                            return (
                              <div
                                key={idx}
                                className="text-sm text-red-300/70 bg-red-500/5 px-3 py-1.5 rounded line-through"
                              >
                                {item.content}
                              </div>
                            );
                          } else if (item.type === 'added') {
                            return (
                              <div
                                key={idx}
                                className="group flex items-start gap-2 text-sm text-green-300 bg-green-500/10 px-3 py-1.5 rounded hover:bg-green-500/15 transition-colors"
                              >
                                <span className="flex-1">{item.content}</span>
                                <button
                                  onClick={() => copyLineFromC(item.content!)}
                                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-green-600/20 rounded transition-all flex-shrink-0"
                                  title="이 줄 복사"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            );
                          } else if (item.type === 'modified') {
                            return (
                              <div key={idx} className="space-y-1">
                                <div className="text-sm text-red-300/70 bg-red-500/5 px-3 py-1.5 rounded line-through">
                                  {item.oldContent}
                                </div>
                                <div className="group flex items-start gap-2 text-sm text-yellow-300 bg-yellow-500/10 px-3 py-1.5 rounded hover:bg-yellow-500/15 transition-colors">
                                  <span className="flex-1">{item.newContent}</span>
                                  <button
                                    onClick={() => copyLineFromC(item.newContent!)}
                                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-yellow-600/20 rounded transition-all flex-shrink-0"
                                    title="이 줄 복사"
                                  >
                                    <Copy className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            );
                          } else {
                            return (
                              <div
                                key={idx}
                                className="text-sm text-gray-400/80 px-3 py-1.5"
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
                            className="group flex items-start gap-2 text-sm text-green-300 bg-green-500/10 px-3 py-1.5 rounded hover:bg-green-500/15 transition-colors"
                          >
                            <span className="flex-1">{line.text}</span>
                            <button
                              onClick={() => copyLineFromC(line.text)}
                              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-green-600/20 rounded transition-all flex-shrink-0"
                              title="이 줄 복사"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Scene Divider */}
                    {scenesC.indexOf(sceneC) < scenesC.length - 1 && (
                      <div className="mt-6 flex items-center gap-3">
                        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-600/30 to-transparent"></div>
                        <div className="text-xs text-gray-600">• • •</div>
                        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-600/30 to-transparent"></div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SplitEditorView;
