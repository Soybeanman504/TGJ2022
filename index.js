window.addEventListener('load', () => {

    new main();

})

class main {

    constructor() {

        this.charaNames = ['Reimu', 'Marisa', 'Rumia', 'Cirno', 'Meirin', 'Patchouli', 'Sakuya', 'Remilia', 'Flandre'];
        this.imgNames = this.charaNames;
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
