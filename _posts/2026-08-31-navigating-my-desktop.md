---
layout: post
title:  "Navigating my desktop"
date:   2026-08-31 12:00:00 +0000
categories: jekyll update
---

## How I use my desktop environment

Due to my job and interests I mostly sit at a Computer all day long, hence why I try do so as efficiently as possible. What helps me with that are configurable desktop environments (and less Windows bloat). 

![My desktop journey: Windows with its taskbar, Ubuntu Unity with its launcher, KDE Plasma with its panel, and Hyprland with tiled windows]({{ '/assets/images/desktop/desktop-evolution.webp' | relative_url }})

Several (like 3) yrs ago I completely made the switch from Windows to Linux at my home computer, where I mostly tinker with Software, experiment with Machine Learning or simply play some games. While I dual booted Linux and Windows for about 10 yrs already, I haven't touched Windows for now in a very long time. This almost sounds like breaking an addiction or ending an abusive relationship. Expensive licenses, forcing the use of online accounts, force the Edge browser on users, force Onedrive on users, broken and duplicated System control settings and a couple more things have made the decision easy for me. Besides these negatives I also want to highlight that Microsoft has developed my favorite Code Editor VS Code, integrated a native OpenSSH client/server into Windows and continuously improved WSL. However, why use WSL when we can use Linux directly. Admittedly, my Laptop still has a dual boot Linux+Windows because I use it for conference presentations. Old habits die hard and unfortunately that thing always has been reliable. 

### Exploring desktop environments
I went through several Linux distros by now that I've installed sometimes on my Desktop, Laptop or VPS. Because the learning curve is steep and support is great, I've used Ubuntu and Unity for the longest time. While I much prefer working on the Terminal and coding on Linux systems, the Desktop environment always felt like a downgrade. In that sense, Unity has always been a less functional Windows desktop to me. To some degree this is necessary, if new users must read a manual to use it - nobody will adopt it - except for power users. My next stop was at KDE but it still didn't feel right either until I discovered Krohnkite.  

### Tiling window managers
~~Kronkite~~, ~~Kronkithe~~, Krohnkite is a tiling window manager. Instead of (micro-) managing the position and size of each window yourself, the tiling window manager automatically assigns space to the opened windows according to a selected layout. A whole new world. Krohnkite is a Kwin script, it's just a little script one can activate on top of KDE and it helped me to avoid loosing track of the third terminal window behind the browser.

Currently I'm tipping my toes into using Hyprland and it helped me significantly to avoid touching my mouse. I've configured it with all kinds of keyboard shortcuts (with the help of tutorials and Claude Code). Why I was immediately sold to Hyprland after using Krohnkite was that there is a very clear highlighting of the active window. (super + cursor keys) lets me navigate my focus to other windows relative to the current one. There is also no concept of the window state minimized like in a conventional desktop, but we can move windows to an unseen workspace. Technically, we can maximize a window to fullscreen, but until now I never felt the need to regularly switch between maximized and windowed states. 

The keyboard shortcuts I need to remember for now:

| Keys | Action |
|---|---|
| **Windows** | |
| <kbd class="mod-super">Super</kbd> + <span class="key-group"><kbd>←</kbd><kbd>↓</kbd><kbd>↑</kbd><kbd>→</kbd></span> or <span class="key-group"><kbd>H</kbd><kbd>J</kbd><kbd>K</kbd><kbd>L</kbd></span> | Move focus to the neighbouring window |
| <kbd class="mod-super">Super</kbd> + <kbd class="mod-shift">Shift</kbd> + <span class="key-group"><kbd>←</kbd><kbd>↓</kbd><kbd>↑</kbd><kbd>→</kbd></span> or <span class="key-group"><kbd>H</kbd><kbd>J</kbd><kbd>K</kbd><kbd>L</kbd></span> | Move the focused window |
| <kbd class="mod-super">Super</kbd> + <kbd>C</kbd> | Close the focused window |
| <kbd class="mod-super">Super</kbd> + <kbd>V</kbd> | Toggle floating |
| **Workspaces** | |
| <kbd class="mod-super">Super</kbd> + <span class="key-group"><kbd>1</kbd>–<kbd>0</kbd></span> | Go to workspace 1–10 (press again to cycle through its windows) |
| <kbd class="mod-super">Super</kbd> + <kbd class="mod-shift">Shift</kbd> + <span class="key-group"><kbd>1</kbd>–<kbd>0</kbd></span> | Move the focused window to workspace 1–10 |
| <kbd class="mod-super">Super</kbd> + <kbd class="mod-ctrl">Ctrl</kbd> + <span class="key-group"><kbd>←</kbd> / <kbd>→</kbd></span> | Previous / next workspace |
| <kbd class="mod-super">Super</kbd> + <kbd>S</kbd> | Show or hide the special workspace, my unseen workspace for parked windows |
| <kbd class="mod-super">Super</kbd> + <kbd class="mod-shift">Shift</kbd> + <kbd>S</kbd> | Move the focused window to the special workspace |
| **Layouts** | |
| <kbd class="mod-super">Super</kbd> + <kbd>T</kbd> | Toggle the split direction |
| <kbd class="mod-super">Super</kbd> + <kbd class="mod-shift">Shift</kbd> + <kbd>T</kbd> | Cycle layouts: dwindle → master → scrolling |
| **Apps** | |
| <kbd class="mod-super">Super</kbd> + <kbd>R</kbd> | Open the launcher |
| <kbd class="mod-super">Super</kbd> + <kbd>Q</kbd> | Terminal (kitty) |
| <kbd class="mod-super">Super</kbd> + <kbd>E</kbd> | File manager (Dolphin) |
| <kbd class="mod-super">Super</kbd> + <span class="key-group"><kbd>F1</kbd>–<kbd>F4</kbd></span> | Jump to Firefox, VS Code, kitty or Thunderbird, or launch it if it isn't running |
| <kbd class="mod-super">Super</kbd> + <kbd class="mod-shift">Shift</kbd> + <span class="key-group"><kbd>F1</kbd>–<kbd>F4</kbd></span> | Assign the focused app to that slot |
| <kbd class="mod-super">Super</kbd> + <kbd>ß</kbd> | Cheat sheet with all bindings (the <kbd>?</kbd> key on a German keyboard) |
{: .shortcuts}

The full list and the config itself are on GitHub: [dschoerk/Hyprland-Desktop](https://github.com/dschoerk/Hyprland-Desktop).

This style of navigating around the desktop feels very natural. I wonder if my favorite editor VS Code will be next... 
