const AWS = require('aws-sdk');

AWS.config.update({ region: 'us-east-1' });
const dynamoDb = new AWS.DynamoDB.DocumentClient();

// Función para validar el token llamando a la Lambda "ValidarTokenAcceso"
const validateToken = async (tenant_id, token) => {
    const lambda = new AWS.Lambda();
    const params = {
        FunctionName: 'ValidarTokenAcceso',
        InvocationType: 'RequestResponse',
        Payload: JSON.stringify({ tenant_id, token }),
    };

    try {
        const response = await lambda.invoke(params).promise();
        const result = JSON.parse(response.Payload);

        if (result.statusCode !== 200) {
            throw new Error(result.body || 'Token inválido');
        }
        return true; // Token válido
    } catch (error) {
        throw new Error(`Error al validar el token: ${error.message}`);
    }
};

// Handler para crear una nueva película
module.exports.crearPelicula = async (event) => {
    const body = JSON.parse(event.body);
    const { tenant_id, titulo, genero, duracion } = body;
    const token = event.headers['authorization']; // Token en el header Authorization

    if (!token) {
        return {
            statusCode: 401,
            body: JSON.stringify({ error: 'Unauthorized - Falta el token de autorización' }),
        };
    }

    try {
        // Validación del token
        await validateToken(tenant_id, token);

        const params = {
            TableName: process.env.TABLE_NAME_PELICULA,
            Item: {
                tenant_id,
                titulo,
                genero,
                duracion,
            },
        };

        await dynamoDb.put(params).promise();

        return {
            statusCode: 201,
            body: JSON.stringify({
                message: 'Película creada exitosamente',
                pelicula: params.Item,
            }),
        };
    } catch (error) {
        console.error("Error al crear película:", error);
        return {
            statusCode: error.message.includes('Token') ? 403 : 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
};

// Handler para obtener una película
module.exports.obtenerPelicula = async (event) => {
    const { tenant_id, titulo } = event.pathParameters;

    const params = {
        TableName: process.env.TABLE_NAME_PELICULA,
        Key: {
            tenant_id,
            titulo,
        },
    };

    try {
        const result = await dynamoDb.get(params).promise();
        if (result.Item) {
            return {
                statusCode: 200,
                body: JSON.stringify({ pelicula: result.Item }),
            };
        } else {
            return {
                statusCode: 404,
                body: JSON.stringify({ error: 'Película no encontrada' }),
            };
        }
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: 'Error al obtener la película',
                details: error.message,
            }),
        };
    }
};

// Handler para actualizar una película
module.exports.actualizarPelicula = async (event) => {
    const { tenant_id, titulo } = event.pathParameters;
    const body = JSON.parse(event.body);
    const { genero, duracion } = body;
    const token = event.headers['authorization']; // Token en el header Authorization

    if (!token) {
        return {
            statusCode: 401,
            body: JSON.stringify({ error: 'Unauthorized - Falta el token de autorización' }),
        };
    }

    try {
        // Validación del token
        await validateToken(tenant_id, token);

        const params = {
            TableName: process.env.TABLE_NAME_PELICULA,
            Key: { tenant_id, titulo },
            UpdateExpression: 'set genero = :genero, duracion = :duracion',
            ExpressionAttributeValues: {
                ':genero': genero,
                ':duracion': duracion,
            },
            ReturnValues: 'UPDATED_NEW',
        };

        const result = await dynamoDb.update(params).promise();

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Película actualizada',
                updatedAttributes: result.Attributes,
            }),
        };
    } catch (error) {
        console.error("Error al actualizar película:", error);
        return {
            statusCode: error.message.includes('Token') ? 403 : 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
};
