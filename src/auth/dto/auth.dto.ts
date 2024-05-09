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
  studentId: string;
  majorId: number;
  city: string;
  district: string;
  liveIn: string;
  Birthday: Date;
  class: string;
  interest: [string];
  gender: string;
  schoolYear: string;
}
