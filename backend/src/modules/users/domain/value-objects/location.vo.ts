import { DomainException } from "../../../../shared/domain/exceptions/domain.exception";
import { ErrorCode } from "../../../../shared/domain/enums/error-code.enum";
import { INDIAN_LOCATION_DATA } from "../constants/location-data.constant";

export class LocationVO {
    private readonly _country: string;
    private readonly _state: string;
    private readonly _city: string;

    constructor(country: string, state: string, city: string) {
        if (country !== 'India') {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, 'Only India is currently supported.');
        }

        const validCities = INDIAN_LOCATION_DATA[state];
        if (!validCities) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, `Invalid state: ${state}`);
        }
        
        if (!validCities.includes(city)) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, `City '${city}' does not belong to state '${state}'`);
        }

        this._country = country;
        this._state = state;
        this._city = city;
    }

    get country(): string { return this._country; }
    get state(): string { return this._state; }
    get city(): string { return this._city; }
}