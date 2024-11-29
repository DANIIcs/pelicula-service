const AWS = require('aws-sdk');

exports.handler = async () => {
    console.log('Obteniendo todas las películas');

    try {
        // Validar las variables de entorno
        if (!process.env.TABLE_NAME_PELICULA) {
            return {
                statusCode: 500,
                status: 'Internal Server Error - Variable de entorno TABLE_NAME_PELICULA no configurada',
            };
        }

        const tabla_peliculas = process.env.TABLE_NAME_PELICULA;

        // Configurar los parámetros para el escaneo de DynamoDB
        const dynamodb = new AWS.DynamoDB.DocumentClient();
        const params = { TableName: tabla_peliculas };

        // Obtener todas las películas desde DynamoDB
        const result = await dynamodb.scan(params).promise();

        // Respuesta exitosa
        return {
            statusCode: 200,
            message: 'Películas obtenidas exitosamente',
            peliculas: result.Items,
        };
    } catch (error) {
        console.error(`Error inesperado: ${error.message}`);

        // Respuesta en caso de error
        return {
            statusCode: 500,
            status: 'Internal Server Error - Error al obtener las películas',
            error: error.message,
        };
    }
};
