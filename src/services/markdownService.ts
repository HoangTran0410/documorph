import { marked, Renderer } from 'marked';
import katex from 'katex';
import hljs from 'highlight.js';

type MathBlock = {
  type: 'block' | 'inline';
  tex: string;
};

// Configure marked with custom renderer for code syntax highlighting
const renderer = new Renderer();
renderer.code = ({ text, lang }: { text: string; lang?: string }) => {
  if (lang && hljs.getLanguage(lang)) {
    try {
      const highlighted = hljs.highlight(text, { language: lang }).value;
      return `<pre style="white-space: pre-wrap;"><code class="hljs language-${lang}" style="white-space: pre-wrap;">${highlighted}</code></pre>`;
    } catch (err) {
      console.error('Highlight error:', err);
    }
  }
  const highlighted = hljs.highlightAuto(text).value;
  return `<pre style="white-space: pre-wrap;"><code class="hljs" style="white-space: pre-wrap;">${highlighted}</code></pre>`;
};

marked.setOptions({
  renderer: renderer,
  gfm: true, // Enable GitHub Flavored Markdown
  breaks: false // Don't convert line breaks to <br>
});

/**
 * Parses markdown content into HTML with support for LaTeX math equations.
 * $$...$$ for block math, $...$ for inline math.
 * Wraps math in elements with data-latex attributes for Docx export preservation.
 */
export const parseMarkdownToHtml = async (content: string): Promise<string> => {
    // 1. Protect Math Blocks
    const mathBlocks: MathBlock[] = [];
    const PROTECT_KEY = '%%%MATH_BLOCK_';
    
    let protectedContent = content
      // Block math $$...$$
      .replace(/\$\$([\s\S]*?)\$\$/g, (match, tex) => {
        mathBlocks.push({ type: 'block', tex: tex.trim() });
        return `${PROTECT_KEY}${mathBlocks.length - 1}%%%`;
      })
      // Inline math $...$
      .replace(/\$([^\$\n]+?)\$/g, (match, tex) => {
        mathBlocks.push({ type: 'inline', tex: tex.trim() });
        return `${PROTECT_KEY}${mathBlocks.length - 1}%%%`;
      });

    // 2. Parse Markdown
    let parsedHtml = await marked.parse(protectedContent);

    // 3. Restore and Render Math
    parsedHtml = parsedHtml.replace(new RegExp(`${PROTECT_KEY}(\\d+)%%%`, 'g'), (match, index) => {
      const block = mathBlocks[parseInt(index)];
      if (!block) return match;
      
      try {
        const rendered = katex.renderToString(block.tex, {
          displayMode: block.type === 'block',
          throwOnError: false,
          output: 'html'
        });
        
        // Wrap in a specialized span/div that preserves the original TeX for docx export
        const wrapperTag = block.type === 'block' ? 'div' : 'span';
        const className = block.type === 'block' ? 'math-block' : 'math-inline';
        
        // Store raw latex in data-latex attribute for docx service
        // We use encodeURIComponent to ensure special chars don't break the HTML attribute
        return `<${wrapperTag} class="${className}" data-latex="${encodeURIComponent(block.tex)}">${rendered}</${wrapperTag}>`;
      } catch (e) {
        return `<code class="text-red-500">${block.tex}</code>`;
      }
    });

    return parsedHtml;
};