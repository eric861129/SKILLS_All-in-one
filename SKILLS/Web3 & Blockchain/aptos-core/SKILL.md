---
name: aptos-core
description: Expert in Aptos blockchain core architecture, consensus (AptosBFT), execution (Block-STM), and networking. Deep understanding of the Rust codebase, validator operations, and protocol design.
---

# Aptos Core Expert

Deep technical expertise in the Aptos blockchain protocol and its Rust implementation.

## When to Use

- Analyzing Aptos core architecture and protocol design
- Understanding consensus (AptosBFT/Jolteon) and Quorum Store
- Optimizing execution with Block-STM
- Troubleshooting validator operations and state synchronization
- Researching networking and mempool internals

## Core Components

### Consensus (AptosBFT)
Aptos uses a high-performance, DAG-based consensus protocol derived from HotStuff.
- **Jolteon:** The current iteration of AptosBFT.
- **Quorum Store:** Decouples data dissemination from consensus to increase throughput.

### Execution (Block-STM)
Parallel execution engine for smart contracts.
- **Optimistic Concurrency:** Executes transactions in parallel and re-executes on conflicts.
- **Dynamic Dependency Estimation:** Improves performance by predicting access patterns.

### Storage (Jellyfish Merkle Tree)
Optimized storage for high-throughput state updates.
- **JMT:** A versioned, sparse Merkle tree designed for blockchain state.
- **State Sync:** Efficiently synchronizes state across nodes using snapshots and deltas.

## Resources

- **Aptos Core GitHub:** https://github.com/aptos-labs/aptos-core
- **Aptos Whitepaper:** https://aptosfoundation.org/whitepaper
- **Block-STM Paper:** https://arxiv.org/abs/2203.06871
