const express = require('express');
const AWS = require('aws-sdk');
const bodyParser = require('body-parser');
const serverless = require('serverless-http'); // Adaptador para Lambda

const app = express();
app.use(bodyParser.json());

AWS.config.update({ region: 'us-east-1' });
const dynamoDb = new AWS.DynamoDB.DocumentClient();

// Función simulada para validar el token (sin validación real)
const validateToken = async (tenant_id, token) => {
    // Simulación de validación desactivada
    console.log(`Simulando validación de token para tenant_id: ${tenant_id}`);
    return true; // Retornar siempre true
};

// Endpoint para crear una nueva película
app.post('/pelicula', async (req, res) => {
    const { tenant_id, titulo, genero, duracion } = req.body;

    try {
        // Validación del token simulada
        await validateToken(tenant_id, null);

        const params = {
            TableName: process.env.TABLE_NAME_PELICULA, // Usa la variable de entorno
            Item: {
                tenant_id,
                titulo,
                genero,
                duracion
            }
        };

        await dynamoDb.put(params).promise();
        res.status(201).json({
            message: 'Película creada exitosamente',
            pelicula: params.Item
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Endpoint para obtener una película por tenant_id y título
app.get('/pelicula/:tenant_id/:titulo', async (req, res) => {
    const { tenant_id, titulo } = req.params;

    const params = {
        TableName: process.env.TABLE_NAME_PELICULA, // Usa la variable de entorno
        Key: {
            tenant_id,
            titulo
        }
    };

    try {
        const result = await dynamoDb.get(params).promise();
        if (result.Item) {
            res.json({ pelicula: result.Item });
        } else {
            res.status(404).json({ error: 'Película no encontrada' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener la película', details: error.message });
    }
});

// Endpoint para actualizar una película
app.put('/pelicula/:tenant_id/:titulo', async (req, res) => {
    const { tenant_id, titulo } = req.params;
    const { genero, duracion } = req.body;

    try {
        // Validación del token simulada
        await validateToken(tenant_id, null);

        const params = {
            TableName: process.env.TABLE_NAME_PELICULA, // Usa la variable de entorno
            Key: { tenant_id, titulo },
            UpdateExpression: 'set genero = :genero, duracion = :duracion',
            ExpressionAttributeValues: {
                ':genero': genero,
                ':duracion': duracion
            },
            ReturnValues: 'UPDATED_NEW'
        };

        const result = await dynamoDb.update(params).promise();
        res.json({
            message: 'Película actualizada',
            updatedAttributes: result.Attributes
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Exportar el handler para que funcione con AWS Lambda
module.exports.crearPelicula = serverless(app); // Adaptar el handler de Express a Lambda
module.exports.obtenerPelicula = serverless(app);
module.exports.actualizarPelicula = serverless(app);
