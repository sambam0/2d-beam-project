# Multi-Mode Beam Calculator Implementation Plan

The objective is to expand the single Beam Calculator into a multi-mode toolkit tailored to Swedish standard lumber geometries. The three distinct modes—Analyze, Compare, and Solve—will seamlessly share core environmental loading contexts while providing distinctly different engineering insights.

## Proposed Tech Stack (Assumed React based on existing framer-motion dependency)
- **Framework**: React (Vite)
- **Styling**: Tailwind CSS (handling responsiveness, dark/light modes, grid layouts)
- **State Management**: Zustand (ideal for decoupling shared loading inputs from granular mode-specific inputs)
- **Animations**: Framer Motion (for smooth layout transitions between modes and dashboard tiles)
- **Data Viz**: Lightweight charting library or custom SVG implementation for exact control over diagram overlays.
- **Icons**: Lucide React or similar SVG icons.

## Architecture & State Management

A central challenge is cleanly sharing the "World Context" while isolating the "Plank Configurations" specific to each mode.

1.  **Global Store (`useBeamStore`)**:
    *   **Shared Loading Configuration**: `span`, `liveLoad`, `tributaryWidth`, `pointLoads`, `safetyFactor`, `deflectionLimit`.
    *   **App UI State**: `currentMode` (analyze | compare | solve), `showWorkPanelVisible` (boolean).
    *   **Analyze Mode Config**: `plankA` (b, h, class).
    *   **Compare Mode Config**: `plankA`, `plankB` (b, h, class).
    *   **Solve Mode Config**: `targetURBending`, `targetURShear`, `targetDeflectionDivider`.

2.  **Physics Kernel (`utils/physics.ts`)**:
    *   A pure function pipeline: `calculateBeam(loadingContext, plankConfig) -> BeamResult`.
    *   `BeamResult` should contain: max values, arrays of shape points for charts, text/steps for "Show Work", and utility ratios.

## UI Component Breakdown

### Core Layout Layout
- `<ModeSwitcher />`: Segmented control component sticking to the top of the UI.
- `<SharedLoadingInputs />`: A sidebar, top bar, or persistent drawer housing the universal parameters that dictate the environment.

### Mode: Compare
-   **Layout**: Side-by-side grid (`grid-cols-1 md:grid-cols-2`).
-   **Dashboards**: Reuses the 4-tile summary widget from Analyze mode, but wrapped in a wrapper that compares sibling results to inject "Winner" badges (greener side / higher margin).
-   **Diagram Canvas**: A specialized `<CompareDiagram />` that takes two sets of result data.
    *   *Deflection*: Superimposed curves using fixed scaling (~50x). Design A (Solid, Primary Color), Design B (Dashed/Ghosted, Secondary Color).
    *   *Shear & Moment*: Shared axises, plotted twice with contrasting strokes. Includes a small overlay legend.
-   **Show Work (Compare)**: Renders `<DerivationSteps />` in two columns emphasizing exactly where the mathematical differences occur.

### Mode: Solve
-   **Data Dictionary**: Constant array of standard Swedish/European dimensions (`45x95` up to `95x220`).
-   **Optimizer Function**: A loop over the sorted array calling `calculateBeam()`. Breaks and tags the first candidate where all three checks (U_b ≤ target, U_s ≤ target, δ_max ≤ L/n) pass.
-   **UI Presentation**:
    *   **Control Bar**: Form inputs for target passes and a massive "Solve" CTA.
    *   **Winner Card**: Highly stylized card showcasing the smallest passing section, with a button dispatching an action to copy its parameters back to Analyze mode.
    *   **Fallbacks**: Graceful empty-state if the end of the array is reached without a pass, specifically detailing how close the "best failing" candidate was.
    *   **Candidates Table**: A sortable `<table>` mapping over results. Row background hints (soft green vs muted strikethrough).

## Verification Plan

### Automated Testing Strategy
If the user's stack includes Vitest or Jest, we will write unit tests for the following:
1.  **Physics Kernel Tests**:
    *   Ensure `calculateBeam()` resolves correctly for known standard configurations.
2.  **Optimization Logic Tests**:
    *   Mock scenarios where standard sizes clearly fail, verify the algorithm selects the correct larger size.
    *   Verify edge cases where no sections pass.

*Command:* `npm run test`

### Manual Verification Path
The user can verify the application works as intended dynamically via `npm run dev`:
1.  **Shared State Check**: Switch from Analyze to Compare. Change the "Live Load" to a new value. Switch back to Analyze. Confirm the value persists.
2.  **Compare Visuals Check**: Input a weak section A and a strong section B. Verify the 4-tile dashboards assign winner badges correctly. Verify the Moment Diagram shows two distinct lines.
3.  **Solver Check**: Run Solve mode. Note the winner. Restrict the acceptable "Deflection target" down drastically. Re-run solve, verifying a stiffer section is selected.
