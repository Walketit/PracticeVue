// Класс растения
export default class Plant {
  constructor(x, y) {
    this.x = x
    this.y = y
    this.radius = 5 // радиус отображения
    this.baseColor = 'green' // основной цвет
    this.rechargingColor = 'gray' // цвет во время перезарядки
    this.isAvailable = true // доступно ли для поедания
    this.rechargeThreshold = 0.1 // минимальный шанс на перезарядку
    this.rechargeChance = 0.5 + Math.random() * 0.5 // шанс на перезарядку
    this.isRecharging = false // находится ли в перезарядке
    this.rechargeTime = 5000 // длительность перезарядки в мс
    this.rechargeTimer = 0 // таймер перезарядки
  }

  // Отрисовка растения
  draw(ctx) {
    ctx.fillStyle = this.isRecharging ? this.rechargingColor : this.baseColor
    if (this.isAvailable || this.isRecharging) {
      ctx.beginPath()
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  // Обновление состояния
  update(deltaTime) {
    if (this.isRecharging) {
      this.rechargeTimer -= deltaTime
      if (this.rechargeTimer <= 0) {
        this.isRecharging = false
        this.isAvailable = true
      }
    }
  }

  // Попытка уйти в перезарядку после съедения
  tryRecharge() {
    if (!this.isRecharging) {
      const roll = Math.random()
      if (roll < this.rechargeChance) {
        this.isAvailable = false
        this.isRecharging = true
        this.rechargeTimer = this.rechargeTime
        this.rechargeChance = Math.max(this.rechargeThreshold, this.rechargeChance * 0.7)
        return true
      }
    }
    return false
  }
}
