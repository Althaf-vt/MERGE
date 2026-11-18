import { UserProfile } from "../../domain/entities/user-profile.entity";
import { UserProfileResponseDto } from "../dtos/user-profile-response.dto";
import { UpdatePersonaResult } from "../interfaces/update-persona.use-case.interface";

export class UserProfileDtoMapper {
    public static toResponseDto(profile: UserProfile): UserProfileResponseDto {
        const profileProps = profile.toJSON();
        const { bioGenerationAttempts: _, ...profileDto } = profileProps;
        return profileDto;
    }

    public static toResponseDtoList(profiles: UserProfile[]): UserProfileResponseDto[] {
        return profiles.map((profile) => UserProfileDtoMapper.toResponseDto(profile));
    }

    public static toPersonaResult(profile: UserProfile, verifiedDOB?: Date): UpdatePersonaResult {
        return {
            profile: UserProfileDtoMapper.toResponseDto(profile),
            verifiedDOB,
        };
    }
}
