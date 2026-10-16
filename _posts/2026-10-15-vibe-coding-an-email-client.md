---
layout: post
title: "Vibe coding an email client"
date: 2026-10-15
categories: weekend-projects
screenshots:
  - src: /assets/images/mailclient/android-conversation.png
    alt: "Android: threaded conversation"
  - src: /assets/images/mailclient/android-html.png
    alt: "Android: HTML email"
  - src: /assets/images/mailclient/android-invitation.png
    alt: "Android: calendar invitation"
  - src: /assets/images/mailclient/android-compose.png
    alt: "Android: composing a message"
  - src: /assets/images/mailclient/desktop-inbox.png
    alt: "Desktop: inbox"
  - src: /assets/images/mailclient/desktop-conversation.png
    alt: "Desktop: threaded conversation"
  - src: /assets/images/mailclient/desktop-html.png
    alt: "Desktop: HTML newsletter with remote images blocked"
  - src: /assets/images/mailclient/desktop-invitation.png
    alt: "Desktop: calendar invitation"
  - src: /assets/images/mailclient/desktop-calendar.png
    alt: "Desktop: calendar week view"
  - src: /assets/images/mailclient/desktop-compose.png
    alt: "Desktop: composing a message"
  - src: /assets/images/mailclient/android-inbox.png
    alt: "Android: inbox"
---

Last weekend I was looking for something to build after taking a few courses at the [Claude Academy](https://anthropic.skilljar.com/). For quite a while I have been intrigued by the possibility of building modern, efficient desktop applications again, after seeing more and more UI development move to the web over the last decade. [Electron](https://www.electronjs.org/) apps are a good example: they are basically a web browser disguised as a desktop application, so that apps can be built with web technologies. This lowers the barrier to entry, but comes at the cost of performance.

After fighting with [Thunderbird](https://www.thunderbird.net/) that same day, my pet project was born: a desktop email client. Before consulting Claude, I made sure there was a robust tech stack available in the [Rust](https://www.rust-lang.org/) ecosystem. I went with [Slint](https://slint.dev/) for the UI, which, judging by their [showcase](https://slint.dev/showcase), appeared to be performant and to scale from embedded devices all the way to the desktop. There are several IMAP implementations available through [Cargo](https://doc.rust-lang.org/cargo/), such as [imap](https://crates.io/crates/imap) and [async-imap](https://crates.io/crates/async-imap), and I knew that the [Servo](https://servo.org/) browser engine would be capable of rendering HTML-formatted emails.

Claude started building the first prototype, and together we worked out a strategy for testing the application. Slint turned out to have an extremely useful feature for agentic UI development: it ships with an [MCP server](https://github.com/slint-ui/slint/blob/master/docs/development/mcp-server.md) to automate and control the UI layer. We paired this with a local email server (Greenlight) running in Docker to write automated tests that send emails between two accounts. Later I added test accounts with the providers Gmail, Hotmail and GMX, because each of them interprets the IMAP protocol a little differently. Yuck.

Since Slint also runs on Android, why not build an Android email client at the same time? So here it is: the current state of my email client, with the creative name [mailclient](https://github.com/dschoerk/mailclient). My favorite feature so far is the "Find similar" button that shows up after archiving or deleting an email with a swipe. It lets you quickly get rid of lots of emails from the same sender. Below are some screenshots of the UI.

{% include gallery.html images=page.screenshots %}

