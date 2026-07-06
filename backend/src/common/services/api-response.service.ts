export interface IApiResponse<T> {
  statusCode: number;
  message: string;
  data?: T;
  timestamp?: string;
}

export class ApiResponseService {
  static success<T>(data: T, message: string = 'Success'): IApiResponse<T> {
    return {
      statusCode: 200,
      message,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  static created<T>(data: T, message: string = 'Created'): IApiResponse<T> {
    return {
      statusCode: 201,
      message,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  static error(statusCode: number, message: string): IApiResponse<null> {
    return {
      statusCode,
      message,
      timestamp: new Date().toISOString(),
    };
  }
}
