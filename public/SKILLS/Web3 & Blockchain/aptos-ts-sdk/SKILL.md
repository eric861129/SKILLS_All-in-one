---
name: aptos-ts-sdk
description: Expert in Aptos TypeScript SDK (v2). Build frontend applications, manage accounts, submit transactions, and query the Aptos Indexer.
---

# Aptos TypeScript SDK Expert

Expertise in building applications using the Aptos TypeScript SDK (v2).

## When to Use

- Building web applications that interact with Aptos
- Managing accounts and signing transactions in TypeScript
- Querying the blockchain via the REST API or Indexer (GraphQL)
- Working with BCS (Binary Canonical Serialization) in JS/TS

## Core Concepts

### Client Initialization
```typescript
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";

const config = new AptosConfig({ network: Network.TESTNET });
const aptos = new Aptos(config);
```

### Transaction Submission
```typescript
const transaction = await aptos.transaction.build.simple({
  sender: alice.accountAddress,
  data: {
    function: "0x1::coin::transfer",
    typeArguments: ["0x1::aptos_coin::AptosCoin"],
    functionArguments: [bobAddress, 100],
  },
});

const pendingTxn = await aptos.signAndSubmitTransaction({
  signer: alice,
  transaction,
});
```

## Resources

- **Aptos TS SDK Docs:** https://aptos.dev/sdks/ts-sdk/
- **GitHub:** https://github.com/aptos-labs/aptos-ts-sdk
