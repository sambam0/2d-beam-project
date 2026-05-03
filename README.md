# 2D Beam Project

A 2D beam analysis application built with React 19, TypeScript, and Vite 8.

## Tech Stack

- **Vite 8** with `@vitejs/plugin-react` (uses [Oxc](https://oxc.rs) for fast transforms)
- **React 19** + **TypeScript**
- **Tailwind CSS v4**
- **Zustand** for state management
- **Framer Motion** for animations
- **KaTeX** / `react-latex-next` for math rendering

## Prerequisites

- **Node.js** (v18 or higher) — [Download here](https://nodejs.org/)
- **npm** (comes bundled with Node.js)

You do **not** need to install Vite globally. It is included as a dev dependency and installed automatically with `npm install`.

To verify Node and npm are installed:

```bash
node --version
npm --version
```

## Installation

Clone the repository and install **all** dependencies (including Vite and TypeScript):

```bash
git clone https://github.com/sambam0/2d-beam-project.git
cd 2d-beam-project
npm install
```

## Running Locally

Start the Vite development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

## Other Commands

```bash
npm run build    # Type-check with tsc, then build for production via Vite
npm run preview  # Serve the production build locally to test it
npm run lint     # Run ESLint
```
