import {
    CdaBuilder
} from './lib/cda.service';
import * as moment from 'moment';
import * as sistemas from './lib/queries/sistemas';
import * as Verificator from './lib/verificador';
import * as Sistemas from './lib/queries/sistemas';

const sql = require('mssql')

export async function ejecutar(target) {
    // Paso 1: llamamos al Motor de base de datos que nos devuelve un array de prestaciones
    // let data: any;
    let counter = 0;
    let data =  Sistemas.getTargetQuery(target);
    console.log('antes de conectarse a la BD');
    let pool = await sql.connect(data.connectionString)
    console.log('Dps de conectarseeee');
    let resultado = await sistemas.getData(data.query, pool);
    console.log('luego del getData');
    if (resultado.recordset.length > 0) {
        console.log('entor porque encontro datos');
        resultado.recordset.forEach(async r => {
            // Paso 2: Verificamos que los datos estén completos por cada registro y si es válido se genera el Data Transfer Object para generar 
            let dto = Verificator.verificar(r);
            console.log('luego de la verificacion')
            if (dto) {
                // Paso 3: Invocamos a la función que genera el CDA por cada documento
                // por ahora no lo hago hasta probar todo
                console.log('antes de generar el cda: ', dto);
                await generarCDA(dto);
            }
            
            function generarCDA(dto) {
                return new Promise(async (resolve: any, reject: any) => {
                    console.log('entro a generar CDA');
                    let cdaBuilder = new CdaBuilder();
                    let res = await cdaBuilder.build(dto);
                    console.log('upaa... antes de insertar');
                    // Guardamos en una tabla cdaMigration: id, idPrestacion, cda, fecha
                    res = JSON.parse(res);
                    if (res.cda) {
                        console.log('antes del insert....');
                        let insert = await sistemas.insertData(res, pool);
                        console.log('luego de insertarrrrrrrr');
                        resolve();
                    } else {
                        resolve();
                    }
                })
            }

            counter = counter + 1;
            if (counter >= resultado.recordset.length) {
                sql.close();
                console.log('Proceso finalizado... y sigue escuchando');
            }
        });
    }
}


// target sería algún sistema que se quiere procesar por ID

// let target = '221'; // En este caso corresponde a Htal Centenario/TEST
// run(target);