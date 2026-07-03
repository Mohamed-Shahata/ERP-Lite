export default () => ({
  app: {
    port: parseInt(process.env.PORT ?? '4000', 10),
  },

  database: {
    url: process.env.DATABASE_URL,
  },

  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN,
  },

  jwt_refresh: {
    secret: process.env.JWT_REFRESH_SECRET,
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
  },

  mail: {
    from: process.env.MAIL_FROM,
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },

  frontend: process.env.FRONTEND_URL,
});

export const ConfigKeys = {
  APP_PORT: 'app.port',
  DATABASE_URL: 'database.url',
  JWT_SECRET: 'jwt.secret',
  JWT_EXPIRES_IN: 'jwt.expiresIn',
  JWT_REFRESH_SECRET: 'jwt_refresh.secret',
  JWT_REFRESH_EXPIRES_IN: 'jwt_refresh.expiresIn',
  SMTP_HOST: 'mail.host',
  SMTP_FROM: 'mail.from',
  SMTP_PORT: 'mail.port',
  SMTP_SECURE: 'mail.secure',
  SMTP_USER: 'mail.user',
  SMTP_PASSWORD: 'mail.pass',
  FRONTEND_URL: 'frontend',
} as const;
