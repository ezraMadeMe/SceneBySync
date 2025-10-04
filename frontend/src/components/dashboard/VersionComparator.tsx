import React from 'react';
import type { Version } from '@/types';
import { Search, GitBranch, Plus, Minus, Pencil, MoveRight, FileText } from 'lucide-react';

interface VersionComparatorProps {
  baseVersion: string;
  targetVersion: string;
  setBaseVersion: (id: string) => void;
  setTargetVersion: (id: string) => void;
  versions: Version[];
  sceneStats: {
    added: number;
    removed: number;
    modified: number;
    moved: number;
    unchanged: number;
  };
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  searchOptions: { header: boolean; content: boolean };
  setSearchOptions: (o: { header: boolean; content: boolean }) => void;
}

const VersionCard: React.FC<{ versionId: string; versions: Version[]; setVersion: (id: string) => void; label: string; bgColor: string }> = ({ versionId, versions, setVersion, label, bgColor }) => {
  const version = versions.find(v => v.id === versionId);

  if (!version) {
    return <div className={`w-full p-3 sm:p-4 rounded-lg ${bgColor} bg-opacity-20`}>버전 정보를 찾을 수 없습니다.</div>;
  }

  return (
    <div className={`w-full h-full p-3 sm:p-4 rounded-lg shadow-md ${bgColor} bg-opacity-20 flex flex-col justify-between`}>
      <div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-2">
          <span className="text-xs sm:text-sm font-bold text-gray-200">{label}</span>
          <select
            value={versionId}
            onChange={(e) => setVersion(e.target.value)}
            className="w-full sm:w-auto bg-gray-700 text-white text-xs sm:text-sm rounded p-1.5 sm:p-1 border-0 focus:ring-2 focus:ring-purple-500 truncate"
          >
            {versions.map(v => (
              <option key={v.id} value={v.id}>{v.id} - {v.message.substring(0, 15)}...</option>
            ))}
          </select>
        </div>
        <div className="font-bold text-base sm:text-lg text-white">{version.id}</div>
        <p className="text-xs sm:text-sm text-gray-300 mt-1 truncate" title={version.message}>{version.message}</p>
      </div>
      <div className="text-xs text-gray-400 mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-500 border-opacity-50">
        <p className="truncate"><strong>Author:</strong> {version.author}</p>
        <p className="truncate"><strong>Date:</strong> {version.date}</p>
      </div>
    </div>
  );
};

const StatRow: React.FC<{ icon: React.ReactNode; value: number; label: string; color: string }> = ({ icon, value, label, color }) => (
    <div className={`flex items-center justify-between text-sm w-full max-w-[150px] px-2 py-1 rounded ${color}`}>
        <div className="flex items-center gap-2">
            {icon}
            <span className="text-xs">{label}</span>
        </div>
        <span className="font-bold text-xs">{value}</span>
    </div>
);

const SearchOptionButton: React.FC<{
  label: string;
  optionKey: 'header' | 'content';
  options: { header: boolean; content: boolean };
  setOptions: (o: { header: boolean; content: boolean }) => void;
}> = ({ label, optionKey, options, setOptions }) => {
  const isActive = options[optionKey];
  
  const handleClick = () => {
    const newOptions = { ...options, [optionKey]: !isActive };
    if (!newOptions.header && !newOptions.content) {
      return;
    }
    setOptions(newOptions);
  };

  return (
    <button
      onClick={handleClick}
      className={`px-4 py-2 text-sm font-semibold transition-colors ${
        isActive 
          ? 'bg-gray-700 text-white' 
          : 'bg-transparent text-gray-400 hover:bg-gray-600'
      }`}
    >
      {label}
    </button>
  );
};

const VersionComparator: React.FC<VersionComparatorProps> = ({ 
    baseVersion, targetVersion, setBaseVersion, setTargetVersion, versions, sceneStats, 
    searchQuery, setSearchQuery, searchOptions, setSearchOptions
}) => {
  return (
    <header className="border-b border-gray-700 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <GitBranch className="w-6 h-6 text-blue-400" />
          <h1 className="text-xl font-bold">ScriptVault Pro</h1>
        </div>
      </div>
      <div className="flex items-stretch justify-center gap-3 sm:gap-4 flex-wrap lg:flex-nowrap">
        <div className="w-full lg:w-[42%]">
          <VersionCard
            label="BASE"
            versionId={baseVersion}
            versions={versions}
            setVersion={setBaseVersion}
            bgColor="bg-blue-900"
          />
        </div>

        <div className="w-full lg:w-[16%] flex flex-col items-center justify-center text-gray-200">
            <div className="flex flex-col gap-1.5 w-full items-center justify-center h-full">
                <StatRow icon={<Plus size={14}/>} value={sceneStats.added} label="추가" color="bg-green-900/70 text-green-300" />
                <StatRow icon={<Minus size={14}/>} value={sceneStats.removed} label="삭제" color="bg-red-900/70 text-red-300" />
                <StatRow icon={<Pencil size={14}/>} value={sceneStats.modified} label="수정" color="bg-yellow-900/70 text-yellow-300" />
                <StatRow icon={<MoveRight size={14}/>} value={sceneStats.moved} label="이동" color="bg-blue-900/70 text-blue-300" />
                <StatRow icon={<FileText size={14}/>} value={sceneStats.unchanged} label="유지" color="bg-gray-800/70 text-gray-400" />
            </div>
        </div>

        <div className="w-full lg:w-[42%]">
          <VersionCard
            label="TARGET"
            versionId={targetVersion}
            versions={versions}
            setVersion={setTargetVersion}
            bgColor="bg-purple-900"
          />
        </div>
      </div>
      <div className="mt-4 border-t border-gray-700/50 pt-4">
        <div className="flex items-center w-full bg-gray-800 border border-gray-700 rounded-lg overflow-hidden transition-all focus-within:ring-2 focus-within:ring-purple-500 focus-within:border-purple-500">
          <div className="flex-shrink-0 flex items-center">
            <SearchOptionButton label="헤더" optionKey="header" options={searchOptions} setOptions={setSearchOptions} />
            <div className="w-px h-5 bg-gray-700"></div>
            <SearchOptionButton label="내용" optionKey="content" options={searchOptions} setOptions={setSearchOptions} />
          </div>
          
          <div className="w-px h-full mx-1 bg-gray-700"></div>

          <div className="relative flex-grow flex items-center">
            <input
              type="text"
              placeholder="검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent pl-3 pr-3 py-2 text-sm outline-none"
            />
          </div>

          <button className="flex-shrink-0 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 transition-colors" title="검색">
            <Search className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default VersionComparator;