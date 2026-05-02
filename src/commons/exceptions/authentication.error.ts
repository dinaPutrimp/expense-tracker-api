import { ClientError } from "./client.error";

export class AuthenticationError extends ClientError {
    constructor(message = 'Unauthorized') {
        super(message, 401)
    }
}