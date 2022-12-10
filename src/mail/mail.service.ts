import { Injectable, BadRequestException } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import {
  ADMIN_EMAIL_ADDRESS,
  GOOGLE_MAILER_CLIENT_ID,
  GOOGLE_MAILER_CLIENT_SECRET,
  GOOGLE_MAILER_REFRESH_TOKEN,
} from './const';
import { createTransport } from 'nodemailer';

export interface AppMail {
  email: string;
  subject: string;
  content: string;
}

@Injectable()
export class MailService {
  private myOAuth2Client: OAuth2Client;
  constructor() {
    this.myOAuth2Client = (() => {
      const oAuth2Client = new OAuth2Client(
        GOOGLE_MAILER_CLIENT_ID,
        GOOGLE_MAILER_CLIENT_SECRET,
      );
      oAuth2Client.setCredentials({
        refresh_token: GOOGLE_MAILER_REFRESH_TOKEN,
      });
      return oAuth2Client;
    })();
  }

  async sendEmail({ email, subject, content }: AppMail) {
    try {
      if (!email || !subject || !content)
        throw new BadRequestException(
          'Vui lòng cung cấp email, subject, content',
        );
      const myAccessTokenObject = await this.myOAuth2Client.getAccessToken();
      const myAccessToken = myAccessTokenObject?.token;
      const transport = createTransport({
        service: 'gmail',
        auth: {
          type: 'OAuth2',
          user: ADMIN_EMAIL_ADDRESS,
          clientId: GOOGLE_MAILER_CLIENT_ID,
          clientSecret: GOOGLE_MAILER_CLIENT_SECRET,
          refreshToken: GOOGLE_MAILER_REFRESH_TOKEN,
          accessToken: myAccessToken,
        },
        from: ADMIN_EMAIL_ADDRESS,
      });

      const mailOptions = {
        to: email,
        subject: subject,
        html: `<p>${content}</p>`,
      };

      await transport.sendMail(mailOptions);
      return { message: 'Gửi mail thành công' };
    } catch (e) {
      return e;
    }
  }
}
