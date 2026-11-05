---
layout: post
title:  "Navigating my desktop"
date:   2026-08-31 12:00:00 +0000
categories: jekyll update
---

## How I use my desktop environment

Due to my job and interests I sit at a computer most of the day, which is why I try to do so as efficiently as possible. What helps me with that are configurable desktop environments (and less Windows bloat).

![My desktop journey: Windows with its taskbar, Ubuntu Unity with its launcher, KDE Plasma with its panel, and Hyprland with tiled windows]({{ '/assets/images/desktop/desktop-evolution.webp' | relative_url }})

About three years ago I completely switched from Windows to Linux on my home computer, where I mostly tinker with software, experiment with machine learning or simply play some games. I had dual-booted Linux and Windows for about ten years before that, but by now I haven't touched Windows in a very long time. This almost sounds like breaking an addiction or ending an abusive relationship. Expensive licenses, mandatory online accounts, Edge and OneDrive being forced on users, broken and duplicated system settings and a couple more things made the decision easy for me.

Besides these negatives, I also want to highlight that Microsoft developed my favorite code editor, VS Code, integrated a native OpenSSH client and server into Windows and keeps improving WSL. But why use WSL when we can use Linux directly? Admittedly, my laptop still dual-boots Linux and Windows because I use it for conference presentations. Old habits die hard, and unfortunately that setup has always been reliable.

### Exploring desktop environments
By now I've gone through several Linux distros on my desktop, laptop or VPS. Because the learning curve is gentle and support is great, I used Ubuntu and Unity for the longest time. While I much prefer working in the terminal and coding on Linux systems, the desktop environment always felt like a downgrade. In that sense, Unity was always a less functional Windows desktop to me. To some degree this is necessary: if new users have to read a manual first, nobody except power users will adopt it. My next stop was KDE, but it didn't feel right either until I discovered Krohnkite.

### Tiling window managers
~~Kronkite~~, ~~Kronkithe~~, Krohnkite is a tiling window manager. Instead of (micro-)managing the position and size of each window yourself, you let the tiling window manager assign space to the open windows according to a selected layout. A whole new world. Krohnkite is a KWin script, just a little script you can activate on top of KDE, and it helped me stop losing track of the third terminal window behind the browser.

Currently I'm dipping my toes into Hyprland, and it has helped me significantly to avoid touching my mouse. I've configured it with all kinds of keyboard shortcuts (with the help of tutorials and Claude Code). What immediately sold me on Hyprland after using Krohnkite was the very clear highlighting of the active window. <kbd class="mod-super">Super</kbd> + arrow keys lets me move my focus to other windows relative to the current one. There is also no concept of a minimized window like in a conventional desktop, but we can move windows to an unseen workspace. Technically, we can maximize a window to fullscreen, but so far I've never felt the need to regularly switch between maximized and windowed states.

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

This style of navigating around the desktop feels very natural. I wonder if my favorite editor, VS Code, will be next...
