# TV Campaign Optimizer

A React-based tool for optimizing TV advertising campaigns for L'Oréal (Garnier Hair Care).

## Quick Start

The development server is already running! Open your browser and navigate to:

**http://localhost:3000**

## Running the Application

### First Time Setup

1. Install dependencies:
```bash
npm install
```

### Start Development Server

```bash
npm run dev
```

The application will automatically open in your browser at `http://localhost:3000`.

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
.
├── src/
│   ├── TVCampaignOptimizer_v3.jsx  # Main React component
│   └── main.jsx                     # Application entry point
├── public/
│   └── input_data_v1.csv            # Campaign data
├── index.html                       # HTML template
├── vite.config.js                   # Vite configuration
└── package.json                     # Dependencies
```

## Features

- **Region Selection**: Choose from different geographic markets
- **Optimization Modes**: 
  - Reach (Maximize Coverage)
  - Impact/Reach (Impact Density)
  - Impact/Cost (Efficiency)
- **Interactive Charts**: Visualize channel performance and optimization results
- **CSV Export**: Download optimized campaign plans

## Technologies

- React 18
- Recharts (for data visualization)
- Vite (build tool and dev server)

