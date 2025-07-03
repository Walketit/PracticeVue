// Класс травоядного животного
import Animal from './Animal.js'

export default class Herbivore extends Animal {
  constructor(x, y) {
    super(x, y)
  }

  // Проверка возможности размножения
  canReproduceWith(other) {
    return (
      this !== other &&
      this.energy > 100 &&
      other.energy > 100 &&
      this.distanceTo(other) < this.perception
    )
  }

  // Размножение
  reproduceWith(partner) {
    const child = new Herbivore(
      (this.x + partner.x) / 2 + (Math.random() - 0.5) * 10,
      (this.y + partner.y) / 2 + (Math.random() - 0.5) * 10
    )

    const speedRoll = Math.floor(Math.random() * (1.0 - 0.1)) + 0.1
    if (speedRoll < 0.4) child.speed = this.speed
    else if (speedRoll < 0.8) child.speed = partner.speed
    else child.speed = 0.5 + Math.random() * 2

    const perceptionRoll = Math.floor(Math.random() * (1.0 - 0.1)) + 0.1
    if (perceptionRoll < 0.4) child.perception = this.perception
    else if (perceptionRoll < 0.8) child.perception = partner.perception
    else child.perception = 70 + Math.random() * 40

    this.energy *= 0.5
    partner.energy *= 0.5

    return child
  }

  // Основное поведение
  update(ecosystem) {
    // Поиск хищников в радиусе восприятия
    const threats = ecosystem.predators.filter(pred => this.distanceTo(pred) < this.perception)

    if (threats.length > 0) {
      // Центр масс угроз для выбора направления отступления
      let avgX = 0, avgY = 0
      threats.forEach(pred => {
        avgX += pred.x
        avgY += pred.y
      })
      avgX /= threats.length
      avgY /= threats.length

      this.target = { x: avgX, y: avgY }
      this.targetType = 'threat'
    } else if (this.targetType === 'threat') {
      this.resetTarget()
    }

    // Поведение в зависимости от цели
    switch (this.targetType) {
      case 'threat': {
        // Убегание от угроз
        const dx = this.x - this.target.x
        const dy = this.y - this.target.y
        const len = Math.sqrt(dx * dx + dy * dy)

        if (len > this.perception * 1.2) {
          this.resetTarget()
        } else if (len > 1) {
          this.dx = (dx / len) * this.speed
          this.dy = (dy / len) * this.speed
        }
        break
      }

      case 'plant': {
        // Поедание растения
        const plant = this.target
        if (!plant.isAvailable || plant.isRecharging) {
          this.resetTarget()
          break
        }
        const dx = plant.x - this.x
        const dy = plant.y - this.y
        const len = Math.sqrt(dx * dx + dy * dy)

        if (len < this.radius + plant.radius) {
          if (plant.tryRecharge()) {
            this.eat(20)
          } else {
            plant.isAvailable = false
            this.eat(20)
          }
          this.resetTarget()
        } else {
          this.dx = (dx / len) * this.speed
          this.dy = (dy / len) * this.speed
        }
        break
      }

      case 'partner': {
        // Размножение
        const partner = this.target
        if (!partner || partner.isDead() || !this.canReproduceWith(partner)) {
          this.resetTarget()
          break
        }
        const dx = partner.x - this.x
        const dy = partner.y - this.y
        const len = Math.sqrt(dx * dx + dy * dy)

        if (len < this.radius * 2) {
          const child = this.reproduceWith(partner)
          ecosystem.herbivores.push(child)
          this.resetTarget()
          partner.resetTarget?.()
          child.move()
        } else {
          this.dx = (dx / len) * this.speed
          this.dy = (dy / len) * this.speed
        }
        break
      }

      case null: {
        // Поиск новой цели
        for (const other of ecosystem.herbivores) {
          if (this.canReproduceWith(other)) {
            this.target = other
            this.targetType = 'partner'
            break
          }
        }
        if (!this.target) {
          const plant = this.findNearestPlant(ecosystem.plants)
          if (plant) {
            this.target = plant
            this.targetType = 'plant'
          }
        }
        break
      }
    }

    this.maybeRandomizeDirection(ecosystem.directionChangeChance)
    this.move(ecosystem.width, ecosystem.height)
  }
}