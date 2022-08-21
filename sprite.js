class ExApp extends PIXI.Application {
    constructor(elm, imgNames, dic) {

        super(dic);

        this.tableCont = new PIXI.Container();

        this.tableCont.x = this.screen.width / 2;
        this.tableCont.y = this.screen.height / 2;
        this.stage.addChild(this.tableCont);

        this.imgNames = imgNames;
        this.textureArray = {};
        this.textureArraySpeed = {};

        this.setImg();
        this.setText();
        
        this.loader.load(() => { this.setTexture() });

        elm.append(this.view);

    }

    setImg() {

        this.imgNames.forEach(imgName => {
            this.loader.add(imgName, './img/' + imgName + '/' + imgName + '.json');
        });

    }

    setTexture() {

        $.ajaxSetup({ async: false });

        this.imgNames.forEach(imgName => {
            let textures = this.loader.resources[imgName].textures;
            this.textureArray[imgName] = Object.keys(textures).map(id => textures[id]);

            $.getJSON('./img/' + imgName + '/' + imgName + '.json', (jsonData) => {
                try {
                    this.textureArraySpeed[imgName] = 50 / (3 * jsonData.frames[imgName + ' 0.aseprite'].duration);
                } catch {
                    this.textureArraySpeed[imgName] = 100;
                }
            });
        });
        
        $.ajaxSetup({ async: true });

    }

    setText() {
        this.loader.add('MaruMonica', './font/MaruMonica.ttf');
    }
}

class ExSprite extends PIXI.AnimatedSprite {
    constructor(app, imgName) {
        super(app.textureArray[imgName]);

        this.anchor.set(0.5);
        this.app = app;
        this.animationSpeed = app.textureArraySpeed[imgName];
        this.play();
    }

    changeTextures(imgName) {
        this.textures = this.app.textureArray[imgName];
        this.animationSpeed = this.app.textureArraySpeed[imgName];
        this.play();
    }
}