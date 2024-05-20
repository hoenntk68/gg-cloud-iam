import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class GoogleConnectorConfig {
  @IsNotEmpty()
  @IsEmail()
  client_email: string;

  @IsNotEmpty()
  @IsString()
  private_key: string;
}
