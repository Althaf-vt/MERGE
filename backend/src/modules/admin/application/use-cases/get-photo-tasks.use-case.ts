import { Inject, Injectable } from "@nestjs/common";
import { IGetPhotoTasksUseCase } from "../interfaces/photo-verification.use-case.interface";
import { IPhotoVerificationTaskRepository, PHOTO_VERIFICATION_TASK_REPOSITORY } from "../../domain/interfaces/photo-verification-task-repository.interface";
import { GetPhotoTasksQueryDto, PaginatedPhotoTasksResponseDto } from "../dtos/photo-verification.dto";
import { PhotoTaskDtoMapper } from "../../presentation/mappers/photo-task-dto.mapper";

@Injectable()
export class GetPhotoTasksUseCase implements IGetPhotoTasksUseCase {
    constructor(
        @Inject(PHOTO_VERIFICATION_TASK_REPOSITORY) private readonly _repository: IPhotoVerificationTaskRepository
    ) {}

    async execute(query: GetPhotoTasksQueryDto): Promise<PaginatedPhotoTasksResponseDto> {
        const result = await this._repository.findAllPaginated({
            page: query.page ?? 1,
            limit: query.limit ?? 20,
            status: query.status,
            claimStatus: query.claimStatus,
            claimedBy: query.claimedBy,
        });

        return {
            data: result.data.map(task => PhotoTaskDtoMapper.toResponseDto(task)),
            total: result.total,
            page: result.page,
            limit: result.limit
        };
    }
}