import { DocumentConfig } from './types';

export const DEFAULT_MARKDOWN = `# DocuMorph - Markdown Showcase

Welcome to **DocuMorph**! This document demonstrates all supported Markdown features.

---

## 1. Text Formatting

You can make text **bold**, *italic*, or ***both***. You can also use ~~strikethrough~~ and \`inline code\`.

Here's a [link to Google](https://google.com) and an image:

![Sample Image](https://avatars.githubusercontent.com/u/36368107)

---

## 2. Headings

### This is H3
#### This is H4
##### This is H5
###### This is H6

---

## 3. Lists

### Unordered Lists
- First item
- Second item
  - Nested item 1
  - Nested item 2
    - Deeply nested
- Third item

### Ordered Lists
1. First step
2. Second step
   1. Sub-step A
   2. Sub-step B
3. Third step

### Task Lists
- [x] Completed task
- [ ] Pending task
- [ ] Another task

---

## 4. Blockquotes

> "The only way to do great work is to love what you do."
> — Steve Jobs

> Multi-line quotes
> can span multiple lines
> and look beautiful!

---

## 5. Code Blocks

### JavaScript Example
\`\`\`javascript
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log(fibonacci(10)); // Output: 55
\`\`\`

### Python Example
\`\`\`python
def calculate_sum(numbers):
    """Calculate sum of a list of numbers."""
    total = 0
    for num in numbers:
        total += num
    return total

print(calculate_sum([1, 2, 3, 4, 5]))  # Output: 15
\`\`\`

### TypeScript Example
\`\`\`typescript
interface User {
  name: string;
  age: number;
  email?: string;
}

const user: User = {
  name: "Alice",
  age: 30
};
\`\`\`

---

## 6. Tables

| Feature | Status | Priority |
|---------|--------|----------|
| Markdown Parser | ✅ Done | High |
| PDF Export | ✅ Done | High |
| DOCX Export | ✅ Done | High |
| Syntax Highlighting | ✅ Done | Medium |
| Dark Mode | ✅ Done | Low |

---

## 7. Mathematical Equations

### Inline Math
The famous equation $E = mc^2$ was discovered by Einstein.

The quadratic formula is $x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}$

### Block Math

The Gaussian Integral:
$$
\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}
$$

Maxwell's Equations:
$$
\\nabla \\times \\vec{E} = -\\frac{\\partial \\vec{B}}{\\partial t}
$$

Euler's Identity:
$$
e^{i\\pi} + 1 = 0
$$

---

## 8. Horizontal Rules

You can create horizontal rules with three or more hyphens, asterisks, or underscores:

---

***

___

---

## 9. Nested Elements

You can combine different elements:

1. **First item** with *emphasis*
   - Nested bullet with \`inline code\`
   - Another bullet with a [link](https://example.com)
2. Second item with an inline formula: $\\alpha + \\beta = \\gamma$
   > And a nested quote!

---

## 10. Complex Example

Here's a real-world example combining multiple features:

### Algorithm: Quick Sort

\`\`\`python
def quicksort(arr):
    """
    Sorts an array using the quicksort algorithm.
    Time Complexity: O(n log n) average case
    """
    if len(arr) <= 1:
        return arr

    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]

    return quicksort(left) + middle + quicksort(right)

# Example usage
numbers = [3, 6, 8, 10, 1, 2, 1]
print(quicksort(numbers))  # Output: [1, 1, 2, 3, 6, 8, 10]
\`\`\`

**Time Complexity Analysis:**

| Case | Complexity |
|------|-----------|
| Best Case | $O(n \\log n)$ |
| Average Case | $O(n \\log n)$ |
| Worst Case | $O(n^2)$ |

> **Note:** The worst case occurs when the array is already sorted and the pivot is always the smallest or largest element.

---

## Conclusion

DocuMorph supports all standard Markdown features including:

- ✅ **Text formatting** (bold, italic, strikethrough)
- ✅ **Headers** (H1-H6)
- ✅ **Lists** (ordered, unordered, task lists)
- ✅ **Links and images**
- ✅ **Code blocks** with syntax highlighting
- ✅ **Tables**
- ✅ **Blockquotes**
- ✅ **Mathematical equations** (inline and block)
- ✅ **Horizontal rules**

*Happy writing! 🚀*

---

*Generated with DocuMorph - Transform your Markdown into beautiful documents*
`;

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
