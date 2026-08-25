import { Injectable } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { IPasswordHasher } from "../../interfaces/password-hasher.interface";
// Service responsible for securely hashing passwords and comparing passwords with their stored hashes.

// Marks this service as available for dependency injection in NestJs. 
@Injectable()
export class BcryptService implements IPasswordHasher{
    private readonly saltRounds = 10;

    async hash(plainText: string): Promise<string>{
        return bcrypt.hash(plainText, this.saltRounds);
    }

    async compare(plainText: string, hashedText: string): Promise<boolean>{
        return bcrypt.compare(plainText, hashedText);
    }
}