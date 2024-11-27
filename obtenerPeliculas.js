const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

const PELICULA_TABLE = process.env.TABLE_NAME_PELICULA;

exports.handler = async () => {
    try {
        const params = { TableName: PELICULA_TABLE };
        const result = await dynamodb.scan(params).promise();

        return {
            statusCode: 200,
            body: JSON.stringify({ peliculas: result.Items }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Error al obtener las películas' }),
        };
    }
};
