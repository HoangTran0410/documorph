import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  Table,
  TableRow,
  TableCell,
  WidthType,
  ImageRun,
  ExternalHyperlink,
  UnderlineType,
} from 'docx';
import { DocumentConfig, StyleConfig } from '../types';
import { renderLatexToImage } from './latexToImage';

/**
 * Maps CSS-like alignment strings to DOCX AlignmentType
 */
const mapAlignment = (align: string) => {
  switch (align) {
    case 'center':
      return AlignmentType.CENTER;
    case 'right':
      return AlignmentType.RIGHT;
    case 'justify':
      return AlignmentType.JUSTIFIED;
    default:
      return AlignmentType.LEFT;
  }
};

/**
 * Helper to fetch image data as ArrayBuffer with a timeout
 */
const fetchImage = async (url: string): Promise<ArrayBuffer | null> => {
  try {
    // Create an AbortController to enforce a timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) return null;
    return await response.arrayBuffer();
  } catch (error) {
    console.warn(
      'Failed to fetch image for DOCX export (timeout or error):',
      url
    );
    return null;
  }
};

/**
 * Processes child nodes recursively to create TextRuns, Hyperlinks, or ImageRuns
 */
const processInlineChildren = async (
  element: Node,
  config: StyleConfig,
  linkConfig: { color: string; underline: boolean }
): Promise<any[]> => {
  const children: any[] = [];

  for (const child of Array.from(element.childNodes)) {
    if (child.nodeType === Node.TEXT_NODE) {
      if (child.textContent) {
        children.push(
          new TextRun({
            text: child.textContent,
            font: config.fontFamily,
            size: config.fontSize * 2,
            color: config.color.replace('#', ''),
            bold: config.bold,
            italics: config.italic,
            underline: config.underline
              ? {
                  color: config.color.replace('#', ''),
                  type: UnderlineType.SINGLE,
                }
              : undefined,
          })
        );
      }
    } else if (child.nodeType === Node.ELEMENT_NODE) {
      const el = child as HTMLElement;
      const tagName = el.tagName.toLowerCase();

      // Handle Math (Inline & Block which are rendered as spans/divs with data-latex)
      const rawLatex = el.getAttribute('data-latex');
      if (rawLatex) {
        const decodedLatex = decodeURIComponent(rawLatex);
        const isBlockMath = el.classList.contains('math-block');

        // Render LaTeX to image for DOCX
        const imageData = await renderLatexToImage(decodedLatex, isBlockMath);

        if (imageData) {
          children.push(
            new ImageRun({
              data: imageData.buffer,
              transformation: {
                width: imageData.width,
                height: imageData.height,
              },
            } as any)
          );
        } else {
          // Fallback to text if image rendering fails
          children.push(
            new TextRun({
              text: decodedLatex,
              font: 'Cambria Math',
              size: config.fontSize * 2,
              color: config.color.replace('#', ''),
              italics: true,
            })
          );
        }
        continue; // Skip processing children (the KaTeX HTML)
      }

      if (tagName === 'br') {
        children.push(new TextRun({ break: 1 }));
        continue;
      }

      if (tagName === 'img') {
        const src = el.getAttribute('src');
        if (src) {
          const buffer = await fetchImage(src);
          if (buffer) {
            // Create image run (limited size for safety)
            children.push(
              new ImageRun({
                data: new Uint8Array(buffer),
                transformation: {
                  width: 400,
                  height: 300, // Basic aspect ratio handling would require reading image dims
                },
              } as any)
            );
          } else {
            children.push(
              new TextRun({
                text: `[Image: ${el.getAttribute('alt') || 'Image'}]`,
              })
            );
          }
        }
        continue;
      }

      if (tagName === 'a') {
        const href = el.getAttribute('href') || '';
        const linkChildren = await processInlineChildren(
          el,
          {
            ...config,
            color: linkConfig.color,
            underline: linkConfig.underline,
          },
          linkConfig
        );
        children.push(
          new ExternalHyperlink({
            children: linkChildren,
            link: href,
          })
        );
        continue;
      }

      // Handle inline formatting overrides
      const isBold = tagName === 'strong' || tagName === 'b' || config.bold;
      const isItalic = tagName === 'em' || tagName === 'i' || config.italic;
      const isCode = tagName === 'code';

      const nestedChildren = await processInlineChildren(
        el,
        {
          ...config,
          bold: isBold,
          italic: isItalic,
          fontFamily: isCode ? 'Courier New' : config.fontFamily,
          color: isCode ? 'D32F2F' : config.color,
        },
        linkConfig
      );

      children.push(...nestedChildren);
    }
  }
  return children;
};

/**
 * Main function to generate the DOCX Blob
 */
