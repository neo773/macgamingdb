export class CustomException<TCode extends string = string> extends Error {
  constructor(
    message: string,
    public readonly code: TCode,
    public readonly userFriendlyMessage?: string,
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}
