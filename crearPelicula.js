const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid'); // Corregido para importar correctamente uuid

exports.handler = async (event) => {
    console.log(event);

    try {
        // Analizar el cuerpo de la solicitud
        let body = event.body || {};
        if (typeof body === 'string') {
            body = JSON.parse(body);
        }

        // Obtener el tenant_id y datos de la película
        const tenant_id = body.tenant_id;
        const titulo = body.titulo;
        const genero = body.genero;
        const duracion = body.duracion;

        // Validar la existencia de las variables de entorno
        if (!process.env.TABLE_NAME_PELICULA || !process.env.LAMBDA_VALIDAR_TOKEN) {
            return {
                statusCode: 500,
                status: 'Internal Server Error - Variables de entorno no configuradas',
            };
        }

        // Obtener el nombre de la tabla y lambda de la variable de entorno
        const tabla_peliculas = process.env.TABLE_NAME_PELICULA;
        const lambda_token = process.env.LAMBDA_VALIDAR_TOKEN;

        // Validar que los datos requeridos estén presentes
        if (!tenant_id || !titulo || !genero || !duracion) {
            return {
                statusCode: 400,
                status: 'Bad Request - Faltan datos en la solicitud',
            };
        }

        // Proteger el Lambda
        const token = event.headers?.Authorization;
        if (!token) {
            return {
                statusCode: 401,
                status: 'Unauthorized - Falta el token de autorización',
            };
        }

        // Invocar otro Lambda para validar el token
        const lambda = new AWS.Lambda();
        const payloadString = JSON.stringify({
            tenant_id,
            token,
        });

        const invokeResponse = await lambda.invoke({
            FunctionName: lambda_token,
            InvocationType: 'RequestResponse',
            Payload: payloadString,
        }).promise();

        const response = JSON.parse(invokeResponse.Payload);
        console.log(response);

        if (response.statusCode === 403) {
            return {
                statusCode: 403,
                status: 'Forbidden - Acceso NO Autorizado',
            };
        }

        // Generar un UUID único para la película
        const uuid = uuidv4();

        // Proceso - Guardar datos en DynamoDB
        const dynamodb = new AWS.DynamoDB.DocumentClient();
        const dbResponse = await dynamodb.put({
            TableName: tabla_peliculas,
            Item: {
                tenant_id,
                uuid,
                titulo,
                genero,
                duracion,
            },
        }).promise();

        // Salida (json)
        return {
            statusCode: 200,
            message: 'Película creada exitosamente',
            response: dbResponse.Item,
        };
    } catch (error) {
        console.error(`Error inesperado: ${error.message}`);

        return {
            statusCode: 500,
            status: 'Internal Server Error - Ocurrió un error inesperado',
        };
    }
};
