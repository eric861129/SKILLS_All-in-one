import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Typography Design Tokens', () => {
  let cssContent: string;

  beforeAll(() => {
    const cssPath = path.resolve(__dirname, '../index.css');
    cssContent = fs.readFileSync(cssPath, 'utf8');
  });

  it('should use Outfit for the sans-serif font family', () => {
    // Current is Geist
    expect(cssContent).toContain("--font-sans: 'Outfit'");
  });

  it('should use JetBrains Mono for the monospace font family', () => {
    // Current is Geist Mono
    expect(cssContent).toContain("--font-mono: 'JetBrains Mono'");
  });

  it('should import Outfit and JetBrains Mono from Google Fonts', () => {
    expect(cssContent).toContain('family=Outfit');
    expect(cssContent).toContain('family=JetBrains+Mono');
  });
});
