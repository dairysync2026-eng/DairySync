import fs from 'node:fs';
import path from 'node:path';
import { jsPDF } from 'jspdf';

const root = process.cwd();
const sourcePath = path.join(root, 'docs', 'DairySync-System-Guide.md');
const outputPath = path.join(root, 'docs', 'DairySync-System-Guide.pdf');
const markdown = fs.readFileSync(sourcePath, 'utf8');

const pageWidth = 210;
const pageHeight = 297;
const margin = 18;
const contentWidth = pageWidth - margin * 2;
const bodySize = 9.2;
const bodyLineHeight = 4.5;
const headingLineHeight = 6.5;

const normalize = (value) => value
  .replace(/\*\*(.*?)\*\*/g, '$1')
  .replace(/\*(.*?)\*/g, '$1')
  .replace(/`([^`]+)`/g, '$1')
  .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
  .replace(/[\u2013\u2014]/g, '-')
  .replace(/[\u2018\u2019]/g, "'")
  .replace(/[\u201c\u201d]/g, '"')
  .replace(/\u2022/g, '*')
  .replace(/₱/g, 'PHP')
  .replace(/[^\x00-\x7F]/g, '?');

const wrap = (doc, text, width, fontSize = bodySize) => {
  doc.setFontSize(fontSize);
  return doc.splitTextToSize(normalize(text), width);
};

const doc = new jsPDF({ unit: 'mm', format: 'a4' });
let pageNumber = 1;
let y = 20;
let inCode = false;

const footer = () => {
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, pageHeight - 13, pageWidth - margin, pageHeight - 13);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('DairySync System Guide | Source-verified September 16, 2026', margin, pageHeight - 8);
  doc.text(String(pageNumber), pageWidth - margin, pageHeight - 8, { align: 'right' });
};

const newPage = () => {
  footer();
  doc.addPage();
  pageNumber += 1;
  y = 20;
};

const ensureSpace = (height) => {
  if (y + height > pageHeight - 19) newPage();
};

const writeLines = (lines, options = {}) => {
  const size = options.size || bodySize;
  const lineHeight = options.lineHeight || bodyLineHeight;
  const color = options.color || [30, 41, 59];
  doc.setFont(options.font || 'helvetica', options.style || 'normal');
  doc.setFontSize(size);
  doc.setTextColor(...color);
  for (const line of lines) {
    ensureSpace(lineHeight);
    doc.text(line, options.x || margin, y, options.align ? { align: options.align } : undefined);
    y += lineHeight;
  }
};

const writeParagraph = (text) => {
  const lines = wrap(doc, text, contentWidth, bodySize);
  writeLines(lines);
  y += 2;
};

const writeHeading = (text, level) => {
  const size = level === 1 ? 17 : level === 2 ? 13 : 10.5;
  const before = level === 1 ? 3 : 4;
  ensureSpace(headingLineHeight + before + 4);
  y += before;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(size);
  doc.setTextColor(15, 23, 42);
  const lines = wrap(doc, text, contentWidth, size);
  for (const line of lines) {
    ensureSpace(headingLineHeight);
    doc.text(line, margin, y);
    y += headingLineHeight;
  }
  doc.setDrawColor(level === 1 ? 79 : 203, level === 1 ? 70 : 213, level === 1 ? 229 : 225);
  doc.setLineWidth(level === 1 ? 0.6 : 0.25);
  doc.line(margin, y + 1, pageWidth - margin, y + 1);
  y += level === 1 ? 5 : 3;
};

const writeBullet = (text, ordered = false, index = 0) => {
  const prefix = ordered ? `${index}. ` : '- ';
  const lines = wrap(doc, prefix + text, contentWidth - 4, bodySize);
  ensureSpace(lines.length * bodyLineHeight);
  writeLines(lines, { x: margin + 3 });
};

const writeCode = (text) => {
  const lines = wrap(doc, text, contentWidth - 8, 8.2);
  const boxHeight = lines.length * 4 + 7;
  ensureSpace(boxHeight);
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y - 3, contentWidth, boxHeight, 2, 2, 'FD');
  writeLines(lines, { x: margin + 4, size: 8.2, lineHeight: 4, font: 'courier', color: [30, 41, 59] });
  y += 4;
};

const writeTable = (rows) => {
  const cleanRows = rows.map(row => row.map(cell => normalize(cell.trim())));
  const columns = cleanRows[0].length;
  const widths = columns === 2 ? [contentWidth * 0.31, contentWidth * 0.69] : Array(columns).fill(contentWidth / columns);
  const rowHeight = 8;
  ensureSpace(rowHeight + 4);
  for (let rowIndex = 0; rowIndex < cleanRows.length; rowIndex += 1) {
    const row = cleanRows[rowIndex];
    const linesByCell = row.map((cell, colIndex) => {
      doc.setFontSize(7.2);
      return doc.splitTextToSize(cell, widths[colIndex] - 4);
    });
    const height = Math.max(rowHeight, ...linesByCell.map(lines => lines.length * 3.5 + 4));
    if (y + height > pageHeight - 19) newPage();
    let x = margin;
    for (let colIndex = 0; colIndex < columns; colIndex += 1) {
      doc.setFillColor(rowIndex === 0 ? 226 : rowIndex % 2 ? 248 : 255, rowIndex === 0 ? 232 : rowIndex % 2 ? 250 : 255, rowIndex === 0 ? 240 : rowIndex % 2 ? 252 : 255);
      doc.setDrawColor(203, 213, 225);
      doc.rect(x, y, widths[colIndex], height, 'FD');
      doc.setFont('helvetica', rowIndex === 0 ? 'bold' : 'normal');
      doc.setFontSize(7.2);
      doc.setTextColor(30, 41, 59);
      doc.text(linesByCell[colIndex], x + 2, y + 4);
      x += widths[colIndex];
    }
    y += height;
  }
  y += 4;
};

const lines = markdown.split(/\r?\n/);
let tableRows = [];
const flushTable = () => {
  if (tableRows.length > 0) {
    writeTable(tableRows);
    tableRows = [];
  }
};

// Cover page
ensureSpace(100);
doc.setFillColor(15, 23, 42);
doc.rect(0, 0, pageWidth, pageHeight, 'F');
doc.setTextColor(255, 255, 255);
doc.setFont('helvetica', 'bold');
doc.setFontSize(25);
doc.text('DairySync', pageWidth / 2, 72, { align: 'center' });
doc.setFontSize(16);
doc.text('System Guide', pageWidth / 2, 84, { align: 'center' });
doc.setFont('helvetica', 'normal');
doc.setFontSize(11);
doc.setTextColor(203, 213, 225);
doc.text('Inventory, Production, Cold Storage and Dairy Box Operations', pageWidth / 2, 98, { align: 'center' });
doc.text('PCC-MMSU | Source-verified September 16, 2026', pageWidth / 2, 107, { align: 'center' });
doc.setDrawColor(99, 102, 241);
doc.setLineWidth(1);
doc.line(55, 119, 155, 119);
doc.setFontSize(9);
doc.setTextColor(148, 163, 184);
doc.text('Complete implementation and function reference', pageWidth / 2, 132, { align: 'center' });
doc.text('https://dairysync-pcc-94978.web.app', pageWidth / 2, 142, { align: 'center' });
footer();
doc.addPage();
pageNumber += 1;
y = 20;

for (const rawLine of lines) {
  const line = rawLine.trim();
  if (line === '```') {
    flushTable();
    inCode = !inCode;
    y += 2;
    continue;
  }
  if (inCode) {
    writeCode(rawLine);
    continue;
  }
  if (line === '') {
    flushTable();
    y += 2;
    continue;
  }
  if (line.startsWith('|')) {
    const cells = line.split('|').slice(1, -1);
    if (cells.every(cell => /^\s*:?-{3,}:?\s*$/.test(cell))) continue;
    tableRows.push(cells);
    continue;
  }
  flushTable();
  if (line.startsWith('# ')) writeHeading(line.slice(2), 1);
  else if (line.startsWith('## ')) writeHeading(line.slice(3), 2);
  else if (line.startsWith('### ')) writeHeading(line.slice(4), 3);
  else if (/^\d+\.\s+/.test(line)) {
    const match = line.match(/^(\d+)\.\s+(.*)$/);
    writeBullet(match[2], true, Number(match[1]));
  } else if (line.startsWith('- ')) writeBullet(line.slice(2));
  else if (line.startsWith('**') && line.endsWith('**')) writeParagraph(line.replace(/^\*\*|\*\*$/g, ''));
  else writeParagraph(line);
}
flushTable();
footer();
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, Buffer.from(doc.output('arraybuffer')));
console.log(`Created ${outputPath}`);
