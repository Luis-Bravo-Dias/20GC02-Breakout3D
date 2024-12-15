import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'
import GUI from 'lil-gui'

/**
 * Base
 */
// Debug
const gui = new GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

//variables
let playerLives = 3
let playerScore = 0
let ballSpeed = new THREE.Vector3(1, 0, -5)
let gameActive = true
let maxSpeed = 10
const livesContainer = document.getElementById('lives')
const scoreContainer = document.getElementById('score')

//sprites
const lifeSprite = 'textures/sprites/life.png'

// Scene
const scene = new THREE.Scene()

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
const playerTexture = textureLoader.load('textures/matcaps/player.png')
playerTexture.colorSpace = THREE.SRGBColorSpace

const ballTexture = textureLoader.load('textures/matcaps/ball.png')
ballTexture.colorSpace = THREE.SRGBColorSpace

const blocksTextures = {
    t1: textureLoader.load('textures/matcaps/1.png'),
    t2: textureLoader.load('textures/matcaps/2.png'),
    t3: textureLoader.load('textures/matcaps/3.png'),
    t4: textureLoader.load('textures/matcaps/4.png')
}

blocksTextures.t1.colorSpace = THREE.SRGBColorSpace
blocksTextures.t2.colorSpace = THREE.SRGBColorSpace
blocksTextures.t3.colorSpace = THREE.SRGBColorSpace
blocksTextures.t4.colorSpace = THREE.SRGBColorSpace

const lifeTexture = textureLoader.load('textures/matcaps/life.png')
lifeTexture.colorSpace = THREE.SRGBColorSpace

const wallTexture = textureLoader.load('textures/matcaps/wall.png')
wallTexture.colorSpace = THREE.SRGBColorSpace


/**
 * Sizes
 */
const sizes = {
    width: 500,
    height: 250
}

/*window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})*/

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
    45, // VIEW_ANGLE
    sizes.width / sizes.height, // ASPECT
    0.1, // NEAR
    10000 // FAR
)
scene.add(camera)

//paddle
const paddleWidth = 60,
    paddleHeight = 20,
    paddleDepth = 10,
    paddleQuality = 1;

const paddleMaterial = new THREE.MeshMatcapMaterial({
    matcap: playerTexture
})

const paddle = new THREE.Mesh(
    new THREE.BoxGeometry(
        paddleWidth,
        paddleHeight,
        paddleDepth,
        paddleQuality,
        paddleQuality,
        paddleQuality
    ),
    paddleMaterial
)

// Position the paddle
paddle.position.set(0, 50, 200)
scene.add(paddle)

//Blocks
const blockSizes = {
    width1: 20,
    width2: 20,
    width3: 20,
    height: 20,
    depth: 10,
    quality: 1
}

function createBlocks() {
    const blocks = [];
    const materials = [
        new THREE.MeshMatcapMaterial({ matcap: blocksTextures.t1 }),
        new THREE.MeshMatcapMaterial({ matcap: blocksTextures.t2 }),
        new THREE.MeshMatcapMaterial({ matcap: blocksTextures.t3 }),
        new THREE.MeshMatcapMaterial({ matcap: blocksTextures.t4 })
    ];

    const lifeMaterial = new THREE.MeshMatcapMaterial({ matcap: lifeTexture });

    const widths = [blockSizes.width1, blockSizes.width2, blockSizes.width3];
    const rows = 16; // Number of rows
    const cols = 20; // Number of blocks per row
    const startX = -200; // Starting point on the X-axis
    const startY = paddle.position.y; // Starting point on the Y-axis
    const startZ = -100; // Starting point on the Z-axis
    const zSpacing = 0.5; // Spacing between blocks on the Z-axis

    // Randomly choose two special blocks
    const specialBlocks = new Set();
    while (specialBlocks.size < 2) {
        const randomRow = Math.floor(Math.random() * (rows - 3)) + 3; // Exclude first 3 rows
        const randomCol = Math.floor(Math.random() * cols);
        specialBlocks.add(`${randomRow}-${randomCol}`);
    }

    let currentX = startX;
    let currentZ = startZ;

    for (let row = 0; row < rows; row++) {
        currentX = startX; // Reset X position at the start of each row
        for (let col = 0; col < cols; col++) {
            // Determine if this block is special
            const isSpecial = specialBlocks.has(`${row}-${col}`);

            const blockWidth = widths[Math.floor(Math.random() * widths.length)];
            const material = isSpecial ? lifeMaterial : materials[Math.floor(Math.random() * materials.length)];

            const block = new THREE.Mesh(
                new THREE.BoxGeometry(blockWidth, blockSizes.height, blockSizes.depth),
                material
            );

            // Position the block
            block.position.set(
                currentX + blockWidth / 2, // Adjust to align blocks
                startY, // Keep the same height for all blocks
                currentZ // Increment to create a row on the Z-axis
            );

            currentX += blockWidth; // Move forward on the X-axis for the next block
            currentZ -= zSpacing; // Move forward on the Z-axis for the next block

            // Add the block to the scene and the array
            scene.add(block);
            blocks.push(block);

            // Add special block behavior (extra life)
            if (isSpecial) {
                block.userData.isSpecial = true;
            }
        }
    }

    return blocks;
}

const blocks = createBlocks();

// Set initial camera position and orientation
camera.position.set(
    paddle.position.x,
    paddle.position.y + 50,
    paddle.position.z + 200
)
//camera.lookAt(paddle.position);

camera.fov = 60
camera.updateProjectionMatrix()


//walls
const wallWidth = 5,
    wallHeight = 150,
    wallDepth = 500,
    wallQuality = 1;

const wallMaterial = new THREE.MeshMatcapMaterial({
    matcap: wallTexture
});

