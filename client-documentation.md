# TV Campaign Optimizer
## Powered by SYNC | Cross-Media Measurement & Attribution

---

# 1. EXECUTIVE SUMMARY

The TV Campaign Optimizer is a **simulation tool** that helps media planners redistribute TV advertising budgets to achieve better campaign outcomes **without increasing spend**. 

**Core Promise:** Same budget, better results through intelligent channel mix optimization.

---

# 2. KEY DEFINITIONS

## 2.1 Channel Classification

### **Short Tail Channels**
- **Definition:** High-reach channels that form the backbone of your media plan
- **Identification:** Channels contributing to the top 70% of cumulative reach (configurable)
- **Examples:** Star Maa, Zee Telugu, Colors, Dangal, Star Vijay
- **Optimization Rule:** Protected during optimization; can only be adjusted by ±10%
- **Business Rationale:** These channels provide mass reach and brand visibility. Dropping them would significantly hurt campaign coverage.

### **Long Tail Channels**
- **Definition:** Lower-reach channels that provide incremental/niche audiences
- **Identification:** Channels in the bottom 30% of cumulative reach contribution
- **Examples:** Regional HD channels, niche genre channels, smaller GECs
- **Optimization Rule:** Can be aggressively optimized, reduced, or dropped entirely
- **Business Rationale:** While individually small, poor-performing long tail channels consume budget that could work harder elsewhere.

---

## 2.2 Optimization Metrics

### **Mode 1: REACH Optimization**

| Attribute | Description |
|-----------|-------------|
| **Formula** | Score = SyncReach (%) |
| **What it measures** | Raw audience coverage percentage |
| **Objective** | Maximize the number of eyeballs/households reached |
| **Best for** | Awareness campaigns, new product launches, mass-market brands |
| **Behavior** | Favors high-reach channels like Star Maa (32%), Zee Telugu (36%), Colors (16%) regardless of impact efficiency |

**Example Ranking (AP Market):**
1. Zee Telugu (36.3% reach) → Score: 36.3
2. Star Maa (32.1% reach) → Score: 32.1
3. Star Maa Movies (30.1% reach) → Score: 30.1

**When to use:** "I want maximum people to see my ad at least once"

---

### **Mode 2: IMPACT/REACH Optimization**

| Attribute | Description |
|-----------|-------------|
| **Formula** | Score = Impact ÷ SyncReach |
| **What it measures** | Impact generated per percentage point of reach |
| **Objective** | Find channels that convert reach into impact most efficiently |
| **Best for** | Performance campaigns, conversion-focused marketing, limited budgets |
| **Behavior** | Rewards "impact-dense" channels - those delivering disproportionate impact relative to their reach |

**Example Ranking (AP Market):**
1. Star Maa Movies (Impact: 224, Reach: 30%) → Score: 7.45
2. Zee Telugu (Impact: 255, Reach: 36%) → Score: 7.02
3. Gemini Music (Impact: 122, Reach: 20%) → Score: 6.21

**Business Insight:** A channel with 10% reach delivering 100 Impact scores HIGHER than a channel with 20% reach delivering 100 Impact. The first channel "converts" its reach more efficiently.

**When to use:** "I want channels that punch above their weight in driving impact"

---

### **Mode 3: IMPACT/COST (Efficiency) Optimization**

| Attribute | Description |
|-----------|-------------|
| **Formula** | Score = (Impact ÷ Cost) × 1,000,000 |
| **What it measures** | Impact generated per Rupee spent |
| **Objective** | Maximize ROI - get most impact for every rupee |
| **Best for** | Cost-conscious campaigns, efficiency-driven planning, proving media ROI |
| **Behavior** | Favors channels with best cost-to-impact ratio; may recommend cheaper FTA channels over premium GECs |

**Example Ranking (AP Market):**
1. Star Maa Music (Impact: 95, Cost: ₹44.5K) → Score: 2,134
2. Star Maa Movies (Impact: 224, Cost: ₹2.46L) → Score: 911
3. NTV Telugu (Impact: 3.9, Cost: ₹4.8K) → Score: 794

**When to use:** "I want maximum impact per rupee spent"

---

## 2.3 Channel Status Tags (Post-Optimization)

