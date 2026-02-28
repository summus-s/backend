import { IsEnum, IsInt, IsString, IsUUID, Min } from 'class-validator';
import { OrderItemType } from '../entities/order-item.entity';

export class CreateOrderItemDto {
  @IsEnum(OrderItemType)
  type: OrderItemType;

  @IsUUID()
  referenceId: string;

  @IsString()
  name: string;

  @IsString()
  unitPrice: string;

  @IsInt()
  @Min(1)
  quantity: number;
}