export const generateDocxBlob = async (
  htmlContent: string,
  config: DocumentConfig
): Promise<Blob> => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');
  const nodes = Array.from(doc.body.childNodes);

  const docxChildren: any[] = [];

  for (const node of nodes) {
    if (node.nodeType !== Node.ELEMENT_NODE) continue;
    const element = node as HTMLElement;
    const tagName = element.tagName.toLowerCase();

    // Check if it's a Math Block (which we wrapped in a div with data-latex)
    const rawLatex = element.getAttribute('data-latex');
    if (rawLatex) {
      const decodedLatex = decodeURIComponent(rawLatex);
      const imageData = await renderLatexToImage(decodedLatex, true);

      if (imageData) {
        docxChildren.push(
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 240, after: 240 },
            children: [
              new ImageRun({
                data: imageData.buffer,
                transformation: {
                  width: imageData.width,
                  height: imageData.height,
                },
              } as any),
            ],
          })
        );
      } else {
        // Fallback to text if rendering fails
        docxChildren.push(
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 240, after: 240 },
            children: [
              new TextRun({
                text: decodedLatex,
                font: 'Cambria Math',
                size: config.p.fontSize * 2 + 4,
                italics: true,
              }),
            ],
          })
        );
      }
      continue;
    }

    // 1. HEADINGS
    if (['h1', 'h2', 'h3'].includes(tagName)) {
      let style = config.h1;
      let headingLevel = HeadingLevel.HEADING_1;
      if (tagName === 'h2') {
        style = config.h2;
        headingLevel = HeadingLevel.HEADING_2;
      }
      if (tagName === 'h3') {
        style = config.h3;
        headingLevel = HeadingLevel.HEADING_3;
      }

      const runs = await processInlineChildren(element, style, config.link);

      docxChildren.push(
        new Paragraph({
          heading: headingLevel,
          alignment: mapAlignment(style.alignment),
          spacing: {
            before: style.marginTop * 20,
            after: style.marginBottom * 20,
          },
          children: runs, // Note: No 'text' property here to avoid duplication
        })
      );
    }
    // 2. PARAGRAPHS
    else if (tagName === 'p') {
      const runs = await processInlineChildren(element, config.p, config.link);
      // Only add if has content or is not just whitespace
      if (runs.length > 0) {
        docxChildren.push(
          new Paragraph({
            alignment: mapAlignment(config.p.alignment),
            spacing: {
              before: config.p.marginTop * 20,
              after: config.p.marginBottom * 20,
            },
            children: runs,
          })
        );
      }
    }
    // 3. BLOCKQUOTES
    else if (tagName === 'blockquote') {
      const runs = await processInlineChildren(
        element,
        config.quote,
        config.link
      );
      docxChildren.push(
        new Paragraph({
          alignment: mapAlignment(config.quote.alignment),
          spacing: {
            before: config.quote.marginTop * 20,
            after: config.quote.marginBottom * 20,
          },
          indent: { left: 720 }, // Indent ~0.5 inch
          border: {
            left: {
              color: 'auto',
              space: 120,
              style: BorderStyle.SINGLE,
              size: 6,
            },
          },
          children: runs,
        })
      );
    }
    // 4. CODE BLOCKS (PRE)
    else if (tagName === 'pre') {
      const codeText = element.textContent || '';
      docxChildren.push(
        new Paragraph({
          alignment: AlignmentType.LEFT,
          spacing: {
            before: config.code.marginTop * 20,
            after: config.code.marginBottom * 20,
          },
          shading: { fill: 'F5F5F5' }, // Light gray background
          children: [
            new TextRun({
              text: codeText,
              font: config.code.fontFamily,
              size: config.code.fontSize * 2,
              color: config.code.color.replace('#', ''),
            }),
          ],
        })
      );
    }
    // 5. LISTS (UL/OL)
    else if (tagName === 'ul' || tagName === 'ol') {
      const listItems = Array.from(element.children);
      for (const li of listItems) {
        const runs = await processInlineChildren(li, config.p, config.link);
        docxChildren.push(
          new Paragraph({
            alignment: mapAlignment(config.p.alignment),
            spacing: { before: 100, after: 100 },
            bullet: { level: 0 }, // Simple bullet list support
            children: runs,
          })
        );
      }
    }
    // 6. TABLES
    else if (tagName === 'table') {
      const rows = Array.from(element.querySelectorAll('tr'));
      const docxRows = await Promise.all(
        rows.map(async (tr) => {
          const cells = Array.from(tr.querySelectorAll('th, td'));
          const docxCells = await Promise.all(
            cells.map(async (td) => {
              const isHeader = td.tagName.toLowerCase() === 'th';
              const style = isHeader ? { ...config.p, bold: true } : config.p;
              const runs = await processInlineChildren(td, style, config.link);

              return new TableCell({
                children: [
                  new Paragraph({
                    children: runs,
                    alignment: isHeader
                      ? AlignmentType.CENTER
                      : AlignmentType.LEFT,
                  }),
                ],
                width: { size: 100 / cells.length, type: WidthType.PERCENTAGE },
                shading: isHeader ? { fill: 'E0E0E0' } : undefined,
              });
            })
          );
          return new TableRow({ children: docxCells });
        })
      );

      docxChildren.push(
        new Table({
          rows: docxRows,
          width: { size: 100, type: WidthType.PERCENTAGE },
        })
      );
      // Add some spacing after table
      docxChildren.push(new Paragraph({ spacing: { before: 240 } }));
    }
    // 7. HR
    else if (tagName === 'hr') {
      docxChildren.push(
        new Paragraph({
          border: {
            bottom: {
              color: 'auto',
              space: 1,
              style: BorderStyle.SINGLE,
              size: 6,
            },
          },
          spacing: { before: 240, after: 240 },
        })
      );
    }
    // 8. TOP LEVEL IMAGES (if direct child of body, rare in p-wrapped markdown but possible)
    else if (tagName === 'img') {
      const src = element.getAttribute('src');
      if (src) {
        const buffer = await fetchImage(src);
        if (buffer) {
          docxChildren.push(
            new Paragraph({
              children: [
                new ImageRun({
                  data: new Uint8Array(buffer),
                  transformation: { width: 400, height: 300 },
                } as any),
              ],
            })
          );
        }
      }
    }
  }

  const docx = new Document({
    sections: [{ properties: {}, children: docxChildren }],
  });

  return await Packer.toBlob(docx);
};
