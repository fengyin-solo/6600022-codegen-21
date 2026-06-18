<template>
  <div class="bg-gray-900 rounded-xl p-4 border border-gray-700">
    <div class="flex items-center justify-between mb-3">
      <h3 class="text-lg font-bold text-green-400">成就系统</h3>
      <span class="text-xs text-gray-400">
        已解锁 {{ store.unlockedCount }} / {{ store.totalCount }}
      </span>
    </div>

    <!-- Progress bar -->
    <div class="w-full bg-gray-800 rounded-full h-2 mb-4">
      <div
        class="bg-green-500 h-2 rounded-full transition-all"
        :style="{ width: `${progressPercent}%` }"
      />
    </div>

    <!-- Recent achievements (shown on homepage) -->
    <div>
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm text-gray-400">最近获得</span>
        <button
          @click="showAll = !showAll"
          class="text-xs text-green-400 hover:text-green-300 transition-colors"
        >
          {{ showAll ? '收起' : '查看全部' }}
        </button>
      </div>

      <div v-if="store.recentAchievements.length === 0" class="text-gray-600 text-sm py-3 text-center">
        暂无成就，击败 AI、通关残局或复盘棋谱即可解锁徽章。
      </div>

      <div v-else class="flex gap-2 overflow-x-auto pb-2">
        <div
          v-for="item in store.recentAchievements"
          :key="item.badgeId + item.unlockedAt"
          class="flex-shrink-0 w-28 bg-gradient-to-br from-green-900/40 to-gray-800 border border-green-600/40 rounded-lg p-2 text-center"
        >
          <div class="text-2xl mb-1">{{ item.badge.icon }}</div>
          <div class="text-xs text-white font-medium truncate">{{ item.badge.name }}</div>
          <div class="text-[10px] text-gray-500 mt-1">{{ timeAgo(item.unlockedAt) }}</div>
        </div>
      </div>
    </div>

    <!-- All achievements grouped by category -->
    <div v-if="showAll" class="mt-4 space-y-4 border-t border-gray-700 pt-4">
      <div v-for="cat in categories" :key="cat.key">
        <div class="flex items-center gap-2 mb-2">
          <span class="text-sm font-bold text-gray-300">{{ cat.label }}</span>
          <span class="text-[10px] text-gray-500">{{ cat.hint }}</span>
        </div>
        <div class="space-y-2">
          <div
            v-for="badge in store.badgesByCategory[cat.key]"
            :key="badge.id"
            class="flex items-center gap-3 bg-gray-800/60 rounded-lg p-2 border"
            :class="store.isUnlocked(badge.id) ? 'border-green-600/40' : 'border-gray-700'"
          >
            <div
              class="w-9 h-9 flex items-center justify-center rounded-lg text-xl flex-shrink-0"
              :class="store.isUnlocked(badge.id) ? 'bg-green-900/40' : 'bg-gray-900 grayscale opacity-40'"
            >
              {{ badge.icon }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between">
                <span class="text-sm text-white truncate">{{ badge.name }}</span>
                <span class="text-[10px]" :class="store.isUnlocked(badge.id) ? 'text-green-400' : 'text-gray-500'">
                  {{ store.isUnlocked(badge.id) ? '已解锁' : `${progressOf(badge)} / ${badge.threshold}` }}
                </span>
              </div>
              <div class="text-[11px] text-gray-500 truncate">{{ badge.description }}</div>
              <div v-if="!store.isUnlocked(badge.id)" class="w-full bg-gray-900 rounded-full h-1 mt-1">
                <div
                  class="bg-green-500 h-1 rounded-full transition-all"
                  :style="{ width: `${Math.min(100, (progressOf(badge) / badge.threshold) * 100)}%` }"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <button
        @click="confirmReset"
        class="w-full py-1.5 text-xs text-red-400/70 hover:text-red-400 border border-red-600/30 rounded-lg hover:bg-red-600/10 transition-colors"
      >
        重置成就数据
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAchievementStore } from '../store/achievement';
import type { AchievementBadge, AchievementCategory } from '../types';

const store = useAchievementStore();
const showAll = ref(false);

const categories: { key: AchievementCategory; label: string; hint: string }[] = [
  { key: 'first_win', label: '首胜', hint: '首次击败 AI' },
  { key: 'consecutive_wins', label: '连胜', hint: '连续赢得对局' },
  { key: 'endgame', label: '残局通关', hint: '通关残局挑战' },
  { key: 'review', label: '复盘次数', hint: '复盘棋谱记录' },
];

const progressPercent = computed(() =>
  store.totalCount === 0 ? 0 : (store.unlockedCount / store.totalCount) * 100,
);

function progressOf(badge: AchievementBadge): number {
  const s = store.stats;
  switch (badge.category) {
    case 'first_win':
      return s.firstWinDone ? 1 : 0;
    case 'consecutive_wins':
      return s.maxWinStreak;
    case 'endgame':
      return s.endgamesCompleted;
    case 'review':
      return s.reviewCount;
    default:
      return 0;
  }
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const min = Math.floor(diff / 60000);
  if (min < 1) return '刚刚';
  if (min < 60) return `${min} 分钟前`;
  const hour = Math.floor(min / 60);
  if (hour < 24) return `${hour} 小时前`;
  const day = Math.floor(hour / 24);
  return `${day} 天前`;
}

function confirmReset() {
  if (confirm('确定要重置所有成就数据吗？此操作不可撤销。')) {
    store.resetStats();
    showAll.value = false;
  }
}
</script>
