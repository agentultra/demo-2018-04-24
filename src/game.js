const canvas = document.getElementById('stage')
, stage = canvas.getContext('2d')
, stageW = 800
, stageH = 400
, state = {}
, INVINCIBLE_DURATION = 40

canvas.width = stageW
canvas.height = stageH

const clr = () => {
    stage.fillStyle = 'black'
    stage.fillRect(0, 0, stageW, stageH)
}

const range = (min, max) => {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min)) + min
}

const collision = (box1, box2) =>
      (box1.x < box2.x + 20 &&
       box1.x + 20 > box2.x &&
       box1.y < box2.y + 20 &&
       box1.y + 20 > box2.y)

const init = () => Object.assign(state, {
    tick: 0,
    player: {
        x: 50,
        y: 50,
        w: 20,
        h: 20,
        dx: 0,
        dy: 0,
        targetX: 50,
        targetY: 50,
        speed: 4,
        hp: 3,
        invincibleTimer: 0
    },
    goal: {
        x: range(0, 780),
        y: range(0, 380),
        w: 20, h: 20
    },
    score: 0,
    blocks: [],
    gameover: false
})

const updatePlayerMove = dt => {
    const {player} = state

    const dirX = player.targetX > player.x
          ? 1
          : player.targetX === player.x
          ? 0
          : -1
    , dirY = player.targetY > player.y
          ? 1
          : player.targetY === player.y
          ? 0
          : -1
    , xTargetDist = Math.abs(player.targetX - player.x)
    , yTargetDist = Math.abs(player.targetY - player.y)

    player.dx = xTargetDist <= player.speed
        ? 0
        : dirX * player.speed
    player.dy = yTargetDist <= player.speed
        ? 0
        : dirY * player.speed
    player.x += player.dx
    player.y += player.dy
}

const addBlock = x => {
    state.blocks.push({
        x, y: -20,
        w: 20,
        h: 20,
        dy: 1
    })
}

const blockHitsPlayer = block => {
    const {player} = state
    
    return collision(block, player)
}

const updateBlocks = dt => {
    const {blocks, player} = state

    for (let block of blocks) {
        block.y += block.dy
        if (player.invincibleTimer <= 0) {
            if (blockHitsPlayer(block)) {
                state.player.hp -= 1
                player.invincibleTimer = INVINCIBLE_DURATION
            }
        }
    }

    Object.assign(state, {
        blocks: blocks.filter(b => b.y < 400)
    })
}

const update = dt => {
    const {goal, player, tick} = state

    if (state.gameover === false) {
        updatePlayerMove(dt)

        if (tick % 33 === 0) {
            addBlock(range(20, 780))
        }

        updateBlocks(dt)

        if (player.invincibleTimer > 0) {
            player.invincibleTimer -= 1
        }

        if (collision(player, goal)) {
            state.score += 1
            state.goal = {
                x: range(0, 780),
                y: range(0, 380),
                w: 20, h: 20
            }
        }
    }

    if (player.hp <= 0) {
        state.gameover = true
    }
}

const render = () => {
    clr()

    const {blocks, goal, player, tick} = state

    if (player.invincibleTimer <= 0) {
        stage.fillStyle = 'yellow'
    } else {
        stage.fillStyle = tick % 4 == 0
            ? 'red'
            : 'white'
    }
    stage.fillRect(player.x, player.y,
                   player.w, player.h)

    stage.fillStyle = 'green'
    stage.fillRect(goal.x, goal.y,
                   goal.w, goal.h)

    for (let block of blocks) {
        stage.fillStyle = 'white'
        stage.fillRect(block.x, block.y,
                       block.w, block.h)
    }

    stage.fillStyle = 'green'
    for (let i = 0; i < player.hp; i++) {
        stage.fillRect(10 + (i * 10), 15, 10, 10)
    }

    stage.fillStyle = 'red'
    stage.fillText(`Score: ${state.score}`, 15, 380)

    if (state.gameover === true) {
        stage.fillStyle = 'red'
        stage.fillText('GAME OVER', stageW / 2, stageH / 2)
    }
}

const loop = dt => {
    update(dt)
    render()
    state.tick += 1
    window.requestAnimationFrame(loop)
}

init()
window.requestAnimationFrame(loop)

canvas.onmousedown = ev => {
    state.player.targetX = ev.x
    state.player.targetY = ev.y
}
