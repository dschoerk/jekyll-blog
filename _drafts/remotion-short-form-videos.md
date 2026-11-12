---
layout: post
title: "Short-form videos as code with Remotion"
categories: weekend-projects
---

## Editing a reel without a timeline

<!-- TODO: your motivation in a few sentences. Why short-form videos at all? -->

CapCut is the obvious tool for this, and it's capable, but it's also expensive once you want the features that matter. And a reel is mostly a timeline: a few clips, some speed changes, a slow zoom here and there, and text that fades in and out at the right moment. Video editors make you build that by dragging things around with the mouse. I wanted to describe it in code instead, so that a cut is reproducible, the texts live in one file, and changing "fade in a bit later" is a one-line diff.

[Remotion](https://www.remotion.dev/) does exactly that. A video is a React component. Remotion tells the component which frame it's on, the component returns what that frame should look like, and a headless Chrome screenshots every frame and hands them to ffmpeg. Everything you know from the web works: CSS, fonts, gradients, SVG, images. Time is just a number you can do math with.

The code is on GitHub in [dschoerk/social-media-content](https://github.com/dschoerk/social-media-content), one folder per project. The first one is a reel about the start of the ice bath season.

<!-- TODO: embed the finished reel or a GIF of it, e.g. {{ '/assets/videos/ice_bath_reel.mp4' | relative_url }} -->

### One project, three formats
From a single phone video, the `icebath-reel` project produces everything a post needs:

- a **reel**: 1080×1920, 30 fps, 25 seconds
- a **cover** image for the reel, in the same 9:16 format
- a **carousel** of five 1080×1350 slides with tips

Each of these is a Remotion *composition*, registered in one root file. A still image is just a composition that is one frame long, so the cover and the carousel slides reuse the fonts, colors and text styles of the reel:

{% raw %}
```jsx
const Root = () => (
  <>
    <Composition id="IceBathReel" component={IceBathReel} durationInFrames={TOTAL_FRAMES} fps={FPS} width={W} height={H} />
    <Composition id="IceCover" component={IceCover} durationInFrames={1} fps={FPS} width={W} height={H} />
    {[1, 2, 3, 4, 5].map(n => (
      <Composition key={n} id={`IceSlide${n}`} component={IceSlide} defaultProps={{n}} durationInFrames={1} fps={FPS} width={1080} height={1350} />
    ))}
  </>
);
```
{% endraw %}

Rendering is one npm script per output: `remotion render` for the MP4 and `remotion still` for the PNGs.

<!-- TODO: screenshot of the cover and two or three carousel slides side by side -->

### Step 1: cut the footage with ffmpeg
The raw clip is about two minutes of 1080×1920 HEVC/HDR from my phone, and far too long for a reel. Remotion could seek around in it, but it's simpler to do the rough cut up front. `scripts/cut.sh` uses ffmpeg to cut four segments and speed them up differently:

| Segment     | Source        | Speed |
|-------------|---------------|-------|
| Approach    | 2.5–5.0 s     | 1×    |
| Entry       | 5.0–46.8 s    | 8×    |
| In the water| 51.5–95.3 s   | 6×    |
| Exit        | 119–122.5 s   | 1×    |

The segments are re-encoded to H.264 at 30 fps (`setpts=PTS/8` does the speed-up) and concatenated into a single 18.5-second `full.mp4`. The timestamps are stored as markers in `assets.json`. I set them by scrubbing through a small proxy copy of the video.

The original footage isn't in git. It's 312 MB, so it's archived in Google Drive, and `assets.json` links to it. The generated `full.mp4` is in `.gitignore`. Anyone with access to the original can rebuild the cut with `bash scripts/cut.sh /path/to/original.mp4`.

### Step 2: put everything you'd tweak in one file
All the numbers and words live in `src/config.js`: the frame where each segment ends, the camera moves, and every piece of text on screen.

```js
export const SEG = {hookEnd: 75, entryEnd: 232, waterEnd: 451, exitEnd: 556};
export const TOTAL_FRAMES = 750;                   // 25 s incl. tips + CTA

export const TEXT = {
  hook: ["Season's back.", 'Start now.'],
  breathe: 'Breathe out.',
  timerLabel: 'in the water',
  takeaway: ['First 30 s are the worst.', "Then it's quiet."],
  // ...
};
```

The components only read from it. Shortening the hook or rewording a caption never means touching the animation code.

### Step 3: a virtual camera
The whole reel is one static shot from a phone on a tripod. To make it feel less static, every segment gets a digital camera move: a pull-out for the hook, a slow push-in during the entry, a drift while in the water. A move is described by a scale `s` and the source pixel `(cx, cy)` that should sit in the center of the frame, each as a `[from, to]` pair:

```js
export const CAMERA = {
  hook:  {s: [2.4, 1.0], cx: [569, 540], cy: [560, 960]},   // close pull-out
  entry: {s: [1.0, 1.55], cx: [540, 585], cy: [960, 720]},  // wide push-in
  water: {s: [1.9, 2.3], cx: [570, 630], cy: [800, 800]},   // medium drift
  exit:  {s: [1.2, 1.2], cx: [560, 560], cy: [900, 900]},   // wide
};
```

For the current frame, Remotion's `interpolate` with a cubic ease turns these pairs into concrete values. The center point is then clamped, so that the zoomed-in image always covers the whole frame and never shows an edge, and the result becomes a CSS transform on the video:

{% raw %}
```jsx
const {s, cx, cy} = camera(frame);
const x = Math.min(Math.max(cx, W / 2 / s), W - W / 2 / s);
const y = Math.min(Math.max(cy, H / 2 / s), H - H / 2 / s);

<OffthreadVideo src={staticFile('video/full.mp4')} muted
  style={{transformOrigin: '0 0',
    transform: `translate(${W / 2 - x * s}px,${H / 2 - y * s}px) scale(${s})`}} />
```
{% endraw %}

The trade-off: zooming into a 1080×1920 frame by 2.4× means upscaling, so the close-ups are a bit soft. For a phone screen that's acceptable.

<!-- TODO: before/after frame of the virtual camera (full frame vs. hook close-up) -->

### Step 4: text that knows what time it is
Text overlays are plain absolutely positioned `div`s. Their opacity is a function of the frame number. A tiny helper fades a text in over 8 frames, holds it and fades it out again:

```js
const fade = (f, a, b) => interpolate(f, [a, a + 8, b - 8, b], [0, 1, 1, 0], cl);
```

My favorite detail is the timer in the corner while I'm in the water. The footage runs at 6× speed there, so the clock on screen can't simply count frames. Instead it maps the frames of that segment back to the real elapsed seconds in the water, so it counts up much faster than the video plays but shows the actual time I spent in there.

<!-- TODO: anything you'd add about the timer, e.g. how long you actually stayed in -->

After the footage ends at 18.5 seconds, the video fades to a blue gradient for the tips and the call to action. Since this is all just React, that's a conditional: `frame < FOOTAGE_FRAMES` renders the video, otherwise the background.

### Step 5: fonts
The fonts (Fraunces for headlines, Inter for body text) are bundled as `woff2` files. Remotion renders frames in parallel in a headless browser, so it must not take a screenshot before the fonts are loaded. `delayRender()` blocks rendering until `continueRender()` is called:

```js
const handle = delayRender();
Promise.all([
  new FontFace('Fraunces', `url(${staticFile('fonts/fraunces-700.woff2')})`, {weight: '700'}).load(),
  new FontFace('Inter', `url(${staticFile('fonts/inter-600.woff2')})`, {weight: '600'}).load(),
]).then(fs => { fs.forEach(f => document.fonts.add(f)); continueRender(handle); });
```

### Three vocabularies for the same thing
Working on this, I kept noticing that content creators, video producers and computer vision engineers talk about the same operations with completely different words. A creator taps "remove background" in an app. A video editor calls it rotoscoping and used to do it by hand, frame by frame. A computer vision engineer calls it video object segmentation, or matting if the edges should be soft, like hair. It's the same pixels in the end.

| Content creator            | Video producer               | Computer vision engineer                       |
|----------------------------|------------------------------|------------------------------------------------|
| Remove background, cutout  | Rotoscoping, masking         | Image / video segmentation, matting            |
| Green screen               | Chroma key                   | Color-based segmentation (thresholding)        |
| Zoom effect, punch-in      | Reframing, Ken Burns, pan & scan | Crop and affine transform                  |
| Smooth zoom                | Keyframes with ease in/out   | Interpolation with easing curves               |
| Speed up, time-lapse       | Speed ramp, retiming         | Temporal resampling                            |
| Smooth slow-mo             | Optical flow retiming        | Frame interpolation                            |
| Sticker that follows you   | Motion tracking              | Object tracking                                |
| Fix shaky video            | Stabilization                | Camera motion estimation and warping           |
| Enhance, HD                | Upscaling                    | Super-resolution                               |
| Filter                     | Color grading, LUT           | Color space transform, lookup table            |
| Auto captions              | Subtitles, transcription     | Speech recognition with word-level alignment   |
| Cut the silences           | Jump cuts                    | Voice activity detection                       |
| Pick a cover               | Thumbnail, poster frame      | Keyframe selection                             |

The virtual camera from step 3 is a good example. On Instagram it's a "zoom effect", in an editor it's a keyframed reframe, and in the code it's a scale and a translation in a CSS transform. The soft close-ups are what an engineer would call upsampling artifacts, and the fix would be super-resolution. Most of the "AI" features in editing apps are classic computer vision tasks with a friendlier name, and once you know the engineering term, you usually find an open model or library for it.

<!-- TODO: any terms you'd add from your own background, or one you'd like to try next in this pipeline (e.g. segmentation with SAM for a cutout effect) -->

### What's not automated (yet)
- **Music.** The footage is silent, and I add music in the Instagram app when uploading, so I can pick from its library.
- **The edit decisions.** The markers and camera moves are still chosen by hand. Code makes them easy to change and reproduce, but somebody still has to watch the footage.

<!-- TODO: your takeaways. How long did this take compared to editing in an app? Would you do the next video the same way? How did the reel perform? -->
<!-- TODO: if you used Claude Code / AI assistance to write the Remotion code, a paragraph on that workflow -->

The project is on [GitHub](https://github.com/dschoerk/social-media-content). New videos get their own folder next to `icebath-reel`.
