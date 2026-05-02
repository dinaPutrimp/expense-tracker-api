import { ClientError } from "./client.error";

export class InvariantError extends ClientError {
    constructor(message = 'Bad request') {
        super(message, 400)
    }
}