window.addEventListener('load', () => {

    app = new ExApp($('#app'), ['Reimu', 'Marisa'], {
        width: 320,
        height: 320,
        backgroundColor: 0x1099bb,
    }); // global

    app.loader.load(main);

})

function main() {

    let charaNames = ['Reimu', 'Marisa'];
    let w = 7;
    let h = 5;
    let table = new Table(app, w, h, charaNames);
    
    /*
    setInterval((table) => {
        table.cont.rotation += 0.1;
    },100,table);
    */

}