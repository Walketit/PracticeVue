<template>
  <!-- Основной контейнер -->
  <div class="ecosystem">
    <!-- Панель статистики -->
    <div class="stats-panel">
      <h3>Статистика</h3>

      <!-- Блок: растения -->
      <div class="stat-block">
        <h4>Растения</h4>
        <div>Количество: {{ plantCountActual }}</div>
      </div>

      <!-- Блок: травоядные -->
      <div class="stat-block">
        <h4>Травоядные</h4>
        <div>Количество: {{ herbivoreCountActual }}</div>
        <div>Средняя скорость: {{ herbivoreAvgSpeed.toFixed(2) }}</div>
        <div>Среднее восприятие: {{ herbivoreAvgPerception.toFixed(0) }}</div>
      </div>

      <!-- Блок: хищники -->
      <div class="stat-block">
        <h4>Хищники</h4>
        <div>Количество: {{ predatorCountActual }}</div>
        <div>Средняя скорость: {{ predatorAvgSpeed.toFixed(2) }}</div>
        <div>Среднее восприятие: {{ predatorAvgPerception.toFixed(0) }}</div>
      </div>
    </div>

    <!-- Панель с canvas и управлением -->
    <div class="main-panel">
      <!-- Кнопки управления -->
      <div class="controls">
        <button @click="toggleSimulation">{{ isRunning ? 'Пауза' : 'Старт' }}</button>
        <button @click="resetSimulation">Сброс симуляции</button>

        <!-- Управление скоростью -->
        <label>
          Скорость: {{ speedMultiplier.toFixed(1) }}x
          <input type="range" min="0.5" max="3" step="0.1" v-model.number="speedMultiplier" @input="handleSpeedChange" />
        </label>

        <!-- Переключение отображения целей -->
        <button @click="toggleShowTargets">
          {{ ecosystem.showTargets ? 'Скрыть цели' : 'Показать цели' }}
        </button>

        <!-- Таймер симуляции -->
        <div>Время симуляции: {{ ecosystem.simTime.toFixed(1) }} сек</div>

        <!-- Слайдеры для начальных количеств существ -->
        <label>
          Растений: {{ plantCount }}
          <input type="range" min="0" max="30" v-model.number="plantCount" />
        </label>

        <label>
          Травоядных: {{ herbivoreCount }}
          <input type="range" min="0" max="30" v-model.number="herbivoreCount" />
        </label>

        <label>
          Хищников: {{ predatorCount }}
          <input type="range" min="0" max="30" v-model.number="predatorCount" />
        </label>

        <!-- Шанс смены направления -->
        <label>
          Вероятность смены направления: {{ directionChangeChance }}%
          <input type="range" min="0" max="100" step="1" v-model.number="directionChangeChance" />
        </label>

        <!-- Шанс появления новых растений -->
        <label>
          Шанс появления новых растений: {{ plantsSpawnChance }}%
          <input type="range" min="0" max="100" step="1" v-model.number="plantsSpawnChance" />
        </label>
      </div>

      <!-- Поле canvas -->
      <canvas ref="canvas" :width="width" :height="height" class="ecosystem-canvas" />
    </div>

    <!-- Всплывающая подсказка при наведении -->
    <div
      v-if="hoveredCreature"
      class="tooltip"
      :style="{ top: `${mouseY + 10}px`, left: `${mouseX + 10}px` }"
    >
      <div><strong>Тип:</strong> {{ hoveredCreature instanceof Herbivore ? 'Травоядное' : 'Хищник' }}</div>
      <div><strong>Энергия:</strong> {{ hoveredCreature.energy.toFixed(1) }}</div>
      <div><strong>Скорость:</strong> {{ hoveredCreature.speed.toFixed(2) }}</div>
      <div><strong>Восприятие:</strong> {{ hoveredCreature.perception.toFixed(0) }}</div>
    </div>
  </div>
</template>

<script setup>
// Импорт из Vue
import { ref, onMounted, onUnmounted, computed } from 'vue'

// Импортируем классы
import Ecosystem from './Ecosystem.js'
import Herbivore from '../models/Herbivore.js'

// Ссылки и состояния
const canvas = ref(null)
const ctx = ref(null)
const width = 1000
const height = 600

// Экосистема
const ecosystem = ref(new Ecosystem(width, height))
const isRunning = ref(true)
const speedMultiplier = ref(1)

// Параметры управления
const directionChangeChance = ref(15)
const plantCount = ref(30)
const plantsSpawnChance = ref(25)
const herbivoreCount = ref(10)
const predatorCount = ref(5)

// Подсказка при наведении
const hoveredCreature = ref(null)
const mouseX = ref(0)
const mouseY = ref(0)

let updateInterval = null
let lastTime = performance.now()

