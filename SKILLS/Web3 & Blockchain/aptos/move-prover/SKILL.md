---
name: move-prover
description: Move Prover formal verification expert for Aptos smart contracts. Write specifications (MSL), preconditions (requires), postconditions (ensures), invariants, abort conditions (aborts_if), quantifiers, schemas, and pragmas.
---

# Move Prover Expert

Formal verification for Move smart contracts - mathematically prove your code is correct.

## When to Use

- Writing specifications for Move functions
- Proving correctness properties (invariants, access control)
- Debugging verification failures or timeouts
- Understanding MSL (Move Specification Language)

## Why Move Prover?

**Testing checks specific inputs. Verification proves ALL inputs.**

```move
// Testing: Checks one case
#[test]
fun test_transfer() {
    transfer(alice, bob, 100);
}

// Verification: Proves for ALL possible inputs
spec transfer {
    ensures sender_balance == old(sender_balance) - amount;
    ensures recipient_balance == old(recipient_balance) + amount;
}
```

## Core Constructs

### Preconditions - `requires`
Conditions that must be true BEFORE function runs:
```move
spec withdraw {
    requires exists<Balance>(addr);
    requires global<Balance>(addr).coins >= amount;
}
```

### Postconditions - `ensures`
Conditions that must be true AFTER function runs:
```move
spec transfer {
    ensures global<Balance>(from).coins == old(global<Balance>(from).coins) - amount;
    ensures global<Balance>(to).coins == old(global<Balance>(to).coins) + amount;
}
```

### Abort Conditions - `aborts_if`
When function should abort:
```move
spec withdraw {
    aborts_if !exists<Balance>(addr) with ERROR_NOT_FOUND;
    aborts_if global<Balance>(addr).coins < amount with ERROR_INSUFFICIENT;
}
```

## Running the Prover

```bash
# Verify all modules
aptos move prove

# Verify specific module
aptos move prove --filter MyModule
```

## Resources

- **Aptos Move Prover Docs:** https://aptos.dev/move/prover/
- **Move Specification Language:** https://github.com/move-language/move/blob/main/language/move-prover/doc/user/spec-lang.md
