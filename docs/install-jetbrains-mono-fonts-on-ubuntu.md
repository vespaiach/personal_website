---
title: 'Install Jetbrains Mono fonts on Ubuntu'
date: '2022-05-08'

github: https://github.com/vespaiach/personal_website/blob/main/posts/install-jetbrains-mono-fonts-in-ubuntu.md
tags: ubuntu, jetbrains mono
---

Another font option for programmers is Jetbrains Mono. For me, compared to other mono fonts, Jetbrains Mono is clearer and pleasing to the eye. Here are instructions to install it on Ubuntu.
```

Download its zip file, current version is 2.242, please check [Jetbrains's website](https://www.jetbrains.com/lp/mono/) for lasted one:

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