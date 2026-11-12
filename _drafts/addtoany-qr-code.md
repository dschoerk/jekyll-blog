---
layout: post
title: "AddToAny Browser Extension with QR Code Integration"
date:   2025-08-25 09:00:00 +0000
categories: software
---

AddToAny is a browser extension designed to make link sharing fast and convenient. It adds a share button to your browser, giving you quick access to many platforms, including email, social media, and messaging apps ([full list here](https://www.addtoany.com/share/preferences)). The extension supports a wide range of services, and new ones can be added manually if needed.

One area where AddToAny could be even more useful is in desktop-to-mobile sharing. Often, you might come across something on your PC and want to open it quickly on your phone. Currently, AddToAny doesn’t have this built-in, but it can be achieved using a QR code generator. The idea is simple: share the webpage as a QR code, display it on your PC screen, and scan it with your phone.

To set this up, create a new **Custom Service** in the AddToAny settings. For the **URI Scheme**, use the following:

```
https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${link}
```

This sends the link to a QR code web service, which generates an image containing the URL. Scanning the QR code with your smartphone instantly opens the link, making desktop-to-mobile sharing quick and seamless.
