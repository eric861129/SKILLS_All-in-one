/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AgentWizard } from '../components/AgentWizard';

afterEach(() => {
  cleanup();
});

describe('AgentWizard Component', () => {
  it('should render platform tabs', () => {
    render(
      <MemoryRouter>
        <AgentWizard />
      </MemoryRouter>
    );
    
    // Check for platform names in buttons
    expect(screen.getByRole('button', { name: /Claude Code/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Cursor/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Gemini CLI/i })).toBeDefined();
  });

  it('should switch content when a tab is clicked', async () => {
    render(
      <MemoryRouter>
        <AgentWizard />
      </MemoryRouter>
    );
    
    // Click Cursor tab
    const cursorTab = screen.getByRole('button', { name: /Cursor/i });
    fireEvent.click(cursorTab);
    
    // Check for some text specific to Cursor instructions
    await waitFor(() => {
      expect(screen.getAllByText(/cursorrules/i).length).toBeGreaterThanOrEqual(1);
    });
  });
});
