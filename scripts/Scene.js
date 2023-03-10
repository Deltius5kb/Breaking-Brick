const m_SELECTED_LEVEL = {
    level: 0
};

let a_Click = [];
let m_ClickedBrick = null;
let m_SelectedBrick = null;

// Used to convert index into number for css class ids in level select scene
function toWord(integer) {
    let string;
    switch (integer) {
        case 1:
            string = "one";
            break;
        case 2:
            string = "two";
            break;
        case 3:
            string = "three";
            break;
        case 4:
            string = "four";
            break;
        case 5:
            string = "five";
            break;
        case 6:
            string = "six";
            break;
    }
    return string;
}

class Scene {
    // Threejs scene
    m_Scene;
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
        this.Disable();
    }

    Update(deltaTime) {
    }

    Draw() {
    }

    Enable() {
    }

    Disable() {
    }

    _SetupThree(canvasID) {
        this._SetupScene();
        this._SetupRenderer(canvasID);
        this._SetupCamera();
        this._SetupLighting();
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
        this.m_Scene.add(this._m_Light, this._m_AmbientLight);
    }

    // Run once from constructor
    _SetupScene() {
        this.m_Scene = new THREE.Scene();
    }

    // Run once from constructor
    _SetupRenderer(canvasID) {
        this._m_Canvas = document.getElementById(canvasID);
        // Renderer
        this._m_Renderer = new THREE.WebGLRenderer({
            canvas: this._m_Canvas,
        });
        // Adds renderer to the html document
        document.body.appendChild(this._m_Renderer.domElement);
        this._m_Canvas.width = window.innerWidth;
        this._m_Canvas.height = window.innerHeight;
        this._m_Renderer.setSize(this._m_Canvas.width, this._m_Canvas.height);
    }

    // Run once from constructor
    _SetupHelpers() {
        // Light helper shows where the light is
        this._m_LightHelper = new THREE.PointLightHelper(this._m_Light);
        // Draws 2D grid 
        this._m_GridHelper = new THREE.GridHelper(200, 50);
        this.m_Scene.add(this._m_LightHelper, this._m_GridHelper);

        // OrbitControls messes with camera movement, only enable this if necessary
        this._m_Controls = new OrbitControls(this._m_Camera, this._m_Renderer.domElement);
    }
}

class SceneGame extends Scene {
    // Threejs Renderer
    // Grid object 
    m_Grid;
    // Bat object
    _m_Bat;
    // Ball object
    m_Ball;
    // Frame object
    _m_Frame;
    // Timer object 
    _m_Timer;
    m_ScoreCounter;
    m_Level;
    _f_DeltaTime;
    _m_Canvas;
    b_Won;

    constructor(canvasID, level) {
        super();
        this.b_Won = false;
        this._m_Canvas;
        this.m_Level = level;
        this._SetupThree(canvasID);
        this.#Initialize();
    }

    // Run every frame
    Update(deltaTime) {
        this._f_DeltaTime = deltaTime;

        this._m_Bat.Update(this._f_DeltaTime);
        this.m_Ball.Update(this._f_DeltaTime);

        this.m_Grid.Update();
        this._m_Timer.Update(this._f_DeltaTime);
        if (this._CheckIfWon()) {
            this.#SetLevelCompleted();
        }
    }

    Enable() {
        document.getElementById("gameui").style.display = "block";
        document.getElementById("gameCanvas").style.display = "block";
    }

    Disable() {
        document.getElementById("gameui").style.display = "none";
        document.getElementById("gameCanvas").style.display = "none";
    }

    Draw() {
        this._m_Renderer.render(this.m_Scene, this._m_Camera);
    }

