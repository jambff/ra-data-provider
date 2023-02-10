type ValidationErrors = {
  constraint: string;
  message: string;
  property: string;
};

export class DataProviderError extends Error {
  errors?: ValidationErrors[];

  _dataprovidererror: true;

  constructor(statusCode: number, errors?: ValidationErrors[]) {
    super(`Invalid response: ${statusCode}`);
    this.errors = errors;
    this._dataprovidererror = true;
  }
}

export const isDataProviderError = (
  error: unknown,
): error is DataProviderError =>
  !!error && typeof error === 'object' && '_dataprovidererror' in error;
