class Table {
    constructor(app, mw, mh, charaNames) {
        this.app = app;
        this.mw = mw;
        this.mh = mh;
        this.margin = 20;
        this.w = mw * 32;
        this.h = mh * 32 + 16;
        this.charaNames = charaNames;
        this.pointer = false;

        this.chain = [];//ゆっくりの連なり。座標を順に格納。

        this.tableCont = new PIXI.Container();

        this.mapCont = new PIXI.Container();

        this.mapCont.x = this.app.screen.width / 2;
        this.mapCont.y = this.app.screen.height / 2;

        this.mapCont.mask = new PIXI.Graphics()
            .beginFill(0xffffff)
            .drawRect(this.mapCont.x - this.w / 2, this.mapCont.y - this.h / 2, this.w, this.h)
            .endFill();

        this.mapCont.interactive = true;
        this.mapCont.hitArea = new PIXI.Rectangle(-this.w / 2 - this.margin, -this.h / 2 - this.margin, this.w + this.margin * 2, this.h + this.margin * 2);

        this.mapCont.on('pointermove', (e) => { this.pointerMoveEvent(e) });
        this.mapCont.on('pointerdown', (e) => { this.pointerDownEvent(e) });
        this.mapCont.on('pointerup', (e) => { this.pointerUpEvent(e) });
        this.mapCont.on('pointerout', (e) => { this.pointerUpEvent(e) });

        this.app.stage.addChild(this.tableCont);
        this.tableCont.addChild(this.mapCont);

        this.fallCharas = Array(this.mw);
        this.fallCharasN = Array(this.mw);
        this.map = new Array(mw);

        for (let mx = 0; mx < this.mw; ++mx) {
            this.fallCharas[mx] = new Array(mh);
            this.fallCharasN[mx] = 0;
            this.map[mx] = new Array(mh);

            for (let my = 0; my < this.mh; ++my) {
                this.fallCharas[mx][my] = { value: -1 };
                this.setChara(mx, my, randInt(charaNames.length));
            }
        }

        //this.app.ticker.add((delta) => { this.mainLoop(delta) });
    }

    //mainLoop

    mainLoop(delta) {
        //fallCharas送り出し
        for (let mx = 0; mx < this.mw; ++mx) {
            if (this.map[mx][0].value == -1) {
                this.setChara(mx, 0, this.fallCharas[mx][0].value);
                this.map[mx][0].fall = true;
                this.map[mx][0].sprite.x -= 32;
            }

            for (let my = this.mh - 1; my > -1; --my) {
                this.map[mx][my].sprite.mv += 1;
                let newY = this.map[mx][my].sprite.y + this.map[mx][my].sprite.mv;
                
                if (newY > this.myToY(mx, my)) {
                    if (my == this.mh - 1 || !this.map[mx][my + 1].fall) {
                        this.map[mx][my].sprite.y = Table.myToY(mx, my);
                        this.map[mx][my].sprite.fall = false;
                    } else if (newY > this.myToY(mx, my) + 16) {
                        //todo myからmy+1にスプライト、fallフラグ、valueなどを移動する。
                    }
                } else {
                    this.map[mx][my].sprite.y = newY;
                }
            }
        }
    }

    //Events

    pointerMoveEvent(e) {
        if (this.pointer) {
            let p = e.data.getLocalPosition(e.currentTarget);
            let pointerMp, success;

            [pointerMp, success] = this.positionToMp(p);

            if (success) {
                console.log('move');
                this.mapEvent(pointerMp);
            }
        }
    }

    mapEvent(pointerMp) {
        if (this.chain.length > 0) {
            let currentMp = this.chain[this.chain.length - 1];

            if (!Table.matchMp(pointerMp, currentMp) &&
                !this.getMap(pointerMp).select &&
                this.getMap(pointerMp).value == this.getMap(currentMp).value) {

                if (Math.abs(pointerMp.x - currentMp.x) < 2 &&
                    Math.abs(pointerMp.y - currentMp.y) < 2) {
                    if ((pointerMp.y - currentMp.y) != ((currentMp.x % 2) * 2 - 1) ||
                        pointerMp.x == currentMp.x) {
                        this.setMap(pointerMp, 'select', true);
                        this.chain.push(pointerMp);
                    }
                }
            }
        } else {
            this.chain.push(pointerMp);
        }
    }

    pointerDownEvent(e) {
        console.log('down', this.chain);
        this.pointer = true;

        this.pointerMoveEvent(e);
    }

    pointerUpEvent(e) {
        console.log('up', this.chain);
        this.pointer = false;

        if (this.chain.length > 0) {
            console.log(this.chain);
            this.deleteCharas(this.chain);
            this.chain = [];
        }
    }

    //Charas

    deleteCharas(mps) {
        let fallMxs = [];

        mps.forEach((mp) => {
            this.deleteChara(mp);

            if (fallMxs.indexOf(mp.x) == -1) {
                fallMxs.push(mp.x);
            }
        });

        fallMxs.forEach((mx) => {
            let depth = 0;

            for (let my = this.mh - 1; my > -1; --my) {
                if (this.map[mx][my] == -1) {
                    depth += 1;
                } else {
                    if (depth > 0) {
                        this.map[mx][my].fall = true;
                    }
                }
            }
        });
    }

    addFallCharas(mx, value) {
        this.fallCharas[mx][this.fallCharas[mx]++].value = value;
    }

    deleteChara(mp) {
        this.setMap(mp, 'false', -1);
        this.setMap(mp, 'select', false);

        this.mapCont.removeChild(this.map[mp.x][mp.y].sprite);
        this.setMap(mp, 'sprite', null);
    }

    setChara(mx, my, value) {
        this.map[mx][my] = {};
        this.map[mx][my].value = value;
        this.map[mx][my].select = false;
        this.map[mx][my].fall = false;
        this.map[mx][my].mv = 0;//速度

        this.map[mx][my].sprite = new ExSprite(this.app, this.charaNames[this.map[mx][my].value]);

        this.map[mx][my].sprite.anchor.set(0.5);
        this.moveSprite(this.map[mx][my].sprite, this.mxToX(mx), this.myToY(mx, my));

        this.mapCont.addChild(this.map[mx][my].sprite);
    }

    mxToX(mx) {
        return mx * 32 + 16 - this.w / 2;
    }

    myToY(mx, my) {
        return my * 32 + (1 - mx % 2) * 16 + 16 - this.h / 2;
    }


    //Others

    positionToMp(p) {
        let mx = Math.floor((p.x + this.w / 2) / 32);
        let my;
        let success = false;

        if (mx >= 0 && mx < this.mw) {
            if (mx % 2) {//奇数のとき
                my = Math.floor((p.y + this.h / 2) / 32);
            } else {//偶数のとき
                my = Math.floor((p.y + this.h / 2 - 16) / 32);
            }

            if (my >= 0 && my < this.mh) {
                success = true;
            }
        }

        return [{ x: mx, y: my }, success];
    }

    getMap(mp) {
        return this.map[mp.x][mp.y];
    }

    setMap(mp, key, value) {
        this.map[mp.x][mp.y][key] = value;
    }

    static matchMp(mp1, mp2) {
        return (mp1.x == mp2.x) && (mp1.y == mp2.y);
    }

    moveSprite(sprite, x, y) {
        sprite.x = x;
        sprite.y = y;
    }
}