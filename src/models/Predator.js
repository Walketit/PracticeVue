import Animal from './Animal.js'

export default class Predator extends Animal {
  constructor(x, y) {
    super(x, y, 'red')
  }

  canReproduceWith(other) {
    return (
      this !== other &&
      this.energy > 100 &&
      other.energy > 100 &&
      this.distanceTo(other) < this.perception
    )
  }

  reproduceWith(partner) {
  const child = new Predator(
    (this.x + partner.x) / 2 + (Math.random() - 0.5) * 10,
    (this.y + partner.y) / 2 + (Math.random() - 0.5) * 10
  )

  // Мутация скорости
  const speedRoll = Math.floor(Math.random() * (1.0 - 0.1)) + 0.1
  if (speedRoll < 0.4) child.speed = this.speed
  else if (speedRoll < 0.8) child.speed = partner.speed
  else child.speed = 0.5 + Math.random() * 2

  // Мутация восприятия
  const perceptionRoll = Math.floor(Math.random() * (1.0 - 0.1)) + 0.1
  if (perceptionRoll < 0.4) child.perception = this.perception
  else if (perceptionRoll < 0.8) child.perception = partner.perception
  else child.perception = 70 + Math.random() * 40

  this.energy *= 0.5
  partner.energy *= 0.5

  return child
}


  update(ecosystem) {
    switch (this.targetType) {
      case 'prey': {
        const prey = this.target
        if (!prey || prey.isDead?.()) {
          this.resetTarget()
          break
        }
        const dx = prey.x - this.x
        const dy = prey.y - this.y
        const len = Math.sqrt(dx * dx + dy * dy)

        if (len < this.radius + prey.radius) {
          prey.energy = 0
          this.eat(30)
          this.resetTarget()
        } else {
          this.dx = (dx / len) * this.speed
          this.dy = (dy / len) * this.speed
        }
        break
      }

      case 'partner': {
        const partner = this.target
        if (!partner || partner.isDead?.() || !this.canReproduceWith(partner)) {
          this.resetTarget()
          break
        }
        const dx = partner.x - this.x
        const dy = partner.y - this.y
        const len = Math.sqrt(dx * dx + dy * dy)

        if (len < this.radius * 2) {
          const child = this.reproduceWith(partner)
          ecosystem.predators.push(child)
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
        for (const other of ecosystem.predators) {
          if (this.canReproduceWith(other)) {
            this.target = other
            this.targetType = 'partner'
            break
          }
        }
        if (!this.target) {
          let closestPrey = null
          let minDist = Infinity
          for (const herb of ecosystem.herbivores) {
            const d = this.distanceTo(herb)
            if (d < this.perception && d < minDist) {
              closestPrey = herb
              minDist = d
            }
          }
          if (closestPrey) {
            this.target = closestPrey
            this.targetType = 'prey'
          }
        }
        break
      }
    }
    this.maybeRandomizeDirection()
    this.move(ecosystem.width, ecosystem.height)
  }
}