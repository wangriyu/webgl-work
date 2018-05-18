// ------------------------------------------------------
// Scene
// ------------------------------------------------------

const scene = new THREE.Scene()
var node = document.getElementById('scene')

// ------------------------------------------------------
// Camera
// ------------------------------------------------------

let fieldOfView = 75, aspectRatio = window.innerWidth / window.innerHeight, near = 10, far = 4000

const camera = new THREE.PerspectiveCamera(fieldOfView, aspectRatio, near, far)
camera.position.z = 500

// ------------------------------------------------------
// Lights
// ------------------------------------------------------

const light = new THREE.DirectionalLight(0xffffff)
light.position.set(1, 0, 1).normalize()
scene.add(light)

// ------------------------------------------------------
// Mesh
// ------------------------------------------------------

// earth
// ---------
let earthRadius = 140, earthWidthSegments = 50, earthHeightSegments = 50

let earthMaterial = new THREE.MeshPhongMaterial({})
let loader = new THREE.ImageLoader()

loader.load('resources/land_ocean_ice_cloud_2048.jpg', (image) => {
  let texture = new THREE.Texture()
  texture.image = image
  texture.needsUpdate = true

  earthMaterial.map = texture
  earthMaterial.needsUpdate = true
})

const earthGeometry = new THREE.SphereGeometry(earthRadius, earthWidthSegments, earthHeightSegments)

const earth = new THREE.Mesh(earthGeometry, earthMaterial)

// moon
// ---------
let moonRadius = 30, moonWidthSegments = 50, moonHeightSegments = 50

let moonMaterial = new THREE.MeshPhongMaterial({})
let loader2 = new THREE.ImageLoader()

loader2.load('resources/moon1024x512.jpg', (image) => {
  let texture = new THREE.Texture()
  texture.image = image
  texture.needsUpdate = true

  moonMaterial.map = texture
  moonMaterial.needsUpdate = true
})

const moonGeometry = new THREE.SphereGeometry(moonRadius, moonWidthSegments, moonHeightSegments)

const moon = new THREE.Mesh(moonGeometry, moonMaterial)

scene.add(earth, moon)

// ------------------------------------------------------
// stars
// ------------------------------------------------------

const particles = 2000  //星星数量
/*buffer做星星*/
let bufferGeometry = new THREE.BufferGeometry()

let positions = new Float32Array(particles * 3)
let colors = new Float32Array(particles * 3)

let color = new THREE.Color()

const gap = 1000 // 定义星星的最近出现位置

for (let i = 0; i < positions.length; i += 3) {
  // positions

  /*-2gap < x < 2gap */
  let x = (Math.random() * gap * 2 ) * (Math.random() < .5 ? -1 : 1)
  let y = (Math.random() * gap * 2 ) * (Math.random() < .5 ? -1 : 1)
  let z = (Math.random() * gap * 2 ) * (Math.random() < .5 ? -1 : 1)

  /*找出x,y,z中绝对值最大的一个数*/
  let biggest = Math.abs(x) > Math.abs(y) ? Math.abs(x) > Math.abs(z) ? 'x' : 'z' : Math.abs(y) > Math.abs(z) ? 'y' : 'z'

  let pos = { x, y, z }

  /*如果最大值比n要小（因为要在一个距离之外才出现星星）则赋值为n（-n）*/
  if (Math.abs(pos[biggest]) < gap) pos[biggest] = pos[biggest] < 0 ? -gap : gap

  x = pos['x']
  y = pos['y']
  z = pos['z']

  positions[i] = x
  positions[i + 1] = y
  positions[i + 2] = z

  // colors

  /*70%星星有颜色*/
  let hasColor = Math.random() > 0.3
  let vx, vy, vz

  if (hasColor) {
    vx = (Math.random() + 1) / 2
    vy = (Math.random() + 1) / 2
    vz = (Math.random() + 1) / 2
  } else {
    vx = 1
    vy = 1
    vz = 1
  }

  color.setRGB(vx, vy, vz)

  colors[i] = color.r
  colors[i + 1] = color.g
  colors[i + 2] = color.b
}

bufferGeometry.addAttribute('position', new THREE.BufferAttribute(positions, 3))
bufferGeometry.addAttribute('color', new THREE.BufferAttribute(colors, 3))
bufferGeometry.computeBoundingSphere()

/*星星的material*/
let material = new THREE.PointsMaterial({ size: 6, vertexColors: THREE.VertexColors })
particleSystem = new THREE.Points(bufferGeometry, material)
scene.add(particleSystem)

// ------------------------------------------------------
// controls
// ------------------------------------------------------

var controls = new THREE.TrackballControls(camera, node)
controls.minDistance = 0
controls.maxDistance = 1e10

// ------------------------------------------------------
// render
// ------------------------------------------------------

const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(window.innerWidth, window.innerHeight)
node.appendChild(renderer.domElement)

moon.angle = 0
moon.speed = Math.PI / 360
moon.distance = 300

const render = () => {
  controls.update()

  // ------------------------------------------------------
  // animation
  // ------------------------------------------------------

  requestAnimationFrame(render)

  // 自转
  earth.rotation.y += 0.002
  moon.rotation.y += 0.025

  // 公转
  moon.angle += moon.speed
  if (moon.angle > Math.PI * 2) {
    moon.angle -= Math.PI * 2
  }
  moon.position.set(moon.distance * Math.sin(moon.angle), 0, moon.distance * Math.cos(moon.angle))

  renderer.render(scene, camera)
}

window.addEventListener('resize', onWindowResize, false)

function onWindowResize () {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  controls.handleResize()
  renderer.setSize(window.innerWidth, window.innerHeight)
}

render()
