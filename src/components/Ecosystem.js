import Plant from '../models/Plant.js'
import Herbivore from '../models/Herbivore.js'
import Predator from '../models/Predator.js'
import herbivoreImgSrc from '../assets/lamb.png'
import predatorImgSrc from '../assets/wolf.png'

const herbivoreImg = new Image()
herbivoreImg.src = herbivoreImgSrc

const predatorImg = new Image()
predatorImg.src = predatorImgSrc

export default class Ecosystem {
  constructor(width, height) {
    this.width = width
    this.height = height
    this.plants = []
    this.herbivores = []
    this.predators = []
    this.simTime = 0
    this.plantSpawnTimer = 0
    this.showTargets = true // Добавляем свойство для отображения целей
    this.directionChangeChance = 100 // Default value
  }

  spawnPlants(count) {
    for (let i = 0; i < count; i++) {
      this.plants.push(new Plant(
        Math.random() * this.width,
        Math.random() * this.height
      ))
    }
  }

  spawnHerbivores(count) {
    for (let i = 0; i < count; i++) {
      this.herbivores.push(new Herbivore(
        Math.random() * this.width,
        Math.random() * this.height
      ))
    }
  }

  spawnPredators(count) {
    for (let i = 0; i < count; i++) {
      this.predators.push(new Predator(
        Math.random() * this.width,
        Math.random() * this.height
      ))
    }
  }

  reset() {
    this.plants = []
    this.herbivores = []
    this.predators = []
    this.simTime = 0

    this.spawnPlants(30)
    this.spawnHerbivores(10)
    this.spawnPredators(5)
  }

  update(deltaTime, directionChance, spawnChance) {
  this.directionChangeChance = directionChance
  this.plantSpawnTimer += deltaTime

  if (this.plantSpawnTimer >= 3000) {
    this.plantSpawnTimer = 0
    if ((Math.floor(Math.random() * (100 - 1)) + 1) < spawnChance) {
      this.spawnPlants(3)
    }
  }

  this.plants.forEach(p => p.update(deltaTime))
  this.herbivores = this.herbivores.filter(h => !h.isDead())
  this.predators = this.predators.filter(p => !p.isDead())
  this.plants = this.plants.filter(p => p.isAvailable || p.isRecharging)

  this.herbivores.forEach(h => h.update(this))
  this.predators.forEach(p => p.update(this))
}

   draw(ctx) {
    // Очищаем canvas
    ctx.fillStyle = '#ccffcc'
    ctx.fillRect(0, 0, this.width, this.height)

    // Рисуем растения
    this.plants.forEach(p => p.draw(ctx))

    // Рисуем травоядных с целями, если нужно
    this.herbivores.forEach(h => {
      if (this.showTargets) {
        ctx.strokeStyle = 'rgba(0, 0, 255, 0.2)'
        ctx.beginPath()
        ctx.arc(h.x, h.y, h.perception, 0, Math.PI * 2)
        ctx.stroke()
      }
      ctx.drawImage(herbivoreImg, h.x - 12, h.y - 12, 24, 24)
    })

    // Рисуем хищников
    this.predators.forEach(p => { 
       if (this.showTargets) {
        ctx.strokeStyle = 'rgba(255, 0, 0, 0.2)'
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.perception, 0, Math.PI * 2)
        ctx.stroke()
    }
        ctx.drawImage(predatorImg, p.x - 14, p.y - 14, 28, 28)})
  }
}