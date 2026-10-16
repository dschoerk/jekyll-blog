---
layout: post
title: "Vibe coding an email client"
categories: weekend-projects
---

Last weekend I was looking for something to build after taking a few courses at the [Claude Academy](https://anthropic.skilljar.com/). For quite a while I have been intrigued by the possibility of building modern, efficient desktop applications again, after seeing more and more UI development move to the web over the last decade. [Electron](https://www.electronjs.org/) apps are a good example: they are basically a web browser disguised as a desktop application, so that apps can be built with web technologies. This lowers the barrier to entry, but comes at the cost of performance.

After fighting with [Thunderbird](https://www.thunderbird.net/) that same day, my pet project was born: a desktop email client. Before consulting Claude, I made sure there was a robust tech stack available in the [Rust](https://www.rust-lang.org/) ecosystem. I went with [Slint](https://slint.dev/) for the UI, which, judging by their [showcase](https://slint.dev/showcase), appeared to be performant and to scale from embedded devices all the way to the desktop. There are several IMAP implementations available through [Cargo](https://doc.rust-lang.org/cargo/), such as [imap](https://crates.io/crates/imap) and [async-imap](https://crates.io/crates/async-imap), and I knew that the [Servo](https://servo.org/) browser engine would be capable of rendering HTML-formatted emails.