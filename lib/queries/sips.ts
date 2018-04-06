import { ConfigPrivate } from './../config.private';
let sql = require('mssql');

const connectionString = {
    user:  ConfigPrivate.hospital.user,
    password: ConfigPrivate.hospital.password,
    server: ConfigPrivate.hospital.ip,
    database: ConfigPrivate.hospital.database
}

const query = 
'select top(1000) consulta.idConsulta as id, tp.nombre as prestacion, consulta.fecha as fecha,'+
'pac.numeroDocumento as pacienteDocumento, pac.nombre as pacienteNombre, pac.apellido as pacienteApellido, '+
'pac.fechaNacimiento as pacienteFechaNacimiento, sex.nombre as pacienteSexo,'+
'prof.numeroDocumento as profesionalDocumento, prof.nombre as profesionalNombre, prof.apellido as profesionalApellido, prof.matricula as profesionalMatricula,'+
'cie.CODIGO as cie10, consulta.informeConsulta as texto '+
'from Sys_Paciente as pac '+
'inner join sys_sexo as sex on sex.idSexo = pac.idSexo '+
'inner join CON_Consulta as consulta on consulta.idPaciente = pac.idPaciente '+
'inner join CON_ConsultaDiagnostico as consultaD on consultaD.idConsulta = consulta.idConsulta '+
'inner join CON_TipoPrestacion as tp on tp.idTipoPrestacion = consulta.idTipoPrestacion '+
'inner join CIE10 as cie on consultaD.CODCIE10 = cie.ID ' +
'inner join Sys_Profesional as prof on consulta.idProfesional = prof.idProfesional '+
'inner join sys_efector as efector on efector.idEfector = 221 '  // HELLER
// 'where tp.nombre <> \x27 Ninguna \x27 ';


export function getData(): any{
    return new Promise((resolve, reject) => {
    sql.connect(connectionString, async function(err) {
        if (err) {
            reject(null);
            console.log('palooo: ', err);
        }
        let result = await new sql.Request().query(query);
        if (result) {
            resolve(result);
        }
    })
});
}