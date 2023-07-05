import express from 'express';
import helmet from 'helmet';
import { errorHandler, validateContentType, validateJSONSyntax } from './middlewares/errorHandler';
import getTokenCookie from './middlewares/authmiddleware';
import route from './routes/index';
import cors from 'cors';
import { removeTokenCookie } from './lib/auth-cookies';
import { applicationUrl, acuantConfig } from './lib/config';
import initiaterelayCron from './jobs/cron';
import logHandler from './middlewares/logHandler';
import initiateQueues from './lib/queue';

const app = express();
const corsDomains = ['http://localhost:3000', acuantConfig.acuantGoUrl];
app.use(helmet());
app.use(cors({ credentials: true, origin: corsDomains }));
app.use((req, res, next) => {
  // prevents SSRF. We are not using hostname though
  try {
    if (process.env.NODE_ENV === 'production') {
      if (req.headers.host) {
        if (req.headers.host === applicationUrl?.split('//')[1]) {
          next();
        } else {
          res.status(400).end();
        }
      } else {
        res.status(400).end();
      }
    } else {
      next();
    }
  } catch {
    next();
  }
});
app.use(express.json({ limit: '10kb' }));
app.use(validateContentType);
app.use(validateJSONSyntax);
app.use(getTokenCookie);
app.use(logHandler);

app.use('/sapi/logout', (req, res) => {
  removeTokenCookie(res);
  res.redirect(applicationUrl);
});

initiaterelayCron();
initiateQueues();

app.use('/sapi', route);

app.use(errorHandler);

export default app;
