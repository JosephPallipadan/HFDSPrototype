/**
 * Make lights flash
 * Audio
 * Make page look good
 * Speedometer
 */


loader = new PIXI.Loader();

// Chainable `add` to enqueue a resource
loader
.add('exterior', 'images/exterior.png')
.add('interior', 'images/interior.png')
.add('treeLeft', 'images/tree-left.png')
.add('treeRight', 'images/tree-right.png')
.add('pole', 'images/pole.png')
.add('hand', 'images/hand.png')
.add('alert', 'images/alert-button.png');

const textStyle = new PIXI.TextStyle({
    fontFamily: 'Verdana',
    fontSize: 16,
    fontWeight: 'bold',
    fill: ['#ffffff', '#00ff99'].reverse(), // gradient
});

const activateStyle = new PIXI.TextStyle({
    fontFamily: 'Verdana',
    fontSize: 12,
    align: 'center',
    fontWeight: 'bold',
    fill: ['#ffffff', '#00ff99'].reverse(), // gradient
});


// The `load` method loads the queue of resources, and calls the passed in callback called once all
// resources have loaded.
loader.load(onAssetsLoaded);

function onAssetsLoaded({resources}) {
    const app = new PIXI.Application({ width: 1024, height: 640 });
    document.body.appendChild(app.view);

    const exterior = PIXI.Sprite.from(resources.exterior.url);
    const interior = PIXI.Sprite.from(resources.interior.url);
    const treeLeft = PIXI.Sprite.from(resources.treeLeft.url);
    const treeRight = PIXI.Sprite.from(resources.treeRight.url);
    const hand = PIXI.Sprite.from(resources.hand.url);
    const alertButton = PIXI.Sprite.from(resources.alert.url);

    const scale = 0.5;
    [exterior, interior, treeLeft, treeRight, hand].forEach((sprite) => {
        sprite.scale.x = scale;
        sprite.scale.y = scale;
    });

    interior.y = exterior.height - interior.height;

    hand.x = 112;
    hand.y = 504;

    treeLeft.x = 328 * scale;
    treeLeft.y = 280 * scale;

    treeRight.x = 1464 * scale;
    treeRight.y = 288 * scale;

    // Masking so the bush does not appear in the black part
    const roadMask = new PIXI.Graphics();
    roadMask.drawRect(0, 552 * scale, 1024, 552 * scale);

    const laneMarker = new PIXI.Graphics();
    const laneMarkerStart = {x:425, y:275 - 50};
    laneMarker.beginFill(0xFFFFFF);
    laneMarker.drawRect(0, 0, 10, 50);
    laneMarker.endFill();
    laneMarker.x = laneMarkerStart.x;
    laneMarker.y = laneMarkerStart.y;
    laneMarker.mask = roadMask;

    const numberOfPoles = 3;
    const poleSpacingX = 200;
    const poleStartX = 470;
    const poleY = (x) => 0.35 * x + 180 * scale;
    const poles = [...Array(numberOfPoles)].map((_, i) => {
        const pole = PIXI.Sprite.from(resources.pole.url);
        pole.x = poleStartX + poleSpacingX * i;
        pole.y = poleY(pole.x);
        return pole;
    });

    const speedIndicator = new PIXI.Text('70 MPH', textStyle);
    let speedValue = 70;
    speedIndicator.x = 235;
    speedIndicator.y = 500;
    let elapsed = 0;
    app.ticker.add((delta) => {
        elapsed += delta;
        if (elapsed > 20 && !hfdsEnabled) {
            elapsed = 0;
            speedValue += (Math.random() < 0.5 ? -1 : 1);
            if (speedValue < 65) speedValue = 65;
            if (speedValue > 75) speedValue = 75;
            speedIndicator.text = `${speedValue} MPH`;
        }
    });

    const activateHFDSButton = new PIXI.Text('TOGGLE\nHFDS', activateStyle);
    let hfdsEnabled = false;
    activateHFDSButton.x = 735;
    activateHFDSButton.y = 465;
    activateHFDSButton.interactive = activateHFDSButton.buttonMode = true;
    activateHFDSButton.on('pointerdown', () => {
        hfdsEnabled = !hfdsEnabled;
        hand.visible = !hfdsEnabled;
        viewPort.visible = hfdsEnabled;
    });

    const viewPort = new PIXI.Graphics();
    const viewPortStart = {x:100, y:80};
    viewPort.beginFill(0xFF0000);
    viewPort.drawRect(0, 0, 600, 300);
    viewPort.endFill();
    viewPort.alpha = 0.5;
    viewPort.x = viewPortStart.x;
    viewPort.y = viewPortStart.y;
    viewPort.visible = false;

    function onKeyDown(key) {
        if (!hfdsEnabled) return;
        const keyDisplacement = 5;
        // Up arrow is 38
        if (key.keyCode === 38) {
            viewPort.y -= keyDisplacement;
        }

        // Down arrow is 40
        if (key.keyCode === 40) {
            viewPort.y += keyDisplacement;
        }

        // Left arrow is 37
        if (key.keyCode === 37) {
            viewPort.x -= keyDisplacement;
        }

        // Right arrow is 39
        if (key.keyCode === 39) {
            viewPort.x += keyDisplacement;
        }
    }
    document.addEventListener('keydown', onKeyDown);

    function isAttentive() {
        if (!hfdsEnabled) return true;
        const XBounds = {left: -100, right: 300};
        const YBounds = {top: -100, bottom: 200};
        const XOk = viewPort.x < XBounds.right && viewPort.x > XBounds.left;
        const YOk = viewPort.y < YBounds.bottom && viewPort.y > YBounds.top;
        return XOk && YOk;
    }

    alertButton.x = 680;
    alertButton.y = 470;
    alertButton.tint = 0x0;

    const activityIndicator = new PIXI.Text('HFDS\nINACTIVE', activateStyle);
    activityIndicator.x = 435;
    activityIndicator.y = 500;

    let inattentionTimer = 20;
    app.ticker.add((delta) => {
        if (!isAttentive()) {
            inattentionTimer -= delta * 0.05;
            activityIndicator.text = `${Math.ceil(inattentionTimer % 5)}`;
            if (inattentionTimer <= 5) {
                speed = Math.max(0, speed - delta * 0.05);
                alertButton.tint = 0xFF0000;
            } else if (inattentionTimer <= 10) {
                alertButton.tint = 0xFF0000;
            } else if (inattentionTimer <= 15) {
                alertButton.tint = 0x00FF00;
            }
        } else {
            inattentionTimer = 20;
        }
    });


    app.stage.addChild(exterior);
    app.stage.addChild(treeLeft);
    app.stage.addChild(treeRight);
    poles.forEach((pole) => app.stage.addChild(pole));
    app.stage.addChild(laneMarker);
    app.stage.addChild(interior);
    app.stage.addChild(speedIndicator);
    app.stage.addChild(activityIndicator);
    app.stage.addChild(alertButton);
    app.stage.addChild(activateHFDSButton)
    app.stage.addChild(hand);
    app.stage.addChild(viewPort);


    let speed = 30;
    app.ticker.add((delta) => {
        laneMarker.y += delta * 0.1 * speed;
        laneMarker.scale.x += 0.005 / 20 * speed;
        laneMarker.scale.y += 0.005 / 20 * speed;

        poles.forEach((pole) => {
            pole.x += delta * 0.1 * speed;
            pole.y = poleY(pole.x);

            if (pole.x >= 1024) {
                pole.x = poleStartX;
            }

            const poleScale = (pole.x - 450) / (1024 - 450) * 0.7 + 0.05;
            pole.scale.x = pole.scale.y = poleScale;
        });

        if (laneMarker.y >= 800 * scale) {
            laneMarker.y = laneMarkerStart.y;
            laneMarker.scale.x = scale;
            laneMarker.scale.y = scale;
        }
    });
}

