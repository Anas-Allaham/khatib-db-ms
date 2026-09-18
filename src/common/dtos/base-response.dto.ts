import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class BaseResponseDto<T> {
    @ApiProperty()
    message!: string;

    @ApiProperty()
    statusCode: number;

    @ApiPropertyOptional()
    data?: T;

    constructor(baseMessage: IBaseMessage<T>) {
        this.message = baseMessage.message;
        this.statusCode = baseMessage.statusCode || 200;
        this.data = baseMessage.data
    }
}

interface IBaseMessage<T> {
    message: string;
    statusCode?: number;
    data?: T
}