import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { AchievementBadge, AchievementStats, AchievementCategory } from '../types';

const STORAGE_KEY = 'gobang_achievement_stats';

export const ACHIEVEMENT_BADGES: AchievementBadge[] = [
  // 首胜
  {
    id: 'first_win',
    name: '初战告捷',
    description: '首次击败 AI 取得胜利',
    category: 'first_win',
    icon: '🏆',
    threshold: 1,
  },
  // 连胜
  {
    id: 'streak_3',
    name: '三连胜',
    description: '连续赢得 3 场对局',
    category: 'consecutive_wins',
    icon: '🔥',
    threshold: 3,
  },
  {
    id: 'streak_5',
    name: '五连胜',
    description: '连续赢得 5 场对局',
    category: 'consecutive_wins',
    icon: '⚡',
    threshold: 5,
  },
  {
    id: 'streak_10',
    name: '十连胜',
    description: '连续赢得 10 场对局',
    category: 'consecutive_wins',
    icon: '👑',
    threshold: 10,
  },
  // 残局通关
  {
    id: 'endgame_1',
    name: '残局初解',
    description: '首次通关残局挑战',
    category: 'endgame',
    icon: '🧩',
    threshold: 1,
  },
  {
    id: 'endgame_3',
    name: '残局精通',
    description: '累计通关 3 次残局',
    category: 'endgame',
    icon: '🎯',
    threshold: 3,
  },
  {
    id: 'endgame_5',
    name: '残局宗师',
    description: '累计通关 5 次残局',
    category: 'endgame',
    icon: '🏹',
    threshold: 5,
  },
  // 复盘次数
  {
    id: 'review_1',
    name: '复盘新手',
    description: '首次复盘棋谱',
    category: 'review',
    icon: '📖',
    threshold: 1,
  },
  {
    id: 'review_10',
    name: '复盘达人',
    description: '累计复盘 10 次棋谱',
    category: 'review',
    icon: '🔍',
    threshold: 10,
  },
  {
    id: 'review_50',
    name: '复盘专家',
    description: '累计复盘 50 次棋谱',
    category: 'review',
    icon: '🎓',
    threshold: 50,
  },
];

function createDefaultStats(): AchievementStats {
  return {
    firstWinDone: false,
    currentWinStreak: 0,
    maxWinStreak: 0,
    endgamesCompleted: 0,
    reviewCount: 0,
    unlockedBadges: [],
    recentUnlocks: [],
  };
}

function loadStats(): AchievementStats {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultStats();
    const parsed = JSON.parse(raw) as Partial<AchievementStats>;
    return { ...createDefaultStats(), ...parsed };
  } catch {
    return createDefaultStats();
  }
}

export const useAchievementStore = defineStore('achievement', () => {
  const stats = ref<AchievementStats>(loadStats());

  const unlockedSet = computed(() => new Set(stats.value.unlockedBadges));

  interface RecentAchievement {
    badgeId: string;
    unlockedAt: number;
    badge: AchievementBadge;
  }

  const recentAchievements = computed<RecentAchievement[]>(() => {
    const result: RecentAchievement[] = [];
    const sorted = [...stats.value.recentUnlocks].sort((a, b) => b.unlockedAt - a.unlockedAt);
    for (const rec of sorted) {
      const badge = ACHIEVEMENT_BADGES.find((b) => b.id === rec.badgeId);
      if (badge) result.push({ badgeId: rec.badgeId, unlockedAt: rec.unlockedAt, badge });
      if (result.length >= 5) break;
    }
    return result;
  });

  const unlockedCount = computed(() => stats.value.unlockedBadges.length);
  const totalCount = computed(() => ACHIEVEMENT_BADGES.length);

  const badgesByCategory = computed(() => {
    const map: Record<AchievementCategory, AchievementBadge[]> = {
      first_win: [],
      consecutive_wins: [],
      endgame: [],
      review: [],
    };
    for (const badge of ACHIEVEMENT_BADGES) {
      map[badge.category].push(badge);
    }
    return map;
  });

  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stats.value));
    } catch {
      // ignore persistence errors
    }
  }

  function isUnlocked(badgeId: string): boolean {
    return unlockedSet.value.has(badgeId);
  }

  function tryUnlock(badgeId: string): boolean {
    if (unlockedSet.value.has(badgeId)) return false;
    stats.value.unlockedBadges.push(badgeId);
    stats.value.recentUnlocks.push({ badgeId, unlockedAt: Date.now() });
    if (stats.value.recentUnlocks.length > 20) {
      stats.value.recentUnlocks = stats.value.recentUnlocks.slice(-20);
    }
    persist();
    return true;
  }

  function checkThresholds(current: number, category: AchievementCategory) {
    for (const badge of ACHIEVEMENT_BADGES) {
      if (badge.category !== category) continue;
      if (current >= badge.threshold) tryUnlock(badge.id);
    }
  }

  function recordGameWon(humanWon: boolean) {
    if (humanWon) {
      if (!stats.value.firstWinDone) {
        stats.value.firstWinDone = true;
        tryUnlock('first_win');
      }
      stats.value.currentWinStreak += 1;
      if (stats.value.currentWinStreak > stats.value.maxWinStreak) {
        stats.value.maxWinStreak = stats.value.currentWinStreak;
      }
      checkThresholds(stats.value.currentWinStreak, 'consecutive_wins');
    } else {
      stats.value.currentWinStreak = 0;
    }
    persist();
  }

  function recordEndgameCompleted() {
    stats.value.endgamesCompleted += 1;
    checkThresholds(stats.value.endgamesCompleted, 'endgame');
    persist();
  }

  function recordReview() {
    stats.value.reviewCount += 1;
    checkThresholds(stats.value.reviewCount, 'review');
    persist();
  }

  function resetStats() {
    stats.value = createDefaultStats();
    persist();
  }

  return {
    stats,
    recentAchievements,
    unlockedCount,
    totalCount,
    badgesByCategory,
    isUnlocked,
    recordGameWon,
    recordEndgameCompleted,
    recordReview,
    resetStats,
  };
});
