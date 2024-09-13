import * as THREE from 'three';
import { Vector3 } from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { vec3 } from 'three/webgpu';
import { TransformControls } from 'three/addons/controls/TransformControls.js';
import dat from 'dat.gui';

const loader = new GLTFLoader();
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
const models=[]

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);  
scene.add(ambientLight);

const pointLight=new THREE.PointLight(0xffffff,500,100);
pointLight.position.set(0,10,0);
scene.add(pointLight);

const gridhelper=new THREE.GridHelper(30,30);
scene.add(gridhelper);

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const transformControls = new TransformControls(camera, renderer.domElement);  
scene.add(transformControls);  

const orbitControls = new OrbitControls(camera, renderer.domElement); 

loader.load( 'scene.glb', function ( gltf ) {
	const model=gltf.scene;
	models.push(model);
	scene.add(model);
	transformControls.attach(model);
}, undefined, function ( error ) {
	console.error( error );
} );

let currentMode='translate';
transformControls.setMode(currentMode);

function switchMode(mode){
	currentMode=mode;
	transformControls.setMode(mode);
}

camera.position.z = 5;

//创建轴  
const axesHelper = new THREE.AxesHelper(30);  
scene.add(axesHelper);

//鼠标
const raycaster = new THREE.Raycaster();  
const mouse = new THREE.Vector2();

transformControls.addEventListener('change', () => {  
    renderer.render(scene, camera);  
}); 
transformControls.addEventListener('dragging-changed', (event) => {  
    orbitControls.enabled = !event.value; // 禁用或启用 OrbitControls  
}); 

document.getElementById('translateBtn').addEventListener('click', () => switchMode('translate'));  
document.getElementById('rotateBtn').addEventListener('click', () => switchMode('rotate'));  
document.getElementById('scaleBtn').addEventListener('click', () => switchMode('scale'));

 // 添加 Raycaster 处理模型点击  
 window.addEventListener('click', (event) => {  
	 // 计算鼠标位置 (0到1)  
	 mouse.x = (event.clientX / window.innerWidth) * 2 - 1;  
	 mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;  

	 // 更新 Raycaster  
	 raycaster.setFromCamera(mouse, camera);  

	 // 计算与模型的交叉点  
	 const intersects = raycaster.intersectObjects(models);  

	 if (intersects.length > 0) {  
		 // 如果有交互，获取第一个模型  
		 const selectedModel = intersects[0].object;  
		 transformControls.attach(selectedModel);  
	 }  
 });  

//GUI
const controlData={
    addcube:function(){
		const geometry = new THREE.BoxGeometry();  
        const material = new THREE.MeshPhongMaterial({ color: Math.random() * 0xffffff });  
        const cube = new THREE.Mesh(geometry, material);  
        cube.position.set((Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4);
		models.push(cube);
        scene.add(cube);
	}
}

const gui=new dat.GUI();
const f=gui.addFolder('配置面板');
f.add(controlData,'addcube').name('添加方块');
f.open();

function animate() {
	requestAnimationFrame( animate );
    orbitControls.update();  
	renderer.render( scene, camera );
}

animate();