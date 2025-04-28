import { registerDecorator, ValidationOptions, ValidationArguments, isEmail } from 'class-validator';

export function IsUniversityEmail(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isUniversityEmail',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: {
        validate(value: any) {
          // Check if it's a valid email first
          if (!value || typeof value !== 'string' || !isEmail(value)) {
            return false;
          }

          // Check for university domain(s)
          const allowedDomains = ['@est.una.ac.cr'];
          return allowedDomains.some((domain) => value.endsWith(domain));
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a valid university email (@est.una.ac.cr)`;
        },
      },
    });
  };
}
