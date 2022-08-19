class Table {
    //キャラが消失するバグがあるが続行できるので無視。

    constructor(app, mw, mh, charaNames, useCharaNames, charaScoreRatios) {
        this.app = app;
        this.mw = mw;
        this.mh = mh;
        this.w = mw * 32;
        this.h = mh * 32 + 16;
        this.charaNames = charaNames;
        this.useCharaNames = useCharaNames;
        this.pointer = false;

        //Const
        this.firstMv = -4;
        this.margin = 20;
        this.scoreCoef = 10;
        this.reiryokuCoef = 1 / 100;
        this.comboTime = 2 * this.app.ticker.FPS;//コンボが持続するframe数

        this.chain = [];//ゆっくりの連なり。座標を順に格納。
        this.frame = 0;

        this.charaScoreRatios = charaScoreRatios;
        Object.keys(this.charaScoreRatios).forEach((charaName) => {
            this.charaScoreRatios[charaName] /= 10;
        });

        this.score = 0;//点数
        this.reiryoku = 0;//霊力(-にもなる)
        this.point = 0;//まとめたやつ
        //comboSocre = n1 * 1 + n2 * 2 + ...
        this.resetCombo();//消した種類の比,個数の加重和と総数など

        //このクラスのものは全てここへ
        this.tableCont = new PIXI.Container();

        this.tableCont.x = this.app.screen.width / 2;
        this.tableCont.y = this.app.screen.height / 2;

        this.app.stage.addChild(this.tableCont);

        //背景
        this.backImg = new ExSprite(this.app, 'Washitsu');
        this.tableCont.addChild(this.backImg);

        //アイコン        
        this.iconTen = new ExSprite(this.app, 'Iconten');

        this.iconTen.x = 16;
        this.iconTen.y = -this.app.screen.height / 2 + 16;

        this.tableCont.addChild(this.iconTen);

        this.iconP = new ExSprite(this.app, 'P');

        this.iconP.x = 16;
        this.iconP.y = -this.app.screen.height / 2 + 48;

        this.tableCont.addChild(this.iconP);

        //盤面
        this.mapCont = new PIXI.Container();

        //クリッピング
        this.mapCont.mask = new PIXI.Graphics()
            .beginFill(0xffffff)
            .drawRect(this.tableCont.x - this.w / 2, this.tableCont.y - this.h / 2, this.w, this.h)
            .endFill();

        this.mapCont.interactive = true;
        this.mapCont.hitArea = new PIXI.Rectangle(-this.w / 2 - this.margin, -this.h / 2 - this.margin, this.w + this.margin * 2, this.h + this.margin * 2);

        this.mapCont.on('pointermove', (e) => { this.pointerMoveEvent(e) });
        this.mapCont.on('pointerdown', (e) => { this.pointerDownEvent(e) });
        this.mapCont.on('pointerup', (e) => { this.pointerUpEvent(e) });
        this.mapCont.on('pointerout', (e) => { this.pointerUpEvent(e) });

        this.tableCont.addChild(this.mapCont);

        //Chara関連

        this.fallingCharas = Array(this.mw);
        this.fallingCharasN = Array(this.mw);
        this.map = new Array(this.mw);

        for (let mx = 0; mx < this.mw; ++mx) {
            this.fallingCharas[mx] = new Array(this.mh + 1);
            this.fallingCharasN[mx] = 0;
            this.map[mx] = new Array(this.mh);

            for (let my = 0; my < this.mh; ++my) {
                this.fallingCharas[mx][my] = -1;
                this.setChara(mx, my, randInt(this.useCharaNames.length));
            }

            this.fallingCharas[mx][this.mh] = -1;
        }

        this.app.ticker.add((delta) => { this.mainLoop(delta) });

    }

    //mainLoop

    mainLoop(delta) {
        this.frame += delta;
        this.fallCharas();
        //console.log(this.frame, this.app.ticker.speed);
    }

    //fallingCharas送り出し

    fallCharas() {
        for (let mx = 0; mx < this.mw; ++mx) {
            if (this.map[mx][0].value == -1) {
                console.log(mx, this.fallingCharas[mx]);
                this.setChara(mx, 0, this.fallingCharas[mx][0]);
                this.map[mx][0].fall = true;
                this.map[mx][0].sprite.y -= 32;

                for (let my = 0; my < this.mh; ++my) {
                    this.fallingCharas[mx][my] = this.fallingCharas[mx][my + 1];
                }

                this.fallingCharasN[mx] -= 1;
            }

            for (let orgMy = this.mh - 1; orgMy > -1; --orgMy) {
                let my = orgMy;

                if (this.map[mx][my].fall) {
                    if (this.map[mx][my].mv < 32) {
                        this.map[mx][my].mv += 1;
                    }
                    let newY = this.map[mx][my].sprite.y + this.map[mx][my].mv;

                    if (newY > this.myToY(mx, my)) {
                        let collision = false;

                        if (newY > this.myToY(mx, my) + 16) {
                            if (this.map[mx][my + 1].value == -1) {
                                this.map[mx][my + 1].value = this.map[mx][my].value;
                                this.map[mx][my + 1].select = this.map[mx][my].select;
                                this.map[mx][my + 1].fall = true;
                                this.map[mx][my + 1].mv = this.map[mx][my].mv;
                                this.map[mx][my + 1].sprite = Object.create(this.map[mx][my].sprite);

                                this.mapCont.removeChild(this.map[mx][my].sprite);
                                this.mapCont.addChild(this.map[mx][my + 1].sprite);

                                this.deleteMap({ x: mx, y: my });

                                my += 1;

                                if (this.map[mx][my].select) {
                                    this.selectChara({ x: mx, y: my });
                                }
                            } else {
                                collision = true;
                            }
                        }

                        if (my == this.mh - 1 ||
                            collision ||
                            (!this.map[mx][my + 1].fall && this.map[mx][my + 1].value != -1)) {

                            this.map[mx][my].sprite.y = this.myToY(mx, my);
                            this.map[mx][my].fall = false;
                            this.map[mx][my].mv = 0;
                        }
                    }

                    if (this.map[mx][my].fall) {
                        this.map[mx][my].sprite.y = newY;
                    }
                }
            }
        }
    }

    //comboを反映
    reflectCombo() {
        let scoreRatio = this.combo.ratio.sum / this.combo.ratio.n;

        this.combo.score = this.combo.point * scoreRatio * this.scoreCoef;
        this.combo.reiryoku = this.combo.point * (1 - scoreRatio) * this.reiryokuCoef;

        if (this.frame - this.combo.frame > this.comboTime) {
            this.score = this.getAllScore();
            this.reiryoku = this.getAllReiryoku();

            this.resetCombo();
        };
    }

    //Events

    pointerMoveEvent(e) {
        if (this.pointer) {
            let p = e.data.getLocalPosition(e.currentTarget);
            let pointerMp, success;

            [pointerMp, success] = this.positionToMp(p);

            if (success) {
                this.mapEvent(pointerMp);
            }
        }
    }

    mapEvent(pointerMp) {
        if (this.chain.length > 0) {
            let currentMp = this.chain[this.chain.length - 1];

            if (!Table.matchMp(pointerMp, currentMp) &&
                this.getMap(pointerMp).value == this.getMap(currentMp).value) {

                if (Math.abs(pointerMp.x - currentMp.x) < 2 &&
                    Math.abs(pointerMp.y - currentMp.y) < 2) {

                    if ((pointerMp.y - currentMp.y) != ((currentMp.x % 2) * 2 - 1) ||
                        pointerMp.x == currentMp.x) {

                        if (this.getMap(pointerMp).select) {
                            if (this.chain.length > 1 &&
                                Table.matchMp(pointerMp, this.chain[this.chain.length - 2])) {

                                this.liftChara(currentMp);
                                this.chain.pop();
                            }
                        } else {
                            this.selectChara(pointerMp);
                            this.chain.push(pointerMp);
                        }
                    }
                }
            }
        } else {
            this.selectChara(pointerMp);
            this.chain.push(pointerMp);
        }
    }

    pointerDownEvent(e) {
        this.pointer = true;

        this.pointerMoveEvent(e);
    }

    pointerUpEvent(e) {
        this.pointer = false;

        if (this.chain.length > 1) {
            this.deleteCharas(this.chain);
            this.chain = [];
        } else if (this.chain.length > 0) {
            this.liftChara(this.chain[0]);
            this.chain = [];
        }
    }

    //Charas

    deleteCharas(mps) {
        let fallMxs = [];

        this.combo.n += 1;
        this.combo.point += mps.length * this.combo.n;

        mps.forEach((mp) => {
            this.combo.ratio.sum += [this.getMap(mp).value];
            this.combo.ratio.n += 1;
            this.deleteChara(mp);
            this.addFallChara(mp.x, randInt(this.useCharaNames.length));

            if (fallMxs.indexOf(mp.x) == -1) {
                fallMxs.push(mp.x);
            }
        });

        fallMxs.forEach((mx) => {
            let depth = 0;

            for (let my = this.mh - 1; my > -1; --my) {
                if (this.map[mx][my].value == -1) {
                    depth += 1;
                } else {
                    if (depth > 0) {
                        this.setFallChara(mx, my);
                    }
                }
            }
        });
    }

    addFallChara(mx, value) {
        this.fallingCharas[mx][this.fallingCharasN[mx]++] = value;
    }

    deleteChara(mp) {
        console.log(this.map[mp.x][mp.y].sprite);
        this.mapCont.removeChild(this.map[mp.x][mp.y].sprite);
        this.deleteMap(mp);
    }

    deleteMap(mp) {
        this.setMap(mp, 'value', -1);
        this.liftChara(mp);
        this.setMap(mp, 'fall', false);
        this.setMap(mp, 'mv', this.firstMv);
        this.setMap(mp, 'sprite', null);
    }

    selectChara(mp) {
        this.setMap(mp, 'select', true);
        if (this.map[mp.x][mp.y].sprite) {
            this.map[mp.x][mp.y].sprite.tint = 0xffcccc;
        }
    }

    liftChara(mp) {
        this.setMap(mp, 'select', false);
        if (this.map[mp.x][mp.y].sprite) {
            this.map[mp.x][mp.y].sprite.tint = 0xffffff;
        }
    }

    setFallChara(mx, my) {
        this.map[mx][my].fall = true;
    }

    setChara(mx, my, value) {
        this.map[mx][my] = {};
        this.deleteMap({ x: mx, y: my });
        this.map[mx][my].value = value;
        this.map[mx][my].sprite = new ExSprite(this.app, this.useCharaNames[this.map[mx][my].value]);

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

    getAllScore() {
        return this.score + this.combo.score;
    }

    getAllReiryoku() {
        return this.reiryoku + this.combo.reiryoku;
    }

    static matchMp(mp1, mp2) {
        return (mp1.x == mp2.x) && (mp1.y == mp2.y);
    }

    moveSprite(sprite, x, y) {
        sprite.x = x;
        sprite.y = y;
    }

    resetCombo() {
        this.combo = { n: 0, ratio: { sum: 0, n: 0 }, score: 0, reiryoku: 0, point: 0, frame: 0 };//消した種類の比,個数の加重和と総数
    }
}