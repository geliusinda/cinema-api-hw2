import { QueryFailedError } from 'typeorm';

export function isPostgresError(
  error: unknown,
  code: string,
  constraint?: string,
): boolean {
  if (!(error instanceof QueryFailedError)) return false;
  const driver = error.driverError as { code?: string; constraint?: string };
  return (
    driver.code === code &&
    (constraint === undefined || driver.constraint === constraint)
  );
}
