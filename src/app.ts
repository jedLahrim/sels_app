import express, { request, Request, response, Response } from 'express';
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import dataSource_config from './config/config';
import * as bodyParser from 'body-parser';
import { body, param, query, validationResult } from 'express-validator';
import routes from './router/routes';
import morgan from 'morgan';
import cors from 'cors';
import { createConnection } from 'typeorm';
import { ConfigModule } from '@nestjs/config';
import multer from 'multer';
import { AuthGuard, PassportModule } from '@nestjs/passport';
import { APP_GUARD } from '@nestjs/core';

ConfigModule.forRoot({
  envFilePath: '.env',
  isGlobal: true,
});
require('dotenv').config({ path: '.env', debug: true });
function handleError(err, _req, res, _next) {
  res.status(err.statusCode || 500).send(err.message);
}
let app = express();
app.use(morgan('tiny'));
// app.use(morgan('tiny'));
app.use(bodyParser.json());
// use express json
app.use(express.json());
// use cors
app.use(cors());

// use router
// app.use(router);
const port = 4060;
app.get('/', function (req, res) {
  res.send('hello word');
});

routes.forEach((route) => {
  (app as any)[route.method](
    route.route,
    ...route.validation,
    async (req: Request, res: Response, next?: Function) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }

        console.log(route.strategy);
        console.log(route.guard);
        if (!route.strategy) {
          const result0 = await new (route.service as any)()[route.action](
            req,
            res,
            next,
          );
          // res.json(result0);
        } else {
          const result = await new (route.strategy as any)()[route.guard](
            req,
            res,
            next,
          );
          if (result.statusMessage === 'Unauthorized') {
            return res
              .status(401)
              .json({ UnauthorizedException: 'Unauthorized' });
          }
          const result2 = await new (route.service as any)()[route.action](
            req,
            res,
            next,
          );
          // res.json({ result, result2 });
        }
      } catch (err) {
        next(err);
      }
    },
  );
});
app.use(handleError);
// export let appDataSource = new DataSource(dataSource_config);
createConnection(dataSource_config)
  .then(async (connection) => {
    console.log('Data base connect successfully');
    app.listen(port, () => {
      console.log(`application running in ${port}`);
    });
  })
  .catch((reason) => {
    console.log('err connecting database', reason);
  });
// })
// .catch((error) => console.log(error));
// appDataSource
//   .connect()
//   .then(() => {
//     console.log('Data base connect successfully');
//
//     app.listen(port, () => {
//       console.log(`application running in ${port}`);
//     });
//   })
//   .catch((reason) => {
//     console.log('err connecting database', reason);
//   });
//
