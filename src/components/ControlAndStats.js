import { computed } from 'vue'

export function createLoop(ctx, ecosystemRef, speedMultiplier, directionChangeChance, plantsSpawnChance) {
  let lastTime = performance.now()

  return function loop() {
    const now = performance.now()
    const deltaTime = (now - lastTime) * speedMultiplier.value
    lastTime = now

    if (ctx.value) {
      ecosystemRef.value.simTime += deltaTime / 1000
      ecosystemRef.value.update(deltaTime, directionChangeChance.value, plantsSpawnChance.value)
      ecosystemRef.value.draw(ctx.value)
    }
  }
}

export function useSimulationControls(loopFn, speedMultiplier, isRunning) {
  let updateInterval = null

  function startSimulation() {
    stopSimulation()
    updateInterval = setInterval(loopFn, 1000 / 30 / speedMultiplier.value)
    isRunning.value = true
  }

  function stopSimulation() {
    clearInterval(updateInterval)
    updateInterval = null
    isRunning.value = false
  }

  function toggleSimulation() {
    isRunning.value ? stopSimulation() : startSimulation()
  }

  function handleSpeedChange() {
    if (isRunning.value) {
      startSimulation()
    }
  }

  return {
    startSimulation,
    stopSimulation,
    toggleSimulation,
    handleSpeedChange,
  }
}

export function useStats(ecosystem) {
  const plantCountActual = computed(() => ecosystem.value.plants.length)

  const herbivoreCountActual = computed(() => ecosystem.value.herbivores.length)
  const herbivoreAvgSpeed = computed(() =>
    ecosystem.value.herbivores.length
      ? ecosystem.value.herbivores.reduce((acc, h) => acc + h.speed, 0) / ecosystem.value.herbivores.length
      : 0
  )
  const herbivoreAvgPerception = computed(() =>
    ecosystem.value.herbivores.length
      ? ecosystem.value.herbivores.reduce((acc, h) => acc + h.perception, 0) / ecosystem.value.herbivores.length
      : 0
  )

  const predatorCountActual = computed(() => ecosystem.value.predators.length)
  const predatorAvgSpeed = computed(() =>
    ecosystem.value.predators.length
      ? ecosystem.value.predators.reduce((acc, p) => acc + p.speed, 0) / ecosystem.value.predators.length
      : 0
  )
  const predatorAvgPerception = computed(() =>
    ecosystem.value.predators.length
      ? ecosystem.value.predators.reduce((acc, p) => acc + p.perception, 0) / ecosystem.value.predators.length
      : 0
  )

  return {
    plantCountActual,
    herbivoreCountActual,
    herbivoreAvgSpeed,
    herbivoreAvgPerception,
    predatorCountActual,
    predatorAvgSpeed,
    predatorAvgPerception,
  }
}

export function setupMouseTracking(canvasRef, ecosystem, hoveredCreature, mouseX, mouseY) {
  function handleMouseMove(e) {
    const rect = canvasRef.value.getBoundingClientRect()
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

  canvasRef.value.addEventListener('mousemove', handleMouseMove)
}

export function resetSimulation(ecosystem, plantCount, herbivoreCount, predatorCount) {
  ecosystem.value.plants = []
  ecosystem.value.herbivores = []
  ecosystem.value.predators = []
  ecosystem.value.simTime = 0

  ecosystem.value.spawnPlants(plantCount.value)
  ecosystem.value.spawnHerbivores(herbivoreCount.value)
  ecosystem.value.spawnPredators(predatorCount.value)
}

