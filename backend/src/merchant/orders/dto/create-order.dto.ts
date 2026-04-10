import { IsString, IsNotEmpty, IsOptional, Matches } from 'class-validator';

export class CreateDirectOrderDto {
  @IsString()
  @IsNotEmpty()
  skuId: string;

  @IsString()
  @IsNotEmpty()
  gameId: string;

  @IsString()
  @IsOptional()
  serverId?: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9]+$/, { message: 'WhatsApp hanya boleh berisi angka' })
  whatsapp: string;
}
