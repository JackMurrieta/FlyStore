// update usuario
// mandar usuario completo y asi dependiendo de los cambios que se hacen solo modificar las columnas relacionadas a los campos del DTO

export interface updateUser {
    "nombre": string,
    "telefono": string,
    "direccion": updateDireccion
}

export interface updateDireccion {
    calle: string;
    numero: string;
    entreCalle1?: string;
    entreCalle2?: string;
    colonia?: string;
    ciudad: string;
    estado: string;
    codigoPostal: string;

}