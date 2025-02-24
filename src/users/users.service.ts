import { ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User } from '../models/user.schema';
import { RegisterDto } from 'src/auth/dto/register.dto';

@Injectable()
export class UsersService {
    constructor(@InjectModel(User.name) private userModel: Model<User>) {}

    async findByEmail(email: string): Promise<User | null> {
        return this.userModel.findOne({ email }).exec();
    }
    
    async findById(id: string): Promise<User | null> {
        return this.userModel.findById(id).exec();
    }

    async register(registerDto: RegisterDto): Promise<User> {
        try {
            const { name, email, password } = registerDto;
            
            // Check if the email already exists
            const existingUser = await this.userModel.findOne({ email });
            if (existingUser) {
                throw new ConflictException('This email is already exists');
            }
            
            const hashedPassword = await bcrypt.hash(password, 10);
            return this.userModel.create({ name, email, password: hashedPassword });
        } catch (err) {
            console.log(err.message);
            throw new InternalServerErrorException('Database error occurred');
        }
    }

    async updateUser(userID: string, updateData: Partial<User>) {
        try {
            return this.userModel.findByIdAndUpdate(userID, updateData, { new: true }).exec();
        } catch (err) {
            console.log(err.message);
            throw new InternalServerErrorException('Database error occurred');
        }
    }
  
}
