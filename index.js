window.addEventListener('load', () => {

    new main();

})

class main {

    constructor() {

        this.charaNames = ['Reimu', 'Marisa', 'Rumia', 'Cirno', 'Meirin', 'Patchouli', 'Sakuya', 'Remilia', 'Flandre'];
        this.backImgNames = ['Washitsu'];
        this.iconNames = ['P', 'Iconten'];
        this.textNames = ['Number1', 'Number2', 'Number3', 'Start', 'Restart', 'Result', 'Twitter', 'Tweet', 'Logo', 'Spellcard'];
        this.imgNames = this.charaNames.concat(this.backImgNames, this.iconNames, this.textNames);

        this.charaScoreRatios = {
            Reimu: 5,
            Marisa: 5,
            Rumia: 5,
            Cirno: 5,
            Meirin: 5,
            Patchouli: 5,
            Sakuya: 5,
            Remilia: 5,
            Flandre: 5
        }

        this.app = new ExApp($('#app'), this.imgNames, {
            width: 256,
            height: 352,
            backgroundColor: 0x1099bb,
        });

        this.app.loader.load(() => { this.set() });
    }

    set() {
        //背景
        this.backImg = new ExSprite(this.app, 'Washitsu');
        this.app.tableCont.addChild(this.backImg);

        this.title();
    }

    title() {
        this.titleCont = new PIXI.Container();
        this.app.tableCont.addChild(this.titleCont);

        this.title = new ExSprite(this.app, 'Logo');
        this.title.y = -48;

        this.titleStart = new ExSprite(this.app, 'Start');
        this.titleStart.y = 96;
        this.titleStart.interactive = true;
        this.titleStart.on('pointerdown', (e) => {
            this.app.tableCont.removeChild(this.titleCont);
            this.select();
        });

        this.titleCont.addChild(this.title);
        this.titleCont.addChild(this.titleStart);
    }

    select() {
        this.selectCont = new PIXI.Container();
        this.app.tableCont.addChild(this.selectCont);

        this.chara = {
            sprite: Array(this.charaNames.length),
            select: Array(this.charaNames.length),
            n: 4
        }

        let w = 3;
        for (let y = 0; y < this.charaNames.length / w; ++y) {
            for (let x = 0; x < w; ++x) {
                let n = x + y * w;
                if(n == this.charaNames.length) { break }
                
                this.chara.sprite[n] = new ExSprite(this.app, this.charaNames[n])
                this.chara.sprite[n].x = x * 64 - (w - 1) * 32;
                this.chara.sprite[n].y = y * 64 - 64;
                this.chara.sprite[n].interactive = true;
                this.chara.sprite[n].on('pointerdown',(e) => {
                    this.chara.select[n] = !this.chara.select[n];
                    if(this.chara.select[n]) {
                        this.chara.sprite[n].tint = 0xffcccc;
                        this.chara.n += 1;
                    } else {
                        this.chara.sprite[n].tint = 0xffffff;
                        this.chara.n -= 1;
                    }
                });

                if (n < 4) {
                    this.chara.select[n] = true;
                    this.chara.sprite[n].tint = 0xffcccc;
                } else {
                    this.chara.select[n] = false;
                }

                this.selectCont.addChild(this.chara.sprite[n]);
            }
        }

        this.selectStart = new ExSprite(this.app, 'Start');
        this.selectStart.y = 128;
        this.selectStart.interactive = true;
        this.selectStart.on('pointerdown',() => {
            if (this.chara.n == 4) {
                this.app.tableCont.removeChild(this.selectCont);
                console.log('a');
                this.useCharaNs = [];
                for (let n = 0; n < this.charaNames.length; ++n){
                    if (this.chara.select[n]) {
                        this.useCharaNs.push(n);
                    }
                }
                this.game();
            }
        });
        this.selectCont.addChild(this.selectStart);
    }

    game() {
        let w = 7;
        let h = 6;
        let table = new Table(this.app, w, h, this.charaNames, this.useCharaNs, this.charaScoreRatios);
    }
}
