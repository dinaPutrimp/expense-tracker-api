import { ClientError } from "./client.error";

export class AuthorizationError extends ClientError {
    constructor(message = 'You do not have permission to access this resource') {
        super(message, 403)
    }
}