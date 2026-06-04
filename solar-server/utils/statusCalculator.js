import moment from 'moment';

/**
 * Calculates the task status based on due date and settings
 * @param {Date|String} dueDate - The due date of the task
 * @param {Object} settings - OverdueTaskSetting object
 * @returns {String} - 'upcoming' | 'pending' | 'overdue' | 'today'
 */
export const calculateTaskStatus = (dueDate, settings = {}) => {
  if (!dueDate) return 'upcoming';

  const today = moment().startOf('day');
  const due = moment(dueDate).startOf('day');
  const daysRemaining = due.diff(today, 'days');

  // Pending Task Range Configuration
  const pendingMinDays = settings.pendingMinDays ?? 1;
  const pendingMaxDays = settings.pendingMaxDays ?? 7;

  // 1. Overdue Logic (Highest Priority as per requirement: 0 days = Overdue)
  // Requirement: "Once Pending range is completed, task should automatically move to Overdue."
  // And "0 days remaining = Overdue", "1 day remaining = Pending"
  if (daysRemaining < pendingMinDays) {
    return 'overdue';
  }

  // 2. Today's Task Logic (If enabled and within the 'Today' range defined by admin)
  // Note: If todayTasksDays is 0, it would have been caught as Overdue above (if minDays >=1).
  const todayTasksDays = settings.todayTasksDays || 0;
  if (daysRemaining >= 0 && daysRemaining <= todayTasksDays) {
    return 'today';
  }

  // 3. Pending Task Logic
  // Pending if within the range [Min, Max]
  if (daysRemaining >= pendingMinDays && daysRemaining <= pendingMaxDays) {
    return 'pending';
  }

  // 4. Otherwise, it's upcoming (more than Max days remaining)
  return 'upcoming';
};

/**
 * Gets the applicable setting for a location hierarchy
 * @param {Model} OverdueTaskSetting - The model
 * @param {Object} location - { country, state, cluster, district, department }
 */
export const getApplicableSetting = async (OverdueTaskSetting, { country, state, cluster, district, department }) => {
  // Strategy: Find most specific first, fall back to hierarchy
  const query = {
    $or: [
      // Exact match for the full hierarchy if possible
      { 
        districts: district || { $size: 0 }, 
        clusters: cluster || { $size: 0 }, 
        states: state || { $size: 0 }, 
        countries: country || { $size: 0 },
        departments: department || { $size: 0 }
      },
      // Global fallback
      { 
        districts: { $size: 0 }, 
        clusters: { $size: 0 }, 
        states: { $size: 0 }, 
        countries: { $size: 0 },
        departments: { $size: 0 }
      }
    ]
  };

  // Find settings. We sort by specificity (districts not empty first)
  // But simpler: just find one that matches the specific or the global
  // In a real app, we'd have a more sophisticated hierarchical join.
  
  const settings = await OverdueTaskSetting.find(query).lean();
  
  // Return specific match if found, else global
  const specific = settings.find(s => (s.districts?.length || 0) > 0 || (s.clusters?.length || 0) > 0);
  return specific || settings.find(s => (s.districts?.length === 0)) || {
    todayTasksDays: 0,
    pendingMinDays: 1,
    pendingMaxDays: 7,
    overdueDays: 1,
    escalationLevels: []
  };
};

/**
 * Gets the escalation level based on overdue days
 * @param {Number} overdueDays - Number of days overdue (positive)
 * @param {Array} levels - Array of escalation level objects
 */
export const getEscalationLevel = (overdueDays, levels = []) => {
  if (overdueDays <= 0 || !levels.length) return null;

  // Find the level where fromDay <= overdueDays <= toDay
  // The 'toDay' being null means it's an open-ended range
  return levels.find(l => 
    l.isActive && 
    overdueDays >= l.fromDay && 
    (!l.toDay || overdueDays <= l.toDay)
  ) || null;
};

/**
 * Calculates current efficiency score based on overdue count and settings
 * @param {Number} overdueCount - Total number of overdue tasks
 * @param {Object} settings - OverdueTaskSetting object
 * @returns {Object} - { efficiency, totalPenalty, isBelowBenchmark }
 */
export const calculateUserEfficiency = (overdueCount, settings = {}) => {
  const startScore = 100;
  
  if (!settings.autoPenalty) {
    return {
      efficiency: startScore,
      totalPenalty: 0,
      isBelowBenchmark: false
    };
  }

  const penaltyRate = settings.penaltyPercentage || 0;
  const totalPenalty = overdueCount * penaltyRate;
  const efficiency = Math.max(0, startScore - totalPenalty);
  const benchmark = settings.overdueBenchmark || 70;

  return {
    efficiency: parseFloat(efficiency.toFixed(2)),
    totalPenalty: parseFloat(totalPenalty.toFixed(2)),
    isBelowBenchmark: efficiency < benchmark,
    benchmark
  };
};

/**
 * Calculates status for a specific project stage (NEW)
 * @param {Date} stageStartDate 
 * @param {String} stageKey 
 * @param {Object} settings - OverdueTaskSetting
 */
export const calculateStageStatus = (stageStartDate, stageKey, settings = {}) => {
  if (!stageStartDate || !stageKey) return 'pending';

  const today = moment();
  const start = moment(stageStartDate);
  const daysInStage = today.diff(start, 'days');

  const stageSetting = (settings.stageSettings || []).find(s => s.stageKey === stageKey);
  const threshold = stageSetting ? stageSetting.overdueDays : 2; // Default 2 days

  if (daysInStage >= threshold) return 'overdue';
  return 'on-track';
};

/**
 * Calculates project timeline delay and SLA status (NEW)
 * @param {Date} projectStartDate 
 * @param {Object} settings - OverdueTaskSetting
 */
export const calculateTimelineDelay = (projectStartDate, settings = {}) => {
  if (!projectStartDate) return { delayDays: 0, delayPercentage: 0, status: 'on-track' };

  const timeline = settings.timelineSettings || { targetCompletionDays: 30, bufferDays: 5 };
  const targetDays = timeline.targetCompletionDays;
  const today = moment();
  const start = moment(projectStartDate);
  const actualDays = today.diff(start, 'days');

  const delayDays = Math.max(0, actualDays - targetDays);
  const delayPercentage = Math.round((actualDays / targetDays) * 100);

  let status = 'on-track';
  if (actualDays > targetDays + timeline.bufferDays) status = 'critical';
  else if (actualDays > targetDays) status = 'delayed';

  return {
    delayDays,
    delayPercentage,
    status,
    isOverdue: actualDays > targetDays
  };
};