    #SetLevelCompleted() {
        this.m_Level.m_ActiveLevel.b_Completed = true;
        this.m_Level.Save();
        this.b_Won = true;
    }

    // Called from Update
    _CheckIfWon() {
        let b_Won = true;

        // Checks for any bricks with more than 0 health
        for (let index = 0; index < this.m_Grid.a_GridArray.length; index++) {
            if (this.m_Grid.a_GridArray[index].i_Health > 0) {
                b_Won = false;
            }
        }
        return b_Won;
    }

    GetCamera() {
        return this._m_Camera;
    }

    // Run once from constructor
    #Initialize() {
        this.m_Grid = new Grid(this.m_Scene);

        this._m_Bat = new Bat(this.m_Scene);
        this._m_Frame = new Frame(this.m_Scene);
        this._m_Timer = new Timer("timer");
        this.m_ScoreCounter = new ScoreCounter("score");

        this.m_Ball = new Ball(this.m_Scene, this.m_Grid, this._m_Frame, this._m_Bat, this._m_Timer, this.m_ScoreCounter);
    }
}

class SceneGameFinished extends Scene {
    constructor() {
        super();
    }

    SetScore(score) {
        document.getElementById("scoreGameFinished").innerHTML = `SCORE: ${score}`;
    }

    Enable() {
        document.getElementById("gameFinishedUI").style.display = "block";
    }

    Disable() {
        document.getElementById("gameFinishedUI").style.display = "none";
    }
}

class SceneMainMenu extends SceneGame {
    constructor(level, canvasID) {
        super(canvasID, level);
        this.m_Ball.b_Simulation = true;
    }

    Update(deltaTime) {
        this._m_Bat.m_BatCuboid.position.x = this.m_Ball.m_BallSphere.position.x;
        super.Update(deltaTime);
    }

    Disable() {
        document.getElementById("mainmenu").style.display = "none";
        document.getElementById("mainMenuCanvas").style.display = "none";
        document.getElementById("gameui").style.display = "none";
    }

    Enable() {
        document.getElementById("mainmenu").style.display = "block";
        document.getElementById("mainMenuCanvas").style.display = "block";
    }

    // Overrides
    _CheckIfWon() {

    }

    // Run once from constructor
    _SetupRenderer(canvasID) {
        this._m_Canvas = document.getElementById(canvasID);

        this._m_Canvas.setAttribute("width", "1200px");
        this._m_Canvas.setAttribute("height", "675px");

        // Renderer
        this._m_Renderer = new THREE.WebGLRenderer({
            canvas: this._m_Canvas,
        });
        // Adds renderer to the html document
        document.body.appendChild(this._m_Renderer.domElement);
    }
}

class SceneSettingsMenu extends Scene {
    constructor() {
        super();
    }
}

class ScenePauseMenu extends Scene {
    constructor() {
        super();
    }

    Enable() {
        document.getElementById("pauseUI").style.display = "block";
    }

    Disable() {
        document.getElementById("pauseUI").style.display = "none";
    }
}

class SceneLevelCreate extends Scene {
    m_Level;
    #i_ActiveBrickHealth;
    #d_BrickColours;
    constructor(m_LevelHandler) {
        super();
        this.#i_ActiveBrickHealth = 0;
        this.m_Level = m_LevelHandler;
        this.#MakeGrid();
        this.#InitColours();
        this.#MakeBrickSelectionButtons();
    }

    Enable() {
        document.getElementById("levelCreate").style.display = "block";
    }

    Disable() {
        document.getElementById("levelCreate").style.display = "none";
    }

    Update(deltaTime) {
        this.#i_ActiveBrickHealth = Number(m_SelectedBrick.getAttribute("health"));
        this.#HandleInputs();
    }
    
    ResetCreationGrid() {
        let bricksDiv = document.getElementById("bricks");
        for (const brick of bricksDiv.children) {
            brick.style.backgroundColor = "#ffffff";
        }
        this.m_Level.a_Levels[64] = new Level([], 64, false);
        this.m_Level.m_ActiveLevel = this.m_Level.a_Levels[64];
    }

