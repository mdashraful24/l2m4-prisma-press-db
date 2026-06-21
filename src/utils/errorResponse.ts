export class SelfError extends Error {
    statusCode: number

    constructor(message: string, statusCode: number) {
        super(message)
        this.statusCode = statusCode
    }
}

type ErrorHandleType = {
    message: string
    statusCode?: number
}

export const errorHandle = (error: unknown): ErrorHandleType => {
    if (error instanceof SelfError) {
        return {
            message: error.message,
            statusCode: error.statusCode,
        }
    }

    if (error instanceof Error) {
        return {
            message: error.message,
        }
    }

    return {
        message: "Something went wrong",
    }
}