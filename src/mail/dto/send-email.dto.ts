import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SendEmailDto {
    @IsNotEmpty()
    @IsEmail({}, { each: true })
    recipients: string | string[];
    
    @IsNotEmpty()
    @IsString()
    subject: string;
    
    @IsNotEmpty()
    @IsString()
    html: string

    @IsOptional()
    @IsString()
    text?: string
}