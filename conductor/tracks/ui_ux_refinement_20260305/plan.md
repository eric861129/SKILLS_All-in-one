# Implementation Plan: UI/UX Refinement

## Phase 1: Foundation & Typography
- [x] Task: Install Dependencies (94e3507)
    - [x] `npm install framer-motion clsx tailwind-merge`
- [x] Task: Update Typography System (3b845ec)
    - [x] Configure `tailwind.config.js` with `Outfit` and `JetBrains Mono`.
    - [x] Update `index.css` with global font rules.
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Foundation & Typography' (Protocol in workflow.md)

## Phase 2: Design System Refinement
- [ ] Task: Define Color Palette & Glassmorphism
    - [ ] Update Tailwind theme with "Deep Sea/Obsidian" accents.
    - [ ] Create reusable glassmorphism utility classes.
- [ ] Task: Custom Scrollbar
    - [ ] Implement a minimal, dark-themed scrollbar in CSS.
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Design System Refinement' (Protocol in workflow.md)

## Phase 3: Component Interactions
- [ ] Task: Tactile SkillCard
    - [ ] Refactor `SkillCard.tsx` to use `framer-motion`.
    - [ ] Add spring-based hover and click effects.
- [ ] Task: Skeleton Loaders
    - [ ] Improve `SkeletonCard.tsx` with refined animations.
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Component Interactions' (Protocol in workflow.md)

## Phase 4: Final Polishing
- [ ] Task: Layout Jitter Prevention
    - [ ] Audit and enforce strict aspect ratios for all dynamic containers.
- [ ] Task: Global Review
    - [ ] Ensure no emojis are used as UI icons (replace with Lucide).
- [ ] Task: Conductor - User Manual Verification 'Phase 4: Final Polishing' (Protocol in workflow.md)