import React from 'react';
import { Code2, RotateCcw } from 'lucide-react';

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  onReset: () => void;
}

const Editor: React.FC<EditorProps> = ({ value, onChange, onReset }) => {
  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-900">
      <div className="p-2 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Code2 className="text-blue-600" size={20} />
          <h2 className="font-bold text-slate-800 dark:text-white">
            Markdown Input
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded transition-colors"
            title="Reset to default styles"
          >
            <RotateCcw size={14} />
            RESET
          </button>
        </div>
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
