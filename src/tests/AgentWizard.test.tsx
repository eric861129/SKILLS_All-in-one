/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';
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
    expect(screen.getByRole('button', { name: /Claude Desktop/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /ChatGPT/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Gemini CLI/i })).toBeDefined();
  });

  it('should switch content when a tab is clicked', async () => {
    render(
      <MemoryRouter>
        <AgentWizard />
      </MemoryRouter>
    );
    
    // Click ChatGPT tab
    const chatGptTab = screen.getByRole('button', { name: /ChatGPT/i });
    fireEvent.click(chatGptTab);
    
    // Check for some text specific to ChatGPT instructions
    // Use waitFor because AnimatePresence might delay the render
    await waitFor(() => {
      expect(screen.getAllByText(/Custom GPT/i).length).toBeGreaterThanOrEqual(1);
    });
  });
});
