import fs from 'fs';
import { Documento } from '../types';
import xml from 'xml2js'

export const ProcesarArchivo = (archivoPath: string): Promise<Documento> => {
    const data = fs.readFileSync(archivoPath, 'utf8');

    return new Promise((resolve, reject) => {
        xml.parseString(data, (error, documentoLeido) => {
            if (error) {
                console.log(error)
                reject('Error al leer xml');
            }
            const { Invoice } = documentoLeido;
            resolve(Invoice);
        })
    })

}
