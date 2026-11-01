import { AppError } from '../utils/AppError.js';

/** Validates req[part] against a Zod schema and exposes the parsed value on req.valid[part]. */
export const validate = (schema, part = 'query') => (req, _res, next) => {
  const result = schema.safeParse(req[part]);
  if (!result.success) {
    const details = result.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message }));
    return next(AppError.badRequest('Invalid request', details));
  }
  req.valid = { ...req.valid, [part]: result.data };
  next();
};
