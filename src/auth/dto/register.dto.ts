import { IsEmail, IsNotEmpty, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
    @IsNotEmpty({ message: 'Name cannot be empty' })
    @IsString({ message: 'Name must be a string' })
    @MinLength(2, { message: 'Name must be at least 2 characters long' })
    @MaxLength(50, { message: 'Name must not exceed 50 characters' })
    @Matches(
        /^[a-zA-Z\s'-]+$/, 
        { message: 'Name can only contain letters, spaces, apostrophes, and hyphens' }
    )
    name: string;

    @IsNotEmpty({ message: 'Email cannot be empty' })
    @IsEmail({}, { message: 'Invalid email address' })
    @MaxLength(100, { message: 'Email must not exceed 100 characters' })
    email: string;

    @IsNotEmpty({ message: 'Password cannot be empty' })
    @IsString()
    @MinLength(8, { message: 'Password must be at least 8 characters long' })
    @MaxLength(32, { message: 'Password must not exceed 32 characters' })
    @Matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, 
        { message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character' }
    )
    password: string;
}
