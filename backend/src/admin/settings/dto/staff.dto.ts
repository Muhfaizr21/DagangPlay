import { IsString, IsEmail, IsNotEmpty, IsOptional, IsArray, IsEnum, MinLength } from 'class-validator';

export enum AdminStatus {
    ACTIVE = 'ACTIVE',
    SUSPENDED = 'SUSPENDED',
}

export class CreateStaffDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsEmail()
    email: string;

    @IsString()
    @MinLength(6)
    password: string;

    @IsEnum(AdminStatus)
    @IsOptional()
    status?: AdminStatus;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    permissions?: string[];
}

export class UpdateStaffDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsEnum(AdminStatus)
    @IsOptional()
    status?: AdminStatus;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    permissions?: string[];
}
