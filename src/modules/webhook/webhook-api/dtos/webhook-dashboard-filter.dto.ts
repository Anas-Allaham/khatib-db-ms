import { ApiProperty } from "@nestjs/swagger";
import { WebhookFilter } from "./webhook-filter.dto";
import { IsMongoId, IsOptional } from "class-validator";
import { Types } from "mongoose";

export class WebhookDashboardFilter extends WebhookFilter {
  @ApiProperty({ type: String, required: false })
  @IsMongoId()
  @IsOptional()
  tenantId?: Types.ObjectId
}