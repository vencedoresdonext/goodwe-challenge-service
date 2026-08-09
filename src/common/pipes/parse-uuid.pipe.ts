import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { validate as uuidValidate } from 'uuid';

/**
 * Pipe que valida se o valor é um UUID válido.
 *
 * @example
 * ```ts
 * @Get(':id')
 * findOne(@Param('id', ParseUuidPipe) id: string) {}
 * ```
 */
@Injectable()
export class ParseUuidPipe implements PipeTransform<string, string> {
  transform(value: string, metadata: ArgumentMetadata): string {
    if (!uuidValidate(value)) {
      throw new BadRequestException(
        `O parâmetro "${metadata.data}" deve ser um UUID válido`,
      );
    }
    return value;
  }
}
