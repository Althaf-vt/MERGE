import { RegisterUserDto } from "../dtos/register-user.dto";

export const REGISTER_USER_USE_CASE = Symbol('REGISTER_USER_USE_CASE');

export interface IRegisterUserUseCase {
    execute(paylod: RegisterUserDto): Promise<void>;
}