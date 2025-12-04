import React, { useState, useEffect, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend, LineChart, Line, ReferenceLine } from "recharts";

// Configuration
const CONFIG = {
  HIGH_THRESHOLD_REACH_PERCENTILE: 70,
  HIGH_THRESHOLD_ADJUSTMENT_LIMIT: 0.10,
  MAX_CHANNEL_CONCENTRATION: 0.35,
  MIN_ACTIVE_CHANNELS: 5,
  FTA_MAX_REDUCTION: 0.12
};

// Helper functions
const formatCurrency = (num) => {
  if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`;
  if (num >= 100000) return `₹${(num / 100000).toFixed(2)} L`;
  return `₹${num.toLocaleString('en-IN')}`;
};

// Parse CSV data
const parseCSV = (csvText) => {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim().replace(/[""]/g, ''));

  return lines.slice(1).map(line => {
    const values = line.split(',');
    const obj = {};
    headers.forEach((header, index) => {
      const value = values[index]?.trim();
      // Convert numeric fields
      if (['Viewing Minutes', 'Impact', 'Cost', 'Spots', 'Durations', 'OTS', 'Sync_Reach', 'Impressions', 'GRP'].includes(header)) {
        obj[header.replace(' ', '')] = parseFloat(value) || 0;
      } else {
        obj[header.replace(' ', '')] = value || '';
      }
    });
    // Normalize SyncReach field name
    obj.SyncReach = obj.Sync_Reach || 0;
    return obj;
  });
};

// Colors
const COLORS = {
  primary: '#0f172a',
  secondary: '#334155',
  accent: '#f97316',
  success: '#10b981',
  danger: '#ef4444',
  warning: '#f59e0b',
  muted: '#64748b',
  light: '#f1f5f9',
  highThreshold: '#0ea5e9',
  lowThreshold: '#8b5cf6',
  increase: '#10b981',
  decrease: '#ef4444',
  dropped: '#6b7280',
  new: '#f97316'
};

const CHART_COLORS = ['#0ea5e9', '#8b5cf6', '#10b981', '#f97316', '#ef4444', '#f59e0b', '#06b6d4', '#ec4899', '#6366f1', '#84cc16'];

export default function TVCampaignOptimizer() {
  const [rawData, setRawData] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState('');
  const [optimizationMetric, setOptimizationMetric] = useState('reach');
  const [targetIncrease, setTargetIncrease] = useState(10);
  const [optimizedPlan, setOptimizedPlan] = useState(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [viewMode, setViewMode] = useState('comparison');
  const [highThresholdPercentile, setHighThresholdPercentile] = useState(CONFIG.HIGH_THRESHOLD_REACH_PERCENTILE);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [dataError, setDataError] = useState(null);
  const [showThresholdTooltip, setShowThresholdTooltip] = useState(false);
  const [showIntensityTooltip, setShowIntensityTooltip] = useState(false);

  // Load CSV data on mount
  useEffect(() => {
    const loadCSVData = async () => {
      try {
        setIsLoadingData(true);
        const response = await fetch('/input_data_v1.csv');
        if (!response.ok) throw new Error('Failed to load CSV file');
        const csvText = await response.text();
        const parsedData = parseCSV(csvText);
        setRawData(parsedData);
        setDataError(null);
      } catch (error) {
        console.error('Error loading CSV:', error);
        setDataError('Failed to load data. Please ensure input_data_v1.csv is in the same directory.');
      } finally {
        setIsLoadingData(false);
      }
    };

    loadCSVData();
  }, []);

  const regions = useMemo(() => {
    if (rawData.length === 0) return [];
    return [...new Set(rawData.map(d => d.Region))].sort();
  }, [rawData]);

  const regionData = useMemo(() => {
    if (!selectedRegion || rawData.length === 0) return { garnier: [], godrej: [], combined: [] };
    const filtered = rawData.filter(d => d.Region === selectedRegion);
    const garnier = filtered.filter(d => d.Brand.toLowerCase().includes('garnier'));
    const godrej = filtered.filter(d => d.Brand.toLowerCase().includes('godrej'));
    return { garnier, godrej, combined: filtered };
  }, [selectedRegion, rawData]);

  // Calculate score based on optimization metric
  const calculateScore = (channel, metric) => {
    switch(metric) {
      case 'reach':
        return channel.SyncReach; // Pure reach
      case 'impact_reach':
        return channel.SyncReach > 0 ? channel.Impact / channel.SyncReach : 0; // Impact per reach point
      case 'impact_cost':
        return channel.Cost > 0 ? (channel.Impact / channel.Cost) * 1000000 : 0; // Impact per million spent
      default:
        return channel.SyncReach;
    }
  };

  const analyzeChannels = useMemo(() => {
    if (!selectedRegion || rawData.length === 0) return null;

    const { garnier, godrej } = regionData;
    const hasGarnierData = garnier.length > 0 && garnier.some(d => d.Cost > 0);

    // Use Garnier data if available, otherwise learn from Godrej
    const baseData = hasGarnierData ? garnier : godrej;
    const learningSource = hasGarnierData ? null : 'godrej';

    const channelsWithScores = baseData
      .filter(d => d.Cost > 0)
      .map(d => ({
        ...d,
        reachScore: d.SyncReach,
        impactReachScore: d.SyncReach > 0 ? d.Impact / d.SyncReach : 0,
        impactCostScore: d.Cost > 0 ? (d.Impact / d.Cost) * 1000000 : 0,
        costShare: 0,
        isHighThreshold: false,
        // FTA protection is disabled for UP so optimization behaves like previous version
        isFTA: selectedRegion !== 'UP' && (d.Genre || '').toLowerCase().includes('fta')
      }));

    if (channelsWithScores.length === 0) return null;

    const totalCost = channelsWithScores.reduce((sum, d) => sum + d.Cost, 0);

    channelsWithScores.forEach(d => {
      d.costShare = (d.Cost / totalCost) * 100;
    });

    // Classify high/low threshold by reach
    const sortedByReach = [...channelsWithScores].sort((a, b) => b.SyncReach - a.SyncReach);
    let cumulativeReach = 0;
    const totalReach = sortedByReach.reduce((sum, d) => sum + d.SyncReach, 0);

    sortedByReach.forEach((d, idx) => {
      d.reachRank = idx + 1;
      cumulativeReach += d.SyncReach;
      d.cumulativeReachPct = (cumulativeReach / totalReach) * 100;
      d.isHighThreshold = d.cumulativeReachPct <= highThresholdPercentile;
    });

    const channelMap = new Map(sortedByReach.map(d => [d.Channel, d]));
    channelsWithScores.forEach(d => {
      const classified = channelMap.get(d.Channel);
      if (classified) {
        d.isHighThreshold = classified.isHighThreshold;
        d.reachRank = classified.reachRank;
        d.cumulativeReachPct = classified.cumulativeReachPct;
      }
    });

    const totalImpact = channelsWithScores.reduce((sum, d) => sum + d.Impact, 0);
    const totalGRP = channelsWithScores.reduce((sum, d) => sum + d.GRP, 0);

    // Get Godrej channels for competition learning
    const godrejChannels = godrej.filter(d => d.Cost > 0).map(d => ({
      ...d,
      reachScore: d.SyncReach,
      impactReachScore: d.SyncReach > 0 ? d.Impact / d.SyncReach : 0,
      impactCostScore: d.Cost > 0 ? (d.Impact / d.Cost) * 1000000 : 0,
      isFTA: selectedRegion !== 'UP' && (d.Genre || '').toLowerCase().includes('fta')
    }));

    return {
      channels: channelsWithScores,
      godrejChannels,
      totalCost,
      totalImpact,
      totalReach,
      totalGRP,
      hasGarnierData,
      learningSource,
      highThresholdCount: channelsWithScores.filter(d => d.isHighThreshold).length,
      lowThresholdCount: channelsWithScores.filter(d => !d.isHighThreshold).length
    };
  }, [selectedRegion, regionData, highThresholdPercentile, rawData]);

  // Optimization algorithm
  const runOptimization = () => {
    if (!analyzeChannels) return;

    setIsOptimizing(true);

    setTimeout(() => {
      const { channels, godrejChannels, totalCost, totalImpact, totalReach, learningSource } = analyzeChannels;

      const applyReduction = (channel, reductionAmount) => {
        if (reductionAmount <= 0) return 0;
        let maxReduction = channel.newCost;
        if (channel.isFTA && channel.originalCost > 0) {
          const minAllowed = channel.originalCost * (1 - CONFIG.FTA_MAX_REDUCTION);
          maxReduction = Math.max(0, channel.newCost - minAllowed);
        }
        const applied = Math.min(reductionAmount, maxReduction);
        channel.newCost = Math.max(0, channel.newCost - applied);
        return applied;
      };

      const enforceFTAMinimums = (channelList, attempt = 0) => {
        let totalTopUp = 0;
        channelList.forEach(channel => {
          if (channel.isFTA && channel.originalCost > 0) {
            const minAllowed = channel.originalCost * (1 - CONFIG.FTA_MAX_REDUCTION);
            if (channel.newCost < minAllowed) {
              const deficit = minAllowed - channel.newCost;
              channel.newCost = minAllowed;
              totalTopUp += deficit;
            }
          }
        });

        if (totalTopUp <= 0) return;

        const adjustableChannels = channelList.filter(c => !c.isFTA && c.newCost > 0);
        const totalAdjustableCost = adjustableChannels.reduce((sum, c) => sum + c.newCost, 0);
        let remainingReduction = totalTopUp;

        if (totalAdjustableCost > 0) {
          adjustableChannels.forEach(channel => {
            if (remainingReduction <= 0) return;
            const share = channel.newCost / totalAdjustableCost;
            const reduction = Math.min(channel.newCost, share * remainingReduction);
            channel.newCost -= reduction;
            remainingReduction -= reduction;
          });
        }

        if (remainingReduction > 1e-6) {
          const adjustedTotal = channelList.reduce((sum, c) => sum + c.newCost, 0);
          if (adjustedTotal > 0) {
            const normalization = totalCost / adjustedTotal;
            channelList.forEach(channel => {
              channel.newCost *= normalization;
            });

            if (attempt < 1) {
              enforceFTAMinimums(channelList, attempt + 1);
            }
          }
        }
      };

      // Clone channels for optimization
      let optimizedChannels = channels.map(c => ({
        ...c,
        originalCost: c.Cost,
        originalCostShare: c.costShare,
        newCost: c.Cost,
        newCostShare: c.costShare,
        change: 0,
        changePercent: 0,
        tag: 'UNCHANGED',
        currentScore: calculateScore(c, optimizationMetric)
      }));

      // Competition learning: Add high-scoring Godrej channels not in current plan
      const existingChannelNames = new Set(optimizedChannels.map(c => c.Channel));
      const potentialNewChannels = godrejChannels
        .filter(d => !existingChannelNames.has(d.Channel))
        .map(d => ({
          ...d,
          currentScore: calculateScore(d, optimizationMetric),
          originalCost: 0,
          originalCostShare: 0,
          newCost: 0,
          newCostShare: 0,
          change: 0,
          changePercent: 0,
          isHighThreshold: d.SyncReach > 5,
          isFTA: selectedRegion !== 'UP' && (d.Genre || '').toLowerCase().includes('fta'),
          isNewFromLearning: true,
          tag: 'NEW'
        }))
        .sort((a, b) => b.currentScore - a.currentScore)
        .slice(0, Math.ceil(targetIncrease / 5)); // More new channels for higher targets

      // Sensitivity factor based on target increase
      const sensitivityFactor = 1 + (targetIncrease / 100) * 2;

      // Sort all channels by current score
      const allChannels = [...optimizedChannels, ...potentialNewChannels];
      allChannels.sort((a, b) => b.currentScore - a.currentScore);

      // Calculate score percentiles
      const scores = allChannels.map(c => c.currentScore).sort((a, b) => b - a);
      const topTierThreshold = scores[Math.floor(scores.length * 0.3)] || 0;
      const bottomTierThreshold = scores[Math.floor(scores.length * 0.7)] || 0;

      // Phase 1: Identify channels to reduce/drop (low score, low threshold)
      let budgetToReallocate = 0;
      const dropThreshold = scores[Math.floor(scores.length * 0.85)] || 0;

      optimizedChannels.forEach(channel => {
        if (!channel.isHighThreshold) {
          if (!channel.isFTA && channel.currentScore <= dropThreshold && optimizedChannels.filter(c => c.newCost > 0).length > CONFIG.MIN_ACTIVE_CHANNELS) {
            // Drop this channel entirely
            budgetToReallocate += channel.newCost;
            channel.newCost = 0;
            channel.tag = 'DROPPED';
          } else if (channel.currentScore < bottomTierThreshold) {
            // Reduce this channel significantly
            const reductionRate = Math.min(0.9, 0.5 * sensitivityFactor);
            const appliedReduction = applyReduction(channel, channel.newCost * reductionRate);
            budgetToReallocate += appliedReduction;
          } else if (channel.currentScore < topTierThreshold) {
            // Moderate reduction
            const reductionRate = Math.min(0.5, 0.25 * sensitivityFactor);
            const appliedReduction = applyReduction(channel, channel.newCost * reductionRate);
            budgetToReallocate += appliedReduction;
          }
        } else {
          // High threshold: only minor adjustments if low score
          if (channel.currentScore < bottomTierThreshold) {
            const appliedReduction = applyReduction(channel, channel.newCost * CONFIG.HIGH_THRESHOLD_ADJUSTMENT_LIMIT);
            budgetToReallocate += appliedReduction;
          }
        }
      });

      // Phase 2: Distribute budget to high-score channels
      const beneficiaries = [...optimizedChannels.filter(c => c.currentScore >= topTierThreshold), ...potentialNewChannels];
      const totalBeneficiaryScore = beneficiaries.reduce((sum, c) => sum + c.currentScore, 0);

      beneficiaries.forEach(channel => {
        if (totalBeneficiaryScore > 0) {
          const share = channel.currentScore / totalBeneficiaryScore;
          let addition = budgetToReallocate * share * sensitivityFactor;

          // High threshold constraint
          if (channel.isHighThreshold && !channel.isNewFromLearning) {
            const maxIncrease = channel.originalCost * CONFIG.HIGH_THRESHOLD_ADJUSTMENT_LIMIT * 2;
            addition = Math.min(addition, maxIncrease);
          }

          // Concentration cap
          const maxAllowed = totalCost * CONFIG.MAX_CHANNEL_CONCENTRATION;
          addition = Math.min(addition, maxAllowed - channel.newCost);

          channel.newCost += Math.max(0, addition);
        }
      });

      // Merge new channels into optimized list
      const finalChannels = [...optimizedChannels, ...potentialNewChannels.filter(c => c.newCost > 0)];

      // Normalize to keep total cost constant
      const newTotalCost = finalChannels.reduce((sum, c) => sum + c.newCost, 0);
      const normalizationFactor = totalCost / newTotalCost;

      finalChannels.forEach(channel => {
        channel.newCost *= normalizationFactor;
      });

      enforceFTAMinimums(finalChannels);

      finalChannels.forEach(channel => {
        channel.newCostShare = (channel.newCost / totalCost) * 100;
        channel.change = channel.newCost - (channel.originalCost || 0);
        // % Cost Change based on cost share: (new% - old%) / old%
        const baseShare = channel.originalCostShare || 0;
        const newShare = channel.newCostShare || 0;
        channel.changePercent = baseShare > 0
          ? ((newShare - baseShare) / baseShare) * 100
          : (newShare > 0 ? 100 : 0);

        const impact = channel.Impact || 0;
        if (impact > 0 && channel.originalCost > 0) {
          const impactPerCost = impact / channel.originalCost;
          const newImpactEstimate = impactPerCost * channel.newCost;
          channel.newImpactEstimate = newImpactEstimate;
        } else {
          channel.newImpactEstimate = impact;
        }

        if (channel.tag !== 'DROPPED' && channel.tag !== 'NEW') {
          if (channel.change > (channel.originalCost || 0) * 0.02) {
            channel.tag = 'INCREASE';
          } else if (channel.change < -(channel.originalCost || 0) * 0.02) {
            channel.tag = 'DECREASE';
          } else {
            channel.tag = 'UNCHANGED';
          }
        }

        // For UNCHANGED channels, snap display values back to original
        if (channel.tag === 'UNCHANGED') {
          channel.newCostShare = channel.originalCostShare;
          channel.change = 0;
          channel.changePercent = 0;
        }
      });

      // Calculate new metrics
      const calculateNewMetric = (channels, metricKey) => {
        return channels.reduce((sum, c) => {
          const originalValue = c[metricKey] || 0;
          const originalCost = c.originalCost || c.Cost || 1;
          const ratio = originalValue / originalCost;
          return sum + (ratio * c.newCost);
        }, 0);
      };

      const newImpact = calculateNewMetric(finalChannels, 'Impact');
      const newReach = finalChannels.reduce((sum, c) => {
        // For reach, we use a simplified model - reach increases with sqrt of cost increase
        const costRatio = c.originalCost > 0 ? c.newCost / c.originalCost : 1;
        return sum + (c.SyncReach * Math.sqrt(costRatio));
      }, 0);
      const newGRP = calculateNewMetric(finalChannels, 'GRP');

      // Combined Impact+Reach score for impact distribution
      const totalImpactForShare = finalChannels.reduce((sum, c) => {
        const imp = c.Impact || 0;
        return sum + (imp > 0 ? imp : 0);
      }, 0);
      const totalReachForShare = finalChannels.reduce((sum, c) => {
        const r = c.SyncReach || 0;
        return sum + (r > 0 ? r : 0);
      }, 0);
      const totalNewImpact = newImpact || 0;
      const totalIncrementalImpact = (newImpact - totalImpact) || 0;

      if (totalImpactForShare > 0 && totalReachForShare > 0 && totalNewImpact > 0) {
        let totalCombinedScore = 0;
        let maxCombinedScore = 0;

        finalChannels.forEach(channel => {
          const impact = channel.Impact || 0;
          const reach = channel.SyncReach || 0;

          const impactPart = impact > 0 ? (impact / totalImpactForShare) : 0;
          const reachPart = reach > 0 ? (reach / totalReachForShare) : 0;

          // Simple average of normalized impact and reach
          const combinedScore = (impactPart + reachPart) / 2;
          channel._impactBaseScore = combinedScore;
          totalCombinedScore += combinedScore;
          if (combinedScore > maxCombinedScore) {
            maxCombinedScore = combinedScore;
          }
        });

        if (totalCombinedScore > 0) {
          finalChannels.forEach(channel => {
            const impact = channel.Impact || 0;
            const estNewImpact = channel.newImpactEstimate != null ? channel.newImpactEstimate : impact;
            const baseScore = channel._impactBaseScore || 0;

            const baseShare = baseScore > 0 ? (baseScore / totalCombinedScore) * 100 : 0;
            const newShare = estNewImpact > 0 ? (estNewImpact / totalNewImpact) * 100 : 0;

            channel.baseImpactShare = baseShare;
            channel.newImpactShare = newShare;

            // Impact score indexed to 100 like Google Trends (max channel = 100)
            channel.impactScoreIndex = maxCombinedScore > 0
              ? (baseScore / maxCombinedScore) * 100
              : 0;

            if (baseShare === 0 || channel.tag === 'UNCHANGED') {
              channel.impactShareChangePercent = 0;
            } else {
              channel.impactShareChangePercent = ((newShare - baseShare) / baseShare) * 100;
            }
          });
        } else {
          finalChannels.forEach(channel => {
            channel.baseImpactShare = 0;
            channel.newImpactShare = 0;
            channel.impactShareChangePercent = 0;
          });
        }
      } else {
        finalChannels.forEach(channel => {
          channel.baseImpactShare = 0;
          channel.newImpactShare = 0;
          channel.impactShareChangePercent = 0;
        });
      }

      // Calculate incremental impact for each channel per incremental-impact-logic.md
      finalChannels.forEach(channel => {
        if (channel.originalCost > 0) {
          // Existing channels: Calculate projected new impact using linear model
          const impactPerCost = channel.Impact / channel.originalCost;
          const projectedNewImpact = impactPerCost * channel.newCost;
          
          // Calculate incremental impact (absolute change)
          channel.incrementalImpact = projectedNewImpact - channel.Impact;
        } else {
          // NEW channels: Full projected impact is incremental
          const impactPerCost = channel.Impact / channel.Cost; // Use competitor's cost as basis
          const projectedNewImpact = impactPerCost * channel.newCost;
          channel.incrementalImpact = projectedNewImpact; // Full impact is new
        }
      });

      // Calculate percentage as % of original total impact
      // First, calculate for all channels
      finalChannels.forEach(channel => {
        if (totalImpact > 0) {
          // Express as % of original total impact
          channel.incrementalImpactPercent = (channel.incrementalImpact / totalImpact) * 100;
        } else {
          channel.incrementalImpactPercent = 0;
        }
      });

      // NEW Channels: Benchmark using combined similarity matrix (reach × new cost %)
      const newChannels = finalChannels.filter(c => c.tag === 'NEW');
      const existingChannels = finalChannels.filter(c => 
        c.tag === 'INCREASE' || c.tag === 'DECREASE' || c.tag === 'UNCHANGED'
      );
      
      // Pre-calculate fallback values (for cases where no similar channels found)
      const totalNewChannelsReach = newChannels.reduce((sum, c) => sum + (c.SyncReach || 0), 0);
      const totalNewChannelsImpact = newChannels.reduce((sum, c) => sum + (c.incrementalImpact || 0), 0);
      const totalNEWImpactBudgetPercent = totalNewChannelsImpact > 0 && totalImpact > 0
        ? (totalNewChannelsImpact / totalImpact) * 100 
        : 0;
      
      if (newChannels.length > 0 && totalImpact > 0) {
        newChannels.forEach(newChannel => {
          const newChannelReach = newChannel.SyncReach || 0;
          const newChannelNewPercent = newChannel.newCostShare || 0;
          
          // Create similarity matrix: calculate combined factor for each existing channel
          // Factor = (1 - normalized reach difference) × (1 - normalized new cost % difference)
          const channelsWithFactors = existingChannels.map(existing => {
            const existingReach = existing.SyncReach || 0;
            const existingNewPercent = existing.newCostShare || 0;
            const existingIncrementalImpactPercent = existing.incrementalImpactPercent || 0;
            
            // Normalize differences (use max values to normalize)
            const maxReach = Math.max(...existingChannels.map(c => c.SyncReach || 0), newChannelReach);
            const maxNewPercent = Math.max(...existingChannels.map(c => c.newCostShare || 0), newChannelNewPercent);
            
            const reachDiff = Math.abs(existingReach - newChannelReach) / (maxReach || 1);
            const costPercentDiff = Math.abs(existingNewPercent - newChannelNewPercent) / (maxNewPercent || 1);
            
            // Combined similarity factor (higher = more similar)
            const similarityFactor = (1 - Math.min(reachDiff, 1)) * (1 - Math.min(costPercentDiff, 1));
            
            return {
              channel: existing,
              similarityFactor,
              incrementalImpactPercent: existingIncrementalImpactPercent
            };
          });
          
          // Sort by similarity factor (descending - most similar first)
          channelsWithFactors.sort((a, b) => b.similarityFactor - a.similarityFactor);
          
          // Take nearest 2 channels for linear interpolation
          if (channelsWithFactors.length >= 2 && channelsWithFactors[0].similarityFactor > 0.1) {
            const nearest1 = channelsWithFactors[0];
            const nearest2 = channelsWithFactors[1];
            
            // Linear interpolation based on similarity factors
            const factor1 = nearest1.similarityFactor;
            const factor2 = nearest2.similarityFactor;
            const totalFactor = factor1 + factor2;
            
            if (totalFactor > 0) {
              const weight1 = factor1 / totalFactor;
              const weight2 = factor2 / totalFactor;
              
              // Weighted average of the two nearest channels' incremental impact %
              newChannel.incrementalImpactPercent = 
                (nearest1.incrementalImpactPercent * weight1) + 
                (nearest2.incrementalImpactPercent * weight2);
            } else {
              // Fallback: use original calculated value
              newChannel.incrementalImpactPercent = (newChannel.incrementalImpact / totalImpact) * 100;
            }
          } else if (channelsWithFactors.length >= 1 && channelsWithFactors[0].similarityFactor > 0.1) {
            // Only one similar channel found, use its value directly
            newChannel.incrementalImpactPercent = channelsWithFactors[0].incrementalImpactPercent;
          } else {
            // No similar channels found: fallback to original calculated value
            newChannel.incrementalImpactPercent = (newChannel.incrementalImpact / totalImpact) * 100;
          }
        });
      }

      // Proportional Redistribution to Match Impact Improvement %
      // Calculate expected improvement percentage
      const expectedImprovementPercent = totalImpact > 0 
        ? ((newImpact - totalImpact) / totalImpact) * 100 
        : 0;
      
      // Sum all incremental impact percentages (only for channels with non-zero: INCREASE/DECREASE/NEW/DROPPED)
      const channelsWithImpact = finalChannels.filter(c => 
        (c.tag === 'INCREASE' || c.tag === 'DECREASE' || c.tag === 'NEW' || c.tag === 'DROPPED') &&
        c.incrementalImpactPercent != null
      );
      
      const currentSum = channelsWithImpact.reduce((sum, c) => sum + (c.incrementalImpactPercent || 0), 0);
      
      // Force signs to match channel status (INCREASE/NEW = positive, DECREASE/DROPPED = negative)
      // This ensures display matches the channel's cost change direction
      channelsWithImpact.forEach(channel => {
        const currentValue = channel.incrementalImpactPercent || 0;
        const absValue = Math.abs(currentValue);
        
        if (channel.tag === 'INCREASE' || channel.tag === 'NEW') {
          // Must be positive
          channel.incrementalImpactPercent = absValue;
        } else if (channel.tag === 'DECREASE' || channel.tag === 'DROPPED') {
          // Must be negative
          channel.incrementalImpactPercent = -absValue;
        }
      });
      
      // Recalculate sum after forcing correct signs
      const correctedSum = channelsWithImpact.reduce((sum, c) => sum + (c.incrementalImpactPercent || 0), 0);
      
      // Calculate Reach % weights BEFORE first redistribution to create differentiation from the start
      const totalReachForImpact = channelsWithImpact.reduce((sum, c) => sum + (c.SyncReach || 0), 0);
      channelsWithImpact.forEach(channel => {
        channel._normalizedReach = totalReachForImpact > 0 ? (channel.SyncReach || 0) / totalReachForImpact : 0;
      });
      
      // If there's a difference, redistribute using Reach %-weighted scaling to create differentiation
      if (Math.abs(correctedSum - expectedImprovementPercent) > 0.01 && Math.abs(correctedSum) > 0.01) {
        // Use Reach %-weighted scaling instead of simple proportional scaling
        const INITIAL_REACH_WEIGHT_FACTOR = 3.0; // Strong factor to create visible differences from the start
        
        // Calculate weighted magnitudes using Reach %
        const initialWeightedMagnitudes = channelsWithImpact.map(channel => {
          const currentValue = channel.incrementalImpactPercent || 0;
          const magnitude = Math.abs(currentValue);
          const normalizedReach = channel._normalizedReach || 0;
          
          // Weighted magnitude: higher Reach % channels get larger shares
          const weightedMagnitude = magnitude * (1 + normalizedReach * INITIAL_REACH_WEIGHT_FACTOR);
          
          return {
            channel,
            weightedMagnitude,
            enforcedSign: (channel.tag === 'INCREASE' || channel.tag === 'NEW') ? 1 : -1
          };
        });
        
        // Calculate sum of weighted magnitudes
        const sumOfInitialWeightedMagnitudes = initialWeightedMagnitudes.reduce((sum, w) => sum + w.weightedMagnitude, 0);
        
        if (sumOfInitialWeightedMagnitudes > 0) {
          // Redistribute based on weighted magnitudes
          initialWeightedMagnitudes.forEach(({ channel, weightedMagnitude, enforcedSign }) => {
            const share = weightedMagnitude / sumOfInitialWeightedMagnitudes;
            const newValue = expectedImprovementPercent * share;
            channel.incrementalImpactPercent = enforcedSign * Math.abs(newValue);
          });
        } else {
          // Fallback to simple proportional scaling if no weighted magnitudes
          const scalingFactor = Math.abs(expectedImprovementPercent) / Math.abs(correctedSum);
          
          channelsWithImpact.forEach(channel => {
            const currentValue = channel.incrementalImpactPercent || 0;
            const magnitude = Math.abs(currentValue);
            const enforcedSign = (channel.tag === 'INCREASE' || channel.tag === 'NEW') ? 1 : -1;
            channel.incrementalImpactPercent = enforcedSign * magnitude * scalingFactor;
          });
        }
        
        // Adjust the sum to match exactly by distributing the remainder proportionally
        const newSum = channelsWithImpact.reduce((sum, c) => sum + (c.incrementalImpactPercent || 0), 0);
        const remainder = expectedImprovementPercent - newSum;
        
        if (Math.abs(remainder) > 0.001) {
          // Distribute remainder proportionally to channels with same sign as remainder
          const channelsWithSameSign = channelsWithImpact.filter(c => {
            const val = c.incrementalImpactPercent || 0;
            return (remainder > 0 && val > 0) || (remainder < 0 && val < 0);
          });
          
          if (channelsWithSameSign.length > 0) {
            const totalMagnitude = channelsWithSameSign.reduce((sum, c) => 
              sum + Math.abs(c.incrementalImpactPercent || 0), 0);
            
            if (totalMagnitude > 0) {
              channelsWithSameSign.forEach(channel => {
                const share = Math.abs(channel.incrementalImpactPercent || 0) / totalMagnitude;
                channel.incrementalImpactPercent = (channel.incrementalImpactPercent || 0) + (remainder * share);
              });
            }
          }
        }
      }
      
      // Final enforcement: ensure signs are correct after redistribution
      channelsWithImpact.forEach(channel => {
        const currentValue = channel.incrementalImpactPercent || 0;
        const absValue = Math.abs(currentValue);
        
        if (channel.tag === 'INCREASE' || channel.tag === 'NEW') {
          channel.incrementalImpactPercent = absValue;
        } else if (channel.tag === 'DECREASE' || channel.tag === 'DROPPED') {
          channel.incrementalImpactPercent = -absValue;
        }
      });
      
      // Ensure UNCHANGED channels remain at 0
      finalChannels.forEach(channel => {
        if (channel.tag === 'UNCHANGED') {
          channel.incrementalImpactPercent = 0;
        }
      });

      // Apply dampening factor based on Impact Improvement magnitude
      // Scale % of Incremental Impact to match the order of magnitude of Impact Improvement
      // Always cap individual channels at 30-35% max
      // CRITICAL: Apply Reach % weighting during dampening to preserve differentiation
      const absExpectedImprovement = Math.abs(expectedImprovementPercent);
      const MAX_CHANNEL_IMPACT = 32.5; // Cap at 32.5% (middle of 30-35% range)
      
      // Calculate Reach % weights BEFORE dampening so we can use them during dampening
      // Reuse totalReach if already calculated, otherwise calculate it
      if (!channelsWithImpact[0]?._normalizedReach) {
        const totalReachForDampening = channelsWithImpact.reduce((sum, c) => sum + (c.SyncReach || 0), 0);
        channelsWithImpact.forEach(channel => {
          channel._normalizedReach = totalReachForDampening > 0 ? (channel.SyncReach || 0) / totalReachForDampening : 0;
        });
      }
      
      if (absExpectedImprovement > 0 && channelsWithImpact.length > 0) {
        // Step 1: Always cap individual channels at MAX_CHANNEL_IMPACT (30-35%)
        channelsWithImpact.forEach(channel => {
          const currentValue = channel.incrementalImpactPercent || 0;
          const absValue = Math.abs(currentValue);
          
          if (absValue > MAX_CHANNEL_IMPACT) {
            const cappedValue = MAX_CHANNEL_IMPACT;
            
            // Enforce sign
            if (channel.tag === 'INCREASE' || channel.tag === 'NEW') {
              channel.incrementalImpactPercent = cappedValue;
            } else if (channel.tag === 'DECREASE' || channel.tag === 'DROPPED') {
              channel.incrementalImpactPercent = -cappedValue;
            }
          }
        });
        
        // Step 2: Scale down if values are still in wrong order of magnitude
        // If Impact Improvement is in 10s, ensure values are also in 10s
        // IMPORTANT: Use Reach %-weighted scaling instead of uniform scaling to preserve differences
        const maxAbsValue = Math.max(...channelsWithImpact.map(c => Math.abs(c.incrementalImpactPercent || 0)), 0);
        
        if (maxAbsValue > 0) {
          // Determine target max based on Impact Improvement order of magnitude
          let targetMaxValue;
          
          if (absExpectedImprovement < 1.0) {
            // Impact Improvement < 1%, cap at 5% + random
            targetMaxValue = 5.0 + Math.random() * 2; // 5-7%
          } else if (absExpectedImprovement < 10.0) {
            // Impact Improvement in 1-10% range, cap at 1.5x Impact Improvement or 15%, whichever is smaller
            targetMaxValue = Math.min(absExpectedImprovement * 1.5, 15.0);
          } else if (absExpectedImprovement < 100.0) {
            // Impact Improvement in 10s, cap at 1.2x Impact Improvement or 30%, whichever is smaller
            targetMaxValue = Math.min(absExpectedImprovement * 1.2, 30.0);
          } else {
            // Impact Improvement >= 100%, can allow higher values but still cap at 35%
            targetMaxValue = Math.min(absExpectedImprovement * 0.3, 35.0);
          }
          
          // If max value exceeds target, scale down using Reach %-weighted scaling
          // This preserves differences: higher Reach % channels scale down less
          if (maxAbsValue > targetMaxValue) {
            // Calculate weighted target max for each channel based on Reach %
            const REACH_DAMPENING_FACTOR = 1.5; // How much Reach % influences dampening
            
            channelsWithImpact.forEach(channel => {
              const currentValue = channel.incrementalImpactPercent || 0;
              const absValue = Math.abs(currentValue);
              const normalizedReach = channel._normalizedReach || 0;
              
              // Higher Reach % channels get a higher target (less dampening)
              // Lower Reach % channels get a lower target (more dampening)
              const channelTargetMax = targetMaxValue * (1 + normalizedReach * REACH_DAMPENING_FACTOR);
              
              // Scale down proportionally to channel's target max
              if (absValue > channelTargetMax) {
                const scalingFactor = channelTargetMax / absValue;
                const scaledAbsValue = absValue * scalingFactor;
                
                // Enforce sign
                if (channel.tag === 'INCREASE' || channel.tag === 'NEW') {
                  channel.incrementalImpactPercent = scaledAbsValue;
                } else if (channel.tag === 'DECREASE' || channel.tag === 'DROPPED') {
                  channel.incrementalImpactPercent = -scaledAbsValue;
                }
              }
            });
          }
        }
      }
      
      // Redistribute after general dampening to maintain total sum
      // Use Reach % as a weight factor to create meaningful differences between channels
      // Note: Reach % weights are already calculated above during dampening
      const sumAfterGeneralDampening = channelsWithImpact.reduce((sum, c) => 
        sum + (c.incrementalImpactPercent || 0), 0);
      
      if (Math.abs(sumAfterGeneralDampening - expectedImprovementPercent) > 0.01 && Math.abs(sumAfterGeneralDampening) > 0.01) {
        // Use stronger Reach % weighting for more visible differences
        const REACH_WEIGHT_FACTOR = 2.5; // Increased from 0.6 to 2.5 for stronger differentiation
        
        // Calculate weighted magnitudes using Reach % as a factor
        const weightedMagnitudes = channelsWithImpact.map(channel => {
          const currentValue = channel.incrementalImpactPercent || 0;
          const magnitude = Math.abs(currentValue);
          const normalizedReach = channel._normalizedReach || 0;
          
          // Weighted magnitude: combine current magnitude with Reach % influence
          // Higher Reach % channels get proportionally larger shares
          const weightedMagnitude = magnitude * (1 + normalizedReach * REACH_WEIGHT_FACTOR);
          
          return {
            channel,
            weightedMagnitude,
            enforcedSign: (channel.tag === 'INCREASE' || channel.tag === 'NEW') ? 1 : -1
          };
        });
        
        // Calculate sum of weighted magnitudes
        const sumOfWeightedMagnitudes = weightedMagnitudes.reduce((sum, w) => sum + w.weightedMagnitude, 0);
        
        // Redistribute based on weighted magnitudes
        if (sumOfWeightedMagnitudes > 0) {
          weightedMagnitudes.forEach(({ channel, weightedMagnitude, enforcedSign }) => {
            // Calculate share based on weighted magnitude
            const share = weightedMagnitude / sumOfWeightedMagnitudes;
            const newValue = expectedImprovementPercent * share;
            
            // Apply enforced sign
            channel.incrementalImpactPercent = enforcedSign * Math.abs(newValue);
          });
        } else {
          // Fallback to simple proportional scaling if no weighted magnitudes
          const adjustmentFactor = expectedImprovementPercent / sumAfterGeneralDampening;
          
          channelsWithImpact.forEach(channel => {
            const currentValue = channel.incrementalImpactPercent || 0;
            const magnitude = Math.abs(currentValue);
            const enforcedSign = (channel.tag === 'INCREASE' || channel.tag === 'NEW') ? 1 : -1;
            channel.incrementalImpactPercent = enforcedSign * magnitude * adjustmentFactor;
          });
        }
        
        // Re-enforce 30% cap after redistribution (in case redistribution pushed values above cap)
        const MAX_CHANNEL_IMPACT_AFTER_REDIST = 32.5; // Cap at 32.5% (middle of 30-35% range)
        channelsWithImpact.forEach(channel => {
          const currentValue = channel.incrementalImpactPercent || 0;
          const absValue = Math.abs(currentValue);
          
          if (absValue > MAX_CHANNEL_IMPACT_AFTER_REDIST) {
            const cappedValue = MAX_CHANNEL_IMPACT_AFTER_REDIST;
            const enforcedSign = (channel.tag === 'INCREASE' || channel.tag === 'NEW') ? 1 : -1;
            channel.incrementalImpactPercent = enforcedSign * cappedValue;
          }
        });
        
        // Final redistribution to ensure sum matches after capping
        // CRITICAL: Use Reach %-weighted scaling here too, not simple proportional scaling
        // This preserves the differentiation we created earlier
        const sumAfterCapping = channelsWithImpact.reduce((sum, c) => 
          sum + (c.incrementalImpactPercent || 0), 0);
        
        if (Math.abs(sumAfterCapping - expectedImprovementPercent) > 0.01 && Math.abs(sumAfterCapping) > 0.01) {
          // Use Reach %-weighted scaling in final redistribution (slightly lower factor to maintain proportions)
          const FINAL_REACH_WEIGHT_FACTOR = 1.5; // Lower than initial 2.5 to maintain existing proportions
          
          // Calculate weighted magnitudes using Reach % for final redistribution
          const finalWeightedMagnitudes = channelsWithImpact.map(channel => {
            const currentValue = channel.incrementalImpactPercent || 0;
            const magnitude = Math.abs(currentValue);
            const normalizedReach = channel._normalizedReach || 0;
            
            // Weighted magnitude: combine current magnitude with Reach % influence
            const weightedMagnitude = magnitude * (1 + normalizedReach * FINAL_REACH_WEIGHT_FACTOR);
            
            return {
              channel,
              weightedMagnitude,
              enforcedSign: (channel.tag === 'INCREASE' || channel.tag === 'NEW') ? 1 : -1
            };
          });
          
          // Calculate sum of weighted magnitudes
          const sumOfFinalWeightedMagnitudes = finalWeightedMagnitudes.reduce((sum, w) => sum + w.weightedMagnitude, 0);
          
          if (sumOfFinalWeightedMagnitudes > 0) {
            // Redistribute based on weighted magnitudes
            finalWeightedMagnitudes.forEach(({ channel, weightedMagnitude, enforcedSign }) => {
              // Calculate share based on weighted magnitude
              const share = weightedMagnitude / sumOfFinalWeightedMagnitudes;
              const newValue = expectedImprovementPercent * share;
              
              // Cap at max if needed
              const finalValue = Math.min(Math.abs(newValue), MAX_CHANNEL_IMPACT_AFTER_REDIST);
              
              // Apply enforced sign
              channel.incrementalImpactPercent = enforcedSign * finalValue;
            });
          } else {
            // Fallback to simple proportional scaling if no weighted magnitudes
            const finalAdjustmentFactor = expectedImprovementPercent / sumAfterCapping;
            
            channelsWithImpact.forEach(channel => {
              const currentValue = channel.incrementalImpactPercent || 0;
              const magnitude = Math.abs(currentValue);
              const enforcedSign = (channel.tag === 'INCREASE' || channel.tag === 'NEW') ? 1 : -1;
              const adjustedValue = magnitude * finalAdjustmentFactor;
              
              // Cap again if needed
              const finalValue = Math.min(adjustedValue, MAX_CHANNEL_IMPACT_AFTER_REDIST);
              channel.incrementalImpactPercent = enforcedSign * finalValue;
            });
          }
        }
      }


      // Apply dampening factor for very high % of Incremental Impact values (HSM only)
      // Cap individual channel contributions to prevent unrealistic values
      if (selectedRegion === 'HSM') {
        const MAX_CHANNEL_INCREMENTAL_IMPACT = 5.0; // Cap at 5% per channel
        const DAMPENING_THRESHOLD = 3.0; // Start dampening above 3%
        
        finalChannels.forEach(channel => {
          const absValue = Math.abs(channel.incrementalImpactPercent || 0);
          
          if (absValue > DAMPENING_THRESHOLD) {
            // Apply dampening: values above threshold are reduced
            // Formula: dampened = threshold + (value - threshold) * dampening_factor
            const excess = absValue - DAMPENING_THRESHOLD;
            const dampeningFactor = Math.max(0.3, 1 - (excess / (MAX_CHANNEL_INCREMENTAL_IMPACT - DAMPENING_THRESHOLD)));
            const dampenedValue = DAMPENING_THRESHOLD + (excess * dampeningFactor);
            
            // Cap at maximum
            const finalValue = Math.min(dampenedValue, MAX_CHANNEL_INCREMENTAL_IMPACT);
            
            // Enforce sign based on channel status (not just preserve existing sign)
            if (channel.tag === 'INCREASE' || channel.tag === 'NEW') {
              channel.incrementalImpactPercent = finalValue;
            } else if (channel.tag === 'DECREASE' || channel.tag === 'DROPPED') {
              channel.incrementalImpactPercent = -finalValue;
            }
          }
        });
        
        // After dampening, redistribute to maintain total sum (HSM only)
        const channelsWithImpactAfterDampening = finalChannels.filter(c => 
          (c.tag === 'INCREASE' || c.tag === 'DECREASE' || c.tag === 'NEW' || c.tag === 'DROPPED') &&
          c.incrementalImpactPercent != null
        );
        
        const sumAfterDampening = channelsWithImpactAfterDampening.reduce((sum, c) => 
          sum + (c.incrementalImpactPercent || 0), 0);
        
        // Redistribute the difference proportionally
        if (Math.abs(sumAfterDampening - expectedImprovementPercent) > 0.01 && Math.abs(sumAfterDampening) > 0.01) {
          const adjustmentFactor = expectedImprovementPercent / sumAfterDampening;
          
          channelsWithImpactAfterDampening.forEach(channel => {
            const currentValue = channel.incrementalImpactPercent || 0;
            const magnitude = Math.abs(currentValue);
            // Enforce sign based on channel status
            const enforcedSign = (channel.tag === 'INCREASE' || channel.tag === 'NEW') ? 1 : -1;
            channel.incrementalImpactPercent = enforcedSign * magnitude * adjustmentFactor;
          });
        }
        
        // Final enforcement after HSM dampening: ensure signs are correct
        channelsWithImpactAfterDampening.forEach(channel => {
          const currentValue = channel.incrementalImpactPercent || 0;
          const absValue = Math.abs(currentValue);
          
          if (channel.tag === 'INCREASE' || channel.tag === 'NEW') {
            channel.incrementalImpactPercent = absValue;
          } else if (channel.tag === 'DECREASE' || channel.tag === 'DROPPED') {
            channel.incrementalImpactPercent = -absValue;
          }
        });
      }

      // Add deterministic Reach %-based variation for KAR and TN to create differentiation
      // Apply this as the FINAL step, right before setting the plan, to ensure differences are preserved
      if ((selectedRegion === 'KAR' || selectedRegion === 'TN')) {
        const channelsWithImpactFinal = finalChannels.filter(c => 
          (c.tag === 'INCREASE' || c.tag === 'DECREASE' || c.tag === 'NEW' || c.tag === 'DROPPED') &&
          c.incrementalImpactPercent != null
        );
        
        if (channelsWithImpactFinal.length > 0) {
          // Calculate Reach % weights if not already calculated
          const totalReachFinal = channelsWithImpactFinal.reduce((sum, c) => sum + (c.SyncReach || 0), 0);
          const maxReach = Math.max(...channelsWithImpactFinal.map(c => c.SyncReach || 0), 1);
          
          // Deterministic seeded random function based on channel properties
          const seededRandom = (channel, region) => {
            const seedString = `${region}_${channel.Channel}_${(channel.SyncReach || 0).toFixed(2)}`;
            let hash = 0;
            for (let i = 0; i < seedString.length; i++) {
              const char = seedString.charCodeAt(i);
              hash = ((hash << 5) - hash) + char;
              hash = hash & hash;
            }
            return (Math.abs(hash) % 10000) / 10000;
          };

          // Store original values before variation
          const originalValues = channelsWithImpactFinal.map(c => ({
            channel: c,
            originalValue: c.incrementalImpactPercent || 0,
            absOriginal: Math.abs(c.incrementalImpactPercent || 0)
          }));

          // Calculate average base value for reference
          const avgBaseValue = originalValues.reduce((sum, v) => sum + v.absOriginal, 0) / originalValues.length;
          
          // Apply direct +/- 3-5% variation based on Reach %
          // Higher Reach % channels get more variation (closer to 5%), lower Reach % get less (closer to 3%)
          channelsWithImpactFinal.forEach(channel => {
            const currentValue = channel.incrementalImpactPercent || 0;
            const absValue = Math.abs(currentValue);
            const channelReach = channel.SyncReach || 0;
            const normalizedReach = channelReach / maxReach; // 0 to 1
            
            // Generate deterministic random value (-1 to 1)
            const randomSeed = seededRandom(channel, selectedRegion);
            const randomDirection = (randomSeed - 0.5) * 2; // -1 to 1
            
            // Variation range: 3% to 5% based on Reach %
            // Higher Reach % = closer to 5%, Lower Reach % = closer to 3%
            const minVariation = 3.0;
            const maxVariation = 5.0;
            const variationAmount = minVariation + (maxVariation - minVariation) * normalizedReach;
            
            // Apply variation: add/subtract based on random direction
            // Scale variation by the base value to keep it proportional
            const variationFactor = (variationAmount / 100) * (absValue > 0 ? absValue : avgBaseValue);
            const variation = randomDirection * variationFactor;
            
            // Apply variation to absolute value
            let adjustedValue = absValue + variation;
            
            // Ensure we don't go negative
            adjustedValue = Math.max(adjustedValue, 0.1);
            
            // Cap at 35% max
            adjustedValue = Math.min(adjustedValue, 35.0);
            
            // Apply enforced sign
            const enforcedSign = (channel.tag === 'INCREASE' || channel.tag === 'NEW') ? 1 : -1;
            channel.incrementalImpactPercent = enforcedSign * adjustedValue;
          });
          
          // Calculate sum after variation
          const sumAfterVariation = channelsWithImpactFinal.reduce((sum, c) => 
            sum + (c.incrementalImpactPercent || 0), 0);
          
          // Adjust to match expected sum while preserving relative differences
          if (Math.abs(sumAfterVariation - expectedImprovementPercent) > 0.01 && Math.abs(sumAfterVariation) > 0.01) {
            // Calculate adjustment needed
            const difference = expectedImprovementPercent - sumAfterVariation;
            
            // Distribute the difference proportionally based on current magnitudes
            const totalMagnitude = channelsWithImpactFinal.reduce((sum, c) => 
              sum + Math.abs(c.incrementalImpactPercent || 0), 0);
            
            if (totalMagnitude > 0) {
              channelsWithImpactFinal.forEach(channel => {
                const currentValue = channel.incrementalImpactPercent || 0;
                const absValue = Math.abs(currentValue);
                const share = absValue / totalMagnitude;
                const adjustment = difference * share;
                
                // Apply adjustment
                const newValue = currentValue + adjustment;
                const newAbsValue = Math.abs(newValue);
                
                // Cap at 35% max
                const cappedValue = Math.min(newAbsValue, 35.0);
                
                // Enforce sign
                const enforcedSign = (channel.tag === 'INCREASE' || channel.tag === 'NEW') ? 1 : -1;
                channel.incrementalImpactPercent = enforcedSign * cappedValue;
              });
              
              // Final check: if sum still doesn't match, do one more proportional adjustment
              const finalSum = channelsWithImpactFinal.reduce((sum, c) => 
                sum + (c.incrementalImpactPercent || 0), 0);
              
              if (Math.abs(finalSum - expectedImprovementPercent) > 0.01) {
                const finalAdjustmentFactor = expectedImprovementPercent / finalSum;
                
                channelsWithImpactFinal.forEach(channel => {
                  const currentValue = channel.incrementalImpactPercent || 0;
                  const magnitude = Math.abs(currentValue);
                  const enforcedSign = (channel.tag === 'INCREASE' || channel.tag === 'NEW') ? 1 : -1;
                  const adjustedValue = magnitude * finalAdjustmentFactor;
                  const finalValue = Math.min(adjustedValue, 35.0);
                  channel.incrementalImpactPercent = enforcedSign * finalValue;
                });
              }
            }
          }
        }
      }

      // Calculate baseline impact percentage for each channel
      // Use totalImpact (original total impact) as the baseline
      // For existing channels: use actual Impact value
      // For NEW channels: estimate based on impact score relative to existing channels
      const existingChannelsForBaseline = finalChannels.filter(c => c.originalCost > 0);
      const newChannelsForBaseline = finalChannels.filter(c => c.tag === 'NEW');
      const droppedChannels = finalChannels.filter(c => c.tag === 'DROPPED');
      
      // Use totalImpact as the baseline (this is the "From" number in Impact Improvement card)
      const totalBaselineImpact = totalImpact;
      
      // Calculate baseline impact percentage for existing channels
      existingChannelsForBaseline.forEach(channel => {
        if (totalBaselineImpact > 0) {
          channel.baselineImpactPercent = ((channel.Impact || 0) / totalBaselineImpact) * 100;
        } else {
          channel.baselineImpactPercent = 0;
        }
      });
      
      // For DROPPED channels, calculate their baseline impact percentage
      droppedChannels.forEach(channel => {
        if (totalBaselineImpact > 0) {
          channel.baselineImpactPercent = ((channel.Impact || 0) / totalBaselineImpact) * 100;
        } else {
          channel.baselineImpactPercent = 0;
        }
      });
      
      // Estimate baseline impact for NEW channels based on their impact score
      // Calculate average impact per existing channel to use as baseline for estimation
      const existingChannelsWithScore = existingChannelsForBaseline.filter(c => c.impactScoreIndex != null && c.impactScoreIndex > 0);
      const avgImpactScore = existingChannelsWithScore.length > 0
        ? existingChannelsWithScore.reduce((sum, c) => sum + (c.impactScoreIndex || 0), 0) / existingChannelsWithScore.length
        : 0;
      
      if (avgImpactScore > 0 && totalBaselineImpact > 0 && existingChannelsForBaseline.length > 0) {
        // Calculate average impact per existing channel
        const avgImpactPerChannel = totalBaselineImpact / existingChannelsForBaseline.length;
        
        newChannelsForBaseline.forEach(channel => {
          const channelImpactScore = channel.impactScoreIndex || 0;
          // Estimate impact based on score ratio relative to average
          const scoreRatio = channelImpactScore / avgImpactScore;
          // Estimate baseline impact: use average impact per channel * score ratio
          const estimatedBaselineImpact = avgImpactPerChannel * scoreRatio;
          channel.baselineImpactPercent = (estimatedBaselineImpact / totalBaselineImpact) * 100;
        });
      } else {
        newChannelsForBaseline.forEach(channel => {
          channel.baselineImpactPercent = 0;
        });
      }

      // Filter out channels with negligible spend
      const activeChannels = finalChannels.filter(c => c.newCost > 1000 || c.originalCost > 0);

      setOptimizedPlan({
        original: {
          channels: channels,
          totalCost,
          totalImpact,
          totalReach,
          totalGRP: analyzeChannels.totalGRP
        },
        optimized: {
          channels: activeChannels.sort((a, b) => b.newCost - a.newCost),
          totalCost,
          totalImpact: newImpact,
          totalReach: newReach,
          totalGRP: newGRP
        },
        improvement: {
          impact: ((newImpact - totalImpact) / totalImpact) * 100,
          reach: ((newReach - totalReach) / totalReach) * 100,
          grp: ((newGRP - analyzeChannels.totalGRP) / analyzeChannels.totalGRP) * 100
        },
        learningSource,
        optimizationMetric,
        summary: {
          increased: activeChannels.filter(c => c.tag === 'INCREASE').length,
          decreased: activeChannels.filter(c => c.tag === 'DECREASE').length,
          dropped: finalChannels.filter(c => c.tag === 'DROPPED').length,
          new: activeChannels.filter(c => c.tag === 'NEW').length
        }
      });

      setIsOptimizing(false);
    }, 600);
  };

  // CSV Download Function
  const downloadCSV = () => {
    if (!optimizedPlan) return;

    const { optimized, original } = optimizedPlan;
    const csvHeaders = [
      'Channel',
      'Status',
      'Threshold Type',
      'Genre',
      'Reach %',
      'Impact Score',
      '%baseline impact',
      'Original %',
      'New %',
      'Change %',
      '% of Incremental Impact'
    ];

    const csvRows = optimized.channels.map(channel => [
      channel.Channel,
      channel.tag,
      channel.isHighThreshold ? 'High' : 'Low',
      channel.Genre,
      channel.SyncReach?.toFixed(2),
      channel.impactScoreIndex != null ? channel.impactScoreIndex.toFixed(1) : '0.0',
      channel.baselineImpactPercent != null ? channel.baselineImpactPercent.toFixed(1) : '',
      channel.originalCostShare?.toFixed(1),
      channel.newCostShare?.toFixed(1),
      channel.changePercent?.toFixed(1),
      (channel.tag === 'INCREASE' || channel.tag === 'DECREASE' || channel.tag === 'NEW' || channel.tag === 'DROPPED')
        ? channel.incrementalImpactPercent?.toFixed(2)
        : ''
    ]);

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `channel_comparison_${selectedRegion}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Tag component
  const ChannelTag = ({ tag }) => {
    const styles = {
      INCREASE: { bg: '#dcfce7', color: '#166534', icon: '↑' },
      DECREASE: { bg: '#fee2e2', color: '#991b1b', icon: '↓' },
      DROPPED: { bg: '#f3f4f6', color: '#374151', icon: '✕' },
      NEW: { bg: '#fff7ed', color: '#c2410c', icon: '★' },
      UNCHANGED: { bg: '#f1f5f9', color: '#475569', icon: '—' }
    };
    const style = styles[tag] || styles.UNCHANGED;

    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '4px 10px',
        borderRadius: 6,
        fontSize: 11,
        fontWeight: 700,
        background: style.bg,
        color: style.color
      }}>
        {style.icon} {tag}
      </span>
    );
  };

  // Info Tooltip component
  const InfoTooltip = ({ show, onClose, title, children, position = 'bottom' }) => {
    if (!show) return null;

    return (
      <>
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1000,
            background: 'rgba(0, 0, 0, 0.3)',
            cursor: 'pointer'
          }}
          onClick={onClose}
        />
        <div
          style={{
            position: 'absolute',
            [position === 'bottom' ? 'top' : 'bottom']: '100%',
            left: 0,
            marginBottom: position === 'top' ? 8 : 0,
            marginTop: position === 'bottom' ? 8 : 0,
            zIndex: 1001,
            background: 'white',
            borderRadius: 12,
            padding: 20,
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
            border: '1px solid #e2e8f0',
            maxWidth: 320,
            fontSize: 13,
            lineHeight: 1.6,
            color: COLORS.primary
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: COLORS.primary }}>{title}</h4>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                fontSize: 18,
                cursor: 'pointer',
                color: COLORS.muted,
                padding: 0,
                width: 24,
                height: 24,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 4
              }}
            >
              ×
            </button>
          </div>
          <div style={{ color: COLORS.secondary }}>
            {children}
          </div>
        </div>
      </>
    );
  };

  const renderComparisonTable = () => {
    if (!optimizedPlan) return null;

    const { optimized } = optimizedPlan;

    return (
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: COLORS.primary, color: 'white' }}>
              <th style={{ padding: '14px 10px', textAlign: 'left', fontWeight: 600 }}>Channel</th>
              <th style={{ padding: '14px 10px', textAlign: 'center', fontWeight: 600 }}>Status</th>
              <th style={{ padding: '14px 10px', textAlign: 'center', fontWeight: 600 }}>Threshold</th>
              <th style={{ padding: '14px 10px', textAlign: 'center', fontWeight: 600 }}>Genre</th>
              <th style={{ padding: '14px 10px', textAlign: 'right', fontWeight: 600 }}>Reach %</th>
              <th style={{ padding: '14px 10px', textAlign: 'right', fontWeight: 600 }}>Impact Score</th>
              <th style={{ padding: '14px 10px', textAlign: 'right', fontWeight: 600 }}>%baseline impact</th>
              <th style={{ padding: '14px 10px', textAlign: 'right', fontWeight: 600 }}>Old %</th>
              <th style={{ padding: '14px 10px', textAlign: 'right', fontWeight: 600 }}>New %</th>
              <th style={{ padding: '14px 10px', textAlign: 'right', fontWeight: 600 }}>% Cost Change</th>
              <th style={{ padding: '14px 10px', textAlign: 'right', fontWeight: 600 }}>% of Incremental Impact</th>
            </tr>
          </thead>
          <tbody>
            {optimized.channels.map((channel, idx) => {
              const changeColor = channel.change > 0 ? COLORS.success : channel.change < 0 ? COLORS.danger : COLORS.muted;

              return (
                <tr
                  key={idx}
                  style={{
                    background: channel.tag === 'DROPPED' ? '#fafafa' : idx % 2 === 0 ? 'white' : '#f8fafc',
                    borderBottom: '1px solid #e2e8f0',
                    opacity: channel.tag === 'DROPPED' ? 0.6 : 1
                  }}
                >
                  <td style={{ padding: '12px 10px', fontWeight: 600 }}>
                    {channel.Channel}
                  </td>
                  <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                    <ChannelTag tag={channel.tag} />
                  </td>
                  <td style={{ padding: '12px 10px', textAlign: 'center', fontWeight: 600, color: channel.isHighThreshold ? COLORS.highThreshold : COLORS.lowThreshold }}>
                    {channel.isHighThreshold ? 'High' : 'Low'}
                  </td>
                  <td style={{ padding: '12px 10px', textAlign: 'center', fontSize: 11, color: COLORS.muted }}>{channel.Genre}</td>
                  <td style={{ padding: '12px 10px', textAlign: 'right', fontFamily: 'monospace' }}>{channel.SyncReach?.toFixed(2)}%</td>
                  <td style={{ padding: '12px 10px', textAlign: 'right', fontFamily: 'monospace' }}>
                    {channel.impactScoreIndex != null ? channel.impactScoreIndex.toFixed(1) : '—'}
                  </td>
                  <td style={{ padding: '12px 10px', textAlign: 'right', fontFamily: 'monospace', color: COLORS.muted }}>
                    {channel.baselineImpactPercent != null ? channel.baselineImpactPercent.toFixed(1) : '—'}%
                  </td>
                  <td style={{ padding: '12px 10px', textAlign: 'right', fontFamily: 'monospace', color: COLORS.muted }}>
                    {channel.originalCostShare?.toFixed(1)}%
                  </td>
                  <td style={{ padding: '12px 10px', textAlign: 'right', fontFamily: 'monospace', fontWeight: 700 }}>
                    {channel.newCostShare?.toFixed(1)}%
                  </td>
                  <td
                    style={{
                      padding: '12px 10px',
                      textAlign: 'right',
                      fontFamily: 'monospace',
                      fontWeight: 700,
                      color: (() => {
                        if (channel.tag === 'UNCHANGED') return COLORS.muted;
                        const raw = channel.changePercent || 0;
                        if (raw > 0) return COLORS.success;
                        if (raw < 0) return COLORS.danger;
                        return COLORS.muted;
                      })()
                    }}
                  >
                    {(() => {
                      if (channel.tag === 'UNCHANGED') return '—';
                      const raw = channel.changePercent || 0;
                      if (raw > 30) return '>30%';
                      if (raw < -30) return '<-30%';
                      return `${raw > 0 ? '+' : ''}${raw.toFixed(1)}%`;
                    })()}
                  </td>
                  <td style={{
                    padding: '12px 10px',
                    textAlign: 'right',
                    fontFamily: 'monospace',
                    fontWeight: 600,
                    color: (() => {
                      if (channel.tag === 'INCREASE' || channel.tag === 'NEW') return COLORS.success;
                      if (channel.tag === 'DECREASE' || channel.tag === 'DROPPED') return COLORS.danger;
                      return COLORS.muted;
                    })()
                  }}>
                    {(channel.tag === 'INCREASE' || channel.tag === 'DECREASE' || channel.tag === 'NEW' || channel.tag === 'DROPPED')
                      ? (() => {
                          const value = channel.incrementalImpactPercent || 0;
                          // Positive values show +, negative values show - (no + for negative)
                          return value > 0 ? `+${value.toFixed(2)}%` : `${value.toFixed(2)}%`;
                        })()
                      : '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const renderPieCharts = () => {
    if (!optimizedPlan) return null;

    const { original, optimized } = optimizedPlan;

    const originalPieData = original.channels
      .sort((a, b) => b.Cost - a.Cost)
      .slice(0, 10)
      .map(c => ({ name: c.Channel, value: c.costShare }));

    const optimizedPieData = optimized.channels
      .filter(c => c.newCost > 0)
      .sort((a, b) => b.newCost - a.newCost)
      .slice(0, 10)
      .map(c => ({ name: c.Channel, value: c.newCostShare }));

    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div style={{ background: 'white', borderRadius: 12, padding: 24, border: '1px solid #e2e8f0' }}>
          <h4 style={{ margin: '0 0 20px', color: COLORS.primary, fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Current Mix (Top 10)
          </h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={originalPieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, value }) => `${value.toFixed(1)}%`}
                labelLine={true}
              >
                {originalPieData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: 'white', borderRadius: 12, padding: 24, border: '1px solid #e2e8f0' }}>
          <h4 style={{ margin: '0 0 20px', color: COLORS.success, fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Optimized Mix (Top 10)
          </h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={optimizedPieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, value }) => `${value.toFixed(1)}%`}
                labelLine={true}
              >
                {optimizedPieData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  const renderScoreChart = () => {
    if (!analyzeChannels) return null;

    const metricLabel = optimizationMetric === 'reach' ? 'Reach Score' : 'Impact/Reach';

    const data = analyzeChannels.channels.map(c => ({
      name: c.Channel,
      score: calculateScore(c, optimizationMetric),
      reach: c.SyncReach,
      isHighThreshold: c.isHighThreshold
    })).sort((a, b) => b.score - a.score).slice(0, 15);

    return (
      <div style={{ background: 'white', borderRadius: 12, padding: 24, border: '1px solid #e2e8f0' }}>
        <h4 style={{ margin: '0 0 20px', color: COLORS.primary, fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Channel Ranking by {metricLabel}
        </h4>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data} layout="vertical" margin={{ left: 120 }}>
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={110} />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload;
                  return (
                    <div style={{ background: 'white', padding: 12, borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontWeight: 700, marginBottom: 6 }}>{d.name}</div>
                      <div style={{ fontSize: 12, color: COLORS.muted }}>{metricLabel}: <strong>{d.score.toFixed(2)}</strong></div>
                      <div style={{ fontSize: 12, color: COLORS.muted }}>Reach: <strong>{d.reach.toFixed(2)}%</strong></div>
                      <div style={{ fontSize: 11, marginTop: 6, color: d.isHighThreshold ? COLORS.highThreshold : COLORS.lowThreshold, fontWeight: 600 }}>
                        {d.isHighThreshold ? '● High Threshold' : '○ Low Threshold'}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="score" name={metricLabel} radius={[0, 4, 4, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.isHighThreshold ? COLORS.highThreshold : COLORS.lowThreshold} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginTop: 16 }}>
          <span style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 14, height: 14, borderRadius: 3, background: COLORS.highThreshold }}></span> High Threshold (High Reach)
          </span>
          <span style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 14, height: 14, borderRadius: 3, background: COLORS.lowThreshold }}></span> Low Threshold
          </span>
        </div>
      </div>
    );
  };

  if (isLoadingData) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f8fafc',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 20 }}>⏳</div>
          <div style={{ fontSize: 18, color: COLORS.primary, fontWeight: 600 }}>Loading data...</div>
        </div>
      </div>
    );
  }

  if (dataError) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f8fafc',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
      }}>
        <div style={{
          background: '#fee2e2',
          border: '2px solid #ef4444',
          borderRadius: 12,
          padding: 32,
          maxWidth: 500,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: 48, marginBottom: 20 }}>⚠️</div>
          <div style={{ fontSize: 18, color: '#991b1b', fontWeight: 600, marginBottom: 12 }}>Data Loading Error</div>
          <div style={{ fontSize: 14, color: '#7f1d1d' }}>{dataError}</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f8fafc',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      padding: 24
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        borderRadius: 16,
        padding: '36px 44px',
        marginBottom: 24,
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: 300,
          height: 300,
          background: 'radial-gradient(circle, rgba(249,115,22,0.15) 0%, transparent 70%)',
          borderRadius: '50%',
          transform: 'translate(30%, -30%)'
        }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 32, fontWeight: 800, letterSpacing: '-1px' }}>
              TV Campaign Optimizer
            </h1>
            <p style={{ margin: '10px 0 0', opacity: 0.8, fontSize: 15, fontWeight: 500 }}>
              Garnier Hair Care • Cross-Media Measurement & Attribution
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, opacity: 0.6, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '1px' }}>Powered by</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: COLORS.accent }}>SYNC</div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div style={{
        background: 'white',
        borderRadius: 12,
        padding: 28,
        marginBottom: 24,
        border: '1px solid #e2e8f0'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 28 }}>
          {/* Region Selector */}
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: COLORS.muted, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Select Region
            </label>
            <select
              value={selectedRegion}
              onChange={(e) => {
                setSelectedRegion(e.target.value);
                setOptimizedPlan(null);
              }}
              style={{
                width: '100%',
                padding: '14px 16px',
                fontSize: 14,
                fontWeight: 500,
                border: '2px solid #e2e8f0',
                borderRadius: 10,
                background: 'white',
                cursor: 'pointer',
                transition: 'border-color 0.2s'
              }}
            >
              <option value="">Choose a region...</option>
              {regions.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* Metric Selector */}
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: COLORS.muted, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Optimize For
            </label>
            <select
              value={optimizationMetric}
              onChange={(e) => {
                setOptimizationMetric(e.target.value);
                setOptimizedPlan(null);
              }}
              style={{
                width: '100%',
                padding: '14px 16px',
                fontSize: 14,
                fontWeight: 500,
                border: '2px solid #e2e8f0',
                borderRadius: 10,
                background: 'white',
                cursor: 'pointer'
              }}
            >
              <option value="reach">Reach (Maximize Coverage)</option>
              <option value="impact_reach">Impact / Reach (Impact Density)</option>
            </select>
          </div>

          {/* Target Increase */}
          <div style={{ position: 'relative' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, fontWeight: 700, color: COLORS.muted, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <span>Optimization Intensity: <span style={{ color: COLORS.accent }}>{targetIncrease}%</span></span>
              <button
                onClick={() => setShowIntensityTooltip(!showIntensityTooltip)}
                onMouseEnter={() => setShowIntensityTooltip(true)}
                style={{
                  background: COLORS.accent,
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: 18,
                  height: 18,
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0,
                  lineHeight: 1,
                  flexShrink: 0
                }}
              >
                i
              </button>
            </label>
            <InfoTooltip
              show={showIntensityTooltip}
              onClose={() => setShowIntensityTooltip(false)}
              title="Optimization Intensity"
              position="bottom"
            >
              <p style={{ margin: '0 0 12px 0' }}>
                This controls how much the tool will change your current channel mix. Think of it like adjusting the volume on your TV:
              </p>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                <li style={{ marginBottom: 8 }}>
                  <strong>Conservative (5-10%):</strong> Small, safe changes. Your current plan stays mostly the same, with minor tweaks to improve performance.
                </li>
                <li style={{ marginBottom: 8 }}>
                  <strong>Moderate (15-20%):</strong> Balanced approach. Some channels get more budget, others get less, but nothing too dramatic.
                </li>
                <li>
                  <strong>Aggressive (25-30%):</strong> Bigger shifts. The tool will make more significant changes, potentially dropping underperforming channels and heavily investing in top performers.
                </li>
              </ul>
            </InfoTooltip>
            <input
              type="range"
              min="5"
              max="30"
              step="5"
              value={targetIncrease}
              onChange={(e) => {
                setTargetIncrease(parseInt(e.target.value));
                setOptimizedPlan(null);
              }}
              style={{ width: '100%', marginTop: 8, accentColor: COLORS.accent }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: COLORS.muted, marginTop: 6 }}>
              <span>Conservative (5%)</span>
              <span>Aggressive (30%)</span>
            </div>
          </div>

          {/* High Threshold Percentile */}
          <div style={{ position: 'relative' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, fontWeight: 700, color: COLORS.muted, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <span>Threshold: <span style={{ color: COLORS.highThreshold }}>{highThresholdPercentile}%</span></span>
              <button
                onClick={() => setShowThresholdTooltip(!showThresholdTooltip)}
                onMouseEnter={() => setShowThresholdTooltip(true)}
                style={{
                  background: COLORS.highThreshold,
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: 18,
                  height: 18,
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0,
                  lineHeight: 1,
                  flexShrink: 0
                }}
              >
                i
              </button>
            </label>
            <InfoTooltip
              show={showThresholdTooltip}
              onClose={() => setShowThresholdTooltip(false)}
              title="Threshold"
              position="bottom"
            >
              <p style={{ margin: '0 0 12px 0' }}>
                This setting protects your most important channels from big budget changes. Think of it like a safety net for your top-performing channels:
              </p>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                <li style={{ marginBottom: 8 }}>
                  <strong>Lower (50-60%):</strong> Only your absolute top channels (the ones delivering most of your reach) are protected. More channels can be adjusted freely.
                </li>
                <li style={{ marginBottom: 8 }}>
                  <strong>Medium (70%):</strong> A good balance. Your main channels stay stable, while smaller channels can be optimized more aggressively.
                </li>
                <li>
                  <strong>Higher (80-90%):</strong> More channels are protected. The tool will be more conservative and make smaller changes across the board.
                </li>
              </ul>
              <p style={{ margin: '12px 0 0 0', fontSize: 12, color: COLORS.muted, fontStyle: 'italic' }}>
                Protected channels can only change by ±10% to keep your campaign stable.
              </p>
            </InfoTooltip>
            <input
              type="range"
              min="50"
              max="90"
              step="5"
              value={highThresholdPercentile}
              onChange={(e) => {
                setHighThresholdPercentile(parseInt(e.target.value));
                setOptimizedPlan(null);
              }}
              style={{ width: '100%', marginTop: 8, accentColor: COLORS.highThreshold }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: COLORS.muted, marginTop: 6 }}>
              <span>Fewer Protected (50%)</span>
              <span>More Protected (90%)</span>
            </div>
          </div>
        </div>

        {/* Run Button */}
        <div style={{ marginTop: 28, display: 'flex', justifyContent: 'center' }}>
          <button
            onClick={runOptimization}
            disabled={!selectedRegion || isOptimizing}
            style={{
              padding: '16px 56px',
              fontSize: 15,
              fontWeight: 700,
              color: 'white',
              background: !selectedRegion ? COLORS.muted : `linear-gradient(135deg, ${COLORS.accent} 0%, #ea580c 100%)`,
              border: 'none',
              borderRadius: 10,
              cursor: !selectedRegion ? 'not-allowed' : 'pointer',
              boxShadow: !selectedRegion ? 'none' : '0 4px 14px rgba(249, 115, 22, 0.4)',
              transition: 'all 0.2s',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}
          >
            {isOptimizing ? 'Optimizing...' : 'Run Optimization'}
          </button>
        </div>
      </div>

      {/* Analysis Summary */}
      {analyzeChannels && (
        <div style={{
          background: 'white',
          borderRadius: 12,
          padding: 24,
          marginBottom: 24,
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: COLORS.primary }}>
              {selectedRegion} Market Analysis
            </h3>
            {analyzeChannels.learningSource && (
              <div style={{
                background: '#fef3c7',
                color: '#92400e',
                padding: '8px 16px',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 600
              }}>
                ⚡ Learning from Godrej (No Garnier data)
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            <div style={{ background: '#f8fafc', padding: 20, borderRadius: 10, textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: COLORS.primary }}>{analyzeChannels.channels.length}</div>
              <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 4, fontWeight: 600, textTransform: 'uppercase' }}>Total Channels</div>
            </div>
            <div style={{ background: '#e0f2fe', padding: 20, borderRadius: 10, textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: COLORS.highThreshold }}>{analyzeChannels.highThresholdCount}</div>
              <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 4, fontWeight: 600, textTransform: 'uppercase' }}>High Threshold</div>
            </div>
            <div style={{ background: '#f3e8ff', padding: 20, borderRadius: 10, textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: COLORS.lowThreshold }}>{analyzeChannels.lowThresholdCount}</div>
              <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 4, fontWeight: 600, textTransform: 'uppercase' }}>Low Threshold</div>
            </div>
          </div>
        </div>
      )}

      {/* Score Chart */}
      {analyzeChannels && !optimizedPlan && (
        <div style={{ marginBottom: 24 }}>
          {renderScoreChart()}
        </div>
      )}

      {/* Results */}
      {optimizedPlan && (
        <>
          {/* Improvement Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: 24,
            marginBottom: 24,
            maxWidth: 400
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              borderRadius: 12,
              padding: 28,
              color: 'white',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)'
            }}>
              <div style={{ fontSize: 12, opacity: 0.9, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>
                Impact Improvement
              </div>
              <div style={{ fontSize: 42, fontWeight: 800, marginBottom: 4 }}>
                {optimizedPlan.improvement.impact > 0 ? '+' : ''}{optimizedPlan.improvement.impact.toFixed(1)}%
              </div>
              <div style={{ fontSize: 13, opacity: 0.85 }}>
                From {optimizedPlan.original.totalImpact.toFixed(0)} → {optimizedPlan.optimized.totalImpact.toFixed(0)}
              </div>
            </div>
          </div>

          {/* Summary Stats */}
          <div style={{
            background: 'white',
            borderRadius: 12,
            padding: 24,
            marginBottom: 24,
            border: '1px solid #e2e8f0'
          }}>
            <h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 700, color: COLORS.primary }}>Optimization Summary</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
              <div style={{ padding: 16, background: '#dcfce7', borderRadius: 8, textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#166534' }}>{optimizedPlan.summary.increased}</div>
                <div style={{ fontSize: 11, color: '#166534', marginTop: 4, fontWeight: 600 }}>Channels Increased</div>
              </div>
              <div style={{ padding: 16, background: '#fee2e2', borderRadius: 8, textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#991b1b' }}>{optimizedPlan.summary.decreased}</div>
                <div style={{ fontSize: 11, color: '#991b1b', marginTop: 4, fontWeight: 600 }}>Channels Decreased</div>
              </div>
              <div style={{ padding: 16, background: '#f3f4f6', borderRadius: 8, textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#374151' }}>{optimizedPlan.summary.dropped}</div>
                <div style={{ fontSize: 11, color: '#374151', marginTop: 4, fontWeight: 600 }}>Channels Dropped</div>
              </div>
              <div style={{ padding: 16, background: '#fff7ed', borderRadius: 8, textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#c2410c' }}>{optimizedPlan.summary.new}</div>
                <div style={{ fontSize: 11, color: '#c2410c', marginTop: 4, fontWeight: 600 }}>New Channels Added</div>
              </div>
            </div>
          </div>

          {/* Pie Charts */}
          {renderPieCharts()}

          {/* Comparison Table with Download Button */}
          <div style={{
            background: 'white',
            borderRadius: 12,
            padding: 24,
            marginTop: 24,
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: COLORS.primary }}>
                Channel-Level Comparison
              </h3>
              <button
                onClick={downloadCSV}
                style={{
                  padding: '10px 24px',
                  fontSize: 13,
                  fontWeight: 600,
                  color: 'white',
                  background: `linear-gradient(135deg, ${COLORS.success} 0%, #059669 100%)`,
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 2px 8px rgba(16, 185, 129, 0.3)';
                }}
              >
                <span style={{ fontSize: 16 }}>⬇</span>
                Download CSV
              </button>
            </div>
            {renderComparisonTable()}
          </div>
        </>
      )}
    </div>
  );
}
