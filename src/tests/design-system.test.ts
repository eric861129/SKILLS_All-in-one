import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Design System Tokens', () => {
  let cssContent: string;

  beforeAll(() => {
    const cssPath = path.resolve(__dirname, '../index.css');
    cssContent = fs.readFileSync(cssPath, 'utf8');
  });

  it('should have Deep Sea/Obsidian accents defined in CSS variables', () => {
    // Current is blue-500
    // Electric Indigo or Cyan accents as per plan
    expect(cssContent).toContain('--accent: 99 102 241'); // Indigo-500
  });

  it('should have glassmorphism utility classes', () => {
    expect(cssContent).toContain('.glass-surface');
    expect(cssContent).toContain('backdrop-filter: blur');
  });
});
