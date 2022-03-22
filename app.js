import * as THREE from './libs/three/three.module.js';
import { GLTFLoader } from './libs/three/jsm/GLTFLoader.js';
import { DRACOLoader } from './libs/three/jsm/DRACOLoader.js';


import gsap from './libs/gsap-public/src/gsap-core.js';

class App{
	constructor(){
    const container = document.createElement( 'div' );
		document.body.appendChild( container );

    //Animation mixer and render clock    
    this.clock = new THREE.Clock();
    this.mixer = new THREE.AnimationMixer();

    //Blender Camera
    this.blender_camera = null;

		this.camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.1, 1000 );
		this.camera.position.set( 0, 1.6, 3 );
    this.camera.lookAt( 0, 0, 0 );
    
    //Scene and lighting setup
		this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color( 0x16164A );

		this.scene.add( new THREE.HemisphereLight( 0x606060, 0x404040 ) );

    const light = new THREE.DirectionalLight( 0xffffff );
    light.position.set( 1, 1, 1 ).normalize();
		this.scene.add( light );
			
		this.renderer = new THREE.WebGLRenderer({ antialias: true } );
		this.renderer.setPixelRatio( window.devicePixelRatio );
		this.renderer.setSize( window.innerWidth, window.innerHeight );
    this.renderer.outputEncoding = THREE.sRGBEncoding;

    container.appendChild( this.renderer.domElement );

    this.count = 50;
    this.colCount = 30;
    this.bucketArr = [];
    this.visibleBuckets = [];
    this.bucketRows = [];
    this.bucketCols = [];
    this.bucketOpacity = 0.18;

    this.addObjects();
    this.loadModels();
    this.render();

