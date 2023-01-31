import { User } from '../entities/user';
import express, { NextFunction, Request, Response } from 'express';
import { getRepository } from 'typeorm';
import {
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuid } from 'uuid';
import * as process from 'process';
import * as fs from 'fs';
import { S3 } from 'aws-sdk';
import { ChildProcess, exec } from 'child_process';
import { Media } from '../entities/media.entity';
import { AppError } from '../commons/errors/app-error';
import path from 'path';
import {
  EMAIL_OR_PASSWORD_IS_INCORRECT,
  ERR_NOT_FOUND_USER,
  THIS_TYPE_OF_FILE_IS_NOT_A_VIDEO_TYPE,
} from '../commons/errors/errors-codes';
express();
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
export class UserService {
  private userRepo = getRepository<User>(User);
  private mediaRepo = getRepository<Media>(Media);
  private configService: ConfigService;
  async getAll(req, res) {
    const allUsers = await this.userRepo.find();
    res.json(allUsers);
  }

  async findOne(req: Request, res: Response) {
    const id = req.params.id;
    const user = await this.userRepo.findOneBy({ id });
    if (user == null) {
      throw new NotFoundException('ERR_NOT_FOUND_BROWSER_SERVICE');
    }
    res.json(user);
  }

  //add user

  async register(req: Request, res: Response) {
    const { first_name, last_name, email, password } = req.body;
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await this.userRepo.create({
      first_name,
      last_name,
      email,
      password: hashedPassword,
    });
    const newUser = await this.userRepo.save(user);
    res.json(newUser);
  }

  async login(req: Request, res: Response) {
    const { email, password } = req.body;
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) {
      return res
        .status(401)
        .json({ UnauthorizedException: EMAIL_OR_PASSWORD_IS_INCORRECT });
    } else {
      if (user.activated === false) {
        throw new ConflictException('you should activate your account');
      } else {
        if (user && (await bcrypt.compare(password, user.password))) {
          const payload = { email };
          const accessExpireIn = '1d';
          const access = this._generateToken(payload, accessExpireIn);
          const access_expire_at = new Date(
            new Date().getTime() + accessExpireIn,
          );
          const refreshExpireIn = '2d';
          const refresh = this._generateToken(payload, refreshExpireIn);
          const refresh_expire_at = new Date(
            new Date().getTime() + refreshExpireIn,
          );
          user.access = await access;
          user.access_expire_at = access_expire_at;
          user.refresh = await refresh;
          user.refresh_expire_at = refresh_expire_at;
          res.json(user);
        } else {
          return res
            .status(401)
            .json({ UnauthorizedException: EMAIL_OR_PASSWORD_IS_INCORRECT });
        }
      }
    }
  }
  private async _generateToken(payload, expiresIn: string) {
    const token = jwt.sign(payload, process.env.SECRET_KEY, {
      expiresIn: expiresIn,
    });
    return token;
  }

  // upload file
  async upload(req: Request, res: Response) {
    console.log(req.file);
    let mediaPath = process.env.MEDIA_PATH;
    //get the extension of a file
    const get_extension = this._getFileExtension(req.file.path);
    if (
      get_extension == '.mp4' ||
      get_extension == '.mov' ||
      get_extension == '.wmv' ||
      get_extension == '.avi' ||
      get_extension == '.f4v' ||
      get_extension == '.webm'
    ) {
      try {
        const bucket = process.env.AWS_BACKET_NAME;
        const uploadParams = this._getAwsUploadParams();
        const s3 = new S3({
          region: uploadParams.region,
          accessKeyId: uploadParams.accessKeyId,
          secretAccessKey: uploadParams.secretAccessKey,
        });

        req.file.path = mediaPath;
        const transcode_video = await this._transcodeVideo(
          req.file,
          req.file.path,
        );
        const media = await this.mediaRepo.findOneBy({
          pid: transcode_video.pid,
        });
        const output = `${mediaPath}/${media.outputVideo}`;
        const transcodeFile = fs.readFileSync(output);
        const params: S3.Types.PutObjectRequest = {
          Body: transcodeFile,
          Bucket: bucket,
          Key: `${uuid()}-${req.file.originalname}`,
          ContentType: req.file.mimetype,
          ACL: 'public-read',
        };
        const uploaded_file = await s3
          .upload(params, (err, data) => {
            if (err) {
              throw err;
            }
          })
          .promise();
        res.json(`File uploaded successfully. ${uploaded_file.Location}`);
      } catch (e) {
        console.log(e);
        res.json('err upload');
      }
    } else {
      return res.status(401).json({
        code: THIS_TYPE_OF_FILE_IS_NOT_A_VIDEO_TYPE,
      });
    }
  }
  private _getFileExtension(filePath: string): string {
    return path.extname(filePath);
  }
  async uploadFile(req, res) {
    // await this._verifyToken(req, res);
    // req.file is the uploaded file
    // req.body will hold the text fields, if there were any
    console.log(req.file);
    try {
      const bucket = process.env.AWS_BACKET_NAME;
      const uploadParams = this._getAwsUploadParams();
      const s3 = new S3({
        region: uploadParams.region,
        accessKeyId: uploadParams.accessKeyId,
        secretAccessKey: uploadParams.secretAccessKey,
      });
      // req.file.path = process.env.MEDIA_PATH;
      const fileContent = fs.readFileSync(`${req.file.path}`);
      const params: S3.Types.PutObjectRequest = {
        Body: fileContent,
        Bucket: bucket,
        Key: `${uuid()}-${req.file.originalname}`,
        ContentType: req.file.mimetype,
        ACL: 'public-read',
      };
      const uploaded_file = await s3
        .upload(params, (err, data) => {
          if (err) {
            throw err;
          }
        })
        .promise();
      res.json(`File uploaded successfully. ${uploaded_file.Location}`);
    } catch (e) {
      console.log(e);
      res.json('err upload');
    }
  }

  private _getAwsUploadParams() {
    const region = process.env.AWS_BACKET_REGION;
    const accessKeyId = process.env.AWS_ACCESS_KEY;
    const secretAccessKey = process.env.AWS_SECRET_KEY;
    return { region, accessKeyId, secretAccessKey };
  }
  private async _transcodeVideo(
    file,
    inputVideoPath: string,
  ): Promise<ChildProcess> {
    const outputVideo = `${uuid()}-output.mp4`;
    const transcodeCommand = `ffmpeg -i ${inputVideoPath}/${file.originalname} -c:v libx264 -preset ultrafast -c:a aac -strict experimental ${inputVideoPath}/${outputVideo}`;
    const transferCommand = `mv ${outputVideo} /Users/jed/Downloads`;

    const transCode = await new Promise(
      async (resolve, reject): Promise<ChildProcess> => {
        return exec(transcodeCommand, (error, stdout, stderr) => {
          if (error) {
            reject(error);
          } else {
            console.log(stderr);
            resolve(stdout);
          }
        });
        // Move the transCoded video to the new directory
      },
    ).then(async (value) => exec(transferCommand));
    const pid = transCode.pid;
    const media = this.mediaRepo.create({
      outputVideo,
      pid,
    });
    await this.mediaRepo.save(media);
    return transCode;
  }
  async remove(req, res): Promise<void> {
    const id = req.params.id;
    const result = await this.userRepo.delete({ id });
    if (result.affected === 0) {
      return res.status(401).json({
        code: ERR_NOT_FOUND_USER,
      });
    }
    return;
  }
}
