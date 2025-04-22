---
title: 'Setting Up a VPS for Rails Applications'
date: '2025-04-21T00:00:00.000Z'
updatedAt: '2025-04-21T00:00:00.000Z'
excerpt: 'Setting up a server is not something we do every day, and it is easy to forget important steps and tricks along the way. Typically, we configure a VPS once and let it run smoothly for a while. In this post, I’m documenting the essential steps to prepare a VPS for a Rails application.'
github: https://github.com/vespaiach/personal_website/blob/main/docs/discard-after-usages.md
tags: javascript
---

Today, I purchased a VPS for my Rails application and spent half the day researching, googling, and chatting with AI to get everything set up. Along the way, I gathered some useful steps and tricks. Hopefully, this post will save time for someone else, or even for me in the future.

Here are basic steps:
- Install Nginx
- Install SSL Certificate (with Let's Encrypt)
- Install Ruby/Node
- Install and config PostgresQL
- Download source code and config Nginx

**Note**: these were my experiences with Debian 12 VPS

## Nginx

To get the latest version of nginx, I told the package manager (APT) to look for Nginx packages from the official source, not Debian's defaults

```bash
# Hey APT! trust the packages downloaded from NGINX.org.

curl -fsSL https://nginx.org/keys/nginx_signing.key | gpg --dearmor | sudo tee /usr/share/keyrings/nginx-archive-keyring.gpg > /dev/null

# And please find nginx packages from offical source

echo "deb [signed-by=/usr/share/keyrings/nginx-archive-keyring.gpg] http://nginx.org/packages/debian bookworm nginx" | sudo tee /etc/apt/sources.list.d/nginx.list
```

Then, installed it

```bash
sudo apt update
sudo apt install nginx
```

Finally, started and enabled it

```bash
sudo systemctl enable nginx
sudo systemctl start nginx
```

Some usefull commands with Nginx

```bash
# check nginx version
nginx -v

# check nginx config
nginx -t

# view nginx access logs
sudo less /var/log/nginx/access.log

# view nginx error logs
sudo less /var/log/nginx/error.log

# follow nginx error logs to view in realtime
sudo tail -f /var/log/nginx/error.log

# view nginx status in system.d
systemctl status nginx

# stop nginx service
sudo systemctl stop nginx

# restart nginx service
sudo systemctl restart ngin

# view Nginx logs using journalctl, -f option to follow the logs in real-time, similar to tail -f
journalctl -u nginx.service -f
```

## Install SSL Certificate (Let's Encrypt)

I created two A records @ and www to map my domain to the service IP, then update Nginx default server block to serve my domain



```bash
# check domain ownership
nslookup example.com

# create the directory if it doesn't exist and add an index.html file
sudo mkdir -p /var/www/example.com
echo "Hello World!" | sudo tee /var/www/example.com/index.html > /dev/null

# change ownership of the directory to www-data
sudo chown -R www-data:www-data /var/www/example.com

# ensure that the permissions are set correctly (readable by www-data)
sudo chmod -R 755 /var/www/example.com

# update /etc/nginx/conf.d/default.conf
server {
    listen 80;
    server_name example.com;

    root /var/www/example.com;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }
}

# restart nginx
sudo systemctl restart nginx
```

Cron service was not installed on my Debian by default, so I installed it (Cron was required before installation of acme.sh)

```bash
# install from debian repository
sudo apt update
sudo apt install -y cron

# enable and start cron service
sudo systemctl enable cron
sudo systemctl start cron

# verify the cron service is active
sudo systemctl status cron
```

Now I stared to insttall ACME.sh, a lightweight and simple script to obtain SSL certificates from Let's Encrypt.

```bash
# install ACME.sh, it will be installed under home directory ~/.acme.sh
curl https://get.acme.sh | sh
```

I failed to request Let's Encrypt to issue my certs and hit its rate limits. So I had to wait for 24 hours before continueing to setup. Then I figured out that I should try with staging enviroment which has very high limits.

```bash
# switch to staging environment with high limits
~/.acme.sh/acme.sh --set-default-ca --server letsencrypt --staging

# switch back to production environment
~/.acme.sh/acme.sh --set-default-ca --server letsencrypt
```

Issued SSL Certificates. 

**Note**: 
- There are two primary key lengths (RSA, ECC), each with a range of variations. For most use cases, the default key algorithm and length (ec-256) is recommended with acme.sh.
- It's common to issue the cert for both domains (example.com and www.example.com), then configure web server (Nginx) to redirect one to the other. (www.example.com -> example.com)

```bash
# Issue the SSL certificate
~/.acme.sh/acme.sh --issue --keylength ec-256 --ecc -d example.com -d www.example.com --webroot /var/www/example.com --email test@example.com

# see all certificates managed by ACME.sh
~/.acme.sh/acme.sh --list
```

Installed the certificate

```bash
# create nginx ssl directory
mkdir -p /etc/nginx/ssl

# install the cert to Nginx
~/.acme.sh/acme.sh --install-cert -d example.com \
--key-file       /etc/nginx/ssl/example.com.key \
--fullchain-file /etc/nginx/ssl/example.com.cer \
--reloadcmd     "systemctl reload nginx"
```

Added SSL configuration to the server block, and redirected trafic from http to https and www.example.com to example.com

```bash
# update /etc/nginx/conf.d/default.conf
server {
    listen 80;
    server_name example.com www.example.com;

    # Redirect all HTTP requests to HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    http2 on; # this is optional
    server_name www.example.com;

    # Redirect all HTTPS requests for www.example.com to example.com
    return 301 https://example.com$request_uri;

    ssl_certificate /etc/nginx/ssl/example.com.cer;
    ssl_certificate_key /etc/nginx/ssl/example.com.key;
}

server {
    listen 443 ssl;
    http2 on; # this is optional
    server_name example.com;

    ssl_certificate /etc/nginx/ssl/example.com.cer;
    ssl_certificate_key /etc/nginx/ssl/example.com.key;

    root /var/www/example.com;
    index index.html index.htm;

    location / {
        try_files $uri $uri/ =404;
    }
}
```

Told acme.sh to set up cron jobs for auto-renewal.

```bash
~/.acme.sh/acme.sh --cron
```

