const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

const PELICULA_TABLE = process.env.TABLE_NAME_PELICULA;

exports.handler = async (event) => {
    try {
        const { tenant_id, titulo } = JSON.parse(event.body);

        if (!tenant_id || !titulo) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'tenant_id y título son obligatorios' }),
            };
        }

        const params = {
            TableName: PELICULA_TABLE,
            Key: { tenant_id, titulo },
        };

        await dynamodb.delete(params).promise();

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Película eliminada con éxito' }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Error al eliminar la película' }),
        };
    }
};
