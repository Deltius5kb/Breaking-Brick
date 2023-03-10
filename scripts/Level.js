class LevelHandler {
    b_Hidden;
    m_ActiveLevel;
    a_Levels;
    constructor() {
        this.m_ActiveLevel;
        this.a_Levels = [];
        this.b_Hidden = false;

        localStorage.clear();
        this.LoadAllLevels();
        this.CreateSimulationLevel();
        this.Save();
        this.a_Levels[0].b_Completed = true;
    }

    // Make empty levels
    // Save them
    // Load all levels
    // Allow saving over individual levels

    // Called from constructor
    LoadAllLevels() {
        this.a_Levels = JSON.parse(localStorage.getItem("levels"));
   
        // If localstorage is empty
        if (this.a_Levels == null) {
            this.#SetAllLevelsEmpty();
            this.Save();
            this.LoadAllLevels();
        }
    }

    // Usually not run
    #SetAllLevelsEmpty() {
        this.a_Levels = [];
        for (let index = 0; index < 62; index++) {
            let a_Grid = [
                new LevelBrick(new THREE.Vector2(0, 0), 2),
                new LevelBrick(new THREE.Vector2(1, 0), 2),
                new LevelBrick(new THREE.Vector2(2, 0), 2),
                new LevelBrick(new THREE.Vector2(3, 0), 2),
                new LevelBrick(new THREE.Vector2(4, 0), 2),
                new LevelBrick(new THREE.Vector2(5, 0), 2),
                new LevelBrick(new THREE.Vector2(6, 0), 2),
                new LevelBrick(new THREE.Vector2(7, 0), 2),
                new LevelBrick(new THREE.Vector2(8, 0), 2),
                new LevelBrick(new THREE.Vector2(9, 0), 2),
                new LevelBrick(new THREE.Vector2(10, 0), 2),
                new LevelBrick(new THREE.Vector2(11, 0), 2)
            ];
            let level = new Level(a_Grid, index + 1, false);
            this.a_Levels.push(level);
        }
    }

    // Saving uses localstorage which is similar to cookies but they do not expire. Called from Game.Initialize() 
    Save() {
        // Converts this level to a JSON string
        let json = JSON.stringify(this.a_Levels);
        // Creates item in localstorage
        localStorage.setItem("levels", json);
    }

    // Loads from localstorage, called from Game.Initiliaze()
    Load(i_LevelIndex) {
        this.m_ActiveLevel = this.a_Levels[i_LevelIndex - 1];
    }    

    CreateSimulationLevel() {
        let brickHealth = 7;
        let a_Bricks = [];
        for (let row = 0; row < 6; row++) {
            for (let column = 0; column < 12; column++) {
                let location = new THREE.Vector2(column, row);
                a_Bricks.push(new LevelBrick(location, brickHealth));
            }
        }
        this.m_ActiveLevel = new Level(a_Bricks, 63, false);
        this.a_Levels[62] = this.m_ActiveLevel;
    }
}

class Level {
    a_Bricks;
    i_Level;
    b_Completed;

    constructor(a_BricksArray, i_Level, b_Completed) {
        this.a_Bricks = a_BricksArray;
        this.i_Level = i_Level;
        this.b_Completed = b_Completed;
    }
}

class LevelBrick {
    vec_GridLocation;
    i_Health;
    constructor(gridLocation, health) {
        this.vec_GridLocation = gridLocation;
        this.i_Health = health;
    }
}