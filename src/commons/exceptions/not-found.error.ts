import { ClientError } from "./client.error";

export class NotFoundError extends ClientError {
    constructor(message = 'Resource not found'){
        super(message, 404)
    }
}