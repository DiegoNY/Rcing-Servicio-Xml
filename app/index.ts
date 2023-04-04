import express from 'express';

import { carpeta, puerto, tiempo, tiempo_limpiar } from "./config/config";
import { LeyendoArchivos } from "./proces/LeerArchivos";
import { Documento, RespuestaServicio } from './types';
import { Declarar } from './proces/Declarar';
import { MoverDocumento } from './proces/MoverDocumento';


console.log("SERVICIO DE XML INICIADO 🔨👷‍♂️");

const app = express();

let mock: Documento[] = []
let mockDocumentosErrores: Documento[] = [];


const LimpiarErrores = () => {
    mockDocumentosErrores = [];
}

const ValidarInformacion = (data: Documento[]) => {
    mockDocumentosErrores.map(docError => {
        const docIndex = data.findIndex(docData => docData.ID[0] == docError.ID[0])
        data.splice(docIndex, 1);
    })
    return data
}


setInterval(() => {
    LeyendoArchivos(carpeta)
        .then(documentos => {
            const documentosEnviar = ValidarInformacion(documentos);
            mock = documentosEnviar;

            if (documentosEnviar.length != 0) {
                console.log("Declarando")
                Declarar(documentosEnviar)
                    .then((rta: any) => {
                        const { data } = rta;
                        console.log(data);
                        data.map((documento: RespuestaServicio) => {

                            const indexDoc = documentosEnviar.findIndex(documentoMock => `${documentoMock.ID[0]}-${documentoMock.InvoiceTypeCode[0]}` == documento.documento)

                            if (documento.estatus == 1) {
                                console.log(`El documento ${documento.documento} sera movido procesado exitosamente`)
                                const documentoMover = documentosEnviar[indexDoc];
                                MoverDocumento(documentoMover.archivoPath, documentoMover.archivo);
                            } else {
                                console.log(`El documento ${documento.documento} contiene errores`)
                                mockDocumentosErrores.push(documentosEnviar[indexDoc])
                            }

                        })
                    })
                    .catch(error => {
                        console.error(error);
                    })
            }


        })
        .catch(error => {
            console.log(error);
        })
}, tiempo);

setInterval(LimpiarErrores, tiempo_limpiar);

app.listen(puerto, () => {
    console.log("Server iniciado");

    app.get('/procesados', (req, res) => {
        LeyendoArchivos(`${__dirname}/sent`)
            .then(rta => {
                res.send({
                    info: "documentos leidos",
                    data: rta
                })
            })
            .catch(erro => {
                res.send({
                    error: true,
                    message: erro
                })
            })
    })

    app.get('/procesando', (req, res) => {
        res.send({ data: mock });
    })

    app.get('/errores', (req, res) => {
        res.send({
            info: 'Documentos con errores',
            data: mockDocumentosErrores
        })
    })
})