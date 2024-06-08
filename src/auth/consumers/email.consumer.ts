import { Processor , Process } from "@nestjs/bull";
import { Job } from "bull";
import { MailerService } from '@nest-modules/mailer';
/**
 * <p>Xin chào {{ name }}</p>
<p>VUi lòng làm theo hướng dẫn</p>
{{!-- link to active --}}
{{#if active}}
  <a href="{{ link }}">Kích hoạt tài khoản</a>
{{/if}}
{{!-- link to reset --}}
{{#if reset}}
  <a href="{{ link }}">Đặt lại mật khẩu</a>
{{/if}}
 */
@Processor('sendMail')
export class EmailConsumer {
	constructor(private readonly mailerService: MailerService) {}
	@Process('register')
	async sendMail(job: Job<any>) {
		console.log("sdfsdfdsf",job.data);
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
		console.log(job.data);
	}
}