| Tag | Symbol | Definition | When Applied |
|-----|--------|------------|--------------|
| **INCREASE** | ↑ | Budget allocation increased | New cost > Original cost by >2% |
| **DECREASE** | ↓ | Budget allocation reduced | New cost < Original cost by >2% |
| **DROPPED** | ✕ | Channel removed from plan | New cost = 0 (Long tail only) |
| **NEW** | ★ | Channel added from competition learning | Not in original Garnier plan, learned from Godrej |
| **UNCHANGED** | — | No significant change | Change within ±2% |

---

## 2.4 Other Key Metrics

| Metric | Definition | Source |
|--------|------------|--------|
| **Impact** | Composite effectiveness score combining reach, frequency, and engagement | SYNC measurement |
| **SyncReach** | Percentage of target universe reached by the channel | SYNC panel data |
| **Cost** | Total advertising spend on the channel | Campaign actuals |
| **GRP (Gross Rating Points)** | Reach × Frequency; standard TV currency | BARC/Industry |
| **OTS (Opportunity to See)** | Average frequency of ad exposure | Campaign data |
| **Impressions** | Total number of ad views (in thousands) | Calculated |

---

# 3. HOW THE OPTIMIZATION WORKS

## 3.1 Step-by-Step Process

```
┌─────────────────────────────────────────────────────────────────┐
│  STEP 1: DATA INGESTION                                         │
│  • Load Garnier campaign data for selected region               │
│  • Load Godrej (competition) data for same region               │
│  • If no Garnier data exists, use Godrej as baseline            │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  STEP 2: CHANNEL CLASSIFICATION                                 │
│  • Sort all channels by SyncReach (descending)                  │
│  • Calculate cumulative reach contribution                      │
│  • Mark top 70%* as SHORT TAIL (protected)                      │
│  • Mark remaining as LONG TAIL (optimizable)                    │
│  * Threshold configurable via slider                            │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  STEP 3: SCORING                                                │
│  • Calculate optimization score for each channel based on       │
│    selected mode (Reach / Impact÷Reach / Impact÷Cost)           │
│  • Rank channels by score                                       │
│  • Identify top tier (top 30%) and bottom tier (bottom 30%)     │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  STEP 4: COMPETITION LEARNING                                   │
│  • Identify Godrej channels NOT in Garnier plan                 │
│  • Score these channels using same optimization metric          │
│  • Select top N high-scoring channels as candidates             │
│  • N increases with optimization intensity                      │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  STEP 5: BUDGET REALLOCATION                                    │
│                                                                 │
│  REDUCE/DROP (Long Tail, Low Score):                            │
│  • Bottom 15% score channels → DROP entirely                    │
│  • Bottom 30% score channels → Reduce by 50-90%                 │
│  • Middle tier channels → Reduce by 25-50%                      │
│                                                                 │
│  PROTECT (Short Tail):                                          │
│  • Low-score short tail → Reduce max 10%                        │
│  • High-score short tail → Can increase up to 10%               │
│                                                                 │
│  INCREASE (High Score):                                         │
│  • Distribute freed budget to top 30% score channels            │
│  • Allocation proportional to score                             │
│  • Include NEW channels from competition learning               │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  STEP 6: CONSTRAINTS & NORMALIZATION                            │
│  • No single channel > 35% of total budget (concentration cap)  │
│  • Maintain minimum 5-7 active channels (diversity)             │
│  • Normalize total to match original budget exactly             │
│  • Tag each channel: INCREASE/DECREASE/DROPPED/NEW              │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  STEP 7: OUTPUT                                                 │
│  • Side-by-side comparison: Old Mix vs New Mix                  │
│  • Projected improvement in Impact, Reach, GRP                  │
│  • Channel-level changes with % change indicators               │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3.2 Business Rules & Guardrails

| Rule | Value | Rationale |
|------|-------|-----------|
| Short Tail Protection | ±10% max change | Preserve mass reach channels |
| Concentration Cap | 35% max per channel | Avoid over-dependence on single channel |
| Minimum Active Channels | 5-7 channels | Ensure portfolio diversification |
| Drop Threshold | Bottom 15% score | Only drop truly underperforming channels |
| Budget Neutrality | 100% of original budget | No additional spend required |

---

# 4. CONTROL PARAMETERS

## 4.1 Optimization Intensity (5% - 30%)

| Setting | Behavior |
|---------|----------|
| **5% (Conservative)** | Minimal changes; slight rebalancing; few/no drops |
| **15% (Moderate)** | Balanced optimization; some drops; moderate reallocation |
| **30% (Aggressive)** | Significant restructuring; multiple drops; new channel additions |

**Impact on results:**
- Higher intensity → More channels dropped
- Higher intensity → More budget shifted to top performers  
- Higher intensity → More NEW channels added from Godrej learning

---

## 4.2 Short Tail Threshold (50% - 90%)

| Setting | Meaning |
|---------|---------|
| **50%** | Only channels in top 50% cumulative reach are protected |
| **70% (Default)** | Top 70% cumulative reach protected |
| **90%** | Almost all channels protected; minimal optimization freedom |

**Impact on results:**
- Lower threshold → Fewer protected channels → More aggressive optimization possible
- Higher threshold → More protected channels → Conservative, incremental changes

---

# 5. INTERPRETING RESULTS

## 5.1 Summary Metrics

| Metric | What it means |
|--------|---------------|
| **Impact Change %** | Projected change in overall campaign impact |
| **Reach Change %** | Projected change in campaign coverage |
| **GRP Change %** | Projected change in total GRPs delivered |
| **Channels Increased** | Number of channels receiving more budget |
| **Channels Decreased** | Number of channels receiving less budget |
| **Channels Dropped** | Number of channels removed (budget → 0) |
| **Channels NEW** | Number of channels added from competition |

---

## 5.2 Channel-Level Output

| Column | Description |
|--------|-------------|
| **Channel** | Channel name |
| **Status** | Tag: INCREASE / DECREASE / DROPPED / NEW |
| **Type** | SHORT TAIL or LONG TAIL classification |
| **Genre** | Channel genre (GEC, Movies, News, etc.) |
| **Reach %** | Channel's SyncReach percentage |
| **Score** | Optimization score based on selected metric |
| **Old Cost** | Original budget allocation |
| **Old %** | Original budget share percentage |
| **New Cost** | Recommended budget allocation |
| **New %** | Recommended budget share percentage |
| **Change** | Percentage change in allocation |

---

# 6. USE CASES & RECOMMENDATIONS

## 6.1 When to use REACH mode

✅ New product launches requiring mass awareness  
✅ Brand campaigns prioritizing coverage  
✅ Categories with low involvement (FMCG staples)  
✅ When share of voice is the primary KPI

## 6.2 When to use IMPACT/REACH mode

✅ Performance marketing campaigns  
✅ Limited budgets seeking maximum efficiency  
✅ Mature brands optimizing existing plans  
✅ When ROI on reach matters more than reach itself

## 6.3 When to use IMPACT/COST mode

✅ Strict ROI mandates from management  
✅ Testing new channels before scaling  
✅ Cost-reduction exercises  
✅ Proving media effectiveness to finance teams

---

# 7. COMPETITIVE LEARNING FEATURE

## How it works:

1. **Identify Gap Channels:** Find channels where Godrej advertises but Garnier doesn't
2. **Score These Channels:** Apply same optimization metric to score them
3. **Recommend Top Performers:** Suggest adding high-scoring gap channels
4. **Allocate Budget:** Redistribute freed budget (from dropped channels) to new additions

## Business Value:

- Learn from competition's media strategy
- Discover untapped channel opportunities
- Benchmark against category leader
- Avoid "blind spots" in media planning

---

# 8. LIMITATIONS & CAVEATS

| Limitation | Mitigation |
|------------|------------|
| Historical data based | Use as directional guide, not absolute truth |
| Assumes linear relationships | Results are projections, not guarantees |
| Channel inventory availability not considered | Validate feasibility with media buying team |
| Doesn't account for creative/copy differences | Impact assumes consistent creative quality |
| Regional data may have sample size variations | Cross-validate with BARC data |

---

# 9. GLOSSARY

| Term | Definition |
|------|------------|
| **SYNC** | Cross-media measurement platform providing unified view of TV + Digital |
| **SyncReach** | Deduplicated reach measured by SYNC panel |
| **Impact** | SYNC's composite effectiveness metric |
| **Short Tail** | High-reach channels forming campaign backbone |
| **Long Tail** | Lower-reach channels providing incremental audiences |
| **FTA** | Free-to-Air channels (DD, Dangal, Colors Rishtey, etc.) |
| **GEC** | General Entertainment Channel |
| **HSM** | Hindi Speaking Markets |
| **Cost Share** | Percentage of total budget allocated to a channel |

---

# 10. CONTACT & SUPPORT

For questions about the methodology or tool:
- **Analytics Team:** [Contact Details]
- **SYNC Platform Support:** [Contact Details]

---

*Document Version: 2.0 | Last Updated: December 2024*
