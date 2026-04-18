# Beam Calculator - Multi-Mode Implementation

## Phase 1: Foundation and State Management
- [/] Initialize frontend framework architecture (e.g. React/Vite or Next.js) and configure Tailwind CSS + Framer Motion
- [/] Define global state store (e.g. using Zustand or React Context)
  - Shared loading inputs: span, live load, tributary width, point loads, safety factor, deflection limit
  - UI state: current mode (Analyze, Compare, Solve), "show work" toggle
- [ ] Implement core physics and engineering calculation utilities
  - Support functions to compute shear diagram, moment diagram, and deflected shape arrays
  - Utility ratio calculation (U_bending, U_shear, U_deflection)
- [ ] Build Top Navigation/Mode Switcher component (Segmented Control)
- [ ] Build Shared Global Inputs Form (persists across views)

## Phase 2: Analyze Mode (Initial Single Beam View)
- [ ] Implement standard section inputs (width b, height h, wood class)
- [ ] Integrate the core physics pipeline to power the Analyze view
- [ ] Build 4-tile summary dashboard (Bending, Shear, Deflection, Margin)
- [ ] Implement Diagram Viewer: single beam diagram for deflected shape, shear diagram, moment diagram
- [ ] Implement "Show Work" panel for detailed mathematical derivation

## Phase 3: Compare Mode
- [ ] State management for Design A vs. Design B (independent inputs for dimensions and wood class)
- [ ] UI layout: Two-column responsive layout for side-by-side inputs and dashboards
- [ ] Implement 4-tile dashboards per side with "Winner" indicator logic
- [ ] Update Diagram Viewer to support overlaid visualization:
  - Overlaid deflected shapes (Design A vs B) with distinct accent colors
  - Overlaid lines (solid vs dashed) for Shear and Moment charts
- [ ] Implement side-by-side "Show Work" comparison view

## Phase 4: Solve Mode
- [x] Define the constant array of standard Swedish construction lumber sizes
- [x] Add user-editable pass criteria inputs (Utility ratios, Deflection limits)
- [x] Implement optimization algorithm:
  - Iterate through sorted lumber array
  - Compute physics for each, record U_bending, U_shear, U_deflection, pass/fail
  - Identify the first "Winner" section
- [x] Build UI
  - Big "Solve" button
  - Winner Card emphasizing the recommended optimal section + "Apply to Analyze mode" feature
  - Sortable full candidate table with color-coded pass/fail rows
  - Conditional error messaging for when no section passes the criteria