    window.addEventListener('resize', this.resize.bind(this) );
	}	
       
  setupResize(){
      window.addEventListener('resize', this.resize.bind(this));
  }
  resize(){
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize( window.innerWidth, window.innerHeight );  
  }

  addObjects() {
    // Instantiate a loader
    this.dot01_text = new THREE.TextureLoader().load( "./assets/textures/dot01.png" );
    this.dot02_text = new THREE.TextureLoader().load(  "./assets/textures/dot02.png" );
    this.dot03_text = new THREE.TextureLoader().load(  "./assets/textures/dot03.png" );
    this.dot04_text = new THREE.TextureLoader().load(  "./assets/textures/dot04.png" );

    let dotsArr = [this.dot01_text, this.dot02_text, this.dot03_text, this.dot04_text, this.dot02_text, this.dot03_text,];

    this.geometrySquares = new THREE.PlaneGeometry(1, 1);
    let finalZ = -25;

    //Create the background grid
    for (let k = -this.count/2; k < this.count/2; k++) {
      for (let l = -this.count/2; l < this.count/2; l++) {
        //Create a material for each block ****
        this.randomMat = dotsArr[Math.floor(Math.random()*dotsArr.length)];

        this.material = new THREE.MeshBasicMaterial( { 
          map: this.randomMat,
          transparent: true,
          opacity: random([0, this.bucketOpacity, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
        } );
        
        //Create squares and add to the scene
        this.mesh = new THREE.Mesh(this.geometrySquares, this.material);
        if(this.mesh.material.opacity == this.bucketOpacity){
          this.visibleBuckets.push(this.mesh);
        }
        
        this.bucketArr.push(this.mesh);
        this.scene.add(this.mesh);

        this.mesh.position.set( l/0.85, k/0.85, random([finalZ+120, finalZ+130,finalZ+140,finalZ+150,finalZ-120,finalZ-130,finalZ-140,finalZ-150,]));
        gsap.to(this.mesh.position, random([12,11,10,9,5]), {z: finalZ, ease: 'power1.out'});
      }
    }
    
    this.fadeAmount = 1;

    this.blockAnimation();

    function random(numbers) {
      return numbers[Math.floor(Math.random()*numbers.length)];
    }
  }

  //Square animations rows and columns
  blockAnimation(){
    
    let delay = 0.5;
    let parent = this;
    let delayTime = 5000;
    let maxRows = 10;
    let rowCount= 0;
    let maxCols = 10;
    let colCount= 0;

    // Row animation loop
    let randomRow = randomInteger(0, this.count-1) * this.count;

    if(rowCount <= maxRows){
      for (let j = randomRow; j < randomRow+this.count; j++) {     
        if(this.visibleBuckets.includes(this.bucketArr[j])){
          gsap.to(this.bucketArr[j].material, 2, {opacity: 0.8, delay: delay });
          gsap.to(this.bucketArr[j].material, 4, {opacity: this.bucketOpacity, delay: delay+0.5,});    
        }else{
          gsap.to(this.bucketArr[j].material, 2, {opacity: 0.8, delay: delay, ease: 'power3'});
          gsap.to(this.bucketArr[j].material, 4, {opacity: 0, delay: delay+0.5, ease: 'power3.inOut'});      
          delay = delay+0.5; 
        }
      }
      rowCount = rowCount +1;
    }else{
      rowCount = rowCount -1;
    }


    // Column animation loop
    let randomCol = randomInteger(0, this.count-1);
    if(colCount <= maxCols){
      for (let i = randomCol; i < this.count*this.count; i+=this.count) {
        if(this.visibleBuckets.includes(this.bucketArr[i])){
          gsap.to(this.bucketArr[i].material, 2, {opacity: 0.8, delay: delay, ease: 'power3'});
          gsap.to(this.bucketArr[i].material, 4, {opacity: this.bucketOpacity, delay: delay+0.5, ease: 'power3.inOut'});    
        }else{
          gsap.to(this.bucketArr[i].material, 2, {opacity: 0.8, delay: delay, ease: 'power3'});
          gsap.to(this.bucketArr[i].material, 4, {opacity: 0, delay: delay+0.5, ease: 'power3.inOut'});      
          delay = delay+0.5; 
        }
      }
      colCount = colCount +1;
    }else{
      colCount = colCount -1;
    }


    function pause() {
      this.delayTime = 300000;
    }
     
    function play() {
      this.delayTime = 3000;
    }
    window.addEventListener('blur', pause);
    window.addEventListener('focus', play);

    setTimeout(function() {
      this.blockAnimation();
    }.bind(this), delayTime);
   
    function randomInteger(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }
  }
    
  random(numbers) {
    return numbers[Math.floor(Math.random()*numbers.length)];
  }

  loadModels(){
    // Instantiate a loader
    const loader = new GLTFLoader();
    let parent = this;
    // Optional: Provide a DRACOLoader instance to decode compressed mesh data
    this.dracoLoader = new DRACOLoader();
    this.dracoLoader.setDecoderPath( './libs/three/js/draco/' );
    loader.setDRACOLoader( this.dracoLoader );

    // Load a glTF resource
    loader.load(
      // resource URL
      './assets/models/shapes.glb',

      // called when the resource is loaded
      function ( gltf ) {
        var model = gltf.scene;
        var animations = gltf.animations;

        parent.scene.add( model );
        parent.mixer = new THREE.AnimationMixer( model );


        animations.forEach((clip) => {
          let action = parent.mixer.clipAction(clip).play();
          action.setLoop(THREE.LoopOnce);
          action.clampWhenFinished = true;
          action.enable = true;
        });

        //Blender camera
        parent.camera = gltf.cameras[0];
        parent.resize();
        parent.setupResize()
      },
      // called while loading is progressing
      function ( xhr ) {
        console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
      },
      // called when loading has errors
      function ( error ) {

        console.log( 'An error happened ' + error );

      }
    );
  }



  render() {
    this.time += 0.05;
    var delta = this.clock.getDelta();
    if ( this.mixer ) this.mixer.update( delta );
    this.renderer.render(this.scene, this.camera);
    this.renderer.setClearColor(0x16164A);
    window.requestAnimationFrame(this.render.bind(this))
  }

}

export { App };