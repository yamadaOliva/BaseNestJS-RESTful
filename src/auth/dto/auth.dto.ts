import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
// import { IsEmailCustom } from '../validator/email.validator';
export class AuthDTO {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;
  name: string;
}
