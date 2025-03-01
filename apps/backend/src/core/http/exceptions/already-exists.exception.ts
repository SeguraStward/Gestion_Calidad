import { HttpException, HttpStatus } from '@nestjs/common';

export class AlreadyExistsException extends HttpException {
  constructor(message = 'Record already exists') {
    super(message, HttpStatus.BAD_REQUEST);
  }
}
