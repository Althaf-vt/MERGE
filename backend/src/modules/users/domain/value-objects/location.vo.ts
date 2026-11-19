import { DomainException } from "../../../../shared/domain/exceptions/domain.exception";
import { ErrorCode } from "../../../../shared/domain/enums/error-code.enum";
import { GLOBAL_LOCATION_DATA } from "../constants/location-data.constant";
import { USER_ERROR_MESSAGES } from "../constants/user-error-messages.constant";

export class LocationVO {
    private readonly _country: string;
    private readonly _state: string;
    private readonly _city: string;

    constructor(country: string, state: string, city: string) {
        // 1. Validate Country exists in our central dictionary
        const countryData = GLOBAL_LOCATION_DATA[country];
        if (!countryData) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, USER_ERROR_MESSAGES.UNSUPPORTED_COUNTRY(country));
        }

        // 2. Validate State exists within the matched Country
        const validCities = countryData[state];
        if (!validCities) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, USER_ERROR_MESSAGES.INVALID_STATE_FOR_COUNTRY(state, country));
        }
        
        // 3. Validate City exists within the matched State
        if (!validCities.includes(city)) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, USER_ERROR_MESSAGES.INVALID_CITY_FOR_STATE(city, state));
        }

        this._country = country;
        this._state = state;
        this._city = city;
    }

    get country(): string { return this._country; }
    get state(): string { return this._state; }
    get city(): string { return this._city; }
}