function legacy(resources) {
    // Create the application helper and add its render target to the page
    let app = new PIXI.Application({ width: 799, height: window.innerHeight / 2 });
    document.body.appendChild(app.view);

    // Create the sprite and add it to the stage
    const roadSprite = PIXI.Sprite.from('road-edited.png');
    // const roadSpriteCopy = PIXI.Sprite.from('road-edited.png');

    roadSprite.y = 100;
    // roadSpriteCopy.y = 100;

    const bushTexture = PIXI.Texture.from('bush.png');
    const leftBushStartX = 200;
    const leftBushStartY = 70;
    const rightBushStartX = 525;
    const rightBushStartY = leftBushStartY;

    const leftBush = new PIXI.Sprite(bushTexture);
    leftBush.width = 80;
    leftBush.height = 80;
    leftBush.x = leftBushStartX;
    leftBush.y = leftBushStartY;

    const rightBush = new PIXI.Sprite(bushTexture);
    rightBush.width = 80;
    rightBush.height = 80;
    rightBush.x = rightBushStartX;
    rightBush.y = rightBushStartY;

    // Masking so the bush does not appear in the black part
    const roadMask = new PIXI.Graphics();
    roadMask.drawRect(0, roadSprite.y, roadSprite.width, roadSprite.height);
    leftBush.mask = roadMask;
    rightBush.mask = roadMask;

    const roadCutterLeft1 = new PIXI.Graphics();
    const roadCutterLeft1Start = {x:402, y:roadSprite.y};
    roadCutterLeft1.beginFill(0x959597);
    roadCutterLeft1.drawRect(0, 0, 50, 30);
    roadCutterLeft1.endFill();
    roadCutterLeft1.angle = 135;
    roadCutterLeft1.x = roadCutterLeft1Start.x;
    roadCutterLeft1.y = roadCutterLeft1Start.y;
    roadCutterLeft1.mask = roadMask;

    const roadCutterLeft2 = new PIXI.Graphics();
    const roadCutterLeft2Start = {x:310, y:roadSprite.y + 100};
    roadCutterLeft2.beginFill(0x959597);
    roadCutterLeft2.drawRect(0, 0, 50, 30);
    roadCutterLeft2.endFill();
    roadCutterLeft2.angle = 135;
    roadCutterLeft2.x = roadCutterLeft2Start.x;
    roadCutterLeft2.y = roadCutterLeft2Start.y;
    roadCutterLeft2.mask = roadMask;

    const roadCutterRight1 = new PIXI.Graphics();
    const roadCutterRight1Start = {x:440, y:roadSprite.y};
    roadCutterRight1.beginFill(0x959597);
    roadCutterRight1.drawRect(0, 0, 50, 30);
    roadCutterRight1.endFill();
    roadCutterRight1.angle = 45;
    roadCutterRight1.x = roadCutterRight1Start.x;
    roadCutterRight1.y = roadCutterRight1Start.y;
    roadCutterRight1.mask = roadMask;

    const roadCutterRight2 = new PIXI.Graphics();
    const roadCutterRight2Start = {x:535, y:roadSprite.y + 100};
    roadCutterRight2.beginFill(0x959597);
    roadCutterRight2.drawRect(0, 0, 50, 30);
    roadCutterRight2.endFill();
    roadCutterRight2.angle = 45;
    roadCutterRight2.x = roadCutterRight2Start.x;
    roadCutterRight2.y = roadCutterRight2Start.y;
    roadCutterRight2.mask = roadMask;


    app.stage.addChild(roadSprite);
    app.stage.addChild(roadCutterLeft1);
    app.stage.addChild(roadCutterLeft2);
    app.stage.addChild(roadCutterRight1);
    app.stage.addChild(roadCutterRight2);
    app.stage.addChild(leftBush);
    app.stage.addChild(rightBush);

    // Add a ticker callback to move the sprite back and forth
    const speed = 32;
    app.ticker.add((delta) => {
        leftBush.y += delta * 0.1 * speed;
        leftBush.x -= delta * 0.29 * speed;

        rightBush.y += delta * 0.1 * speed;
        rightBush.x += delta * 0.29 * speed;

        roadCutterLeft1.y += delta * 0.1 * speed * 2;
        roadCutterLeft1.x -= delta * 0.094 * speed * 2;

        roadCutterLeft2.y += delta * 0.1 * speed * 2;
        roadCutterLeft2.x -= delta * 0.094 * speed * 2;

        roadCutterRight1.y += delta * 0.1 * speed * 2;
        roadCutterRight1.x += delta * 0.094 * speed * 2;

        roadCutterRight2.y += delta * 0.1 * speed * 2;
        roadCutterRight2.x += delta * 0.094 * speed * 2;

        if (leftBush.x < -50) {
            leftBush.x = leftBushStartX;
            leftBush.y = leftBushStartY;
        }

        if (rightBush.x > roadSprite.width) {
            rightBush.x = rightBushStartX;
            rightBush.y = rightBushStartY;
        }


        if (roadCutterLeft1.y > roadSprite.y + roadSprite.height) {
            roadCutterLeft1.x = roadCutterLeft1Start.x;
            roadCutterLeft1.y = roadCutterLeft1Start.y;
        }

        if (roadCutterLeft2.y > roadSprite.y + roadSprite.height) {
            roadCutterLeft2.x = roadCutterLeft1Start.x;
            roadCutterLeft2.y = roadCutterLeft1Start.y;
        }

        if (roadCutterRight1.y > roadSprite.y + roadSprite.height) {
            roadCutterRight1.x = roadCutterRight1Start.x;
            roadCutterRight1.y = roadCutterRight1Start.y;
        }

        if (roadCutterRight2.y > roadSprite.y + roadSprite.height) {
            roadCutterRight2.x = roadCutterRight1Start.x;
            roadCutterRight2.y = roadCutterRight1Start.y;
        }
    });
}
