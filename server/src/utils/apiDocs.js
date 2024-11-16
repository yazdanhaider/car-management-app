export const apiDocumentation = {
  openapi: "3.0.0",
  info: {
    title: "Car Management API",
    version: "1.0.0",
    description: "API documentation for Car Management System"
  },
  servers: [
    {
      url: process.env.NODE_ENV === 'production' 
        ? 'https://your-api-url.vercel.app/api' 
        : 'http://localhost:5001/api',
      description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server'
    }
  ],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: "apiKey",
        in: "cookie",
        name: "token"
      }
    }
  },
  paths: {
    "/auth/register": {
      post: {
        tags: ["Authentication"],
        summary: "Register a new user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: {
                    type: "string",
                    format: "email",
                    description: "User's email address"
                  },
                  password: {
                    type: "string",
                    minimum: 6,
                    description: "User's password (min 6 characters)"
                  }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: "User successfully registered",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: {
                    user: {
                      email: "user@example.com",
                      _id: "user_id",
                      createdAt: "timestamp"
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/auth/login": {
      post: {
        tags: ["Authentication"],
        summary: "Login user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: {
                    type: "string",
                    format: "email"
                  },
                  password: {
                    type: "string"
                  }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: "Successfully logged in"
          }
        }
      }
    },
    "/cars": {
      get: {
        tags: ["Cars"],
        summary: "Get all cars for authenticated user",
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            in: "query",
            name: "search",
            schema: {
              type: "string"
            },
            description: "Search term for filtering cars"
          }
        ],
        responses: {
          200: {
            description: "List of cars",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: {
                    cars: [
                      {
                        _id: "car_id",
                        title: "Car Title",
                        description: "Car Description",
                        images: ["image_url"],
                        tags: ["tag1", "tag2"],
                        user: "user_id"
                      }
                    ]
                  }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ["Cars"],
        summary: "Create a new car",
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["title", "description", "images", "tags"],
                properties: {
                  title: {
                    type: "string"
                  },
                  description: {
                    type: "string"
                  },
                  images: {
                    type: "array",
                    items: {
                      type: "string"
                    }
                  },
                  tags: {
                    type: "array",
                    items: {
                      type: "string"
                    }
                  }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: "Car created successfully"
          }
        }
      }
    }
  }
}; 