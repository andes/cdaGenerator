let moment = require('moment');


function vPaciente(registro) {

    let paciente = {
        documento: registro.pacienteDocumento ? registro.pacienteDocumento.toString() : null,
        nombre: registro.pacienteNombre ? registro.pacienteNombre : null,
        apellido: registro.pacienteApellido ? registro.pacienteApellido : null,
        sexo: registro.pacienteSexo ? registro.pacienteSexo : null,
        fechaNacimiento: registro.pacienteFechaNacimiento ? registro.pacienteFechaNacimiento : null
    }
    if (paciente.nombre && paciente.apellido && paciente.sexo && paciente.fechaNacimiento && paciente.documento) {
        // TODO
        // Chequear que la fecha de nacimiento no sea raro como 1900, etc
        // Ver si es necesario realizar alguna transformación de sexo
        paciente.sexo = (paciente.sexo === 'Femenino') ? 'femenino' : 'masculino';
        return paciente
    } else {
        return null
    }
}

function vProfesional(registro) {
    let profesional = {
        documento : registro.profesionalDocumento ? registro.profesionalDocumento.toString() : null,
        nombre : registro.profesionalNombre ? registro.profesionalNombre : null,
        apellido : registro.profesionalApellido ? registro.profesionalApellido : null,
    }
    if (profesional.nombre && profesional.apellido && profesional.documento) {
        // TODO: Ver si hace falta transformar el sexo
        return profesional
    } else {
        return null
    }
}

function vPrestacion(prestacionNombre) {
// TODO Verificar que sea un código snomed o sino que lo busque en la colección de configuracionPrestaciones
    let prestacion = null;
    if (prestacionNombre) {
      prestacion = prestacionNombre;          
    }
    return prestacion;
}

function vCie10(cie10) {
    // TODO verificar el código cie10 en configuraciónPrestaciones
    let c = null;
    if (cie10) {
        return cie10;
    } else {
        return c
    }
}

export function verificar(registro): any {
    let dto = {
        paciente: null,
        profesional: null,
        prestacion: null,
        fecha: null,
        id: null,
        cie10: null,
        texto: null
    }
    let notError = true;
    let msgError = '';
    let paciente;
    let pacienteVerified:any = vPaciente(registro);
    if (pacienteVerified) {
        dto['paciente'] = pacienteVerified;
    } else {
        notError = false;
        msgError = 'El paciente no ha sido verificado correctamente';
    }
    let profesionalVerified = vProfesional(registro);
    if (profesionalVerified && notError) {
        dto['profesional'] = profesionalVerified;
    } else {
        notError = false;
        msgError = 'El profesional no ha sido verificado correctamente';
    }

    let prestacionVerified = vPrestacion(registro.prestacion);
    if (prestacionVerified && notError) {
        dto['prestacionSnomed'] = prestacionVerified;
    } else {
        notError = false;
        msgError = 'La prestación no existe';
    }
    notError = registro.fecha ? true : false;
    notError = registro.id ? true : false;

    if (notError) {
        dto['fecha'] = moment(registro.fecha).toDate();
        dto['id'] = registro.id;
    } else {
        msgError = 'El registro no posee fecha de registro o id';
    }

    if (notError) {
        let cie10Verified = vCie10(registro.cie10);
        if (cie10Verified && notError) {
            dto['cie10'] = registro.cie10; 
        } else {
            msgError = 'El código CIE10 no es válido';
        }
    }

    // NO Obligatorios
    if (notError) {
        dto['texto'] = registro.texto ? registro.texto : null;
    }

    if (notError) {
        return dto
    } else {
        dto['msgError'] = msgError;
    }
}
