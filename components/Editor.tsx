import React from 'react';

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
}

const Editor: React.FC<EditorProps> = ({ value, onChange }) => {
  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-900">
      <div className="p-2 bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 text-[10px] font-mono text-slate-500 dark:text-slate-400 flex justify-between items-center">
        <span>MARKDOWN INPUT</span>
      </div>
      <textarea
        className="flex-1 w-full h-full p-4 resize-none focus:outline-none font-mono text-sm bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 leading-relaxed"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="# Start typing your document..."
      />
    </div>
  );
};

export default Editor;