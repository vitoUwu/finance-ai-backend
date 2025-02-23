import "fastify";

declare module "fastify" {
  export interface FastifyRequest {
    user: {
      id: string;
    };
  }
}

interface JwtPayload {
  sub: string;
  name: string;
  email: string;
}
