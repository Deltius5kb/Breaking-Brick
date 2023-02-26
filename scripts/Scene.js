import * as THREE from 'three';
import { Grid } from './Grid.js'
import { Bat } from './Bat';
import { Frame } from './Frame.js';
import { Ball } from './Ball.js';
import { Timer } from './Timer.js';
import { ScoreCounter } from './Score.js';

class Scene {
    // Threejs scene
    _m_Scene;
    // Threejs Camera
    _m_Camera;
    // Threejs PointLight object
    _m_Light;
    // Threejs AmbientLight object
    _m_AmbientLight;
    // Threejs Renderer obejct
    _m_Renderer;
    // Threejs Camera object
    _vec3_CameraPosition;

    // Helpers 
    _m_LightHelper;
    _m_GridHelper;
    _m_Controls;

    constructor() {
        this._SetupScene();
        this._SetupRenderer();
        this._SetupCamera();   
        this._SetupLighting();
    }
    
    Update(timeNow) { 

    }

    Draw() {
        this._m_Renderer.render(this._m_Scene, this._m_Camera);
    }

    // Run once from constructor
    _SetupCamera() {
        // https://stackoverflow.com/questions/14614252/how-to-fit-camera-to-object
        var width = 1920;
        var dist = 1100;
        var aspect = 1920 / 1080;
        // var fov = 2 * Math.atan( height / ( 2 * dist ) ) * ( 180 / Math.PI );
        var fov = 2 * Math.atan((width / aspect) / (2 * dist)) * (180 / Math.PI) + 7;

        // Camera
        this._m_Camera = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, 0.1, 10000);
        this._vec3_CameraPosition = new THREE.Vector3(960, 620, dist - 200);
        this._m_Camera.position.set(this._vec3_CameraPosition.x, this._vec3_CameraPosition.y, this._vec3_CameraPosition.z);
    }

    // Called from constructor
    _SetupLighting() {
        // Lighting
        this._m_Light = new THREE.PointLight(0xbbbbbb);
        this._m_Light.position.set(this._m_Camera.position.x, this._m_Camera.position.y, this._m_Camera.position.z + 5);
        this._m_AmbientLight = new THREE.AmbientLight(0x909090);
        this._m_Scene.add(this._m_Light, this._m_AmbientLight);
    }

    // Run once from constructor
    _SetupScene() {
        this._m_Scene = new THREE.Scene();
    }

    // Run once from constructor
    _SetupRenderer() {
        // Renderer
        this._m_Renderer = new THREE.WebGLRenderer({
            canvas: document.querySelector('#bg'),
        });
        this._m_Renderer.setPixelRatio(window.devicePixelRatio);
        this._m_Renderer.setSize(window.innerWidth, window.innerHeight);
        // Adds renderer to the html document
        document.body.appendChild(this._m_Renderer.domElement);
    }

    // Run once from constructor
    _SetupHelpers() {
        // Light helper shows where the light is
        this._m_LightHelper = new THREE.PointLightHelper(this._m_Light);
        // Draws 2D grid 
        this._m_GridHelper = new THREE.GridHelper(200, 50);
        this._m_Scene.add(this._m_LightHelper, this._m_GridHelper);

        // OrbitControls messes with camera movement, only enable this if necessary
        this._m_Controls = new OrbitControls(this._m_Camera, this._m_Renderer.domElement);
    }
}

export class SceneGame extends Scene {
    // Threejs Renderer
    // Grid object 
    _m_Grid;
    // Bat object
    _m_Bat;
    // Ball object
    _m_Ball;
    // Frame object
    _m_Frame;
    // Timer object 
    _m_Timer;
    _m_ScoreCounter;
    _m_Level;
    _f_DeltaTime;

    constructor(level) {
        super();
        this._SetupCamera();
        this.#Initialize(level);
    }
    
    // Run every frame
    Update(deltaTime) {
        this._f_DeltaTime = deltaTime;

        this._m_Bat.Update(this._f_DeltaTime);
        this._m_Ball.Update(this._f_DeltaTime);

        this._m_Grid.Update();
        this._m_Timer.Update(this._f_DeltaTime);
    }

    GetCamera() {
        return this._m_Camera;
    }

    // Run once from constructor
    #Initialize(level) {
        this._m_Level = level;

        this._m_Grid = new Grid(this._m_Scene);
        this._m_Grid.LoadLevel(this._m_Scene, this._m_Level);
        
        this._m_Bat = new Bat(this._m_Scene);
        this._m_Frame = new Frame(this._m_Scene);
        this._m_Timer = new Timer("timer");    
        this._m_ScoreCounter = new ScoreCounter("score");
        
        this._m_Ball = new Ball(this._m_Scene, this._m_Grid, this._m_Frame, this._m_Bat, this._m_Timer, this._m_ScoreCounter);
    }
}

export class SceneMainMenu extends SceneGame {
    constructor(level) {
        super(level);
        this._m_Ball.HideLives();
        this._m_Ball.b_Simulation = true;
        this._m_ScoreCounter.Hide();
        this._m_Timer.Hide();

        this.#SetupCanvas();   

        this._m_Ball.LaunchBallAtRandomAngle();
    }
    
    Update(deltaTime) {
        this._m_Bat.m_BatCuboid.position.x = this._m_Ball.m_BallSphere.position.x;
        super.Update(deltaTime);
    }

    #SetupCanvas() {
        let canvas = document.getElementById("bg");
        canvas.setAttribute("width", "1200px");
        canvas.setAttribute("height", "675px");
        canvas.style.top = "250px";
        canvas.style.left = "50px";
        this._m_Renderer.setSize(canvas.width, canvas.height);
    }
}