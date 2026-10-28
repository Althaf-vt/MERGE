import { Inject, Injectable } from "@nestjs/common";
import { HydratedPhotoTaskResult, IGetPhotoTasksUseCase, PaginatedHydratedPhotoTasks } from "../interfaces/photo-verification.use-case.interface";
import { IPhotoVerificationTaskRepository, PHOTO_VERIFICATION_TASK_REPOSITORY } from "../../domain/interfaces/photo-verification-task-repository.interface";
import { GetPhotoTasksQueryDto } from "../dtos/photo-verification.dto";
import { IMediaFacade, MEDIA_FACADE } from "../../../users/application/interfaces/media-facade.interface";

@Injectable()
export class GetPhotoTasksUseCase implements IGetPhotoTasksUseCase {
    constructor(
        @Inject(PHOTO_VERIFICATION_TASK_REPOSITORY) private readonly _repository: IPhotoVerificationTaskRepository,
        @Inject(MEDIA_FACADE) private readonly _mediaFacade: IMediaFacade
    ) {}

    async execute(query: GetPhotoTasksQueryDto): Promise<PaginatedHydratedPhotoTasks> {
        const result = await this._repository.findAllPaginated({
            page: query.page ?? 1,
            limit: query.limit ?? 20,
            status: query.status,
            claimStatus: query.claimStatus,
            claimedBy: query.claimedBy,
        });

        // Hydrate the raw S3 keys into secure presingned URLs concurrently
        const hydratedData: HydratedPhotoTaskResult[] = await Promise.all(
            result.data.map(async (task) => {
                const signedKycUrl = await this._mediaFacade.getPresignedMediaUrl(task.kycSelfieUrl) || task.kycSelfieUrl;
                const signedUploadedUrl = await this._mediaFacade.getPresignedMediaUrl(task.uploadedPhotoUrl) || task.uploadedPhotoUrl;

                return { task, signedKycUrl, signedUploadedUrl };
            })
        );

        return {
            data: hydratedData,
            total: result.total,
            page: result.page,
            limit: result.limit
        };
    }
}