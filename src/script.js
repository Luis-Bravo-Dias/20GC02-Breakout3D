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


/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
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
})

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

const blockSizes = {
    width1: 20,
    width2: 20,
    width3: 20,
    height: 20,
    depth: 10,
    quality: 1
}

// Função para criar blocos
function createBlocks() {
    const blocks = [];
    const materials = [
        new THREE.MeshMatcapMaterial({ matcap: blocksTextures.t1 }),
        new THREE.MeshMatcapMaterial({ matcap: blocksTextures.t2 }),
        new THREE.MeshMatcapMaterial({ matcap: blocksTextures.t3 }),
        new THREE.MeshMatcapMaterial({ matcap: blocksTextures.t4 })
    ];

    const widths = [blockSizes.width1, blockSizes.width2, blockSizes.width3];
    const rows = 16; // Número de fileiras
    const cols = 20; // Número de blocos por fileira
    const startX = -200; // Ponto inicial no eixo X centrado com o paddle
    const startY = 50 // Ponto inicial no eixo Y
    const startZ = -100; // Ponto inicial no eixo Z
    const zSpacing = 0.5 // Espaçamento entre os blocos no eixo Z

    let currentX = startX;
    let currentZ = startZ;

    for (let row = 0; row < rows; row++) {
        currentX = startX; // Reinicia a posição X no início de cada fileira
        for (let col = 0; col < cols; col++) {
            // Escolha aleatória de largura e material
            const blockWidth = widths[Math.floor(Math.random() * widths.length)];
            const material = materials[Math.floor(Math.random() * materials.length)];

            const block = new THREE.Mesh(
                new THREE.BoxGeometry(blockWidth, blockSizes.height, blockSizes.depth),
                material
            );

            // Posicionar o bloco
            block.position.set(
                currentX + blockWidth / 2, // Ajusta para alinhar blocos
                startY, // Mantém a mesma altura para todos os blocos
                currentZ // Incrementa para criar uma linha no eixo Z
            );

            currentX += blockWidth; // Avança no eixo X para o próximo bloco
            currentZ -= zSpacing; // Avança no eixo Z para o próximo bloco

            // Adiciona o bloco à cena e ao array
            scene.add(block);
            blocks.push(block);
        }
    }

    return blocks;
}


// Criar os blocos
const blocks = createBlocks();


//paddle
const paddleWidth = 60,
    paddleHeight = 20,
    paddleDepth = 10,
    paddleQuality = 1;

const paddleMaterial = new THREE.MeshMatcapMaterial({
    matcap: playerTexture
});

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
);

// Position the paddle
paddle.position.set(0, 50, 200);

// Set initial camera position and orientation
camera.position.set(
    paddle.position.x,
    paddle.position.y + 50,
    paddle.position.z + 150
);
//camera.lookAt(paddle.position);

//camera.fov = 60
//camera.updateProjectionMatrix()

scene.add(paddle);


// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const loop = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    //controls.update()

    // Render
    renderer.render(scene, camera)

    // Call loop again on the next frame
    window.requestAnimationFrame(loop)
}

loop()