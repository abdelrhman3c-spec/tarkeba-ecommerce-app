import { IsNotEmpty, IsString, Matches, MaxLength, MinLength } from "class-validator";
import { IsMatch } from '../decorators/match-password.decorator';

export class ResetPasswordDto {
    @IsNotEmpty({ message: 'Password cannot be empty' })
    @IsString()
    @MinLength(8, { message: 'Password must be at least 8 characters long' })
    @MaxLength(32, { message: 'Password must not exceed 32 characters' })
    @Matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, 
        { message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character' }
    )
    password: string;

    @IsNotEmpty()
    @IsString()
    @IsMatch('password')
    confirmPassword: string;
}
