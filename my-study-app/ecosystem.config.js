module.exports = {
  apps: [
    {
      name: 'ham-radio-study-app',
      script: 'node_modules/.bin/next',
      args: 'start -p 4000',
      instances: 1,
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 4000,
      },
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_file: './logs/pm2-combined.log',
      time: true,
      merge_logs: true,
    },
  ],
};
