import { IsEmail, IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class GoogleUserDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    firstName: string;

    @IsString()
    @IsNotEmpty()
    lastName: string;

    @IsString()
    @IsNotEmpty()
    sub: string;

    @IsUrl()
    @IsNotEmpty()
    avatar: string;
}