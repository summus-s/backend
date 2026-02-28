import { IsString } from 'class-validator';

export class ExchangeTicketDto {
  @IsString()
  ticket: string;
}
