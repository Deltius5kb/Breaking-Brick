import * as THREE from 'three';

// Class to hold Object3Ds
export class Frame {
    // THREE.Mesh objects
    m_WallLeft;
    m_WallRight;
    m_WallTop;
    m_WallBack;
    
    vec_WallSideSize;
    vec_WallTopSize;

    constructor(scene) {
        const m_Material = new THREE.MeshStandardMaterial({ color: 0x808080 });

        this.vec_WallSideSize = new THREE.Vector3(100, 1080, 60);
        this.vec_WallTopSize = new THREE.Vector3(1920, 100, 60);

        this.#CreateWallLeft(m_Material);
        this.#CreateWallRight(m_Material);
        this.#CreateWallTop(m_Material);
        this.#CreateWallBack(m_Material);

        scene.add(this.m_WallLeft, this.m_WallRight, this.m_WallTop, this.m_WallBack);
    }
    // Called from constructor
    #CreateWallLeft(material) {
        const geometry = new THREE.BoxGeometry(this.vec_WallSideSize.x, this.vec_WallSideSize.y, this.vec_WallSideSize.z);
        this.m_WallLeft = new THREE.Mesh(geometry, material);
        this.m_WallLeft.position.set(50, 590, 0);
    }
    // Called from constructor
    #CreateWallRight(material) {
        const geometry = new THREE.BoxGeometry(this.vec_WallSideSize.x, this.vec_WallSideSize.y, this.vec_WallSideSize.z);
        this.m_WallRight = new THREE.Mesh(geometry, material);
        this.m_WallRight.position.set(1870, 590, 0);
    }
    // Called from constructor
    #CreateWallTop(material) {
        const geometry = new THREE.BoxGeometry(this.vec_WallTopSize.x, this.vec_WallTopSize.y, this.vec_WallTopSize.z);
        this.m_WallTop = new THREE.Mesh(geometry, material);
        this.m_WallTop.position.set(960, 1080, 0);
    }
    // Called from constructor
    #CreateWallBack() {
        const material = new THREE.MeshStandardMaterial({ color: 0x111111 });
        const geometry = new THREE.BoxGeometry(1920, 1080, 100);
        this.m_WallBack = new THREE.Mesh(geometry, material);
        this.m_WallBack.position.set(960, 590, -90);
    }
}