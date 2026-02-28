import { IsUUID } from 'class-validator';

export class CreateTicketDto {
  @IsUUID()
  companyVerticalId: string;
}
