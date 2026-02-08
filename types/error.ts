export interface AppError {
  title: string;
  message?: string | null;
}

export interface ErrorDisplayProps extends AppError {
  className?: string;
}
