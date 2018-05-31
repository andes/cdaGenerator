import * as inicio from '../../index';
import * as configPrivate from '../config.private';

function run() {
    console.log('Inicia el proceso...');
    let cs = configPrivate.efectores;
    let target = process.argv[2]; 
    if (cs.indexOf(target,0) >= 0) {
        inicio.ejecutar(target)
    } else {
        console.log('Para ejecutar este proceso correctamente, deberá pasar como argumento algo de los siguientes: ', cs);
        console.log('Ejemplo: node lib/scheduler.js heller');
    }
}
export = run;
