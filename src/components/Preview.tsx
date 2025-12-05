import React, { useRef } from 'react';
import { DocumentConfig } from '../types';
import { parseMarkdownToHtml } from '../services/markdownService';

interface PreviewProps {
  content: string;
  config: DocumentConfig;
}

const Preview: React.FC<PreviewProps> = ({ content, config }) => {
  const [html, setHtml] = React.useState('');
  const [isParsing, setIsParsing] = React.useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    // Debounce the parsing - wait 300ms after user stops typing
    const timeoutId = setTimeout(async () => {
      try {
        setIsParsing(true);
        const parsedHtml = await parseMarkdownToHtml(content);
        setHtml(parsedHtml);
      } finally {
        setIsParsing(false);
      }
    }, 300);

    // Cleanup function to cancel pending parse if content changes
    return () => {
      clearTimeout(timeoutId);
    };
  }, [content]);

  return (
    <div className="h-full flex flex-col bg-gray-100 dark:bg-slate-950 overflow-hidden relative">
      <div className="p-2 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 text-[10px] font-mono text-slate-500 dark:text-slate-400 flex justify-between items-center shadow-sm z-10">
        <span className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              isParsing ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'
            }`}
          ></span>
          {isParsing ? 'PARSING...' : 'LIVE PREVIEW'}
        </span>
        <span className="bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300">
          Continuous Scroll • A4 Width
        </span>
      </div>

      {/* A4 Paper Simulation Container */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 flex justify-center bg-gray-100 dark:bg-slate-950/50 scroll-smooth">
        <div
          ref={containerRef}
          id="print-container"
          className="bg-white text-black shadow-xl transition-all ease-in-out duration-300 relative mx-auto"
          style={{
            width: '210mm',
            minHeight: '297mm', // Starts at A4 height but expands
            height: 'fit-content',
            padding: '15mm', // Reduced padding as requested
            boxSizing: 'border-box',
            marginBottom: '2rem',
          }}
        >
          <style>
            {`
                /* Headings */
                #preview-content h1 {
                  font-family: ${config.h1?.fontFamily};
                  font-size: ${config.h1?.fontSize}pt;
                  color: ${config.h1?.color};
                  font-weight: ${config.h1?.bold ? 'bold' : 'normal'};
                  font-style: ${config.h1?.italic ? 'italic' : 'normal'};
                  text-align: ${config.h1?.alignment};
                  margin-top: ${config.h1?.marginTop}pt;
                  margin-bottom: ${config.h1?.marginBottom}pt;
                }
                #preview-content h2 {
                  font-family: ${config.h2?.fontFamily};
                  font-size: ${config.h2?.fontSize}pt;
                  color: ${config.h2?.color};
                  font-weight: ${config.h2?.bold ? 'bold' : 'normal'};
                  font-style: ${config.h2?.italic ? 'italic' : 'normal'};
                  text-align: ${config.h2?.alignment};
                  margin-top: ${config.h2?.marginTop}pt;
                  margin-bottom: ${config.h2?.marginBottom}pt;
                }
                #preview-content h3 {
                  font-family: ${config.h3?.fontFamily};
                  font-size: ${config.h3?.fontSize}pt;
                  color: ${config.h3?.color};
                  font-weight: ${config.h3?.bold ? 'bold' : 'normal'};
                  font-style: ${config.h3?.italic ? 'italic' : 'normal'};
                  text-align: ${config.h3?.alignment};
                  margin-top: ${config.h3?.marginTop}pt;
                  margin-bottom: ${config.h3?.marginBottom}pt;
                }

                /* Text Bodies */
                #preview-content p, #preview-content li, #preview-content td, #preview-content th {
                  font-family: ${config.p?.fontFamily};
                  font-size: ${config.p?.fontSize}pt;
                  color: ${config.p?.color};
                  font-weight: ${config.p?.bold ? 'bold' : 'normal'};
                  font-style: ${config.p?.italic ? 'italic' : 'normal'};
                  text-align: ${config.p?.alignment};
                  line-height: 1.5;
                }
                #preview-content p {
                   margin-top: ${config.p?.marginTop}pt;
                   margin-bottom: ${config.p?.marginBottom}pt;
                }

                /* Links */
                #preview-content a {
                  color: ${config.link?.color};
                  text-decoration: ${
                    config.link?.underline ? 'underline' : 'none'
                  };
                }

                /* Lists */
                #preview-content ul, #preview-content ol {
                  padding-left: 30pt;
                  margin-top: 8pt;
                  margin-bottom: 12pt;
                  margin-left: 0;
                }

                #preview-content ul {
                  list-style-type: disc;
                }

                #preview-content ol {
                  list-style-type: decimal;
                }

                #preview-content ul ul {
                  list-style-type: circle;
                  margin-top: 4pt;
                  margin-bottom: 4pt;
                }

                #preview-content ul ul ul {
                  list-style-type: square;
                }

                #preview-content li {
                  margin-bottom: 6pt;
                  padding-left: 4pt;
                }

                /* Nested lists */
                #preview-content li > ul,
                #preview-content li > ol {
                  margin-top: 4pt;
                }

                /* Task list checkboxes */
                #preview-content input[type="checkbox"] {
                  margin-right: 8pt;
                  width: 14pt;
                  height: 14pt;
                  cursor: pointer;
                }

                #preview-content li:has(> input[type="checkbox"]) {
                  list-style-type: none;
                  margin-left: -20pt;
                }

                /* Quotes */
                #preview-content blockquote {
                  font-family: ${config.quote?.fontFamily};
                  font-size: ${config.quote?.fontSize}pt;
                  color: ${config.quote?.color};
                  font-weight: ${config.quote?.bold ? 'bold' : 'normal'};
                  font-style: ${config.quote?.italic ? 'italic' : 'normal'};
                  text-align: ${config.quote?.alignment};
                  margin-top: ${config.quote?.marginTop}pt;
                  margin-bottom: ${config.quote?.marginBottom}pt;
                  border-left: 4px solid #ccc;
                  padding-left: 12pt;
                  margin-left: 0;
                }

                /* Code - Inline code only (not syntax highlighted blocks) */
                #preview-content :not(pre) > code {
                  font-family: ${config.code?.fontFamily};
                  color: ${config.code?.color};
                  font-size: ${config.code?.fontSize}pt;
                  background: #f5f5f5;
                  padding: 2px 6px;
                  border-radius: 3px;
                }

                /* Code Blocks - Syntax Highlighted */
                #preview-content pre {
                  margin: ${config.code?.marginTop}pt 0 ${
              config.code?.marginBottom
            }pt 0;
                  border-radius: 6px;
                  overflow-x: auto;
                  white-space: pre-wrap;
                  word-wrap: break-word;
                }

                #preview-content pre code.hljs {
                  font-family: ${config.code?.fontFamily};
                  font-size: ${config.code?.fontSize}pt;
                  display: block;
                  padding: 12pt;
                  border-radius: 6px;
                  line-height: 1.5;
                  background: #f6f8fa !important;
                  white-space: pre-wrap;
                  word-wrap: break-word;
                }

                /* Syntax highlighting colors */
                #preview-content .hljs-keyword { color: #d73a49 !important; }
                #preview-content .hljs-string { color: #032f62 !important; }
                #preview-content .hljs-comment { color: #6a737d !important; }
                #preview-content .hljs-number { color: #005cc5 !important; }
                #preview-content .hljs-function { color: #6f42c1 !important; }
                #preview-content .hljs-title { color: #6f42c1 !important; }
                #preview-content .hljs-params { color: #24292e !important; }
                #preview-content .hljs-built_in { color: #005cc5 !important; }
                #preview-content .hljs-literal { color: #005cc5 !important; }
                #preview-content .hljs-attr { color: #005cc5 !important; }
                #preview-content .hljs-variable { color: #e36209 !important; }
                #preview-content .hljs-tag { color: #22863a !important; }
                #preview-content .hljs-name { color: #22863a !important; }
                #preview-content .hljs-regexp { color: #032f62 !important; }
                #preview-content .hljs-symbol { color: #005cc5 !important; }
                #preview-content .hljs-class { color: #6f42c1 !important; }
                #preview-content .hljs-meta { color: #005cc5 !important; }
                #preview-content .hljs-operator { color: #d73a49 !important; }

                /* Tables */
                #preview-content table {
                  width: 100%;
                  border-collapse: collapse;
                  margin-bottom: 14pt;
                }
                #preview-content th, #preview-content td {
                  border: 1px solid #ddd;
                  padding: 8pt;
                }
                #preview-content th {
                  background-color: #f3f4f6;
                  font-weight: bold;
                  text-align: center;
                }

                /* Images */
                #preview-content img {
                  max-width: ${config.img?.maxWidth};
                  height: auto;
                  margin-top: ${config.img?.marginTop}pt;
                  margin-bottom: ${config.img?.marginBottom}pt;
                  display: block;
                  margin-left: ${
                    config.img?.alignment === 'center'
                      ? 'auto'
                      : config.img?.alignment === 'right'
                      ? 'auto'
                      : '0'
                  };
                  margin-right: ${
                    config.img?.alignment === 'center'
                      ? 'auto'
                      : config.img?.alignment === 'right'
                      ? '0'
                      : 'auto'
                  };
                }

                #preview-content hr {
                  border: 0;
                  border-top: 1px solid #ccc;
                  margin: 20pt 0;
                }

                /* Math */
                .math-block {
                  display: flex;
                  justify-content: center;
                  margin: 1em 0;
                  overflow-x: auto;
                }
                .math-inline {
                  /* padding: 0 0.2em; */
                }
              `}
          </style>
          <div
            id="preview-content"
            className="relative z-10"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </div>
    </div>
  );
};

export default Preview;
