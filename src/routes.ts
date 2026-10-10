export type AppRoute =
  | 'landing'
  | 'login'
  | 'signup'
  | 'forgot-password'
  | 'reset-password'
  | 'access-denied'
  | 'app'; // Logged-in application shell (which handles inner tabs like command-center, forecast-inputs, etc.)
