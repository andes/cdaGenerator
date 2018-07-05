import * as ConfigPrivate from './../config.private';
let sql = require('mssql');

export function getTargetQuery(target) {
    let query;
    let connectionString;
    let data;

    switch (target) {
        case 'hpn':
            {
                // Conexión a la base de datos
                connectionString = {
                    user: ConfigPrivate.staticConfiguration.hpn.user,
                    password: ConfigPrivate.staticConfiguration.hpn.password,
                    server: ConfigPrivate.staticConfiguration.hpn.ip,
                    database: ConfigPrivate.staticConfiguration.hpn.database,
                    requestTimeout: 20000
                },
                query = `select top(10) 
                -- Id
                ('T-' + CONVERT(varchar(max), Turnos_Agendas_de_Consultorios.Codigo)) as id,
                --
                -- Turnos_Especialidades.SNOMED
                ISNULL(Turnos_Especialidades.SNOMED, 391000013108) as prestacion,
                -- ID Efector HPN/Heller
                205 as idEfector, 
                -- Fecha prestacion
                Turnos_Agendas_de_Consultorios.Fecha as fecha,
                -- Paciente
                Historias_Clinicas.HC_Documento as pacienteDocumento, 
                Historias_Clinicas.HC_Nombre as pacienteNombre, 
                Historias_Clinicas.HC_Apellido as pacienteApellido,
                Historias_Clinicas.HC_Nacimiento_Fecha as pacienteFechaNacimiento,
                Historias_Clinicas.HC_Sexo as pacienteSexo,
                -- Profesional
                Personal_Agentes.Documento as profesionalDocumento, 
                Personal_Agentes.Nombre as profesionalNombre, 
                Personal_Agentes.Apellido as profesionalApellido, 
                NULL as profesionalMatricula,
                -- Código CIE sin texto. Ejemplo: J10.5
                (CASE diagnostico1_CIE10_subcausa 
                WHEN '(Sin subtipo)' THEN RTRIM(SUBSTRING(diagnostico1_CIE10_causa, 1, CHARINDEX(' ', diagnostico1_CIE10_causa))) 
                WHEN '((Diagnóstico ilegible))' THEN NULL
                WHEN '(Sin especificar)' THEN NULL
                WHEN '((Normal))' THEN NULL
                ELSE RTRIM(SUBSTRING(diagnostico1_CIE10_subcausa, 1, CHARINDEX(' ', diagnostico1_CIE10_subcausa)))
                END) as cie10,
                -- Texto (si existe)
                'Especialidad: ' + Turnos_Especialidades.Nombre COLLATE SQL_Latin1_General_CP1_CI_AI + '<br><br>' + ('Diagnóstico: ' + ISNULL(diagnostico1, 'Sin diagnóstico')) as texto
                -- Tablas
                FROM Turnos_Agendas_de_Consultorios  
                INNER JOIN Personal_Agentes ON Agente = Personal_Agentes.Numero  
                INNER JOIN Turnos_AgendasPP ON app = Turnos_AgendasPP.codigo
                INNER JOIN Turnos_Especialidades ON Turnos_AgendasPP.Especialidad = Turnos_Especialidades.codigo
                LEFT JOIN Turnos_RegistrosConsultorio ON Turnos_Agendas_de_Consultorios.Codigo = Turnos_RegistrosConsultorio.Agenda
                INNER JOIN Historias_Clinicas ON Paciente = HC_Numero AND HC_Tipo_de_documento <> 'SN'
                WHERE Turnos_Agendas_de_Consultorios.Estado = 1
                AND NOT EXISTS (SELECT * FROM AndesCDA WHERE idPrestacion = ('T-' + CONVERT(varchar(max), Turnos_Agendas_de_Consultorios.Codigo))) 
                AND NOT EXISTS (SELECT * FROM AndesCDARejected where idPrestacion = ('T-' + CONVERT(varchar(max), Turnos_Agendas_de_Consultorios.Codigo)))`;
                break;
            }
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
                query = `select top 100
                replace(CNS_TipoConsultorio.Descripcion,' ','') + '-' + rtrim(CNS_Recepcion.Id_recepcion) as id,
                convert(varchar(max),391000013108) as prestacion,
                     999 as idEfector,  
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
        default: // SIPS NIVEL CENTRAL: Todos los C.S.
            {
                let sipsInstance: any = ConfigPrivate.getSipsInstance(target);
                connectionString = {
                    user: sipsInstance.user,
                    password: sipsInstance.password,
                    server: sipsInstance.ip,
                    database: sipsInstance.database
                },
                query =
                `select top(10) 
                consulta.idConsulta as id, 
                convert(varchar(max),391000013108) as prestacion,
                efector.idEfector as idEfector, 
                consulta.fecha as fecha,
                pac.numeroDocumento as pacienteDocumento, pac.nombre as pacienteNombre, pac.apellido as pacienteApellido,
                pac.fechaNacimiento as pacienteFechaNacimiento, sex.nombre as pacienteSexo,
                prof.numeroDocumento as profesionalDocumento, prof.nombre as profesionalNombre, prof.apellido as profesionalApellido, prof.matricula as profesionalMatricula,
                cie.CODIGO as cie10, consulta.informeConsulta as texto
                from Sys_Paciente as pac
                inner join sys_sexo as sex on sex.idSexo = pac.idSexo
                inner join CON_Consulta as consulta on consulta.idPaciente = pac.idPaciente
                inner join CON_ConsultaDiagnostico as consultaD on consultaD.idConsulta = consulta.idConsulta
                inner join Sys_CIE10 as cie on consultaD.CODCIE10 = cie.ID
                inner join Sys_Profesional as prof on consulta.idProfesional = prof.idProfesional
                inner join Sys_Efector as efector on consulta.idEfector = efector.idEfector
                where NOT EXISTS (SELECT * FROM AndesCDA WHERE idPrestacion = consulta.idConsulta)
                AND NOT EXISTS (SELECT * FROM AndesCDARejected where idPrestacion = consulta.idConsulta)`;
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
        pool.request().query(query, function(err, recordSet) {
            if (err) {
                console.log('Error: ', err);
                reject(err);
            }
            console.log('Obtuvo resultado ok');
            resolve(recordSet);
        });
    })
}

// Inserta la información
export function insertData(cdaInfo, pool): any {
    return new Promise(async (resolve, reject) => {
        let insertQuery = ConfigPrivate.createInsertQuery(cdaInfo);
        await pool.request().query(insertQuery), (err, result) => {
            if (err) {
                console.log('insert error: ', err);
                reject(err);
            }
            console.log('inserto de primavera!!');
            resolve(result);
        };
    })
}

// Insert rejection
export function insertRejection(info, pool):any {
    return new Promise(async (resolve, reject) => {
        let insertQuery = ConfigPrivate.createInsertRejectQuery(info);
        await pool.request().query(insertQuery), (err, result) => {
            if (err) {
                console.log('insert reject error: ', err);
                reject(err);
            }
            console.log('Inserto en la tabla de rejectados debido a un error en los datos');
            resolve(result);
        }
    });
}