    // Called from update
    #HandleInputs() {
        if (m_ClickedBrick != null) {
            let thisBrick = this.#MakeBrickForGrid();
            if (this.#i_ActiveBrickHealth != -1) {
                this.m_Level.m_ActiveLevel.a_Bricks.push(thisBrick);
            }
            // Removes clicked cuboid from m_Level.m_ActiveLevel.a_Bricks
            else {
                this.#RemoveBrickAtClick();
            }
            m_ClickedBrick = null;
            a_Click = [];
            console.log(this.m_Level);
        }
        this.#EmptyClicksArray();
    }

    #MakeBrickForGrid() {
        let thisBrick = new LevelBrick(new THREE.Vector2(a_Click[0], a_Click[1]), this.#i_ActiveBrickHealth);
        m_ClickedBrick.style.backgroundColor = this.#GetColourFromHealth(this.#i_ActiveBrickHealth);
        return thisBrick;
    }
    
    #EmptyClicksArray() {
        // This doesnt work as its a const
        // a_Click = [];
        // So have to do this
        for (let index = 0; index < a_Click.length; index++) {
            a_Click.pop();
        }
    }

    #RemoveBrickAtClick() {
        for (let index = 0; index < this.m_Level.m_ActiveLevel.a_Bricks.length; index++) {
            if (this.m_Level.m_ActiveLevel.a_Bricks[index].vec_GridLocation.x == a_Click[0]
                && this.m_Level.m_ActiveLevel.a_Bricks[index].vec_GridLocation.y == a_Click[1]) {
                this.m_Level.m_ActiveLevel.a_Bricks.splice(index, 1);
                console.log("removed");
                break;
            }
        }
    }

    #InitColours() {
        this.#d_BrickColours = {
            "Blue": "#89a9ff",
            "Pink": "#E589FF",
            "Lime": "#A3FF89",
            "Green": "#89FFBA",
            "Purple": "#898DFF",
            "Hot Pink": "#FF89B3",
            "Yellow": "#FFED89",
            "Orange": "#FF834B",
            "Grey": "#808080"
        };
    }

    #GetColourFromHealth(health) {
        let colour;
        switch (health) {
            default:
                colour = this.#d_BrickColours["Grey"];
                break;
            case 1:
                colour = this.#d_BrickColours["Purple"];
                break;
            case 2:
                colour = this.#d_BrickColours["Lime"];
                break;
            case 3:
                colour = this.#d_BrickColours["Pink"];
                break;
            case 4:
                colour = this.#d_BrickColours["Yellow"];
                break;
            case 5:
                colour = this.#d_BrickColours["Hot Pink"];
                break;
            case 6:
                colour = this.#d_BrickColours["Orange"];
                break;
            case 7:
                colour = this.#d_BrickColours["Blue"];
                break;
            case 8:
                colour = this.#d_BrickColours["Green"];
                break;
            case -1:
                colour = "#ffffff";
                break;
        }
        return colour;
    }

    // Makes the "pallete" that lets you place bricks 
    #MakeBrickSelectionButtons() {
        let div = document.getElementById("selection");
        
        this.#AddHeadersToPallete(div);
        // Adds selection bricks themselves
        for (let health = -1; health < 9; health++) {
            let colour = this.#GetColourFromHealth(health);
            let brickDesc = this.#MakeBrickDescription(health);
            let thisBrick = this.#MakeBrick(health, colour);
            let row = this.#MakeRow(thisBrick, brickDesc);
            div.appendChild(row);
        }
    }

    // Makes a row div, called from MakeBrickSelectionButtons
    #MakeRow(thisBrick, brickDesc) {
        let row = document.createElement("div");
        row.setAttribute("class", "selection-row");
        row.appendChild(thisBrick);
        row.appendChild(brickDesc);
        return row;
    }

    // Makes a brick div, called from MakeBrickSelectionButtons
    #MakeBrick(health, colour) {
        let thisBrick = document.createElement("div");
        thisBrick.setAttribute("class", "brick");
        thisBrick.setAttribute("health", health);
        // If first 
        if (health == -1) {
            thisBrick.style.backgroundColor = "#ffffff";
        }
        else {
            thisBrick.style.backgroundColor = colour;
        }

        thisBrick.style.border = "5px solid transparent";

        thisBrick.onclick = function (event) {
            if (m_SelectedBrick.getAttribute("health") == -1) {
                m_SelectedBrick.style.border = "5px solid transparent";
            }
            m_SelectedBrick.setAttribute("class", "brick");
            m_SelectedBrick = event.currentTarget;
            if (m_SelectedBrick.getAttribute("health") == -1) {
                m_SelectedBrick.style.border = "5px solid #808080";
            }
            else {
                event.currentTarget.setAttribute("class", "brick selected");
            }
        };

        if (health == 0) {
            m_SelectedBrick = thisBrick;
            thisBrick.setAttribute("class", "brick selected");
        }

        return thisBrick;
    }

    // Makes a label div, called from MakeBrickSelectionButtons
    #MakeBrickDescription(health) {
        let brickDesc = document.createElement("div");
        // If first
        if (health == -1) {
            brickDesc.innerHTML = "REMOVE";
        }
        else {
            brickDesc.innerHTML = health;
        }
        brickDesc.setAttribute("class", "label");
        return brickDesc;
    }

    #AddHeadersToPallete(div) {
        // Adds column headers
        let headerRow = document.createElement("div");
        headerRow.setAttribute("class", "selection-row");

        let brickLabel = document.createElement("div");
        brickLabel.setAttribute("class", "column-header");
        brickLabel.innerHTML = "Brick";
        headerRow.appendChild(brickLabel);

        let healthLabel = document.createElement("div");
        healthLabel.setAttribute("class", "column-header");
        healthLabel.innerHTML = "Health";
        headerRow.appendChild(healthLabel);
        div.appendChild(headerRow);
    }

    // Called from constructor, makes html grid
    #MakeGrid() {
        let element = document.getElementById("bricks");
        for (let row = 0; row < 6; row++) {
            let thisRow = [];
            for (let column = 0; column < 12; column++) {
                let thisBrick = document.createElement("div");
                thisBrick.setAttribute("class", "brick");
                thisBrick.setAttribute("row", row);
                thisBrick.setAttribute("column", column);

                thisBrick.onclick = function (event) {
                    let x = Number(event.currentTarget.getAttribute("column"));
                    let y = Number(event.currentTarget.getAttribute("row"));
                    a_Click = [x, y];
                    m_ClickedBrick = event.currentTarget;
                    console.log(a_Click);
                };
                element.appendChild(thisBrick);
                thisRow.push(thisBrick);
            }
        }
    }
}

