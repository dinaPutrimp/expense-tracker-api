export abstract class ClientError extends Error {
    public readonly statusCode: number;

    protected constructor(message: string, statusCode = 400){
        super(message)

        this.statusCode = statusCode;
        this.name = new.target.name

        Object.setPrototypeOf(this, new.target.prototype)
    }
}