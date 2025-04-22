---
title: 'Setting up a server for Rails Applications'
date: '2025-04-21T00:00:00.000Z'
updatedAt: '2025-04-21T00:00:00.000Z'
excerpt: 'Learn how to set up a VPS for Rails applications with this step-by-step guide. From installing Nginx and securing with Let’s Encrypt SSL to configuring Ruby and PostgreSQL, ensure your server is optimized for performance and security.'
github: https://github.com/vespaiach/personal_website/blob/main/docs/discard-after-usages.md
tags: nginx, lets-encrypt, postgresql, ruby
---

After purchasing a VPS for my Rails application, I spent half of day navigating through documentations, troubleshooting, googling, and chatting with AI to get everything configured. Along the way, I wrote down some valuable steps and insights. Hopefully, my note will save time for others, or even for me in the future.

The setup involves four main tasks:

- Install Nginx
- Set Up SSL Certificates with Let's Encrypt
- Install Ruby
- Install and Configure PostgreSQL

**Note**: these were my experiences with Debian 12 VPS

## Installing Nginx

To ensure we use the latest version of Nginx, we can tell APT to retrieve packages from the official source instead of Debian's default repositories:

```bash
# Add Nginx’s official signing key
curl -fsSL https://nginx.org/keys/nginx_signing.key | gpg --dearmor | sudo tee /usr/share/keyrings/nginx-archive-keyring.gpg > /dev/null

# Configure APT to use Nginx’s official package source
echo "deb [signed-by=/usr/share/keyrings/nginx-archive-keyring.gpg] http://nginx.org/packages/debian bookworm nginx" | sudo tee /etc/apt/sources.list.d/nginx.list

```

Next, install Nginx and enable it:

```bash
sudo apt update
sudo apt install nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

Useful Nginx Commands

```bash
nginx -v                # Check Nginx version  
nginx -t                # Validate Nginx configuration  
sudo less /var/log/nginx/access.log  # View access logs  
sudo tail -f /var/log/nginx/error.log  # Follow error logs in real-time  
sudo systemctl restart nginx  # Restart Nginx service  
journalctl -u nginx.service -f  # View logs with journalctl  
```

## Setting Up SSL Certificates (Let's Encrypt)

To secure the application, first, map the domain using A records (@ and www) and update Nginx’s default server block:

```bash
# Verify domain ownership
nslookup example.com

# Set up web directory
sudo mkdir -p /var/www/example.com
echo "Hello World!" | sudo tee /var/www/example.com/index.html > /dev/null
sudo chown -R www-data:www-data /var/www/example.com
sudo chmod -R 755 /var/www/example.com
```

Modify /etc/nginx/conf.d/default.conf

```nginx
server {
    listen 80;
    server_name example.com;

    root /var/www/example.com;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }
}
```

restart nginx

```bash
sudo systemctl restart nginx
```

Install (acme.sh)[https://github.com/acmesh-official/acme.sh] to request Let's Encrypt for certificates. ACME.sh requires cron service which not installed on Debian by default

```bash
sudo apt update
sudo apt install -y cron
sudo systemctl enable cron
sudo systemctl start cron
```

Then install ACME.sh:

```bash
curl https://get.acme.sh | sh
```

Switch to staging evironment first. This is optional step, but I think we should do to avoid rate limits due to wrong configurations. We later can switch back to production if we feel confident about our configuration.

```bash
~/.acme.sh/acme.sh --set-default-ca --server letsencrypt --staging
# switch back to production environment
~/.acme.sh/acme.sh --set-default-ca --server letsencrypt
```

Once ready, issue the SSL certificate:

```bash
~/.acme.sh/acme.sh --issue --keylength ec-256 --ecc -d example.com -d www.example.com --webroot /var/www/example.com --email test@example.com
```

Install the certificate:

```bash
mkdir -p /etc/nginx/ssl # create nginx ssl directory
~/.acme.sh/acme.sh --install-cert -d example.com \
    --key-file /etc/nginx/ssl/example.com.key \
    --fullchain-file /etc/nginx/ssl/example.com.cer \
    --reloadcmd "systemctl reload nginx"
```

**Note**: 
- There are two primary key lengths (RSA, ECC), each with a range of variations. For most use cases, the default key algorithm and length (ec-256) is recommended with acme.sh.
- It's common to issue the cert for both domains (example.com and www.example.com), then configure web server (Nginx) to redirect one to the other. (www.example.com -> example.com)

Modify /etc/nginx/conf.d/default.conf to enable HTTPS and redirects:

```nginx
# update /etc/nginx/conf.d/default.conf
server {
    listen 80;
    server_name example.com www.example.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    http2 on;
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

Enable automatic renewal

```bash
~/.acme.sh/acme.sh --cron
```

Use this command to view installed certificates 

```bash
~/.acme.sh/acme.sh --list
```

## Install Ruby

The simplest way to install Ruby is using rbenv. First, we install dependencies.

```bash
sudo apt update
sudo apt install -y git curl build-essential libssl-dev libreadline-dev zlib1g-dev libyaml-dev libffi-dev libgdbm-dev libncurses5-dev libdb-dev uuid-dev
```

Then install rbenv and ruby-build

```bash
# clone rbenv repository and add script to path
git clone https://github.com/rbenv/rbenv.git ~/.rbenv
echo 'export PATH="$HOME/.rbenv/bin:$PATH"' >> ~/.bashrc
echo 'eval "$(rbenv init - bash)"' >> ~/.bashrc
exec "$SHELL"

# install ruby-build as plugins of rbenv
git clone https://github.com/rbenv/ruby-build.git ~/.rbenv/plugins/ruby-build
```

Install Ruby

```bash
rbenv install 3.4.3
rbenv global 3.4.3
ruby -v
```

**Note**: if we install rbenv from Debian's default repositories, Ruby will also be installed along with rbenv, but usually old version.

## Setting Up PostgreSQL

To install PostgreSQL, ensure APT fetches packages from the official PostgreSQL repository:

```bash
# tell apt to install postgres from offical repository 
sudo apt install -y curl ca-certificates gnupg
curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo gpg --dearmor -o /usr/share/keyrings/postgresql.gpg
echo "deb [signed-by=/usr/share/keyrings/postgresql.gpg] http://apt.postgresql.org/pub/repos/apt bookworm-pgdg main" | sudo tee /etc/apt/sources.list.d/pgdg.list
```

Install PostgreSQL

```bash
sudo apt update
sudo apt install -y postgresql-16
```

Log in postgresql terminal

```bash
sudo -i -u postgres # login to shell as postgres
psql
```

Create a database and user

```sql
CREATE ROLE rails_app_user WITH LOGIN PASSWORD 'StrongPa$$word123';
CREATE DATABASE rails_app_db;
GRANT ALL PRIVILEGES ON DATABASE rails_app_db TO rails_app_user;
SHOW hba_file; # find location of pg_hba.conf
```

Modify pg_hba.conf to allow local authentication

```systemd
# TYPE  DATABASE        USER            ADDRESS                 METHOD
host    all             all             127.0.0.1/32            md5
host    all             all             ::1/128                 md5
local   all             all                                     md5
```

Restart PostgreSQL for changes to affect

```bash
sudo systemctl restart postgresql
```

Tested connection

```bash
psql -U ails_app_user -d rails_app_db
``` 
