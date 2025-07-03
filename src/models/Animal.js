// Базовый класс для Травоядных и Хищников
export default class Animal {
  constructor(x, y, color) {
    this.x = x // позиция X на поле
    this.y = y // позиция Y на поле
    this.radius = 8 // радиус отображения модельки
    this.speed = 0.5 + Math.random() // скорость передвижения (0.5 - 1.5)
    this.energy = 100 // текущая энергия
    this.maxEnergy = 150 // максимальная энергия
    this.energyLossRate = 0.1 // скорость потери энергии
    this.perception = 60 + Math.random() * 40 // радиус восприятия
    this.dx = (Math.random() - 0.5) * this.speed // направление движения по X
    this.dy = (Math.random() - 0.5) * this.speed // направление движения по Y
    this.lastDirectionChange = Date.now() // время последней смены направления
    this.target = null // текущая цель
    this.targetType = null // тип цели: "partner", "plant", "threat", "prey"
  }

  // Перемещение существа с учетом границ
  move(width, height) {
    this.x += this.dx
    this.y += this.dy

    // Столкновение с границами мира
    if (this.x < this.radius) {
      this.x = this.radius
      this.dx = Math.abs(this.dx)
    } else if (this.x > width - this.radius) {
      this.x = width - this.radius
      this.dx = -Math.abs(this.dx)
    }

    if (this.y < this.radius) {
      this.y = this.radius
      this.dy = Math.abs(this.dy)
    } else if (this.y > height - this.radius) {
      this.y = height - this.radius
      this.dy = -Math.abs(this.dy)
    }

    // Уменьшение энергии
    this.energy -= this.energyLossRate
    if (this.energy < 0) this.energy = 0
  }

  // Проверка, умерло ли существо
  isDead() {
    return this.energy <= 0
  }

  // Питание: восстановление энергии
  eat(amount) {
    this.energy = Math.min(this.maxEnergy, this.energy + amount)
  }

  // Отрисовка существа
  draw(ctx) {
    ctx.fillStyle = this.color
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
    ctx.fill()
  }

  // Расстояние до другого объекта
  distanceTo(other) {
    const dx = this.x - other.x
    const dy = this.y - other.y
    return Math.sqrt(dx * dx + dy * dy)
  }

  // Проверка на случайное изменение направления движения
  maybeRandomizeDirection(chance) {
    if ((Date.now() - this.lastDirectionChange) >= 1000) {
      this.lastDirectionChange = Date.now()
      if (Math.floor(Math.random() * (100 - 1)) + 1 < chance) {
        const angle = Math.random() * 2 * Math.PI
        this.dx = Math.cos(angle) * this.speed
        this.dy = Math.sin(angle) * this.speed
      }
    }
  }

  // Сброс цели
  resetTarget() {
    this.target = null
    this.targetType = null
  }

  // Поиск ближайшего растения
  findNearestPlant(plants) {
    let nearest = null
    let minDist = Infinity

    for (const plant of plants) {
      if (!plant.isAvailable) continue
      const dist = this.distanceTo(plant)
      if (dist < this.perception && dist < minDist) {
        minDist = dist
        nearest = plant
      }
    }

    return nearest
  }

}
