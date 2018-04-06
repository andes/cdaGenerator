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
        paciente.sexo = (paciente.sexo === 'Masculino') ? 'masculino' : 'femenino';
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
// Verifica que la prestación no sea vacía y matchea el nombre de la prestación con un código SNOMED de la colección de mapeo
    let prestacion;
    return prestacion = '700152009';
}

function vCie10() {

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
    let paciente;
    let pacienteVerified:any = vPaciente(registro);
    if (pacienteVerified) {
        dto['paciente'] = pacienteVerified;
    } else {
        notError = false;
    }
    let profesionalVerified = vProfesional(registro);
    if (profesionalVerified && notError) {
        dto['profesional'] = profesionalVerified;
    } else {
        notError = false
    }

    let prestacionVerified = vPrestacion(registro.prestacion);
    if (prestacionVerified && notError) {
        dto['prestacionSnomed'] = prestacionVerified;
    } else {
        notError = false
    }
    notError = registro.fecha ? true : false;
    notError = registro.id ? true : false;

    if (notError) {
        dto['fecha'] = moment(registro.fecha).toDate();
        dto['id'] = registro.id;
    }
    // NO Obligatorios
    if (notError) {
        dto['texto'] = registro.texto ? registro.texto : null;
        dto['cie10'] = registro.cie10 ? registro.cie10 : null;   
    }

    if (notError) {
        return dto
    }
}
