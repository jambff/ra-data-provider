type ValidationErrors = {
  constraint: string;
  message: string;
  property: string;
};

export class DataProviderError extends Error {
  errors?: ValidationErrors[];

  constructor(statusCode: number, errors?: ValidationErrors[]) {
    super(`Invalid response: ${statusCode}`);
    this.errors = errors;
  }
}
