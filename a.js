const AWS = require('aws-sdk');

exports.handler = async (event) => {
    console.log(event);

    try {
        // Obtener el token de autorización
        const token = event.headers?.Authorization?.split(' ')[1];
        if (!token) {
            return {
                statusCode: 401,
                status: 'Unauthorized - Falta el token de autorización'
            };
        }

        // Obtener el tenant_id del cuerpo de la solicitud
        let body = event.body || {};
        if (typeof body === 'string') {
            body = JSON.parse(body);
        }

        const tenant_id = body.tenant_id;
        if (!tenant_id) {
            return {
                statusCode: 400,
                status: 'Bad Request - Faltan campos obligatorios (tenant_id)'
            };
        }

        // Validar el token llamando al Lambda de validación
        const isValidToken = await validateToken(tenant_id, token);
        if (!isValidToken) {
            return {
                statusCode: 403,
                status: 'Forbidden - Token inválido o expirado'
            };
        }

        // Validar los demás campos necesarios
        const { titulo, genero, duracion } = body;
        if (!titulo || !genero || !duracion) {
            return {
                statusCode: 400,
                status: 'Bad Request - Faltan campos obligatorios (titulo, genero, duracion)'
            };
        }

        // Configurar DynamoDB
        const dynamodb = new AWS.DynamoDB.DocumentClient();
        const PELICULA_TABLE = process.env.TABLE_NAME_PELICULA;

        // Crear la película
        const item = {
            tenant_id,
            titulo,
            genero,
            duracion,
            created_at: new Date().toISOString() // Registrar la fecha de creación
        };

        await dynamodb.put({
            TableName: PELICULA_TABLE,
            Item: item
        }).promise();

        // Respuesta exitosa
        return {
            statusCode: 201,
            response: {
                message: 'Película creada con éxito',
                pelicula: item
            }
        };

    } catch (error) {
        console.error(`Error inesperado: ${error.message}`);

        return {
            statusCode: 500,
            status: 'Internal Server Error - Ocurrió un error inesperado al crear la película'
        };
    }
};

// Validar el token invocando un Lambda externo
async function validateToken(tenant_id, token) {
    try {
        const lambda = new AWS.Lambda();
        const lambdaName = process.env.LAMBDA_VALIDAR_TOKEN; // Nombre del Lambda que valida tokens

        const payloadString = JSON.stringify({ tenant_id, token });

        const invokeResponse = await lambda.invoke({
            FunctionName: lambdaName,
            InvocationType: 'RequestResponse',
            Payload: payloadString
        }).promise();

        const response = JSON.parse(invokeResponse.Payload);

        // El token es válido solo si el Lambda responde con un código 200
        return response.statusCode === 200;
    } catch (error) {
        console.error('Error al invocar el Lambda para validar el token:', error.message);
        return false;
    }
}
