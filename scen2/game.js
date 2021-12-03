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

const timers = {
    otherCar: 0,
    malfunction: 0
}

function preload ()
{
    this.load.image('road', 'road.png');
    this.load.image('player', 'player.png');
    this.load.image('radar', 'radar.png');
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

    this.otherCar = this.add.image(lanePositions[0] + 60, 500, 'player');
    this.otherCar.setScale(0.25);
    this.otherCar.setTint(0xfffff);
    this.otherCar.setRotation(-Math.PI / 2);

    this.radar = this.add.image(90, 150, 'radar');
    this.radar.setScale(0.5);

    this.otherCarDot = this.add.circle(80, 150, 5, 0xff0000);
    this.malfunctionDot = this.add.circle(80, 150, 5, 0xff0000);
    this.malfunctionDot.visible = false;

    this.cursors = this.input.keyboard.createCursorKeys();

    this.camera = this.cameras.main;

    this.logs = [];

    this.hfdsEnabled = true;
    this.isOnHigherSpeed = false;

    this.activateButton = this.add.text(5, 10, `${this.hfdsEnabled ? 'Deactivate' : 'Activate'} HFDS`, { fontSize: '20px', fill: '#0f0', fontFamily: 'Arial' });
    this.activateButton.setInteractive()
    .on('pointerdown', () => handleHFDSClick.call(this) )
    .on('pointerover', () => this.activateButton.setStyle({ fill: '#ff0'}) )
    .on('pointerout', () => this.activateButton.setStyle({ fill: '#0f0' }) );

    this.speedChangeButton = this.add.text(5, 250, 'High Speed Setting', { fontSize: '20px', fill: '#0f0', fontFamily: 'Arial' });
    this.speedChangeButton.setInteractive()
    .on('pointerover', () => this.speedChangeButton.setStyle({ fill: '#ff0'}) )
    .on('pointerout', () => this.speedChangeButton.setStyle({ fill: '#0f0' }) )
    .on('pointerdown', () => {
        this.isOnHigherSpeed  = !this.isOnHigherSpeed;
        this.speedChangeButton.text = `${this.isOnHigherSpeed ? 'Low Speed Setting' : 'High Speed Setting'}`;
    });

    this.simulateRadarFaultButton = this.add.text(5, 280, `Simulate Fault`, { fontSize: '20px', fill: '#0f0', fontFamily: 'Arial' });
    this.simulateRadarFaultButton.setInteractive()
    .on('pointerdown', () => simulateRadarFault.call(this) )
    .on('pointerover', () => this.simulateRadarFaultButton.setStyle({ fill: '#ff0'}) )
    .on('pointerout', () => this.simulateRadarFaultButton.setStyle({ fill: '#0f0' }) );
    

    if (this.hfdsEnabled) activateHFDS.call(this);
}

function handleHFDSClick() {
    if (this.hfdsEnabled) deactivateHFDS.call(this);
    else activateHFDS.call(this);
}

function activateHFDS() {
    this.hfdsEnabled = true;
    this.activateButton.text = "Deactivate HFDS";
    addLog.call(this, "System Activated");
}

function deactivateHFDS() {
    this.hfdsEnabled = false;
    this.activateButton.text = "Activate HFDS";
    addLog.call(this, "System Deactivated");
}

function update(time, delta)
{
    const cursors = this.cursors;
    const offset = (this.isOnHigherSpeed ? 200 : 100) * delta / 1000;

    if (cursors.left.isDown)
    {
        this.player.x -= offset;
        if (this.hfdsEnabled) deactivateHFDS.call(this);
    }
    else if (cursors.right.isDown)
    {
        this.player.x += offset;
        if (this.hfdsEnabled) deactivateHFDS.call(this);
    }

    const handleForwardMovement = () => {
        this.player.y -= offset;
        this.logs.forEach(log => log.y -= offset);
        this.activateButton.y -= offset;
        this.radar.y -= offset;
        this.speedChangeButton.y -= offset;
        this.simulateRadarFaultButton.y -= offset;
        // this.otherCarDot.y -= offset;
    };

    if (cursors.up.isDown || this.hfdsEnabled)
    {
        handleForwardMovement();
        if (cursors.up.isDown && this.hfdsEnabled) {
            deactivateHFDS.call(this);
        }
    }

    this.camera.centerOnY(this.player.y - 200);
    fixRoads.call(this);

    const otherCar = this.otherCar;
    otherCar.y -= offset + 1;
    Object.keys(timers).forEach((key) => timers[key] += delta / 1000);

    if (timers.otherCar >= 5 && !this.camera.worldView.contains(otherCar.x, otherCar.y + 100)) {
        otherCar.y = this.player.y + 500;
        otherCar.x = lanePositions[Math.random() < 0.5 ? 0 : 1] + 60;
        timers.otherCar = 0;
    }

    this.otherCarDot.x = this.radar.x + (otherCar.x - this.player.x) / 10;
    this.malfunctionDot.x = this.radar.x - (otherCar.x - this.player.x) / 10;
    this.otherCarDot.y = this.malfunctionDot.y = this.radar.y + (otherCar.y - this.player.y) / 25;

    // if (timers.malfunction >= 15) {
    //     timers.malfunction = 0;
    //     simulateRadarFault.call(this);
    // }
}

function simulateRadarFault() {
    if (this.hfdsEnabled) {
        addLog.call(this, "Radar Fault Detected...");
        this.malfunctionDot.visible = true;
        setTimeout(() => this.malfunctionDot.visible = false, 2000);
        deactivateHFDS.call(this);
    }
}

/**
 * This function is what makes the road 'infinite'
 */
function fixRoads() {
    const contains = {};
    this.roads.forEach((road, i) => {
        contains[i] = this.camera.worldView.contains(road.x, road.y);
    });
    // console.log( Object.values(contains).toString() );
    const secondRoad = this.roads[1];
    if (!this.camera.worldView.contains(secondRoad.x, secondRoad.y)) {
        const firstRoad = this.roads.shift();
        firstRoad.y = this.roads[2].y - 650;
        this.roads.push(firstRoad);
    }
}

function addLog(text) {
    const basePos = this.logs.length > 0 ? this.logs[this.logs.length - 1].y : 0;
    this.logs.push(this.add.text(1030,  basePos + 20, text, { fontSize: '16px', fill: '#FFFFFF', fontFamily: 'Arial' }));
}

