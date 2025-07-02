export default class Plant {
  constructor(x, y) {
    this.x = x
    this.y = y
    this.radius = 5
    this.baseColor = 'green'
    this.rechargingColor = 'gray'

    this.isAvailable = true

    this.rechargeThreshold = 0.1  // минимальный шанс уйти на перезарядку (10%)
    this.rechargeChance = 0.5 + Math.random() * 0.5 // начальный шанс от 50% до 100%
    this.isRecharging = false
    this.rechargeTime = 5000 // 5 секунд перезарядки (можно менять)
    this.rechargeTimer = 0
  }

  draw(ctx) {
    ctx.fillStyle = this.isRecharging ? this.rechargingColor : this.baseColor
    if (this.isAvailable || this.isRecharging) {
      ctx.beginPath()
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  update(deltaTime) {
    if (this.isRecharging) {
      this.rechargeTimer -= deltaTime
      if (this.rechargeTimer <= 0) {
        this.isRecharging = false
        this.isAvailable = true
      }
    }
  }

  tryRecharge() {
    if (!this.isRecharging) {
      const roll = Math.random()
      if (roll < this.rechargeChance) {
        this.isAvailable = false
        this.isRecharging = true
        this.rechargeTimer = this.rechargeTime
        // уменьшаем шанс, но не ниже порога
        this.rechargeChance = Math.max(this.rechargeThreshold, this.rechargeChance * 0.7)
        return true
      }
    }
    return false
  }
}
