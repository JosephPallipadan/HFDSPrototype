
loader = new PIXI.Loader();

// Chainable `add` to enqueue a resource
loader.add('road', 'road-edited.png').add('bush', 'bush.png');

// The `load` method loads the queue of resources, and calls the passed in callback called once all
// resources have loaded.
loader.load(onAssetsLoaded);

function onAssetsLoaded(resources) {
    console.log(resources);
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
