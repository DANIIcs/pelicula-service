const AWS = require('aws-sdk');

exports.handler = async (event) => {
    console.log(event);

    try {
        // Analizar el cuerpo de la solicitud
        let body = event.body || {};
        if (typeof body === 'string') {
            body = JSON.parse(body);
        }

        // Validar la existencia de las variables de entorno
        if (!process.env.TABLE_NAME_PELICULA) {
            return {
                statusCode: 500,
                status: 'Internal Server Error - Variable de entorno TABLE_NAME_PELICULA no configurada',
            };
        }

        const tabla_peliculas = process.env.TABLE_NAME_PELICULA;

        // Validar que tenant_id y título estén presentes
        const { tenant_id, titulo } = body;
        if (!tenant_id || !titulo) {
            return {
                statusCode: 400,
                status: 'Bad Request - tenant_id y título son obligatorios',
            };
        }

        // Eliminar la película desde DynamoDB
        const dynamodb = new AWS.DynamoDB.DocumentClient();
        const params = {
            TableName: tabla_peliculas,
            Key: { tenant_id, titulo },
        };

        const deleteResponse = await dynamodb.delete(params).promise();

        // Salida (json)
        return {
            statusCode: 200,
            message: 'Película eliminada con éxito',
            response: deleteResponse,
        };
    } catch (error) {
        console.error(`Error inesperado: ${error.message}`);

        return {
            statusCode: 500,
            status: 'Internal Server Error - Error al eliminar la película',
            error: error.message,
        };
    }
};