class SceneLevelSelect extends Scene {
    b_CreateButton;
    m_LevelHandler;
    constructor(m_LevelHandler) {
        super();

        this.m_LevelHandler = m_LevelHandler;
        this.b_CreateButton = true;
        // Make a 5 row grid (1 for each season)
        // Add each level name as a breaking bad episode
        // Add html object for each level 
        // Group them by season
        // Change colours based on seasons
        this.#MakeGrid();
        this.UpdateColours();
    }

    Update() {
        if (KeyStates.m) {
            KeyStates.m = false;
            for (let index = 0; index < this.m_LevelHandler.a_Levels.length; index++) {
                if (!this.m_LevelHandler.a_Levels[index].b_Completed) {
                    this.m_LevelHandler.a_Levels[index].b_Completed = true;
                    this.m_LevelHandler.Save();
                    this.UpdateColours();
                    break;
                }
            }
        }
    }

    Enable() {
        document.getElementById("levelselect").style.display = "block";
    }

    Disable() {
        document.getElementById("levelselect").style.display = "none";
    }

    ShowCreateButton() {
        this.b_CreateButton = true;
        document.getElementById("levelDesignerButton").style.display = "block";
    }

    HideCreateButton() {
        this.b_CreateButton = false;
        document.getElementById("levelDesignerButton").style.display = "none";
    }

