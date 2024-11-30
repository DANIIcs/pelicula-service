const AWS = require('aws-sdk');

exports.handler = async (event) => {
    console.log(event);

    try {
        // Validar las variables de entorno
        if (!process.env.TABLE_NAME_PELICULA) {
            return {
                statusCode: 500,
                status: 'Internal Server Error - Variable de entorno TABLE_NAME_PELICULA no configurada',
            };
        }

        const tabla_peliculas = process.env.TABLE_NAME_PELICULA;

        // Obtener el parámetro uuid de la solicitud
        const { uuid } = event.pathParameters || {};

        // Validar que el parámetro uuid esté presente
        if (!uuid) {
            return {
                statusCode: 400,
                status: 'Bad Request - uuid es obligatorio',
            };
        }

        // Configurar los parámetros para obtener la película
        const dynamodb = new AWS.DynamoDB.DocumentClient();
        const params = {
            TableName: tabla_peliculas,
            Key: { uuid }, // Solo utilizamos el uuid
        };

        // Obtener la película desde DynamoDB
        const result = await dynamodb.get(params).promise();

        // Verificar si la película existe
        if (!result.Item) {
            return {
                statusCode: 404,
                status: 'Not Found - Película no encontrada',
            };
        }

        // Respuesta exitosa
        return {
            statusCode: 200,
            message: 'Película obtenida exitosamente',
            pelicula: result.Item,
        };
    } catch (error) {
        console.error(`Error inesperado: ${error.message}`);

        // Respuesta en caso de error
        return {
            statusCode: 500,
            status: 'Internal Server Error - Error al obtener la película',
            error: error.message,
        };
    }
};
