import { Injectable } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { MailerService } from '@nestjs-modules/mailer';
import { job } from 'cron';
import { Request, Response } from 'express';
import * as nodemailer from 'nodemailer';
import { schedule } from 'node-cron';
import mailgun from 'mailgun-js';
import { optionalRequire } from '@nestjs/core/helpers/optional-require';
import process from 'process';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class EmailSchedulingService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {}

  // @Cron('0 30 11 * * 6,7') //  11:30:00 on Saturday, and Sunday,
  // log() {
  //   console.log('Hello world!');
  // }

  async scheduleEmail(req: Request, res: Response): Promise<any> {
    const client = mailgun({ domain: '', apiKey: '' });
    // const client = require('mailgun-js')({ domain: '', apiKey: '' });
    const { recipient, subject, content } = req.body;
    // create a transporter object to send emails
    const job = schedule('0 30 11 * * 7', async () => {
      await client.messages().send({
        to: recipient,
        from: 'Contact@boostifly.com',
        subject: subject,
        text: content,
        //html: `Click <a href="${url}">here</a> to activate your account !`,
      });
    });

    // await this.schedulerRegistry.addCronJob(
    //   `${Date.now()}-${req.body.emailSchedule.subject}`,
    //   job,
    // );
    job.start();
  }
  async sendMail(req: Request, res: Response) {
    const { recipient, subject, content } = req.body;
    // create a transporter object to send emails
    let transporter = nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      auth: {
        user: 'apikey',
        pass: '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',
      },
    });

    await transporter.sendMail({
      to: recipient,
      from: 'Contact@boostifly.com',
      subject: subject,
      text: content,
      sender: 'Contact@boostifly.com',
      //html: `Click <a href="${url}">here</a> to activate your account !`,
    });
  }
}