    UpdateColours() {
        // Sets all levels to unlocked
        let a_LockedLevels = document.querySelectorAll(".locked");
        a_LockedLevels.forEach(function (element) {
            let newClassName = element.getAttribute("class").replace(" locked", "");
            element.setAttribute("class", newClassName);
        });

        // Sets locked levels
        let a_Periods = document.getElementsByClassName("period-inner");
        // The first will always be unlocked 
        for (let index = 1; index < a_Periods.length; index++) {
            let a_Period = a_Periods[index];
            let str_Level = a_Period.getAttribute("level");
            let i_Level = Number(str_Level);
            let m_PreviousLevel = this.m_LevelHandler.a_Levels[i_Level - 2];

            if (!m_PreviousLevel.b_Completed) {
                a_Period.setAttribute("class", a_Period.getAttribute("class") + " locked");
            }
        }
    }

    #MakeGrid() {
        // TODO move into text file
        let season1 = [
            {
                Name: "Pilot",
                Abbreviation: "Pi"
            },
            {
                Name: "The Cat's in the Bag",
                Abbreviation: "Cb"
            },
            {
                Name: "And the Bag's in the River",
                Abbreviation: "Br"
            },
            {
                Name: "Cancer Man",
                Abbreviation: "Cm"
            },
            {
                Name: "Gray Matter",
                Abbreviation: "Gm"
            },
            {
                Name: "Crazy Handful of Nothin'",
                Abbreviation: "Ch"
            },
            {
                Name: "A No-Rough-Stuff-Type Deal",
                Abbreviation: "Nr"
            },
        ];

        let season2 = [
            {
                Name: "Seven Thirty-Seven",
                Abbreviation: "Sv"
            },
            {
                Name: "Grilled",
                Abbreviation: "G"
            },
            {
                Name: "Bit by a Dead Bee",
                Abbreviation: "Bb"
            },
            {
                Name: "Down",
                Abbreviation: "Dn"
            },
            {
                Name: "Breakage",
                Abbreviation: "Bk"
            },
            {
                Name: "Peekaboo",
                Abbreviation: "Pkb"
            },
            {
                Name: "Negro y Azul",
                Abbreviation: "Na"
            },
            {
                Name: "Better Call Saul",
                Abbreviation: "Bcs"
            },
            {
                Name: "4 Days Out",
                Abbreviation: "Do"
            },
            {
                Name: "Over",
                Abbreviation: "O"
            },
            {
                Name: "Mandala",
                Abbreviation: "M"
            },
            {
                Name: "Phoenix",
                Abbreviation: "P"
            },
            {
                Name: "ABQ",
                Abbreviation: "Abq"
            },
        ];

        let season3 = [
            {
                Name: "No Mas",
                Abbreviation: "Nm"
            },
            {
                Name: "Caballo Sin Nombre",
                Abbreviation: "Cn"
            },
            {
                Name: "I.F.T",
                Abbreviation: "If"
            },
            {
                Name: "Green Light",
                Abbreviation: "Gl"
            },
            {
                Name: "Mas",
                Abbreviation: "Ma"
            },
            {
                Name: "Sunset",
                Abbreviation: "S"
            },
            {
                Name: "One Minute",
                Abbreviation: "Om"
            },
            {
                Name: "I See You",
                Abbreviation: "Icu"
            },
            {
                Name: "Kafkaesque",
                Abbreviation: "K"
            },
            {
                Name: "Fly",
                Abbreviation: "F"
            },
            {
                Name: "Abiquiu",
                Abbreviation: "Ab"
            },
            {
                Name: "Half Measures",
                Abbreviation: "Hm"
            },
            {
                Name: "Full Measure",
                Abbreviation: "Fm"
            },
        ];

