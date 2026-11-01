export class AppError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }

  static badRequest(message, details) {
    return new AppError(400, 'BAD_REQUEST', message, details);
  }

  static notFound(message = 'Not found') {
    return new AppError(404, 'NOT_FOUND', message);
  }

  static unauthorized(message = 'Please sign in to continue.') {
    return new AppError(401, 'UNAUTHORIZED', message);
  }

  static forbidden(message = 'You do not have access to this.') {
    return new AppError(403, 'FORBIDDEN', message);
  }

  static conflict(message) {
    return new AppError(409, 'CONFLICT', message);
  }

  // Upstream data provider (weather, routing, places) failed or timed out.
  static provider(provider, message) {
    return new AppError(502, 'PROVIDER_UNAVAILABLE', message, { provider });
  }
}
