module.exports = {
  apps: [
    {
      name: '3d-callback-server',
      script: '3d-callback-server.js',
      cwd: '/opt/3d-callback-server',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 5001
      },
      error_file: '/var/log/3d-callback-error.log',
      out_file: '/var/log/3d-callback-out.log',
      log_file: '/var/log/3d-callback-combined.log',
      time: true
    }
  ]
}; 