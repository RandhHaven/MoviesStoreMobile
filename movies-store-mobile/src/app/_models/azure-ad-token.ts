import { JwtPayload } from 'jwt-decode';

export interface AzureADToken extends JwtPayload {
  upn: string;
  given_name: string;
  family_name: string;
  email: string;
  jobTitle: string;
}
