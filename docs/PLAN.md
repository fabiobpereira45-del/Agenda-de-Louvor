# Modernization Plan: Agenda de Louvor SaaS

## 1. Project Analysis
- **Current State**: Monolithic `App.tsx` (1100+ lines), standard blue/grey SaaS design, Tailwind 4, React 19.
- **Objective**: Modernize UI/UX, improve code architecture, and enhance functionality.
- **Constraints**: 
    - No Purple (except if specifically requested).
    - Avoid "Safe Blue/Grey" palettes.
    - Break "Standard Split" and "Bento Grid" defaults.
    - Mandatory animations and micro-interactions.

## 2. Phase 1: Architectural Refactoring
- [ ] Create `src/components` directory.
- [ ] Create `src/hooks` directory.
- [ ] Create `src/context` directory for global state (Members, Scales, Themes, Songs).
- [ ] Extract `ScaleCard`, `ScaleWizard`, `MemberForm`, etc., into separate files.
- [ ] Implement a custom hook for AI logic.

## 3. Phase 2: Design Redesign (High-Aesthetics)
- **Style Commitment**: **Divine Minimalist (Swiss-Punk Hybrid)**.
    - **Palette**: Deep Forest Green (`#0F1F1C`) + Parchment Cream (`#F9F7F2`) + Burnt Amber (`#D4A373`). (No Blue/Purple).
    - **Geometry**: Sharp (0px radius) for technical elements, Organic/Soft (24px+) for "Human" elements.
    - **Typography**: Playfair Display (Serif) for headings, Inter (Sans) for body.
    - **Layout**: Asymmetric 90/10 or Overlapping Layers. No standard 50/50 splits.
- [ ] Update `index.css` with new design tokens.
- [ ] Implement scroll-triggered reveal animations.
- [ ] Add physical feedback (scale/glow) to all interactive elements.

## 4. Phase 3: Functional Enhancements
- [ ] **AI Co-pilot**: Transform the AI search into a persistent side-drawer that can "suggest and apply" songs directly to the scale.
- [ ] **Ministry Dashboard**: Add a "Statistics" view (most sung songs, member participation frequency).
- [ ] **Improved PDF Templates**: Create more "elegant" PDF layouts for church distribution.

## 5. Implementation Roadmap
1. **Refactor Phase**: Split the monolith into maintainable components.
2. **Design Phase**: Apply the new design system globally.
3. **Feature Phase**: Implement AI enhancements and Dashboard.
4. **Polish Phase**: Add advanced animations and refine micro-interactions.