        let season4 = [
            {
                Name: "Box Cutter",
                Abbreviation: "Bc"
            },
            {
                Name: "Thirty-Eight Snub",
                Abbreviation: "Ts"
            },
            {
                Name: "Open House",
                Abbreviation: "Oh"
            },
            {
                Name: "Bullet Points",
                Abbreviation: "Bp"
            },
            {
                Name: "Shotgun",
                Abbreviation: "Sg"
            },
            {
                Name: "Cornered",
                Abbreviation: "C"
            },
            {
                Name: "Problem Dog",
                Abbreviation: "Pd"
            },
            {
                Name: "Hermanos",
                Abbreviation: "H"
            },
            {
                Name: "Bug",
                Abbreviation: "B"
            },
            {
                Name: "Salud",
                Abbreviation: "Sa"
            },
            {
                Name: "Crawl Space",
                Abbreviation: "Cs"
            },
            {
                Name: "End Times",
                Abbreviation: "Et"
            },
            {
                Name: "Face Off",
                Abbreviation: "Fo"
            },
        ];

        let season5 = [
            {
                Name: "Live Free or Die",
                Abbreviation: "Lfd"
            },
            {
                Name: "Madrigal",
                Abbreviation: "Ml"
            },
            {
                Name: "Hazard Pay",
                Abbreviation: "Hp"
            },
            {
                Name: "Fifty One",
                Abbreviation: "Fio"
            },
            {
                Name: "Dead Freight",
                Abbreviation: "Df"
            },
            {
                Name: "Buyout",
                Abbreviation: "Bo"
            },
            {
                Name: "Say My Name",
                Abbreviation: "Smn"
            },
            {
                Name: "Gliding Over All",
                Abbreviation: "Go"
            },
            {
                Name: "Blood Money",
                Abbreviation: "Blm"
            },
            {
                Name: "Buried",
                Abbreviation: "Bu"
            },
            {
                Name: "Confessions",
                Abbreviation: "Co"
            },
            {
                Name: "Rabid Dog",
                Abbreviation: "Rd"
            },
            {
                Name: "To'hajilee",
                Abbreviation: "Th"
            },
            {
                Name: "Ozymandias",
                Abbreviation: "Ozy"
            },
            {
                Name: "Granite State",
                Abbreviation: "Gs"
            },
            {
                Name: "Felina",
                Abbreviation: "Fe"
            },
        ];

        // Iterated through 
        let seasons = [
            season1,
            season2,
            season3,
            season4,
            season5
        ];

        let table = document.getElementById("table");
        let level = 0;

        for (let seasonIndex = 0; seasonIndex < seasons.length; seasonIndex++) {
            let season = seasons[seasonIndex];

            for (let index = 0; index < season.length; index++) {
                level += 1;

                // Makes elements in form:
                // <div class="period 1">
                //     <div class="period-inner">
                //         <div class="title">L1</div>
                //         <div class="desc">Level1</div>
                //     </div>
                // </div>
                let period = document.createElement("div")

                period.setAttribute("class", "period " + toWord(seasonIndex + 1));
                let period_inner = document.createElement("div")
                period_inner.setAttribute("class", "period-inner");

                let title = document.createElement("div")
                title.setAttribute("class", "title");
                title.innerHTML = season[index].Abbreviation;
                let desc = document.createElement("div")
                desc.setAttribute("class", "desc");
                desc.innerHTML = "Level " + level;

                period_inner.appendChild(title);
                period_inner.appendChild(desc);

                period_inner.setAttribute("level", level)
                period_inner.onclick = function (event) {
                    m_SELECTED_LEVEL.level = Number(event.currentTarget.getAttribute("level"));
                    console.log(m_SELECTED_LEVEL.level);
                };

                period.appendChild(period_inner);
                table.appendChild(period);
            }
        }

        // Makes empty spaces 
        for (let index = 0; index < 4; index++) {
            let gap = document.createElement("div");
            gap.setAttribute("class", "empty-space-" + (index + 1));
            table.appendChild(gap);
        }
    }
}

// {
//     Name: "",
//     Abbreviation: ""},