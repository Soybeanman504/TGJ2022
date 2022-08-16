class Table {
    constructor(app, mw, mh, charaNames) {
        this.app = app;
        this.mw = mw;
        this.mh = mh;
        this.w = mw * 32;
        this.h = mh * 32 + 16;
        this.charaNames = charaNames;

        this.chain = [];//ゆっくりの連なり。座標を順に格納。

        this.cont = new PIXI.Container();

        this.cont.x = this.app.screen.width / 2;
        this.cont.y = 224;

        this.cont.mask = new PIXI.Graphics()
            .beginFill(0xffffff)
            .drawRect(this.cont.x - this.w / 2, this.cont.y - this.h / 2, this.w, this.h)
            .endFill();


        this.cont.interactive = true;
        this.cont.on('mousemove', (e) => { this.mapEvent(e) });

        this.app.stage.addChild(this.cont);

        this.map = new Array(mw);

        for (let mx = 0; mx < this.mw; ++mx) {
            this.map[mx] = new Array(mh);

            for (let my = 0; my < this.mh; ++my) {
                this.setCharaSprite(mx, my, randInt(charaNames.length));
            }
        }
    }

    mapEvent(e) {
        let p = e.data.getLocalPosition(e.currentTarget);
        let mx, my, success;

        [mx, my, success] = this.positionToMap(p.x, p.y);

        if (success) {
            console.log(mx,my);
        }
    }

    positionToMap(x, y) {
        let mx = Math.floor((x + this.w / 2) / 32);
        let my;
        let success = false;

        if (mx >= 0 && mx < this.mw) {
            if (mx % 2) {//奇数のとき
                my = Math.floor((y + this.h / 2) / 32);
            } else {//偶数のとき
                my = Math.floor((y + this.h / 2 - 16) / 32);
            }

            if (my >= 0 && my < this.mh) {
                success = true;
            }
        }

        return [mx, my, success];
    }

    setCharaSprite(mx, my, value) {
        this.map[mx][my] = {};
        this.map[mx][my].value = value;

        this.map[mx][my].sprite = new ExSprite(this.app, this.charaNames[this.map[mx][my].value]);

        this.map[mx][my].sprite.anchor.set(0.5);
        this.moveSprite(this.map[mx][my].sprite, mx * 32 + 16, my * 32 + (1 - mx % 2) * 16 + 16);

        this.cont.addChild(this.map[mx][my].sprite);
    }

    moveSprite(sprite, x, y) {
        sprite.x = x - this.w / 2;
        sprite.y = y - this.h / 2;
    }
}