import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

export interface MailOptions {
  to: string;
  subject: string;
  html: string;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private readonly transporter: Transporter;
  private readonly from: string;

  constructor(private readonly config: ConfigService) {
    this.from = config.get('MAIL_FROM', 'noreply@certificatedu.dev');
    this.transporter = nodemailer.createTransport({
      host: config.get('MAIL_HOST', 'smtp.gmail.com'),
      port: Number(config.get('MAIL_PORT', '587')),
      secure: config.get('MAIL_SECURE', 'false') === 'true',
      auth: {
        user: config.get('MAIL_USER', ''),
        pass: config.get('MAIL_PASS', ''),
      },
    });
  }

  async sendMail(options: MailOptions): Promise<boolean> {
    if (!this.config.get('MAIL_USER')) {
      this.logger.warn(`[MAIL SKIP] MAIL_USER 미설정 — to: ${options.to}, subject: ${options.subject}`);
      return false;
    }
    try {
      await this.transporter.sendMail({ from: this.from, ...options });
      this.logger.log(`[MAIL SENT] to: ${options.to}, subject: ${options.subject}`);
      return true;
    } catch (err) {
      this.logger.error(`[MAIL ERROR] ${(err as Error).message}`);
      return false;
    }
  }

  sendPurchaseConfirm(to: string, userName: string, courseTitle: string, price: number) {
    return this.sendMail({
      to,
      subject: `[CertificatEdu] "${courseTitle}" 수강 신청 완료`,
      html: `
        <h2>안녕하세요, ${userName}님!</h2>
        <p><strong>${courseTitle}</strong> 강의 수강 신청이 완료되었습니다.</p>
        <p>결제 금액: <strong>${price.toLocaleString()}원</strong></p>
        <p>지금 바로 학습을 시작하세요! 🎉</p>
        <hr/>
        <p style="color:#999;font-size:12px">CertificatEdu — 자격증 합격을 위한 온라인 강의 플랫폼</p>
      `,
    });
  }

  sendDailyDigest(to: string, newCourseCount: number, topCourses: Array<{ title: string; price: number }>) {
    const courseList = topCourses.map((c) => `<li>${c.title} — ${c.price.toLocaleString()}원</li>`).join('');
    return this.sendMail({
      to,
      subject: `[CertificatEdu] 오늘의 강의 현황 (신규 ${newCourseCount}개)`,
      html: `
        <h2>오늘의 CertificatEdu 현황</h2>
        <p>신규 등록 강의: <strong>${newCourseCount}개</strong></p>
        ${topCourses.length ? `<h3>추천 강의</h3><ul>${courseList}</ul>` : ''}
        <hr/>
        <p style="color:#999;font-size:12px">CertificatEdu 일간 다이제스트</p>
      `,
    });
  }
}
