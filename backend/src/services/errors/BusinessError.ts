export class BusinessError extends Error {
  public status: number;
  public error: string;
  constructor(message: string, status = 422) {
    super(message);
    this.status = status;
    this.error = message;
  }
}
