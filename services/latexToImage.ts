import katex from 'katex';
import html2canvas from 'html2canvas';

/**
 * Renders LaTeX to PNG image buffer for embedding in DOCX
 * Uses html2canvas to convert the KaTeX-rendered HTML to a PNG
 */
export const renderLatexToImage = async (
  latex: string,
  displayMode: boolean = false
): Promise<{ buffer: Uint8Array; width: number; height: number } | null> => {
  try {
    // Render LaTeX to HTML using KaTeX
    const htmlContent = katex.renderToString(latex, {
      displayMode,
      throwOnError: false,
      output: 'html',
    });

    // Create temporary container
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.background = 'white';
    container.style.padding = displayMode ? '16px' : '4px';
    container.style.display = 'inline-block';
    container.style.color = '#000000'; // Force black text
    container.innerHTML = htmlContent;

    // Load KaTeX CSS if not already loaded
    if (!document.getElementById('katex-css')) {
      const link = document.createElement('link');
      link.id = 'katex-css';
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css';
      document.head.appendChild(link);
      // Wait a bit for CSS to load
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    document.body.appendChild(container);

    // Use html2canvas to render to canvas
    const canvas = await html2canvas(container, {
      backgroundColor: '#ffffff',
      scale: 2, // Higher quality
      logging: false,
      useCORS: true,
    });

    // Get dimensions
    const width = canvas.width / 2; // Divide by scale
    const height = canvas.height / 2;

    // Clean up
    document.body.removeChild(container);

    // Convert canvas to PNG blob
    return new Promise((resolve) => {
      canvas.toBlob(async (blob) => {
        if (blob) {
          const arrayBuffer = await blob.arrayBuffer();
          resolve({
            buffer: new Uint8Array(arrayBuffer),
            width: Math.min(width, 600),
            height: Math.min(height, 400),
          });
        } else {
          resolve(null);
        }
      }, 'image/png');
    });
  } catch (error) {
    console.error('Failed to render LaTeX to image:', error);
    return null;
  }
};
