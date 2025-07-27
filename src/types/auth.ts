export interface UserProfile {
  id: string;
  displayName: string;
  givenName: string;
  surname: string;
  userPrincipalName: string;
  mail: string;
  jobTitle?: string;
  department?: string;
  companyName?: string;
  businessPhones?: string[];
  mobilePhone?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: UserProfile | null;
  isLoading: boolean;
  error: string | null;
}

export interface LoginError {
  errorCode: string;
  errorMessage: string;
  subError?: string;
}