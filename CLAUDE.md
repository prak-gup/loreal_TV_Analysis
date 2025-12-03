# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **TV Campaign Budget Optimization Tool** for L'Oréal (Garnier Hair Care) built with React. The tool simulates and optimizes TV advertising budgets across different channels and regions to maximize campaign outcomes without increasing spend. It's powered by SYNC's cross-media measurement and attribution platform.

**Core Purpose**: Redistribute TV advertising budgets intelligently to achieve better ROI, reach, or impact through data-driven channel mix optimization.

## Data Source & Structure

### Input Data
- **Primary file**: `input_data_v1.csv` - Contains historical TV campaign performance data
- **Embedded data**: Raw CSV data is embedded directly in `TVCampaignOptimizer_v2.jsx` (lines 5-247)
- **Data schema**:
  - `Region`: Geographic market (AP, HSM, KAR, MAH, Orissa, Punjab, TN, UP, WB)
  - `Channel`: TV channel name
  - `Genre`: Channel category (GEC, Movies, News, Music, etc.)
  - `Language`: Content language
  - `Brand`: Either "garnier black naturals" or "godrej expert rich creme hair colour"
  - `ViewingMinutes`, `Impact`, `Cost`, `Spots`, `OTS`, `SyncReach`, `Impressions`, `GRP`: Campaign metrics

### Documentation
- **client-documentation.md**: Comprehensive 350-line business documentation explaining:
  - Optimization modes (REACH, IMPACT/REACH, IMPACT/COST)
  - Channel classification (Short Tail vs Long Tail)
  - Business rules and guardrails
  - Use cases and interpretation guidelines

## Architecture & Key Concepts

### 1. Channel Classification System

**Short Tail Channels**:
- High-reach channels forming the campaign backbone
- Identified by cumulative reach threshold (default 70%, configurable 50-90%)
- Protected during optimization: can only adjust by ±10%
- Examples: Star Maa, Zee Telugu, Colors (major networks)

**Long Tail Channels**:
- Lower-reach niche channels
- Can be aggressively optimized, reduced, or dropped entirely
- Provide incremental/specialized audiences

### 2. Optimization Modes

**REACH Mode** (`optimizationMetric: 'reach'`):
- Maximizes raw audience coverage
- Score = `SyncReach` (percentage)
- Best for awareness campaigns

**IMPACT/REACH Mode** (`optimizationMetric: 'impact_reach'`):
- Maximizes impact per reach point
- Score = `Impact ÷ SyncReach`
- Best for efficiency/conversion campaigns

**IMPACT/COST Mode** (`optimizationMetric: 'impact_cost'`):
- Maximizes ROI
- Score = `(Impact ÷ Cost) × 1,000,000`
- Best for cost-conscious campaigns

### 3. Optimization Algorithm (lines 394-550)

**Phase 1 - Budget Reallocation**:
1. Calculate scores for all channels based on selected metric
2. Classify channels into tiers (top 30%, bottom 30%)
3. Identify channels to reduce/drop:
   - Long tail + bottom 15% score → DROP entirely
   - Long tail + bottom 30% score → Reduce by 50-90%
   - Short tail + low score → Reduce max 10%

**Phase 2 - Competition Learning**:
1. Identify Godrej channels NOT in Garnier plan
2. Score them using same metric
3. Select top N high-scoring channels as candidates
4. N increases with optimization intensity

**Phase 3 - Budget Distribution**:
1. Distribute freed budget to top 30% score channels
2. Allocation proportional to score
3. Apply constraints:
   - No channel > 35% of total budget
   - Maintain minimum 5-7 active channels
   - Short tail: max ±10% adjustment

### 4. Component Structure

**Main State Variables**:
- `selectedRegion`: Current geographic market
- `optimizationMetric`: 'reach' | 'impact_reach' | 'impact_cost'
- `targetIncrease`: Optimization intensity (5-30%)
- `shortTailThreshold`: Cumulative reach cutoff (50-90%)
- `optimizedPlan`: Results object containing before/after comparison

