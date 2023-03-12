import {
  UnprocessableEntityException,
  ValidationPipe as NestValidationPipe,
  ValidationPipeOptions,
} from '@nestjs/common';

export class ValidationPipe extends NestValidationPipe {
  constructor(options?: ValidationPipeOptions) {
    super({
      ...options,
      exceptionFactory(errors) {
        throw new UnprocessableEntityException(
          errors
            .map((item) => {
              return {
                property: item.property,
                errors: Object.values(item.constraints),
              };
            })
            .reduce((prev, curr) => {
              return {
                ...prev,
                [curr.property]: curr.errors,
              };
            }, {}),
        );
      },
    });
  }
}
