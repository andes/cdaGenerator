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
    sql.close();
    let counter = 0;
    let data =  Sistemas.getTargetQuery(target);
    let pool = await sql.connect(data.connectionString);
    console.log('antes del getData: ');
    let resultado = await sistemas.getData(data.query, pool);
    console.log('despues del getData');
    console.log('cantidad de registros: ', resultado.recordset.length);
    if (resultado.recordset.length > 0) {
        resultado.recordset.forEach(async r => {
            // Paso 2: Verificamos que los datos estén completos por cada registro y si es válido se genera el Data Transfer Object para generar 
            let dto = Verificator.verificar(r);
            if (dto && !dto.msgError) {
                // Paso 3: Invocamos a la función que genera el CDA por cada documento
                // por ahora no lo hago hasta probar todo
                await generarCDA(dto);
                
            } else {
                console.log('Motivo de error desde la verificación: ', dto.msgError);
                // TODO Debería insertarlo en una colección de rejected
            }
            
            function generarCDA(dto) {
                return new Promise(async (resolve: any, reject: any) => {
                    let cdaBuilder = new CdaBuilder();
                    let res = await cdaBuilder.build(dto);
                    // Guardamos en una tabla cdaMigration: id, idPrestacion, cda, fecha
                    res = JSON.parse(res);
                    if (res.cda) {
                        console.log('Genere el cda de: ', res.idPrestacion);
                        let insert = sistemas.insertData(res, pool);
                    } else {
                        console.log('No se genero el cda de: ', dto.id);
                        console.log('Motivo del error desde la API: ', res);
                        // TODO Debería insertarlo en una colección de rejected
                    }

                    console.log('finaliza de generar el cda e insertar en la bd y continua con el siguiente');
                    resolve();
                })
            }
            counter = counter + 1;
            console.log('cantidad hasta el momento: ', counter);
            if (counter >= resultado.recordset.length) {
                console.log('Proceso finalizado... y sigue escuchando');
               // pool.close();
            } else {
                console.log('Continúa el procesamiento de información....');
            }
        });
    } else {
        // pool.close();
        console.log('No me trajo registros....');
    }
}