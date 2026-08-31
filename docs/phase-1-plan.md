# Phase 1 Implementation Plan: Design System Tokens & Component Catalog

## Objectives
1. Build an interactive design system sandbox at `/dev/tokens`.
2. Showcase every semantic color token, surface layer, and named gradient token.
3. Display full typography hierarchy from Display Hero heading down to monospace metadata.
4. Demonstrate all component primitives across all interactive states (default, hover, focus, error, active, disabled) in both Light and Dark themes.
5. Provide live WCAG 2.2 AA contrast ratio validation table.

## Components & Visual Elements to Showcase
- **Theme Switcher**: Instant client-side toggle for `.dark` root class.
- **Color Palette**: Brand hierarchy (`brand-ink`, `brand-800`...`brand-50`), Soft atmosphere tints (`lavender`, `peach`, `sky`), Functional status tokens (`status-success`, `status-info`, `status-warning`, `status-danger`).
- **Gradients**: `gradient-hero`, `gradient-panel`, `gradient-dark-band`, `gradient-subtle`.
- **Typography Scale**: Display 1, H1, H2, H3, H4, Body Lead, Body Regular, Body Small, Monospace Tag.
- **Buttons**: All 7 variants × 4 sizes + icon button combinations.
- **Input & Form Controls**: Standard input, error input with helper text, switch toggles.
- **Add-On Toggle Rows**: Interactive high-margin add-on rows with live pricing feedback.
- **Badges & Status Chips**: All variants with icons.
- **Cards & Surface Elevation**: White raised card, subtle lavender card, and deep navy dark band container.
- **Interactive Primitives**: Accordions and Tabs.

## Acceptance Criteria
- `/dev/tokens` loads cleanly without errors.
- Dark mode toggle dynamically switches all surfaces and text.
- Axe-clean semantic markup with proper ARIA attributes and focus rings.
- 0 raw hex violations in codebase.
