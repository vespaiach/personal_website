---
title: 'Install Jetbrains Mono fonts on Ubuntu'
date: '2022-05-08'
excerpt: 'Another font option for programmers is Jetbrains Mono. For me, compared to other mono fonts, Jetbrains Mono is clearer and pleasing to the eye. Here are instructions to install it on Ubuntu.'
github: https://github.com/vespaiach/personal_website/blob/main/docs/install-jetbrains-mono-fonts-on-ubuntu.md
tags: ubuntu, jetbrains mono
---

Download font zip file, current version is 2.242, please check [Jetbrains's website](https://www.jetbrains.com/lp/mono/) for lastest one:

```bash
curl -L -o JetBraninsMono-2.242.zip https://download.jetbrains.com/fonts/JetBrainsMono-2.242.zip
```

Unzip downloaded file:

```bash
unzip ./JetBraninsMono-2.242.zip -d ~/jetbrains-fonts
```

Copy fonts to local share directory:

```bash
cp ./jetbrains-fonts/fonts/ttf/JetBrainsMono-*.ttf ~/.local/share/fonts
rm -rf ./jetbrains-fonts
```
Copy fonts to local share directory:

```bash
cp ./jetbrains-fonts/fonts/ttf/JetBrainsMono-*.ttf ~/.local/share/fonts
rm -rf ./jetbrains-fonts

# Or install it on system-wide, you will need sudo permission to do that

sudo cp ./jetbrains-fonts/fonts/ttf/JetBrainsMono-*.ttf /usr/local/share/fonts
rm -rf ./jetbrains-fonts
```