// Основной цикл отрисовки
function loop() {
  const now = performance.now()
  const deltaTime = (now - lastTime) * speedMultiplier.value
  lastTime = now

  if (ctx.value) {
  ecosystem.value.simTime += deltaTime / 1000 // теперь время обновляется точно
  ecosystem.value.update(deltaTime, directionChangeChance.value, plantsSpawnChance.value)
  ecosystem.value.draw(ctx.value)
}
}

// Переключение целей
function toggleShowTargets() {
  ecosystem.value.showTargets = !ecosystem.value.showTargets
}

// Отслеживание курсора и определение попадания по объекту
function handleMouseMove(e) {
  const rect = canvas.value.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  mouseX.value = e.clientX
  mouseY.value = e.clientY

  hoveredCreature.value = null
  const allCreatures = [...ecosystem.value.herbivores, ...ecosystem.value.predators]

  for (const creature of allCreatures) {
    const dx = x - creature.x
    const dy = y - creature.y
    const dist = Math.sqrt(dx * dx + dy * dy)
    if (dist <= creature.radius) {
      hoveredCreature.value = creature
      break
    }
  }
}

// Назначение обработчика мыши
function setupMouseTracking() {
  canvas.value.removeEventListener('mousemove', handleMouseMove)
  canvas.value.addEventListener('mousemove', handleMouseMove)
}

// Запуск симуляции
function startSimulation() {
  stopSimulation()
  updateInterval = setInterval(loop, 1000 / 30 / speedMultiplier.value)
  setupMouseTracking()
  isRunning.value = true
}

// Остановка симуляции
function stopSimulation() {
  clearInterval(updateInterval)
  updateInterval = null
  isRunning.value = false
}

// Переключение симуляции
function toggleSimulation() {
  isRunning.value ? stopSimulation() : startSimulation()
}

// Контроль изменения скорости симуляции
function handleSpeedChange() {
  if (isRunning.value) {
    startSimulation()
  }
}

// Сброс состояния
function resetSimulation() {
  ecosystem.value.plants = []
  ecosystem.value.herbivores = []
  ecosystem.value.predators = []
  ecosystem.value.simTime = 0

  ecosystem.value.spawnPlants(plantCount.value)
  ecosystem.value.spawnHerbivores(herbivoreCount.value)
  ecosystem.value.spawnPredators(predatorCount.value)
}

// Статистика (computed)
const plantCountActual = computed(() => ecosystem.value.plants.length)

const herbivoreCountActual = computed(() => ecosystem.value.herbivores.length)
const herbivoreAvgSpeed = computed(() =>
  ecosystem.value.herbivores.length ? ecosystem.value.herbivores.reduce((acc, h) => acc + h.speed, 0) / ecosystem.value.herbivores.length : 0
)
const herbivoreAvgPerception = computed(() =>
  ecosystem.value.herbivores.length ? ecosystem.value.herbivores.reduce((acc, h) => acc + h.perception, 0) / ecosystem.value.herbivores.length : 0
)

const predatorCountActual = computed(() => ecosystem.value.predators.length)
const predatorAvgSpeed = computed(() =>
  ecosystem.value.predators.length ? ecosystem.value.predators.reduce((acc, p) => acc + p.speed, 0) / ecosystem.value.predators.length : 0
)
const predatorAvgPerception = computed(() =>
  ecosystem.value.predators.length ? ecosystem.value.predators.reduce((acc, p) => acc + p.perception, 0) / ecosystem.value.predators.length : 0
)

// Монтирование
onMounted(() => {
  ctx.value = canvas.value.getContext('2d')
  resetSimulation()
  startSimulation()
})

// Очистка при размонтировании
onUnmounted(() => {
  stopSimulation()
})
</script>

<style scoped>
.ecosystem {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  padding: 10px;
}

.stats-panel {
  width: 220px;
  color:black;
  background: #f0f8ff;
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 15px;
  font-size: 14px;
  box-shadow: 2px 2px 8px rgba(0,0,0,0.1);
}

.stats-panel h3 {
  margin-top: 0;
  color:black;
  margin-bottom: 15px;
  text-align: center;
}

.stat-block {
  color:black;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ddd;
}

.stat-block:last-child {
  color:black;
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.main-panel {
  flex-grow: 1;
}

.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 10px;
  justify-content: center;
  align-items: center;
}

label {
  display: flex;
  align-items: center;
  gap: 8px;
}

input[type="range"] {
  width: 120px;
}

canvas {
  border: 1px solid #444;
  background: #f8fff0;
  display: block;
  margin: 0 auto;
}

.tooltip {
  position: fixed;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid #aaa;
  color: black;
  padding: 6px 10px;
  font-size: 13px;
  border-radius: 6px;
  box-shadow: 2px 2px 6px rgba(0, 0, 0, 0.2);
  pointer-events: none;
  z-index: 100;
  white-space: nowrap;
}
</style>