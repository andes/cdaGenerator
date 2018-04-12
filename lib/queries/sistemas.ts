import * as ConfigPrivate from './../config.private';
let sql = require('mssql');

export function getTargetQuery(target) {
    let query;
    let connectionString;
    let data;

    switch (target) {
        case 'heller':
            {
                // Conexión a la base de datos
                connectionString = {
                    user: ConfigPrivate.staticConfiguration.heller.user,
                    password: ConfigPrivate.staticConfiguration.heller.password,
                    server: ConfigPrivate.staticConfiguration.heller.ip,
                    database: ConfigPrivate.staticConfiguration.heller.database
                }
                query = 'TO DO chicos HELLER';
                break;
            }
        default:
            {
                // Buscamos que instancia de SIPS vamos a traer
                let sipsInstance: any = ConfigPrivate.getSipsInstance(target);
                connectionString = {
                    user: sipsInstance.user,
                    password: sipsInstance.password,
                    server: sipsInstance.ip,
                    database: sipsInstance.database
                },
                query =
                'select top(100) consulta.idConsulta as id, tp.nombre as prestacion,efector.idEfector as idEfector, consulta.fecha as fecha,' +
                'pac.numeroDocumento as pacienteDocumento, pac.nombre as pacienteNombre, pac.apellido as pacienteApellido, ' +
                'pac.fechaNacimiento as pacienteFechaNacimiento, sex.nombre as pacienteSexo,' +
                'prof.numeroDocumento as profesionalDocumento, prof.nombre as profesionalNombre, prof.apellido as profesionalApellido, prof.matricula as profesionalMatricula,' +
                'cie.CODIGO as cie10, consulta.informeConsulta as texto ' +
                'from Sys_Paciente as pac ' +
                'inner join sys_sexo as sex on sex.idSexo = pac.idSexo ' +
                'inner join CON_Consulta as consulta on consulta.idPaciente = pac.idPaciente ' +
                'inner join CON_ConsultaDiagnostico as consultaD on consultaD.idConsulta = consulta.idConsulta ' +
                'inner join CON_TipoPrestacion as tp on tp.idTipoPrestacion = consulta.idTipoPrestacion ' +
                'inner join Sys_CIE10 as cie on consultaD.CODCIE10 = cie.ID ' +
                'inner join Sys_Profesional as prof on consulta.idProfesional = prof.idProfesional ' +
                'left join andesCDA as cda on consulta.idConsulta = cda.idPrestacion ' +
                'inner join sys_efector as efector on efector.idEfector = ' + target +
                ' where cda.idPrestacion is null'
            }
    }
    return data = {
        connectionString: connectionString,
        query: query
    };

}


// Consulta generica
export function getData(query, pool): any {
    return new Promise(async (resolve, reject) => {
        console.log('antes del palo');
        let result = await pool.request().query(query);
        if (result) {
            resolve(result);
        }
    });
}

// Inserta la información
export function insertData(cdaInfo, pool): any {
    return new Promise(async (resolve, reject) => {
        let insertQuery = ConfigPrivate.createInsertQuery(cdaInfo);
        let result = await pool.request().query(insertQuery);
        if (result) {
            console.log('Se inserta registro: ', result);
            resolve(result);
        }
    })
}