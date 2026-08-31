import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { HANDOFF_SERVICE, type IHandoffSessionService } from "../../domain/interfaces/handoff-service.interface";
import { HandoffGateway } from "../../presentation/gateways/handoff.gateway";

@Injectable()
export class ValidateHandoffUseCase{
    constructor(
        @Inject(HANDOFF_SERVICE) private readonly handoffService: IHandoffSessionService,
        // Injecting the gateway so we can trigger real-time updates from this HTTP request
        private readonly handoffGateway: HandoffGateway,
    ){}

    async execute(sessionId: string): Promise<string>{
        // 1. check if the QR code is still valid in Redis
        const userId = await this.handoffService.validateSession(sessionId);

        if(!userId){
            throw new BadRequestException('QR Code session has expired or is invalid.');
        }

        // 2. Instantly notify the desktop UI that mobile phone has successfully connected
        this.handoffGateway.notifyDesktop(sessionId, 'PHONE_CONNECTED');

        // 3. Return the userId so the controller can issue authenticated cookies
        return userId
    }
}