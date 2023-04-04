import fs from 'fs';
import path from 'path';
import { Documento } from '../types';
import { ProcesarArchivo } from './ProcesarArchivo';
import { idSucursal } from '../config/config';

export const LeyendoArchivos = (carpeta: string): Promise<Documento[]> => {
    const archivosEnviar: Documento[] = [];

    return new Promise((resolve, reject) => {
        fs.readdir(carpeta, (error, archivos) => {

            if (error) {
                console.error(`Error al leer la carpeta ${error}`);
                reject('Error al leer carpeta' + error)
                return;
            }

            archivos.forEach(archivo => {

                const archivoPath = path.join(carpeta, archivo);

                console.log(`Procesando archivo ${archivo}`);
                ProcesarArchivo(archivoPath)
                    .then(documento => {
                        archivosEnviar.push({ ...documento, archivoPath, archivo, idSucursal: idSucursal });
                    })
                    .catch(error => {
                        console.error(error);
                    });
                // Registrar el archivo como procesado
            })

            resolve(archivosEnviar)
        })
    })
}