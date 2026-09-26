import { Inject, Injectable } from '@nestjs/common';
import { IUpdateMedicalRecordUseCase } from '../interfaces/profile-management.use-case.interface';
import { IUserRepository, USER_REPOSITORY } from '../../domain/interfaces/user-repository.interface';
import { UpdateMedicalRecordDto } from '../dtos/profile-management.dto';
import { DomainException } from '../../../../shared/domain/exceptions/domain.exception';
import { ErrorCode } from '../../../../shared/domain/enums/error-code.enum';
import { UserMedical } from '../../domain/entities/user-medical.entity';

@Injectable()
export class UpdateMedicalRecordUseCase implements IUpdateMedicalRecordUseCase {
    constructor(
        @Inject(USER_REPOSITORY) private readonly _userRepository: IUserRepository,
    ) { }

    async execute(userId: string, dto: UpdateMedicalRecordDto): Promise<void> {
        const user = await this._userRepository.findById(userId);
        if (!user) throw new DomainException(ErrorCode.USER_NOT_FOUND, 'User not found.');

        // Retrieve existing entity or initialize a new one
        const medicalRecord = user.medicalRecord || new UserMedical({ infectiousVisibility: 'HIDDEN' });

        medicalRecord.updateRecords(dto);

        // Attach and save
        user.attachMedicalRecord(medicalRecord);
        await this._userRepository.update(user);
    }
}