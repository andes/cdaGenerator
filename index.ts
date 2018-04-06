import {
    CdaBuilder
} from './lib/cda.service';
import * as moment from 'moment';
import * as sips from './lib/queries/sips';
import * as Verificator from './lib/verificador';

async function run() {
    // Paso 1: llamamos al Motor de base de datos que nos devuelve un array de prestaciones
    let data: any;
    let counter = 0;
    data = await sips.getData();
    if (data.recordset.length > 0) {
        data.recordset.forEach(async r => {
            // Paso 2: Verificamos que los datos estén completos por cada registro y si es válido se genera el Data Transfer Object para generar 
            let dto = Verificator.verificar(r);
            if (dto) {
                // Paso 3: Invocamos a la función que genera el CDA por cada documento
                // por ahora no lo hago hasta probar todo
                await generarCDA(dto);
            }
            counter = counter + 1;
            console.log('el counter: ', counter);
            if (counter >= data.recordset.length) {
                console.log('Proceso finalizado');
                process.exit();
            }
        });
        function generarCDA(dto) {
            return new Promise(async (resolve: any, reject: any) => {
                let cdaBuilder = new CdaBuilder();
                let resultado = await cdaBuilder.build(dto);
                console.log('el resultado es: ', resultado);
                resolve();
            })
        }
    }
}

run();