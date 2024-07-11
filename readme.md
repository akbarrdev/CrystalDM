# CrystalDM - Advanced DDoS Mitigation System for GTPS

CrystalDM is an advanced DDoS Mitigation System specifically designed for Growtopia Private Servers (GTPS) using Node.js. Developed by Akbarrdev, this system offers comprehensive logging, multiple security plugins, and server monitoring capabilities.

## Features

- Real-time Protection
- High Performance
- Easy Configuration
- Comprehensive Logging
- Multiple Security Plugins
- Server Monitoring

## Key Components

1. Client Management
2. HTTPS Redirect
3. Geo Ban
4. Auto Blacklist
5. Rate Limiter
6. Web Application Firewall (WAF)
7. IP Reputation Check
8. Adaptive Rate Limiter
9. Under Attack Mode
10. Server Processing
11. Response Handling

## Installation

1. Clone the repository:
```
git clone https://github.com/akbarrdev/CrystalDM.git
```
2. Install the required dependencies:
```
npm install
```
3. Configure the system by editing the `config.json` file with your server details and security settings.
4. Start the system:
```
npm run start
```
5. Access the server monitor by visiting `https://your-server-ip/monitor` in your web browser.


## Configuration

Edit the `config.json` file to customize the system according to your needs. Key configuration options include:

- Server ports (TCP and UDP)
- Security settings (Auto Blacklist, Geo Ban, Rate Limiter, etc.)
- Discord webhook for reporting
- HTTPS settings

## Usage

After starting the server, CrystalDM will automatically protect your GTPS from DDoS attacks. You can monitor the server's performance and view logs through the provided web interface.

## Monitoring

Access the server monitor by navigating to `https://your-server-ip/monitor` in your web browser. This provides real-time statistics on CPU usage, memory usage, response time, and uptime.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

Akbarrdev

## Links

- GitHub Repository: [https://github.com/akbarrdev/CrystalDM](https://github.com/akbarrdev/CrystalDM)
- Documentation: [https://github.com/akbarrdev/CrystalDM/wiki](https://github.com/akbarrdev/CrystalDM/wiki)

## Acknowledgments

- Thanks to all contributors and users of CrystalDM
