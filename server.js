const express = require('express');
const AWS = require('aws-sdk');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

AWS.config.update({ region: 'us-east-1' }); // Cambia la región según tu configuración
const dynamoDb = new AWS.DynamoDB.DocumentClient();

// Endpoint para crear una nueva película
app.post('/pelicula', async (req, res) => {
    const { tenant_id, titulo, genero, duracion } = req.body;

    const params = {
        TableName: 'Pelicula',
        Item: {
            tenant_id,
            titulo,
            genero,
            duracion
        }
    };

    try {
        await dynamoDb.put(params).promise();
        res.status(201).json({
            message: 'Película creada exitosamente',
            pelicula: params.Item
        });
    } catch (error) {
        res.status(500).json({ error: 'No se pudo crear la película', details: error.message });
    }
});

// Endpoint para obtener una película por tenant_id y título
app.get('/pelicula/:tenant_id/:titulo', async (req, res) => {
    const { tenant_id, titulo } = req.params;

    const params = {
        TableName: 'Pelicula',
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

    const params = {
        TableName: 'Pelicula',
        Key: { tenant_id, titulo },
        UpdateExpression: 'set genero = :genero, duracion = :duracion',
        ExpressionAttributeValues: {
            ':genero': genero,
            ':duracion': duracion
        },
        ReturnValues: 'UPDATED_NEW'
    };

    try {
        const result = await dynamoDb.update(params).promise();
        res.json({
            message: 'Película actualizada',
            updatedAttributes: result.Attributes
        });
    } catch (error) {
        res.status(500).json({ error: 'No se pudo actualizar la película', details: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
