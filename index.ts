import {
    CdaBuilder
} from './lib/cda.service';
import * as moment from 'moment';
import * as sistemas from './lib/queries/sistemas';
import * as Verificator from './lib/verificador';

async function run(target) {
    // Paso 1: llamamos al Motor de base de datos que nos devuelve un array de prestaciones
    let data: any;
    let counter = 0;
    data = await sistemas.getData(target);
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
            if (counter >= data.recordset.length) {
                console.log('Proceso finalizado');
                process.exit();
            }
        });
        function generarCDA(dto) {
            return new Promise(async (resolve: any, reject: any) => {
                let cdaBuilder = new CdaBuilder();
                let resultado = await cdaBuilder.build(dto);
                // Guardamos en una tabla cdaMigration: id, idPrestacion, cda, fecha
                resultado = JSON.parse(resultado);
                if (resultado.cda) {
                    let insert = await sistemas.insertData(target, resultado);
                }
                resolve();
            })
        }
    }
}


// target sería algún sistema que se quiere procesar por ID

let target = '221'; // En este caso corresponde a Htal Centenario/TEST
run(target);