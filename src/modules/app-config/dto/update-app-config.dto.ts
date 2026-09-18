import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class UpdateAppConfigDto {
    @ApiProperty({ type: String })
    @IsString()
    key!: string;

    @ApiProperty({ type: String })
    @IsString()
    value!: string;
}
