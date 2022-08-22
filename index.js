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
            Reimu: 6,
            Marisa: 4,
            Rumia: 8,
            Cirno: 9,
            Meirin: 5,
            Patchouli: 3,
            Sakuya: 10,
            Remilia: 2,
            Flandre: 0
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
        this.titleStart.on('pointertap', (e) => {
            this.app.tableCont.removeChild(this.titleCont);
            this.select();
        });

        this.titleCont.addChild(this.title);
        this.titleCont.addChild(this.titleStart);
    }

    select() {
        this.music = new Audio('./music/13_oharaibou_140.ogg');
        this.music.loop = true;
        this.music.play();
        
        this.selectCont = new PIXI.Container();
        this.app.tableCont.addChild(this.selectCont);

        this.chara = Array(this.charaNames.length);
        this.charaN = 4;

        this.charaNText = new PIXI.Text('キャラ数' + this.charaN + '/4', {
            fontSize: 24,
            fill: 0xffffff,
            stroke: 0x777777,
            strokeThickness: 2
        });
        this.charaNText.y = -136;
        this.charaNText.anchor.x = 0.5;
        this.selectCont.addChild(this.charaNText);

        let w = 3;
        for (let y = 0; y < this.charaNames.length / w; ++y) {
            for (let x = 0; x < w; ++x) {
                let n = x + y * w;
                if (n == this.charaNames.length) { break }

                this.chara[n] = {};
                this.chara[n].sprite = new ExSprite(this.app, this.charaNames[n]);
                this.chara[n].sprite.x = x * 64 - (w - 1) * 32;
                this.chara[n].sprite.y = y * 64 - 64;
                this.chara[n].sprite.interactive = true;
                this.chara[n].sprite.on('pointertap', (e) => {
                    this.chara[n].select = !this.chara[n].select;
                    if (this.chara[n].select) {
                        this.chara[n].sprite.tint = 0xffcccc;
                        this.charaN += 1;
                    } else {
                        this.chara[n].sprite.tint = 0xffffff;
                        this.charaN -= 1;
                    }
                    this.charaNText.text = 'キャラ数' + this.charaN + '/4';
                });

                if (n < 4) {
                    this.chara[n].select = true;
                    this.chara[n].sprite.tint = 0xffcccc;
                } else {
                    this.chara[n].select = false;
                }

                let text = '点:P=' + this.charaScoreRatios[this.charaNames[n]] + ':' + (10 - this.charaScoreRatios[this.charaNames[n]]);
                this.chara[n].ratioText = new PIXI.Text(text, {
                    fontSize: 14,
                    fill: 0xffffff,
                    stroke: 0x000000,
                    strokeThickness: 2
                });

                this.chara[n].ratioText.anchor.x = 0.5;
                this.chara[n].ratioText.x = x * 64 - (w - 1) * 32;
                this.chara[n].ratioText.y = y * 64 - 48;

                this.selectCont.addChild(this.chara[n].sprite);
                this.selectCont.addChild(this.chara[n].ratioText);
            }
        }

        this.selectStart = new ExSprite(this.app, 'Start');
        this.selectStart.y = 128;

        this.selectStart.interactive = true;
        this.selectStart.on('pointertap', () => {
            if (this.charaN == 4) {
                this.app.tableCont.removeChild(this.selectCont);
                this.useCharaNs = [];
                for (let n = 0; n < this.charaNames.length; ++n) {
                    if (this.chara[n].select) {
                        this.useCharaNs.push(n);
                    }
                }
                this.music.pause();
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
