import swaggerAutogen from "swagger-autogen";

const doc = {
  info: {
    version: "1.0.0",
    title: "Insta-clone API",
    description: "Insta-clone API Information",
    contact: {
      name: "Amazing Developer",
    },
    servers: [
      {
        url: "http://localhost:5000",
      },
    ],
    tags: [
      {
        name: "Auth",
        description: "Auth API",
      },
      {
        name: "User",
        description: "User API",
      },
      {
        name: "Post",
        description: "Post API",
      },
      {
        name: "Comment",
        description: "Comment API",
      },
      {
        name: "Setting",
        description: "Setting API",
      },
    ],
  },
  host: "localhost:5000",
  securityDefinitions: {
    bearerAuth: {
      type: "apiKey",
      name: "x-auth-token",
      scheme: "bearer",
      in: "header",
    },
  },
};

const outputFile = "./swagger2.json";
const endpointsFiles = ["./src/sever.ts"];

swaggerAutogen({ openai: "3.0.3" })(outputFile, endpointsFiles, doc);
