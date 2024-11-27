const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

const PELICULA_TABLE = process.env.TABLE_NAME_PELICULA;

exports.handler = async (event) => {
    try {
        const { tenant_id, titulo } = event.pathParameters;

        const params = {
            TableName: PELICULA_TABLE,
            Key: { tenant_id, titulo },
        };

        const result = await dynamodb.get(params).promise();

        if (!result.Item) {
            return { statusCode: 404, body: JSON.stringify({ message: 'Película no encontrada' }) };
        }

        return { statusCode: 200, body: JSON.stringify({ pelicula: result.Item }) };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Error al obtener la película' }),
        };
    }
};
