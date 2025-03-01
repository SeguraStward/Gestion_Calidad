import { Transform } from 'class-transformer';

/**
 * Transform date to ISO string format
 * @returns {PropertyDecorator}
 */
/**
 * A property decorator that transforms a date value to ISO string format.
 *
 * This decorator automatically converts date values to ISO string format when the property is accessed.
 * If the input value is falsy (null, undefined, etc.), it returns undefined.
 *
 * @returns A Transform decorator that converts dates to ISO strings
 */
export function TransformDate() {
  return Transform(({ value }) => {
    if (!value) return undefined;
    return new Date(value).toISOString();
  });
}
