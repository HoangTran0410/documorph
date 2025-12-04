import { DocumentConfig } from './types';

export const DEFAULT_MARKDOWN = `# 🚀 Welcome to DocuMorph

**Transform your Markdown & HTML into beautiful Word and PDF documents**

---

## 📖 What is DocuMorph?

DocuMorph is a powerful web-based document transformation tool that converts **Markdown** and **HTML** content into professionally formatted **Word (.docx)** and **PDF** documents.

### ✨ Key Features

- 👁️ **Live Preview** - See your document rendered in real-time as you type
- 📝 **Markdown Support** - Full GitHub Flavored Markdown (GFM) support
- 🌐 **HTML Support** - Direct HTML input with inline styles
- 📄 **Word Export** - Generate .docx files with proper formatting
- 📑 **PDF Export** - Export to PDF with selectable text
- 🎨 **Syntax Highlighting** - Beautiful code blocks for 100+ languages
- 🧮 **Math Equations** - LaTeX math rendering with KaTeX
- ⚙️ **Customizable Styles** - Fine-tune fonts, colors, spacing, and alignment
- 🌙 **Dark Mode** - Easy on the eyes for late-night writing
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile

---

## 🎯 Quick Start Guide

### 1️⃣ Writing Content

Start typing in the **left panel** using Markdown syntax. Your content will be rendered in real-time in the **center preview panel**.

### 2️⃣ Customizing Styles

Click the **⚙️ settings icon** on the right to customize:
- 🔤 Heading styles (H1, H2, H3)
- 📝 Paragraph formatting
- 💻 Code block appearance
- 🖼️ Image sizing and alignment
- 💬 Quote blocks
- 🔗 Link colors

### 3️⃣ Exporting Documents

When you're ready, click:
- **📄 DOCX** button to export to Microsoft Word
- **📑 PDF** button to export to PDF format

---

## 🎨 Supported Markdown Features

### ✍️ Text Formatting

- **Bold text** with \`**bold**\`
- *Italic text* with \`*italic*\`
- ***Bold and italic*** with \`***both***\`
- ~~Strikethrough~~ with \`~~text~~\`
- \`Inline code\` with backticks

### 💻 Code Blocks

\`\`\`javascript
// Syntax highlighting for 100+ languages
const greet = (name) => {
  console.log(\`Hello, \${name}! 👋\`);
};

greet("DocuMorph");
\`\`\`

### 📊 Tables

| Feature | Markdown | HTML | Export |
|---------|----------|------|--------|
| Headings | ✅ | ✅ | ✅ |
| Lists | ✅ | ✅ | ✅ |
| Tables | ✅ | ✅ | ✅ |
| Images | ✅ | ✅ | ✅ |
| Math | ✅ | ✅ | ✅ |

### 🧮 Mathematical Equations

Inline math: $E = mc^2$

Block math:
$$
f(x) = \\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}
$$

### 📝 Lists

1. Ordered lists
2. With numbering
   - Nested unordered lists
   - With bullets

**Task Lists:**
- [x] ✅ Completed task
- [ ] ⏳ Pending task
- [ ] 📋 Another task

### 💬 Blockquotes

> "The best way to predict the future is to invent it."
> — Alan Kay

---

## 🌐 HTML Support

You can also paste **raw HTML** directly:

\`\`\`html
<div>
  <h2>Custom HTML</h2>
  <p style="color: #0066cc;">
    Text with <strong>inline styles</strong>
  </p>
  <img src="url" style="width: 100px; height: 100px" />
</div>
\`\`\`

**DocuMorph will:**
- ✅ Parse nested HTML structures
- ✅ Respect inline styles (colors, sizes)
- ✅ Convert everything to Word/PDF

---

## 💡 Pro Tips

1. 🔄 **Use the Reset Button** - Click RESET in the editor or styles panel to start fresh
2. 👁️ **Toggle Panels** - Hide/show editor and config panels for focused viewing
3. 🌙 **Dark Mode** - Toggle dark mode for comfortable night-time editing
4. 🖼️ **Image Sizing** - Use inline styles or the Styles Config panel to control image dimensions
5. 🎨 **Code Languages** - Specify language after \\\`\\\`\\\` for proper syntax highlighting

---

## 🎯 Example Use Cases

### 📚 Documentation
Create technical documentation with code examples, tables, and diagrams.

### 📊 Reports
Generate professional reports with data tables, charts, and formatted text.

### 🎓 Academic Papers
Write papers with mathematical equations, citations, and structured content.

### 📽️ Presentations
Convert markdown notes to formatted documents for sharing.

### 💼 Resumes & CVs
Design and export professional resumes with consistent formatting.

---

## 🛠️ Technical Details

**Built With:**
- ⚛️ React + TypeScript
- 📝 Marked (Markdown parser)
- 📄 docx.js (Word generation)
- 🧮 KaTeX (Math rendering)
- 🎨 Highlight.js (Code highlighting)

**Export Formats:**
- 📄 .docx (Microsoft Word 2007+)
- 📑 .pdf (via browser print)

**Browser Support:**
- ✅ Chrome, Firefox, Safari, Edge
- 📱 Mobile browsers supported

---

## 🎉 Get Started Now!

1. 🧹 **Clear this text** by clicking the RESET button
2. ✍️ **Start writing** your content in Markdown or HTML
3. 🎨 **Customize styles** to match your preferences
4. 📤 **Export** to Word or PDF when ready

*Happy documenting with DocuMorph! 🎊*

---

**Need Help?** 📖 Visit our documentation or 🐛 report issues on GitHub.`;

export const DEFAULT_CONFIG: DocumentConfig = {
  h1: {
    fontFamily: 'Inter',
    fontSize: 24,
    color: '#1e293b',
    bold: true,
    italic: false,
    alignment: 'left',
    marginTop: 24,
    marginBottom: 12,
  },
  h2: {
    fontFamily: 'Inter',
    fontSize: 18,
    color: '#334155',
    bold: true,
    italic: false,
    alignment: 'left',
    marginTop: 18,
    marginBottom: 8,
  },
  h3: {
    fontFamily: 'Inter',
    fontSize: 14,
    color: '#475569',
    bold: true,
    italic: false,
    alignment: 'left',
    marginTop: 12,
    marginBottom: 6,
  },
  p: {
    fontFamily: 'Merriweather',
    fontSize: 11,
    color: '#374151',
    bold: false,
    italic: false,
    alignment: 'justify',
    marginTop: 0,
    marginBottom: 10,
  },
  quote: {
    fontFamily: 'Merriweather',
    fontSize: 11,
    color: '#4b5563',
    bold: false,
    italic: true,
    alignment: 'left',
    marginTop: 12,
    marginBottom: 12,
  },
  code: {
    fontFamily: 'JetBrains Mono',
    fontSize: 10,
    color: '#dc2626',
    bold: false,
    italic: false,
    alignment: 'left',
    marginTop: 10,
    marginBottom: 10,
  },
  link: {
    color: '#0284c7',
    underline: true,
  },
  img: {
    maxWidth: '100%',
    alignment: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
};
