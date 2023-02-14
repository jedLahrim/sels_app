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
  constructor() {}

  // @Cron('0 30 11 * * 6,7') //  11:30:00 on Saturday, and Sunday,
  // log() {
  //   console.log('Hello world!');
  // }

  async scheduleEmail(req: Request, res: Response): Promise<void> {
    // used spread operator here
    // "a"
    // "b"
    // ["c", "d", "e", “f”]
    // 0 10,44 14 ? 3 WED
    // 2:10 pm and at 2:44 pm every Wednesday in the month of March.

    // 0 15 10 ? * MON-FRI
    // 10:15 am every Monday, Tuesday, Wednesday, Thursday and Friday
    const client = mailgun({ domain: '', apiKey: '' });
    // const client = require('mailgun-js')({ domain: '', apiKey: '' });
    const { recipient, subject, content } = req.body;
    // create a transporter object to send emails
    const job = schedule('0 17 * * *', async () => {
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
  cron() {
    const cron = require('cron');

    const job = new cron.CronJob('0 0 * * *', function () {
      console.log('Running a job at midnight every day');
    });
    job.start();
  }
}