const righWall = new THREE.Mesh(
    new THREE.BoxGeometry(
        wallWidth,
        wallHeight,
        wallDepth,
        wallQuality,
        wallQuality,
        wallQuality
    ),
    wallMaterial
)

righWall.position.x = paddle.position.x + 250
righWall.position.y = paddle.position.y
righWall.position.z = paddle.position.z - 250

scene.add(righWall)

const leftWall = new THREE.Mesh(
    new THREE.BoxGeometry(
        wallWidth,
        wallHeight,
        wallDepth,
        wallQuality,
        wallQuality,
        wallQuality
    ),
    wallMaterial
)

leftWall.position.x = paddle.position.x - 250
leftWall.position.y = paddle.position.y
leftWall.position.z = paddle.position.z - 250

scene.add(leftWall)

const ceilingWidth = 500,
    ceilingHeight = wallHeight,
    ceilingDepth = 10,
    ceilingQuality = 1;

const ceiling = new THREE.Mesh(
    new THREE.BoxGeometry(
        ceilingWidth,
        ceilingHeight,
        ceilingDepth,
        ceilingQuality,
        ceilingQuality,
        ceilingQuality
    ),
    wallMaterial
)

ceiling.position.x = paddle.position.x
ceiling.position.y = paddle.position.y
ceiling.position.z = paddle.position.z - 500

scene.add(ceiling)

//
const ballRadius = 10
const ballMaterial = new THREE.MeshMatcapMaterial({
    matcap: ballTexture
})

const ball = new THREE.Mesh(
    new THREE.SphereGeometry(ballRadius, 32, 32),
    ballMaterial
)

ball.position.set(0, paddle.position.y, paddle.position.z -50)
scene.add(ball)


// Controls
//const controls = new OrbitControls(camera, canvas)
//controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

//reset ball
function resetBall()
{
    ball.position.set(0, paddle.position.y, paddle.position.z - 50)
    ballSpeed.set(1, 0, -5)
}

//update containers
function updateLives()
{
    livesContainer.innerHTML = '' //clean sprites
    for (let i = 0; i < playerLives; i++)
    {
        const life = document.createElement('img')
        life.src = lifeSprite
        livesContainer.appendChild(life)
    }
}

function updateScore()
{
    scoreContainer.textContent = `Score: ${playerScore}`
}

updateLives()
updateScore()

/**
 * Animate
 */
const clock = new THREE.Clock()

//move paddle
//let targetPaddleX = paddle.position.x

/*document.addEventListener('keydown', (event) =>
{
    const moveDist = 20
    if (event.key === 'a' && paddle.position.x > leftWall.position.x + paddleWidth / 2)
        paddle.position.x -= moveDist
    else if (event.key === 'd' && paddle.position.x < righWall.position.x - paddleWidth / 2)
        paddle.position.x += moveDist
})*/

document.addEventListener('mousemove', (event) =>
{
    //mouse position in canvas
    const canvasBounds = canvas.getBoundingClientRect()
    const mouseX = ((event.clientX - canvasBounds.left) / canvasBounds.width * 2 - 1) //normalize between -1 and 1

    //covert coordenates
    const worldX = mouseX * (righWall.position.x - paddleWidth / 2)

    //restrict paddle
    const clampedX = THREE.MathUtils.clamp(worldX, leftWall.position.x + paddleWidth / 2, righWall.position.x - paddleWidth / 2)

    //paddle position
    paddle.position.x = clampedX
})

const loop = () =>
{
    if (gameActive)
    {
        const elapsedTime = clock.getElapsedTime()

        //smooth move
        //paddle.position.x = THREE.MathUtils.lerp(paddle.position.x, targetPaddleX, 0.5)

        //ball movements
        ball.position.add(ballSpeed)

        //walls and ceiling collisions
        if (ball.position.x <= leftWall.position.x + wallWidth /2 || ball.position.x >= righWall.position.x - wallWidth / 2)
            ballSpeed.x *= -1
        if (ball.position.z <= ceiling.position.z + ceilingDepth / 2)
            ballSpeed.z *= -1

        //paddle collisions
        if(
            ball.position.z >= paddle.position.z - paddleDepth / 2 &&
            ball.position.z <= paddle.position.z + paddleDepth / 2 &&
            ball.position.x >= paddle.position.x - paddleWidth / 2 &&
            ball.position.x <= paddle.position.x + paddleWidth / 2 &&
            ball.position.y <= paddle.position.y + paddleHeight / 2
        )
            ballSpeed.z *= -1
        
        //blocks collisions
        blocks.forEach((block, index) => {
            const distance = ball.position.distanceTo(block.position)
            if (distance < ballRadius + blockSizes.depth / 2)
            {
                scene.remove(block)
                blocks.splice(index, 1)
                ballSpeed.z *= -1
                playerScore += 1

                //ball speed
                ballSpeed.multiplyScalar(1.01)
                const speed = ballSpeed.length()
                if (speed > maxSpeed)
                    ballSpeed.setLength(maxSpeed)
                
                //extra life
                if (block.userData.isSpecial)
                {
                    playerLives += 1
                    updateLives()
                }
                updateScore()
            }
        })

        //ball out
        if (ball.position.z >= paddle.position.z + (paddleDepth * 2))
        {
            if (playerLives <= 0)
            {
                resetBall()
                gameActive = false
                alert("Game Over! Points: " + playerScore)
            }
            else
            {
                playerLives -= 1
                updateLives()
                resetBall()
            }
        }
    }

    if (blocks.length === 0)
        blocks.push(...createBlocks())

    // Update controls
    //controls.update()

    // Render
    renderer.render(scene, camera)

    // Call loop again on the next frame
    window.requestAnimationFrame(loop)
}

loop()