module.exports = {
  apps: [{
    name: 'pay-proxy',
    script: 'server.js',
    cwd: '/root/pay-proxy',  // 修正为实际路径
    instances: 1,
    autorestart: true,
    watch: false,
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: '/var/log/pay-proxy-error.log',
    out_file: '/var/log/pay-proxy-out.log',
    log_file: '/var/log/pay-proxy-combined.log',
    time: true
  }]
};
