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

        // Obtener los parámetros de la solicitud
        const { tenant_id, titulo } = event.pathParameters || {};
        const body = event.body ? JSON.parse(event.body) : {};

        // Validar que los parámetros y datos estén presentes
        if (!tenant_id || !titulo) {
            return {
                statusCode: 400,
                status: 'Bad Request - tenant_id y título son obligatorios',
            };
        }

        if (!body.genero || !body.duracion) {
            return {
                statusCode: 400,
                status: 'Bad Request - género y duración son obligatorios en el cuerpo de la solicitud',
            };
        }

        // Configurar los parámetros para actualizar en DynamoDB
        const dynamodb = new AWS.DynamoDB.DocumentClient();
        const params = {
            TableName: tabla_peliculas,
            Key: { tenant_id, titulo },
            UpdateExpression: 'set genero = :genero, duracion = :duracion',
            ExpressionAttributeValues: {
                ':genero': body.genero,
                ':duracion': body.duracion,
            },
            ReturnValues: 'UPDATED_NEW',
        };

        // Ejecutar la operación de actualización
        const result = await dynamodb.update(params).promise();

        // Validar si se encontraron y actualizaron los datos
        if (!result.Attributes) {
            return {
                statusCode: 404,
                status: 'Not Found - Película no encontrada para actualizar',
            };
        }

        // Respuesta exitosa
        return {
            statusCode: 200,
            message: 'Película actualizada exitosamente',
            updatedAttributes: result.Attributes,
        };
    } catch (error) {
        console.error(`Error inesperado: ${error.message}`);

        // Respuesta en caso de error
        return {
            statusCode: 500,
            status: 'Internal Server Error - Error al actualizar la película',
            error: error.message,
        };
    }
};
