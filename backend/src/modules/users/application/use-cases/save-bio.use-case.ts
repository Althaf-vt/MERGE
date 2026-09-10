import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { IUserRepository, USER_REPOSITORY } from "../../domain/interfaces/user-repository.interface";
import { ISaveBioUseCase } from "../interfaces/save-bio.use-case.interface";
import { SaveBioDto } from "../dtos/save-bio.dto";

@Injectable()
export class SaveBioUseCase implements ISaveBioUseCase{
    constructor(
        @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository 
    ){}

    async execute(userId: string, payload: SaveBioDto): Promise<{ success: boolean; message: string; }> {
        const user = await this.userRepository.findById(userId);

        if(!user || !user.profile){
            throw new BadRequestException("User or profile not found.");
        }

        user.profile.updateBio(
            payload.bio,
            payload.seletedTraits,
            payload.interests
        )

        await this.userRepository.update(user);

        return {
            success: true,
            message: "Bio saved successfully"
        }
    }
}