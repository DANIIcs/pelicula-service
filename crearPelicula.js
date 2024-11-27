const AWS = require('aws-sdk');
const jwt = require('jsonwebtoken');
const dynamodb = new AWS.DynamoDB.DocumentClient();
const uuid = require('uuid'); // Generar IDs únicos

const PELICULA_TABLE = process.env.TABLE_NAME_PELICULA;

exports.handler = async (event) => {
    try {
        const token = event.headers.Authorization.split(' ')[1]; 
        const authPayload = await verifyToken(token);

        if (!authPayload) {
            return {
                statusCode: 403,
                body: JSON.stringify({ message: 'Token inválido o expirado' }),
            };
        }

        const data = JSON.parse(event.body);
        const item = {
            tenant_id: data.tenant_id,
            titulo: data.titulo,
            genero: data.genero,
            duracion: data.duracion,
        };

        await dynamodb.put({
            TableName: PELICULA_TABLE,
            Item: item,
        }).promise();

        return {
            statusCode: 201,
            body: JSON.stringify({ message: 'Película creada con éxito', pelicula: item }),
        };
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Ocurrió un error al crear la película' }),
        };
    }
};

async function verifyToken(token) {
    try {
        const secret = process.env.JWT_SECRET; 
        const payload = jwt.verify(token, secret);
        return payload;
    } catch (error) {
        return null;
    }
}
