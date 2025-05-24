---
title: 'Set Up a Home DNS Server on MacBook'
date: '2025-05-23T00:00:00.000Z'
updatedAt: '2025-05-23T00:00:00.000Z'
excerpt: 'In this tutorial, I will walk you through the steps to set up a DNS server on a MacBook using DNSMASQ - a lightweight and easy-to-configure DNS tool.'
github: https://github.com/vespaiach/personal_website/blob/main/docs/setup-a-home-dns-server-on-macbook.md
tags: dns, dnsmasq
---

## Introduction

Setting up your own DNS server grants greater control over your local network. Imagine hosting a home web server to share content within your private network—having a DNS server makes this easier. Additionally, it can improve browsing speed.

In my case, I use a local DNS server for web development. When testing websites on different devices, I can use my DNS server to point the domain back to my local computer, making the site accessible through the local network.

## How DNSMASQ Works

DNSMASQ acts as an intermediary between your device and the internet, intercepting DNS requests. If the request matches a predefined local name, DNSMASQ resolves it; otherwise, it forwards the query to an upstream DNS (such as Google's 8.8.8.8) and caches the result for faster future lookups.

## Installing DNSMASQ on Mac

To install DNSMASQ using Homebrew, run:

```bash
brew install dnsmasq

# Then check the installation location:
brew info dnsmasq
```

## Config DNSMASQ

Three key configurations to consider:

- Listening IP Addresses: Specifies where DNSMASQ should accept DNS queries.
- Upstream DNS Servers: Defines which external DNS services DNSMASQ should forward unresolved queries to.
- Static DNS Records: Maps domain names to specific IP addresses.

Find the dnsmasq.conf file location using:

```
brew info dnsmasq
```

Then update the configuration file (dnsmasq.conf) to set your Mac’s IP address for listening:

```
# Bind DNSMASQ to your local network interface
listen-address=your_mac_static_ip
```

Ensure your Mac has a static IP by configuring your router.

Specify the upstream DNS servers:

```
server=8.8.8.8       # Google DNS
server=1.1.1.1       # Cloudflare DNS
server=9.9.9.9       # Quad9 DNS
```

Optionally, prevent DNSMASQ from reading /etc/resolv.conf by adding:

```
no-resolv
```

Map your custom domain to a local IP address:

```
address=/mydomain.local/your_local_ip_address
```

## Creating a Launchd Service

Since DNSMASQ listens on port 53, root permissions are required. Homebrew services do not run as root by default, so the recommended method is to use sudo with launchd.

First, create a service plist file at /Library/LaunchDaemons/homebrew.dnsmasq.plist:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
    "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <dict>
    <key>Label</key>
    <string>homebrew.dnsmasq</string>
    <key>ProgramArguments</key>
    <array>
      <string>/usr/local/opt/dnsmasq/sbin/dnsmasq</string>
      <string>--keep-in-foreground</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardErrorPath</key>
    <string>/var/log/dnsmasq.err.log</string>
    <key>StandardOutPath</key>
    <string>/var/log/dnsmasq.out.log</string>
  </dict>
</plist>
```

Ensure the correct path to DNSMASQ in your system (/usr/local/opt/dnsmasq/sbin/dnsmasq in this example).

Then, set the appropriate permissions:

```bash
sudo chown root:wheel /Library/LaunchDaemons/homebrew.dnsmasq.plist
sudo chmod 644 /Library/LaunchDaemons/homebrew.dnsmasq.plist
```

## Loading the Service

Once configured, load the service so DNSMASQ starts with root privileges and runs automatically on reboot:

```bash
# Load service
sudo launchctl load -w /Library/LaunchDaemons/homebrew.dnsmasq.plist

# To stop the service:
sudo launchctl unload /Library/LaunchDaemons/homebrew.dnsmasq.plist
```

To verify if DNSMASQ is running on port 53, use:

```bash
sudo lsof -i :53

# Expected output example:
# dnsmasq   PID   ... UDP your_computer_IP_address:53
```

## Configuring the Mac Firewall

If you prefer not to configure the firewall manually, you can disable it entirely. However, it’s recommended to keep it enabled for security.

To check if the firewall is enabled:

```bash
/usr/libexec/ApplicationFirewall/socketfilterfw --getglobalstate

# Expected output:
# Firewall is enabled. (State = 1)
```

If the firewall is off, enable it:

```bash
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --setglobalstate on
```

Allow DNSMASQ through the firewall:

```bash
# Ensure the path matches your installation
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --add /opt/homebrew/sbin/dnsmasq
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --unblockapp /opt/homebrew/sbin/dnsmasq
```

Firewall stealth mode makes Mac ignores incoming connection attempts silently. To allow incoming DNS requests, disable stealth mode:

```bash
sudo defaults write /Library/Preferences/com.apple.alf stealthenabled -bool false
sudo pkill -HUP socketfilterfw
```

Verify that DNSMASQ is on the firewall’s allow list:

```bash
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --listapps
```

Check that DNSMASQ is listening on port 53:

```bash
sudo lsof -nP -iUDP:53 -iTCP:53
```

## Configuring Other Devices to Use Your DNS Server

There are two ways to configure other devices:

1. Manually set the DNS server in the network settings of each device.
2. Configure your router to point to your Mac’s DNSMASQ instance as the primary DNS server.

## Debug Checklist

1. Confirm your Mac is listening on port 53 over the LAN

```bash
sudo lsof -iUDP:53 -iTCP:53
```

Expected output:

```bash
dnsmasq   1234 nobody   ... UDP 192.168.1.100:53
dnsmasq   1234 nobody   ... TCP 192.168.1.100:53
```

If missing, verify your dnsmasq.conf contains:

```
listen-address=192.168.1.100
```

Restart DNSMASQ:

```bash
sudo launchctl unload /Library/LaunchDaemons/homebrew.dnsmasq.plist
sudo launchctl load -w /Library/LaunchDaemons/homebrew.dnsmasq.plist
```

2. Ping your Mac from another device:

```
ping 192.168.4.100
```

3. Test DNS resolution from another device

Make sure your dnsmasq.conf has a line:

```
address=/mylocal.test/192.168.1.30
```

Then from another computer run:

```bash
dig mylocal.test @192.168.1.100
# Update 192.168.1.100 yours DNS server
```

4. Check firewall logs to ensure DNS packets aren’t blocked. Temporarily disable the firewall for testing:

```bash
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --setglobalstate off
```

5. Run DNSMASQ in foreground to monitor queries:

```bash
sudo /usr/local/opt/dnsmasq/sbin/dnsmasq --no-daemon --log-queries
# ensure the path to your dnsmasq correct
```

## Recap

Here’s a summary of the steps to set up a DNS server on your Mac:

- Install DNSMASQ.
- Create a Launchd service to run DNSMASQ with root privileges.
- Configure DNSMASQ to listen on port 53.
- Ensure the Mac firewall allows incoming DNS requests.
- Configure devices to use the DNS server.
- Test and debug