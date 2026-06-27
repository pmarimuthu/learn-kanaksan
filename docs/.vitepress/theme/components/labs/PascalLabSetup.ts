export function setup(
  canvas: HTMLCanvasElement,
  getR: () => number,
  onTick: (p: number, f1: number, f2: number) => void
) {
  const M = (window as any).Matter
  const { Engine, Render, Runner, Bodies, Body, Composite, Events, Mouse, MouseConstraint } = M

  const W = 480, H = 280
  const SX = 106, NAT = 100, FLOOR = 248, SW = 52
  const LX = 362, LW = 96

  const engine = Engine.create({ gravity: { y: 2 } })
  const render = Render.create({
    canvas, engine,
    options: { width: W, height: H, wireframes: false, background: '#f0f9ff' }
  })

  const box = (x:number,y:number,w:number,h:number,c:string,s=true) =>
    Bodies.rectangle(x,y,w,h,{isStatic:s,render:{fillStyle:c}})

  const world = [
    box(79,  170, 10, 165, '#475569'),
    box(133, 170, 10, 165, '#475569'),
    box(SX,  258, SW+8, 10, '#93c5fd'),
    box(220, 258, 172, 10, '#93c5fd'),
    box(313, 232, 10,  52, '#93c5fd'),
    box(412, 170, 10, 165, '#475569'),
    box(313, 170, 10, 165, '#475569'),
    box(LX,  258, LW+8, 10, '#93c5fd'),
  ]

  const sp = Bodies.rectangle(SX, NAT, SW, 14, {
    friction: 0.05, frictionAir: 0.25, mass: 2,
    inertia: Infinity, inverseInertia: 0,
    render: { fillStyle: '#ef4444' },
  })

  const lp  = box(LX, 148, LW, 14, '#2563eb', true)
  const car = box(LX, 128, 80, 18, '#10b981', true)

  const label = (txt:string,x:number,y:number) => ({
    label: txt, position:{x,y}, isStatic:true,
    render:{text:{content:txt,size:11,color:'#64748b'},fillStyle:'transparent'},
    collisionFilter:{mask:0},
    _label: txt
  })

  Composite.add(engine.world, [...world, sp, lp, car])

  const mouse = Mouse.create(canvas)
  const mc = MouseConstraint.create(engine, {
    mouse, constraint: { stiffness: 0.3, render: { visible: false } }
  })
  Composite.add(engine.world, mc)

  Events.on(engine, 'afterUpdate', () => {
    const sy = Math.max(68, Math.min(FLOOR - 8, sp.position.y))
    Body.setPosition(sp, { x: SX, y: sy })
    Body.setVelocity(sp, { x: 0, y: sp.velocity.y })

    const d1  = Math.max(0, sy - NAT)
    const r   = getR()
    const lpy = 148 - d1 / r
    Body.setPosition(lp,  { x: LX, y: lpy })
    Body.setPosition(car, { x: LX, y: lpy - 16 })

    const A1 = 0.001
    const f1 = sp.mass * 10 + d1 * 0.6
    const p  = f1 / A1
    onTick(p / 1000, f1, f1 * r)
  })

  Events.on(render, 'afterRender', () => {
    const ctx = render.context
    ctx.font = '11px system-ui'
    ctx.fillStyle = '#475569'
    ctx.textAlign = 'center'
    ctx.fillText('A₁ = 10 cm²', SX, 272)
    ctx.fillText(`A₂ = ${getR() * 10} cm²`, LX, 272)
    ctx.fillStyle = '#ef4444'
    ctx.fillText('← drag me', SX, 55)
    ctx.fillStyle = '#10b981'
    ctx.fillText('🚗 car', LX, 108)
  })

  const runner = Runner.create()
  Runner.run(runner, engine)
  Render.run(render)

  return () => { Render.stop(render); Runner.stop(runner) }
}
