const config = {
    type: Phaser.AUTO,
    parent: "phaser-parent",
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1200,
    height: 650,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 200 }
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);
const lanePositions = [354, 470, 600, 730];

function preload ()
{
    this.load.image('road', 'road.png');
    this.load.image('player', 'player.png');
}

function create ()
{
    this.roads = [];
    this.roads.push(this.add.image(600, 325 + 650, 'road'));
    this.roads.push(this.add.image(600, 325, 'road'));
    this.roads.push(this.add.image(600, 325 - 650, 'road'));
    this.roads.push(this.add.image(600, 325 - 650 * 2, 'road'));

    this.player = this.add.image(190 + 600, 500, 'player');
    this.player.setScale(0.25);
    this.player.setRotation(-Math.PI / 2);

    this.cursors = this.input.keyboard.createCursorKeys();

    this.camera = this.cameras.main;

    this.logs = [];

    this.activateButton = this.add.text(25, 10, 'Toggle HFDS', { fontSize: '20px', fill: '#0f0', fontFamily: 'Arial' });
    this.activateButton.setInteractive()
    .on('pointerdown', () => handleHFDSClick.call(this) )
    .on('pointerover', () => this.activateButton.setStyle({ fill: '#ff0'}) )
    .on('pointerout', () => this.activateButton.setStyle({ fill: '#0f0' }) );

    this.hfdsEnabled = false;
}

function handleHFDSClick() {
    if (this.hfdsEnabled) deactivateHFDS.call(this);
    else activateHFDS.call(this);
}

function activateHFDS() {
    this.hfdsEnabled = true;
    addLog.call(this, "System Activated");
}

function deactivateHFDS() {
    this.hfdsEnabled = false;
    addLog.call(this, "System Deactivated");
}

function update(time, delta)
{
    const cursors = this.cursors;
    const offset = 100 * delta / 1000;
    if (cursors.left.isDown)
    {
        this.player.x -= offset;
    }
    else if (cursors.right.isDown)
    {
        this.player.x += offset;
    }
    if (cursors.up.isDown)
    {
        handleForwardMovement();
        if (this.hfdsEnabled) {
            deactivateHFDS.call(this);
        }
    }

    const handleForwardMovement = () => {
        this.player.y -= offset;
        this.logs.forEach(log => log.y -= offset);
        this.activateButton.y -= offset;
    };

    this.camera.centerOnY(this.player.y - 200);
    fixRoads.call(this);
}

/**
 * This function is what makes the road 'infinite'
 */
function fixRoads() {
    const contains = {};
    this.roads.forEach((road, i) => {
        contains[i] = this.camera.worldView.contains(road.x, road.y);
    });
    console.log( Object.values(contains).toString() );
    const secondRoad = this.roads[1];
    if (!this.camera.worldView.contains(secondRoad.x, secondRoad.y)) {
        const firstRoad = this.roads.shift();
        firstRoad.y = this.roads[2].y - 650;
        this.roads.push(firstRoad);
    }
}

function addLog(text) {
    const today = new Date();
    const basePos = this.logs.length > 0 ? this.logs[this.logs.length - 1].y : 0;
    this.logs.push(this.add.text(1030,  basePos + 20, text, { fontSize: '16px', fill: '#FFFFFF', fontFamily: 'Arial' }));
}

