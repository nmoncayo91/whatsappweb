import "./bootstrap";
import "reflect-metadata";
import "express-async-errors";
import express, { Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import * as Sentry from "@sentry/node";
import cors from "cors";
import "./database";
import uploadConfig from "./config/upload";
import AppError from "./errors/AppError";
import routes from "./routes";
import { logger } from "./utils/logger";
import { Integrations } from "@sentry/tracing";
// import ReactDOM from "react-dom";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  // integrations: [new Integrations.BrowserTracing()],
  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0
//prueba
});
//prueba
// ReactDOM.r2ender(<App />, document.getElementById("root"));

const app = express();

app.all('*', function(req, res, next) {
    res.header('Access-Control-Allow-Origin',`${process.env.FRONTEND_URL}`);
    res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');

    if (req.method == 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

app.use(
  cors({
    credentials: false,
    origin: process.env.FRONTEND_URL
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(Sentry.Handlers.requestHandler());
app.use("/public", express.static(uploadConfig.directory));
app.use(routes);

app.use(Sentry.Handlers.errorHandler());

app.use(async (err: Error, req: Request, res: Response, _: NextFunction) => {
  if (err instanceof AppError) {
    logger.warn(err);
    return res.status(err.statusCode).json({ error: err.message });
  }

  logger.error(err);
  return res.status(500).json({ error: "Internal server error" });
});

export default app;
