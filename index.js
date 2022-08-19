window.addEventListener('load', () => {

    new main();

})

class main {

    constructor() {

        this.charaNames = ['Reimu', 'Marisa', 'Rumia', 'Cirno', 'Meirin', 'Patchouli', 'Sakuya', 'Remilia', 'Flandre'];
        this.backImgNames = ['Washitsu'];
        this.iconNames = ['P', 'Iconten'];
        this.textNames = ['_1','_2','_3', 'Start', 'Restart'];
        this.imgNames = this.charaNames.concat(this.backImgNames, this.iconNames);//, this.textNames);
        console.log(this.imgNames);

        this.app = new ExApp($('#app'), this.imgNames, {
            width: 256,
            height: 352,
            backgroundColor: 0x1099bb,
        });

        this.app.loader.load(() => { this.game() });
        this.useCharaNames = ['Reimu', 'Marisa', 'Meirin', 'Cirno']

    }

    game() {

        let w = 7;
        let h = 6;
        let table = new Table(this.app, w, h, this.useCharaNames);

        /*
        setInterval((table) => {
            table.cont.rotation += 0.1;
        },100,table);
        */

    }

}
