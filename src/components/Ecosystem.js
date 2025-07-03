// Импортируем классы моделей
import Plant from '../models/Plant.js'
import Herbivore from '../models/Herbivore.js'
import Predator from '../models/Predator.js'

// Импорт изображений
import herbivoreImgSrc from '../assets/lamb.png'
import predatorImgSrc from '../assets/wolf.png'

// Создание объектов изображений
const herbivoreImg = new Image()
herbivoreImg.src = herbivoreImgSrc

const predatorImg = new Image()
predatorImg.src = predatorImgSrc

// Основной класс экосистемы
export default class Ecosystem {
  constructor(width, height) {
    // Размеры поля
    this.width = width
    this.height = height

    // Списки объектов на поле
    this.plants = []
    this.herbivores = []
    this.predators = []

    // Время симуляции и таймер появления растений
    this.simTime = 0
    this.plantSpawnTimer = 0

    // Показ радиусов восприятия
    this.showTargets = true

    // Вероятность смены направления
    this.directionChangeChance = 15
  }

  // Создание растений
  spawnPlants(count) {
    for (let i = 0; i < count; i++) {
      this.plants.push(new Plant(
        Math.random() * this.width,
        Math.random() * this.height
      ))
    }
  }

  // Создание травоядных
  spawnHerbivores(count) {
    for (let i = 0; i < count; i++) {
      this.herbivores.push(new Herbivore(
        Math.random() * this.width,
        Math.random() * this.height
      ))
    }
  }

  // Создание хищников
  spawnPredators(count) {
    for (let i = 0; i < count; i++) {
      this.predators.push(new Predator(
        Math.random() * this.width,
        Math.random() * this.height
      ))
    }
  }

  // Сброс экосистемы
  reset() {
    this.plants = []
    this.herbivores = []
    this.predators = []
    this.simTime = 0

    this.spawnPlants(30)
    this.spawnHerbivores(10)
    this.spawnPredators(5)
  }

  // Обновление состояния мира
  update(deltaTime, directionChance, spawnChance) {
    this.directionChangeChance = directionChance
    this.plantSpawnTimer += deltaTime

    // Попытка спавна новых растений
    if (this.plantSpawnTimer >= 3000) {
      this.plantSpawnTimer = 0
      if ((Math.floor(Math.random() * (100 - 1)) + 1) < spawnChance) {
        this.spawnPlants(3)
      }
    }

    // Обновление состояния объектов
    this.plants.forEach(p => p.update(deltaTime))
    this.herbivores = this.herbivores.filter(h => !h.isDead())
    this.predators = this.predators.filter(p => !p.isDead())
    this.plants = this.plants.filter(p => p.isAvailable || p.isRecharging)

    this.herbivores.forEach(h => h.update(this))
    this.predators.forEach(p => p.update(this))
  }

  // Отрисовка всех элементов
  draw(ctx) {
    // Очистка фона
    ctx.fillStyle = '#ccffcc'
    ctx.fillRect(0, 0, this.width, this.height)

    // Растения
    this.plants.forEach(p => p.draw(ctx))

    // Травоядные (с радиусом восприятия при включенной опции)
    this.herbivores.forEach(h => {
      if (this.showTargets) {
        ctx.strokeStyle = 'rgba(0, 0, 255, 0.2)'
        ctx.beginPath()
        ctx.arc(h.x, h.y, h.perception, 0, Math.PI * 2)
        ctx.stroke()
      }
      ctx.drawImage(herbivoreImg, h.x - 12, h.y - 12, 24, 24)
    })

    // Хищники (также с радиусом)
    this.predators.forEach(p => { 
      if (this.showTargets) {
        ctx.strokeStyle = 'rgba(255, 0, 0, 0.2)'
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.perception, 0, Math.PI * 2)
        ctx.stroke()
      }
      ctx.drawImage(predatorImg, p.x - 14, p.y - 14, 28, 28)
    })
  }
}
