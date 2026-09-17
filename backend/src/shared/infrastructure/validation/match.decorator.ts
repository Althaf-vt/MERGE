import { registerDecorator, ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";

// 1. The actual validation logic
@ValidatorConstraint({name: "Match"})
export class MatchConstraint implements ValidatorConstraintInterface{
    validate(value: any, args: ValidationArguments){
        const [relatedPropertyName] = args.constraints;
        const relatedValue = (args.object as any)[relatedPropertyName];

        // Returns true if the field match, false it they dont
        return value === relatedValue;
    }

    defaultMessage(args: ValidationArguments){
        // Standart error message if not overridden in the DTO
        return `${args.property} must match ${args.constraints[0]}`
    }
}

// 2. The Decorator function that you attach to your DTO property
export function Match(property: string, validationOptions?: ValidationOptions){
    return (object: any, propertyName: string) => {
        registerDecorator({
            target: object.constructor,
            propertyName,
            options: validationOptions,
            constraints: [property],
            validator: MatchConstraint
        })
    }
}