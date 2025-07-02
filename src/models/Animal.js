export default class Animal {
  constructor(x, y, color) {
    this.x = x
    this.y = y
    this.color = color
    this.radius = 8
    this.speed = 0.5 + Math.random();
    this.energy = 100
    this.maxEnergy = 150
    this.energyLossRate = 0.1
    this.age = 0
    this.perception = 60 + Math.random() * 40
    this.dx = (Math.random() - 0.5) * this.speed
    this.dy = (Math.random() - 0.5) * this.speed
    this.lastDirectionChange = Date.now()
    this.target = null
    this.targetType = null
  }

  move(width, height) {
    this.x += this.dx
    this.y += this.dy

    // Ограничение по границам
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

    this.energy -= this.energyLossRate
    if (this.energy < 0) this.energy = 0
  }

  isDead() {
    return this.energy <= 0
  }

  eat(amount) {
    this.energy = Math.min(this.maxEnergy, this.energy + amount)
  }

  draw(ctx) {
    ctx.fillStyle = this.color
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
    ctx.fill()
  }

  distanceTo(other) {
    const dx = this.x - other.x
    const dy = this.y - other.y
    return Math.sqrt(dx * dx + dy * dy)
  }

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

  resetTarget() {
    this.target = null
    this.targetType = null
  }

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