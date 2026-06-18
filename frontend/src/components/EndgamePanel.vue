<template>
  <div class="bg-gray-900 rounded-xl p-4 border border-gray-700">
    <h3 class="text-lg font-bold text-green-400 mb-3">残局挑战</h3>

    <!-- Active endgame banner -->
    <div v-if="store.endgameActive && store.currentPuzzle" class="space-y-3">
      <div class="bg-gray-800 rounded-lg p-3 border border-green-600/40">
        <div class="flex items-center justify-between">
          <span class="text-sm font-bold text-white">{{ store.currentPuzzle.name }}</span>
          <span class="text-[10px] px-2 py-0.5 rounded-full" :class="diffClass(store.currentPuzzle.difficulty)">
            {{ diffLabel(store.currentPuzzle.difficulty) }}
          </span>
        </div>
        <p class="text-xs text-gray-400 mt-1">{{ store.currentPuzzle.description }}</p>
        <div class="text-[11px] text-green-400 mt-2">
          你执黑，AI 执白。击败 AI 即可通关并解锁残局成就。
        </div>
      </div>

      <div class="flex gap-2">
        <button
          @click="restart"
          class="flex-1 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors text-sm font-medium"
        >
          重新挑战
        </button>
        <button
          @click="store.exitEndgame()"
          class="flex-1 py-2 bg-red-600/20 border border-red-600/50 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors text-sm"
        >
          退出残局
        </button>
      </div>
    </div>

    <!-- Puzzle list -->
    <div v-else class="space-y-2">
      <p class="text-xs text-gray-500 mb-2">从预设残局开始，执黑击败 AI 即可通关。</p>
      <button
        v-for="puzzle in puzzles"
        :key="puzzle.id"
        @click="store.startEndgame(puzzle)"
        class="w-full text-left bg-gray-800 rounded-lg p-3 border border-gray-700 hover:border-green-600/50 hover:bg-gray-700 transition-colors"
      >
        <div class="flex items-center justify-between">
          <span class="text-sm font-bold text-white">{{ puzzle.name }}</span>
          <span class="text-[10px] px-2 py-0.5 rounded-full" :class="diffClass(puzzle.difficulty)">
            {{ diffLabel(puzzle.difficulty) }}
          </span>
        </div>
        <p class="text-xs text-gray-400 mt-1">{{ puzzle.description }}</p>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGameStore, ENDGAME_PUZZLES } from '../store/game';
import type { EndgamePuzzle } from '../types';

const store = useGameStore();
const puzzles = ENDGAME_PUZZLES;

function diffLabel(d: EndgamePuzzle['difficulty']): string {
  return d === 'easy' ? '简单' : d === 'medium' ? '中等' : '困难';
}

function diffClass(d: EndgamePuzzle['difficulty']): string {
  return d === 'easy'
    ? 'bg-green-900/50 text-green-400'
    : d === 'medium'
      ? 'bg-yellow-900/50 text-yellow-400'
      : 'bg-red-900/50 text-red-400';
}

function restart() {
  if (store.currentPuzzle) store.startEndgame(store.currentPuzzle);
}
</script>
