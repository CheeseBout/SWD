const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Pre-Marital Counseling API",
      version: "1.0.0",
      description: "API documentation for Pre-Marital Counseling System",
      contact: {
        name: "API Support",
        email: "support@example.com",
      },
    },
    servers: [
      {
        url: "http://localhost:8080/api/v1",
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: ["./src/routes/*.js"], // Path to the API routes
};

module.exports = swaggerOptions;
