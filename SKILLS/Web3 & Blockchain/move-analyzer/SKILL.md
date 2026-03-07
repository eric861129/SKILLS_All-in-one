---
name: move-analyzer
description: Expert in Move language server (LSP) and developer tools. Configure move-analyzer, debug IDE integration (VS Code), and optimize development workflows.
---

# Move Analyzer Expert

Expertise in Move language tooling and IDE integration.

## When to Use

- Setting up `move-analyzer` for local development
- Troubleshooting IDE features (Go to Definition, Hover, Diagnostics)
- Configuring VS Code extensions for Move
- Optimizing developer experience for Move projects

## Setup & Configuration

### Installation
```bash
cargo install --git https://github.com/move-language/move move-analyzer
```

### VS Code Integration
1. Install the "Move Analyzer" extension from the Marketplace.
2. Ensure the `move-analyzer` binary is in your PATH.
3. Open a Move project (containing a `Move.toml`).

## Common Troubleshooting

- **No Diagnostics:** Ensure `Move.toml` is valid and dependencies are reachable.
- **Path Issues:** Check `which move-analyzer` and update VS Code settings if necessary.
- **Version Mismatch:** Ensure `move-analyzer` version matches your Move compiler version.

## Resources

- **Move Analyzer GitHub:** https://github.com/move-language/move/tree/main/language/move-analyzer
