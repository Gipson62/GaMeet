import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'GaMeet API',
      version: '1.0.0',
      description: 'API documentation for GaMeet - Gaming Event Platform'
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT Bearer token for authentication'
        }
      }
    }
  },
  apis: [
    './controller/*.js',
    './routes/v1/*.js'
  ]
};

export const swaggerSpec = swaggerJsdoc(options);
