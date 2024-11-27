const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

const PELICULA_TABLE = process.env.TABLE_NAME_PELICULA;

exports.handler = async (event) => {
    try {
        const { tenant_id, titulo } = event.pathParameters;
        const data = JSON.parse(event.body);

        if (!tenant_id || !titulo) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'tenant_id y título son obligatorios' }),
            };
        }

        const params = {
            TableName: PELICULA_TABLE,
            Key: { tenant_id, titulo },
            UpdateExpression: 'set genero = :genero, duracion = :duracion',
            ExpressionAttributeValues: {
                ':genero': data.genero,
                ':duracion': data.duracion,
            },
            ReturnValues: 'UPDATED_NEW',
        };

        const result = await dynamodb.update(params).promise();
        if (!result.Attributes) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: 'Película no encontrada para actualizar' }),
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Película actualizada', updatedAttributes: result.Attributes }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Error al actualizar la película' }),
        };
    }
};
