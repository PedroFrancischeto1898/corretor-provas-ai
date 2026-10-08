export class GradeError extends Error {
    status: number;

    constructor(
        message: string,
        status = 400
    ) {
        super(message);

        this.name = "GradeError";
        this.status = status;
    }
}