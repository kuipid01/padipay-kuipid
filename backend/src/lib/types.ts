export interface ServiceError {
  code: number;
  message: string;
}

export type ServiceResult<T> = 
  | { success: true; data: T }
  | { success: false; error: ServiceError };
