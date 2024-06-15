import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { MailerService } from '@nest-modules/mailer';

@Processor('sendMail')
export class EmailConsumer {
  constructor(private readonly mailerService: MailerService) {}
  @Process('register')
  async sendMail(job: Job<any>) {
    console.log('sdfsdfdsf', job.data);
    const { email, name, activeToken } = job.data;
    const link = `http://192.168.1.14:3000/auth/active/${activeToken}`;
    await this.mailerService.sendMail({
      to: email,
      subject: 'Xác nhận tài khoản',
      template: 'welcome',
      context: {
        name,
        link,
        active: true,
        reset: false,
      },
    });
  }
  @Process('forgotPassword')
  async sendMail2(job: Job<any>) {
    const { email, name, resetToken } = job.data;
    const link = `http://192.168.1.14:3000/auth/reset/${resetToken}`;
    await this.mailerService.sendMail({
      to: email,
      subject: 'Đặt lại mật khẩu',
      template: 'welcome',
      context: {
        name,
        link,
        active: false,
        reset: true,
      },
    });
  }
  @Process('sendPassword')
  async sendMail3(job: Job<any>) {
	const { email, name, password } = job.data;
	await this.mailerService.sendMail({
	  to: email,
	  subject: 'Xin chào bạn',
	  template: 'showpassword',
	  context: {
		name,
		password,
		active: false,
		reset: false,
	  },
	});
  }
}
