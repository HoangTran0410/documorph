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
 * Extract image dimensions from HTML element (style, width/height attributes)
 * Returns dimensions in pixels, or default values if not found
 */
const getImageDimensions = (
  imgElement: HTMLElement
): { width: number; height: number } => {
  let width = 400; // default width
  let height = 300; // default height

  // Try to get from width/height attributes
  const widthAttr = imgElement.getAttribute('width');
  const heightAttr = imgElement.getAttribute('height');

  if (widthAttr) {
    const w = parseInt(widthAttr);
    if (!isNaN(w)) width = w;
  }

  if (heightAttr) {
    const h = parseInt(heightAttr);
    if (!isNaN(h)) height = h;
  }

  // Try to get from inline style (overrides attributes)
  const styleAttr = imgElement.getAttribute('style');
  if (styleAttr) {
    const widthMatch = styleAttr.match(/width:\s*(\d+)(?:px)?/i);
    const heightMatch = styleAttr.match(/height:\s*(\d+)(?:px)?/i);

    if (widthMatch) {
      const w = parseInt(widthMatch[1]);
      if (!isNaN(w)) width = w;
    }

    if (heightMatch) {
      const h = parseInt(heightMatch[1]);
      if (!isNaN(h)) height = h;
    }
  }

  return { width, height };
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
            color: config.color?.replace?.('#', ''),
            bold: config.bold,
            italics: config.italic,
            underline: config.underline
              ? {
                  color: config.color?.replace?.('#', ''),
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
              color: config.color?.replace?.('#', ''),
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
            const dimensions = getImageDimensions(el);
            children.push(
              new ImageRun({
                data: new Uint8Array(buffer),
                transformation: {
                  width: dimensions.width,
                  height: dimensions.height,
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
      const isUnderline = tagName === 'u';

      // Try to extract color from inline style
      let textColor = config.color;
      const styleAttr = el.getAttribute('style');
      if (styleAttr) {
        const colorMatch = styleAttr.match(/color:\s*#?([0-9a-fA-F]{6})/i);
        if (colorMatch) {
          textColor = colorMatch[1];
        }
      }

      const nestedChildren = await processInlineChildren(
        el,
        {
          ...config,
          bold: isBold,
          italic: isItalic,
          underline: isUnderline || config.underline,
          fontFamily: isCode ? 'Courier New' : config.fontFamily,
          color: isCode ? 'D32F2F' : textColor,
        },
        linkConfig
      );

      children.push(...nestedChildren);
    }
  }
  return children;
};

/**
 * Process a single HTML element into DOCX paragraph(s)
 * Returns array of DOCX elements (Paragraphs, Tables, etc.)
 */
const processElement = async (
  element: HTMLElement,
  config: DocumentConfig
): Promise<any[]> => {
  const docxElements: any[] = [];
  const tagName = element.tagName.toLowerCase();

  // Check if it's a Math Block (which we wrapped in a div with data-latex)
  const rawLatex = element.getAttribute('data-latex');
  if (rawLatex) {
    const decodedLatex = decodeURIComponent(rawLatex);
    const imageData = await renderLatexToImage(decodedLatex, true);

    if (imageData) {
      docxElements.push(
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
      docxElements.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 240, after: 240 },
          children: [
            new TextRun({
              text: decodedLatex,
              font: 'Cambria Math',
              size: config.p?.fontSize * 2 + 4,
              italics: true,
            }),
          ],
        })
      );
    }
    return docxElements;
  }

  // 1. HEADINGS
  if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName)) {
    const StyleMap = {
      [HeadingLevel.HEADING_1]: config.h1,
      [HeadingLevel.HEADING_2]: config.h2,
      [HeadingLevel.HEADING_3]: config.h3,
      [HeadingLevel.HEADING_4]: config.h3,
      [HeadingLevel.HEADING_5]: config.h3,
      [HeadingLevel.HEADING_6]: config.h3,
    };
    const TagNameMap = {
      h1: HeadingLevel.HEADING_1,
      h2: HeadingLevel.HEADING_2,
      h3: HeadingLevel.HEADING_3,
      h4: HeadingLevel.HEADING_4,
      h5: HeadingLevel.HEADING_5,
      h6: HeadingLevel.HEADING_6,
    };
    let headingLevel = TagNameMap[tagName];
    let style = StyleMap[headingLevel];

    const runs = await processInlineChildren(element, style, config.link);
    docxElements.push(
      new Paragraph({
        heading: headingLevel,
        alignment: mapAlignment(style.alignment),
        spacing: {
          before: style.marginTop * 20,
          after: style.marginBottom * 20,
        },
        children: runs,
      })
    );
    return docxElements;
  }

  // 2. PARAGRAPHS
  if (tagName === 'p') {
    const runs = await processInlineChildren(element, config.p, config.link);
    if (runs.length > 0) {
      docxElements.push(
        new Paragraph({
          alignment: mapAlignment(config.p.alignment),
          spacing: {
            before: config.p?.marginTop * 20,
            after: config.p?.marginBottom * 20,
          },
          children: runs,
        })
      );
    }
    return docxElements;
  }

  // 3. BLOCKQUOTES
  if (tagName === 'blockquote') {
    const runs = await processInlineChildren(
      element,
      config.quote,
      config.link
    );
    docxElements.push(
      new Paragraph({
        alignment: mapAlignment(config.quote.alignment),
        spacing: {
          before: config.quote.marginTop * 20,
          after: config.quote.marginBottom * 20,
        },
        indent: { left: 720 },
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
    return docxElements;
  }

  // 4. CODE BLOCKS (PRE)
  if (tagName === 'pre') {
    const codeText = element.textContent || '';
    docxElements.push(
      new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: {
          before: config.code.marginTop * 20,
          after: config.code.marginBottom * 20,
        },
        shading: { fill: 'F5F5F5' },
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
    return docxElements;
  }

  // 5. LISTS (UL/OL)
  if (tagName === 'ul' || tagName === 'ol') {
    const listItems = Array.from(element.children);
    for (const li of listItems) {
      const runs = await processInlineChildren(li, config.p, config.link);
      docxElements.push(
        new Paragraph({
          alignment: mapAlignment(config.p.alignment),
          spacing: { before: 100, after: 100 },
          bullet: { level: 0 },
          children: runs,
        })
      );
    }
    return docxElements;
  }

  // 6. TABLES
  if (tagName === 'table') {
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

    docxElements.push(
      new Table({
        rows: docxRows,
        width: { size: 100, type: WidthType.PERCENTAGE },
      })
    );
    docxElements.push(new Paragraph({ spacing: { before: 240 } }));
    return docxElements;
  }

  // 7. HR
  if (tagName === 'hr') {
    docxElements.push(
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
    return docxElements;
  }

  // 8. IMAGES
  if (tagName === 'img') {
    const src = element.getAttribute('src');
    if (src) {
      const buffer = await fetchImage(src);
      if (buffer) {
        const dimensions = getImageDimensions(element);
        docxElements.push(
          new Paragraph({
            children: [
              new ImageRun({
                data: new Uint8Array(buffer),
                transformation: {
                  width: dimensions.width,
                  height: dimensions.height,
                },
              } as any),
            ],
          })
        );
      }
    }
    return docxElements;
  }

  // 9. DIV / SPAN / OTHER CONTAINER ELEMENTS
  // Check if this element has direct text content (not just in children)
  const hasDirectText = Array.from(element.childNodes).some(
    (node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim()
  );

  if (hasDirectText) {
    // This element has direct text content, treat it as a paragraph
    const runs = await processInlineChildren(element, config.p, config.link);
    if (runs.length > 0) {
      docxElements.push(
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
  } else {
    // This is a container element, recursively process its children
    for (const child of Array.from(element.children)) {
      if (child instanceof HTMLElement) {
        const childElements = await processElement(child, config);
        docxElements.push(...childElements);
      }
    }
  }

  return docxElements;
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

    // Use the new recursive processing function
    const elements = await processElement(element, config);
    docxChildren.push(...elements);
  }

  const docx = new Document({
    sections: [{ properties: {}, children: docxChildren }],
  });

  return await Packer.toBlob(docx);
};
