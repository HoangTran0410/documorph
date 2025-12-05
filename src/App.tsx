import React, { useState, useEffect } from 'react';
import FileSaver from 'file-saver';
import {
  Moon,
  Sun,
  FileText,
  File,
  LayoutTemplate,
  Loader2,
  Github,
  SquarePen,
  Settings,
  Code,
  Code2,
  Pencil,
} from 'lucide-react';

import { DocumentConfig } from './types';
import { DEFAULT_CONFIG, DEFAULT_MARKDOWN } from './constants';
import { generateDocxBlob } from './services/docxService';
import { parseMarkdownToHtml } from './services/markdownService';
import Editor from './components/Editor';
import Preview from './components/Preview';
import ConfigPanel from './components/ConfigPanel';
import useCacheState from './hooks/useCacheState';

function App() {
  const [isDark, setIsDark] = useCacheState('darkTheme', false);
  const [content, setContent] = useCacheState('markdown', DEFAULT_MARKDOWN);
  const [config, setConfig] = useCacheState<DocumentConfig>(
    'config',
    DEFAULT_CONFIG
  );
  const [isExporting, setIsExporting] = useState<'word' | 'pdf' | null>(null);

  // Layout State
  const [showEditor, setShowEditor] = useCacheState('showEditor', true);
  const [showConfig, setShowConfig] = useCacheState('showConfig', false);
  const [editorWidth, setEditorWidth] = useCacheState('editorWidth', 500);
  const [isResizing, setIsResizing] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Toggle Dark Mode
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Resizing Logic
  const startResizing = React.useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizing) {
        const newWidth = Math.max(250, Math.min(e.clientX, 800));
        setEditorWidth(newWidth);
      }
    };
    const handleMouseUp = () => setIsResizing(false);

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const handleExportWord = async () => {
    try {
      setIsExporting('word');
      // Use the custom parser that handles math logic
      const html = await parseMarkdownToHtml(content);
      const blob = await generateDocxBlob(html, config);
      FileSaver.saveAs(blob, 'document.docx');
    } catch (error) {
      console.error('Export failed', error);
      alert('Failed to export DOCX');
    } finally {
      setIsExporting(null);
    }
  };

  const handleExportPDF = () => {
    setIsExporting('pdf');

    // Use browser's native print-to-PDF for selectable text
    // Create a print-friendly version
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to export PDF');
      setIsExporting(null);
      return;
    }

    const element = document.getElementById('print-container');
    if (!element) {
      printWindow.close();
      setIsExporting(null);
      return;
    }

    // Get KaTeX CSS
    const katexCSS = Array.from(document.styleSheets)
      .map((sheet) => {
        try {
          return Array.from(sheet.cssRules)
            .map((rule) => rule.cssText)
            .join('\n');
        } catch {
          return '';
        }
      })
      .join('\n');

    // Create print document
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Document</title>
          <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
          <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/highlight.js@11.9.0/styles/github.min.css">
          <style>
            @page {
              margin: 20mm;
              size: A4;
            }
            body {
              margin: 0;
              padding: 20px;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              line-height: 1.6;
              color: #000;
            }
            * {
              print-color-adjust: exact;
              -webkit-print-color-adjust: exact;
            }
            ${katexCSS}
          </style>
        </head>
        <body>
          ${element.innerHTML}
          <script>
            window.onload = () => {
              setTimeout(() => {
                window.print();
                window.close();
              }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();

    // Reset export state after a delay
    setTimeout(() => setIsExporting(null), 1000);
  };

  return (
    <div className="h-screen flex flex-col font-sans overflow-hidden bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Header */}
      <header className="h-14 flex items-center justify-between px-4 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 z-20 shrink-0 shadow-sm">
        <div className="flex items-center gap-1 md:gap-3 justify-between">
          <div className="bg-blue-600 p-1.5 rounded-lg hidden sm:block">
            <LayoutTemplate className="text-white" size={18} />
          </div>
          <h1 className="text-lg font-bold tracking-tight hidden sm:block">
            Docu<span className="text-blue-500">Morph</span>
          </h1>

          {/* View Toggles */}
          <div className="flex items-center gap-1 ml-2 md:border-l border-gray-200 dark:border-slate-700 md:pl-2 mr-2">
            <button
              onClick={() => setShowEditor(!showEditor)}
              className={`p-1.5 rounded hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors ${
                showEditor
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-slate-800'
                  : 'text-slate-500'
              }`}
              title="Toggle Editor"
            >
              <Pencil size={18} />
            </button>
            <button
              onClick={() => setShowConfig(!showConfig)}
              className={`p-1.5 rounded hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors ${
                showConfig
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-slate-800'
                  : 'text-slate-500'
              }`}
              title="Toggle Config"
            >
              <Settings size={18} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-0.5 sm:gap-4">
          {/* Export Actions */}
          <div className="flex bg-gray-100 dark:bg-slate-800 rounded-lg p-0.5 gap-0.5">
            <button
              onClick={handleExportWord}
              disabled={!!isExporting}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 shadow-sm transition-all disabled:opacity-50"
            >
              {isExporting === 'word' ? (
                <Loader2 className="animate-spin" size={14} />
              ) : (
                <FileText size={14} className="text-blue-600" />
              )}
              DOCX
            </button>
            <button
              onClick={handleExportPDF}
              disabled={!!isExporting}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 shadow-sm transition-all disabled:opacity-50"
            >
              {isExporting === 'pdf' ? (
                <Loader2 className="animate-spin" size={14} />
              ) : (
                <File size={14} className="text-red-500" />
              )}
              PDF
            </button>
          </div>

          <div className="w-px h-6 bg-gray-200 dark:bg-slate-800 hidden sm:block"></div>

          <div className="flex items-center">
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <a
              href="https://github.com/HoangTran0410/documorph"
              target="_blank"
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
            >
              <Github size={18} />
            </a>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Editor Pane */}
        <div
          style={{
            width:
              !isMobile && !showEditor ? 0 : isMobile ? '100%' : editorWidth,
            height: !showEditor ? 0 : isMobile ? '50%' : '100%',
            opacity: !showEditor ? 0 : 1,
          }}
          className={
            'flex-shrink-0 flex flex-col border-b md:border-b-0 md:border-r border-gray-200 dark:border-slate-800 z-10 overflow-hidden' +
            (isResizing ? ' transition-none' : ' transition-all')
          }
        >
          <Editor
            value={content}
            onChange={setContent}
            onReset={() => setContent(DEFAULT_MARKDOWN)}
          />
        </div>

        {/* Resizer Handle (Desktop Only) */}
        {showEditor && !isMobile && (
          <div
            className="w-1 bg-gray-100 dark:bg-slate-900 hover:bg-blue-400 dark:hover:bg-blue-600 cursor-col-resize flex-shrink-0 transition-colors z-20 flex items-center justify-center group"
            onMouseDown={startResizing}
          >
            <div className="h-8 w-0.5 bg-gray-300 dark:bg-slate-700 group-hover:bg-white rounded-full" />
          </div>
        )}

        {/* Preview Pane */}
        <div className="flex-1 bg-gray-100 dark:bg-slate-950/50 flex flex-col relative overflow-hidden">
          <Preview content={content} config={config} />
        </div>

        {/* Right Sidebar - Configuration */}
        <div
          style={{
            width: !showConfig ? 0 : isMobile ? '100%' : 320,
            opacity: !showConfig ? 0 : 1,
          }}
          className={`
              transition-all
              overflow-hidden
            flex-shrink-0 bg-white dark:bg-slate-900 border-l border-gray-200 dark:border-slate-800 z-10 shadow-xl
            ${isMobile ? 'absolute inset-0 z-50' : 'w-80'}
          `}
        >
          <ConfigPanel
            config={config}
            onChange={setConfig}
            onReset={() => setConfig(DEFAULT_CONFIG)}
            onClose={() => setShowConfig(false)}
            isMobile={isMobile}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