**Key Functions**:
- `calculateScore(channel, metric)`: Compute optimization score (lines 304-315)
- `analyzeChannels()`: Classify channels, calculate metrics (lines 317-391)
- `runOptimization()`: Execute optimization algorithm (lines 394-550)

**Configuration Constants** (lines 250-255):
```javascript
CONFIG = {
  SHORT_TAIL_REACH_PERCENTILE: 70,      // Default cumulative reach threshold
  SHORT_TAIL_ADJUSTMENT_LIMIT: 0.10,    // Max ±10% adjustment for short tail
  MAX_CHANNEL_CONCENTRATION: 0.35,      // No channel > 35% budget
  MIN_ACTIVE_CHANNELS: 5                // Minimum channel diversity
}
```

## Development Guidelines

### Working with the Optimizer

1. **Data modifications**: If updating data, maintain CSV schema consistency. The component expects exact column names.

2. **Adding optimization metrics**:
   - Add new case in `calculateScore()` function
   - Update `optimizationMetric` state type
   - Add corresponding UI option in metric selector dropdown

3. **Adjusting business rules**:
   - Modify `CONFIG` constants for global thresholds
   - Update tier percentiles in `runOptimization()` (lines 444-445)
   - Adjust reduction rates in Phase 1 logic (lines 452-478)

4. **Visualization changes**:
   - Charts use Recharts library (BarChart, PieChart, LineChart)
   - Color scheme defined in `COLORS` object (lines 265-280)
   - All currency formatted via `formatCurrency()` helper

### Key Metrics Calculations

```javascript
// Impact per reach point
impactReachScore = Impact / SyncReach

// Impact per million rupees
impactCostScore = (Impact / Cost) × 1,000,000

// Cost share percentage
costShare = (channelCost / totalCost) × 100

// Cumulative reach classification
cumulativeReachPct = (cumulativeReach / totalReach) × 100
isShortTail = cumulativeReachPct <= shortTailThreshold
```

### Understanding Channel Tags

After optimization, channels receive status tags:
- `INCREASE` (↑): Budget increased by >2%
- `DECREASE` (↓): Budget reduced by >2%
- `DROPPED` (✕): Channel removed (cost = 0)
- `NEW` (★): Added from Godrej competition learning
- `UNCHANGED` (—): Change within ±2%

## Common Tasks

### Testing different scenarios
1. Select a region (AP, HSM, KAR, etc.)
2. Choose optimization mode (reach/impact_reach/impact_cost)
3. Adjust optimization intensity slider (5-30%)
4. Adjust short tail threshold slider (50-90%)
5. Click "Run Optimization" to see results

### Adding new regions
1. Add data to CSV with proper `Region` column value
2. Component automatically detects unique regions via `useMemo` (line 293)

### Modifying constraints
- **Channel concentration cap**: Edit `MAX_CHANNEL_CONCENTRATION` in CONFIG
- **Minimum channels**: Edit `MIN_ACTIVE_CHANNELS` in CONFIG
- **Short tail protection**: Edit `SHORT_TAIL_ADJUSTMENT_LIMIT` in CONFIG

## Business Context

This tool is used by media planners to:
- Optimize existing TV campaign budgets post-campaign
- Learn from competition (Godrej) media strategies
- Prove ROI and justify media spend to stakeholders
- Identify underperforming channels consuming budget
- Discover high-performing channels to scale up

The optimization is **budget-neutral** - it redistributes existing spend rather than recommending additional investment.

## Technical Stack

- **React 18** with Hooks (useState, useEffect, useMemo)
- **Recharts** for data visualization
- **Inline styling** (no external CSS framework)
- **No build system required** - Single JSX file for deployment
- **Data**: Embedded CSV data as JavaScript array

## Important Constraints

1. **Short tail channels are protected** - Can only adjust by ±10% to preserve mass reach
2. **Budget neutrality** - Total spend before = total spend after
3. **Minimum diversity** - Must maintain at least 5-7 active channels
4. **Concentration limits** - No single channel can exceed 35% of budget
5. **Competition learning** - Only suggests Godrej channels with high scores in selected metric
