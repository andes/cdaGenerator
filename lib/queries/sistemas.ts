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
                    database: ConfigPrivate.staticConfiguration.heller.database,
                    options: {
                        tdsVersion: '7_1'
                    }
                }
                query =  `select top 10
                rtrim(CNS_TipoConsultorio.Descripcion) + '-' + rtrim(CNS_Recepcion.Id_recepcion) as id,
                  451000013109 AS prestacion,
                     221 as idEfector,  
                 CNS_Recepcion.Fecha as fecha,
              
                   CNS_Recepcion.DNI AS pacienteDocumento, 
                      Pacientes.NOMBRES AS pacienteNombre,
                 Pacientes.APELLIDOS AS pacienteApellido,
              
                 Pacientes.[Fecha de Nacimiento] AS pacienteFechaNacimiento,
                 Pacientes.Sexo AS pacienteSexo,
                       Profesionales.DNI as profesionalDocumento,
                         CASE  
                     WHEN CHARINDEX(' ', Profesionales.[Apellido y nombre]) >=1 THEN SUBSTRING(Profesionales.[Apellido y nombre],CHARINDEX(' ', Profesionales.[Apellido y nombre])+1,30 )
                     ELSE NULL
                     END as profesionalNombre,
                   CASE 
                     WHEN CHARINDEX(' ', Profesionales.[Apellido y nombre]) >=1 THEN LEFT(Profesionales.[Apellido y nombre],CHARINDEX(' ', Profesionales.[Apellido y nombre])-1 )
                     ELSE Profesionales.[Apellido y nombre]
                     END  as profesionalApellido, 
              
              
                  Profesionales.MP as profesionalMatricula,
                 CIE.cod_sss as cie10,
                   CONVERT(text, CNS_Informes.Informe) AS texto
                   FROM CNS_Recepcion 
                 inner join  Pacientes on CNS_Recepcion.DNI = Pacientes.[Número de Documento]
                 inner JOIN CNS_Consultorios ON CNS_Recepcion.Id_Consultorio= CNS_Consultorios.Id_Consultorio
                   INNER JOIN CNS_TipoConsultorio ON CNS_Consultorios.Id_TipoCNS = CNS_TipoConsultorio.Id_TipoCNS
                   inner JOIN Profesionales ON CNS_Recepcion.CodigoProf = Profesionales.Código
                   inner JOIN  CNS_Informes on CNS_Recepcion.Id_Informe= CNS_Informes.Id_Informe		
                 inner JOIN CNS_Informes_MDC ON CNS_Recepcion.Id_Informe = CNS_Informes_MDC.Id_Informe 
                   inner JOIN CIE ON CNS_Informes_MDC.CodigoCIE10 = CIE.Id 
                 where Pacientes.[Número de Documento]!=99 and
                      (Pacientes.[Número de Documento]<88000000 or Pacientes.[Número de Documento]>89000000)
                      and Atendido =1
                      and CodigoProf not in (1019159,1019158,1019157,1019054)/*se excluye cns enfermeria*/
                      and CNS_Recepcion.Id_Consultorio not in (76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,98,99) -- no odontologias
                      and CNS_Informes_MDC.Ppal=1 
                      and CNS_Informes_MDC.CodigoCIE10 <>''
              ORDER BY CNS_Recepcion.Fecha `;
                break;
            }
        default: // SIPS NIVEL CENTRAL
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
                ' where cda.idPrestacion is null';
                break;
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
            resolve(result);
        }
    })
}