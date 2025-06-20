import { IsUniversityEmail } from '@src/modules/users/validators/is-university-email.validator';
import { validate } from 'class-validator';

class TestClass {
  @IsUniversityEmail()
  email: string;
}

describe('IsUniversityEmail', () => {
  it('should validate emails with @est.una.ac.cr domain', async () => {
    const instance = new TestClass();
    instance.email = 'test@est.una.ac.cr';

    const errors = await validate(instance);

    expect(errors.length).toBe(0);
  });

  it('should invalidate emails with other domains', async () => {
    const instance = new TestClass();
    instance.email = 'test@gmail.com';

    const errors = await validate(instance);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isUniversityEmail');
  });
});
