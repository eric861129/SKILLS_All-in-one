import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Scrollbar Styling', () => {
  let cssContent: string;

  beforeAll(() => {
    const cssPath = path.resolve(__dirname, '../index.css');
    cssContent = fs.readFileSync(cssPath, 'utf8');
  });

  it('should have custom scrollbar styles defined', () => {
    expect(cssContent).toContain('::-webkit-scrollbar');
    expect(cssContent).toContain('::-webkit-scrollbar-thumb');
  });
});
