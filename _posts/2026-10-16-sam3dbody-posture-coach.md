---
layout: post
title: "A posture coach with SAM 3D Body"
date:   2026-10-16 09:00:00 +0000
categories: weekend-projects machine-learning
---

## Sit up straight, says the GPU

When your back starts to hurt after a whole day at the desk, you know you should be sitting upright. The problem is remembering to do it. After a few minutes of focus I'm leaning towards the screen again.

[SAM 3D Body](https://github.com/facebookresearch/sam-3d-body) from Meta is a monocular pose estimation model: from a single video frame it estimates the 3D positions of body landmarks, and even a full body mesh. This weekend project is a technical demo built on top of it. It takes webcam input, estimates my pose on the GPU, shows the 3D skeleton and measures the angle of my spine. If I lean forward too far, an alarm goes off to get me to sit up straight again.

Besides the posture use case, I simply wanted to know how good the output looks on my own footage, and how close to real-time it runs on my home GPU (an RTX 4080 Super).

![Webcam demo showing person detection, lean angle overlay and 3D skeleton]({{ '/assets/images/sam3dbody-webcam.png' | relative_url }})

<!-- TODO: a sentence or two on your first impression of the mesh quality -->

### What happens inside a frame
SAM 3D Body is a top-down model: it doesn't look at the whole image but at one crop per detected person. Its output is not a skeleton but the parameters of the [Momentum Human Rig](https://github.com/facebookresearch/MHR) (MHR), a parametric body model that separates skeletal pose from surface shape. From these parameters the pipeline derives the mesh vertices and 70 3D keypoints (body, feet, hands and a few face points). The upstream `process_one_image` call runs these stages per frame:

1. **Person detection.** A detector produces bounding boxes. The default is ViTDet, a Cascade Mask R-CNN with a ViT-H backbone, running at 1024 px input resolution.
2. **Camera intrinsics.** [MoGe-2](https://github.com/microsoft/MoGe), a monocular geometry model, estimates the field of view and with it the camera intrinsics. Without it, the pipeline falls back to a default FOV.
3. **Body pass.** The person crop is affine-transformed to the model's input size and encoded by a DINOv3 ViT-H backbone. The intrinsics enter the backbone as a per-pixel ray embedding, so the network knows the viewing direction of each patch. A promptable transformer decoder then iteratively refines a pose token. MLP heads regress the MHR parameters (pose, shape, scale, hand and face components) from that token, and a perspective camera head regresses the translation (s, t<sub>x</sub>, t<sub>y</sub>) that places the body in camera space. Like other SAM models, the decoder optionally accepts 2D keypoint or mask prompts. The demo doesn't use them.
4. **Hand passes.** In the default `full` mode, hand boxes are derived from the body prediction. Each hand is cropped and sent through the backbone again, with a dedicated hand decoder. The left hand is mirrored so that it can be processed like a right hand. The hand poses then replace the hand estimates from the body pass.

So for a single person, the full pipeline runs a ViT-H detector, the MoGe-2 depth model and three ViT-H backbone passes. Even without MoGe (with a static webcam it only needs to run once, see below), that comes to **about 1060 ms per frame**, or just under 1 fps.

### Turning a lean angle into a beep
The posture part turned out to be the easy bit. From the 3D joints I take the vector from the pelvis to the neck and measure its angle in the sagittal plane (the side view). Zero degrees means sitting upright, positive values mean leaning towards the camera. If I lean forward by more than 8° for too long, the demo plays the system bell via `paplay` every few seconds until I straighten up.

This is where a 3D model pays off. With 2D keypoints alone, leaning *towards* the camera barely changes anything in the image. In 3D it shows up directly as depth.

<!-- TODO: did it actually help? How annoying was the beep after an hour? -->

### From 1 fps to 10 fps
Since this is a webcam demo, I profiled the pipeline and went after the slowest parts one at a time. Each row below adds one optimization on top of the previous one (RTX 4080 Super, 20 timed runs after warmup):

| Config                  |    ms/frame |   fps | speedup |
|-------------------------|------------:|------:|--------:|
| baseline (ViTDet, full) |      1061.7 |  0.94 |   1.00x |
| + body only             |       705.6 |  1.42 |   1.50x |
| + TF32                  |       605.8 |  1.65 |   1.75x |
| + YOLO11n detector      |       113.9 |  8.78 |   9.32x |
| + `torch.compile`       |       107.8 |  9.28 |   9.85x |

What each step does:

- **Body only.** For posture I don't need fingers, so the two hand decoder passes are skipped. The wrists are still estimated as part of the body.
- **TF32.** Two lines that let Ampere and newer GPUs use TensorFloat-32 for matrix multiplications. Practically free.
- **YOLO11n instead of ViTDet.** The surprise of the weekend: the *person detector*, not the 3D model, was the biggest bottleneck. A ViT-H running at 1024 px just to draw a box around the one person sitting in front of the camera is overkill. YOLO11n does the same job in about 10 ms.
- **`torch.compile`** on the DINOv3 backbone. It costs around 30 seconds of compilation at startup and saves a few milliseconds per frame afterwards.

A few more tricks are always on in webcam mode. The camera doesn't move, so MoGe runs only on the first frame and the intrinsics are cached (that saves about 500 ms per frame). The detector can optionally run only every N frames and reuse the last bounding box in between. A dummy frame is pushed through the model at startup, so the CUDA kernels are compiled before the first real frame. Finally, inference runs in a background thread, so the video and the 3D skeleton view stay responsive even when the model is slower than the camera.

Removing one optimization at a time from the final setup shows where the time goes: without YOLO a frame takes 500 ms longer, without body-only it's 360 ms longer, while TF32 and `torch.compile` are each worth only 3 to 10 ms. Profile first, then optimize. The biggest win was in the part of the pipeline I wasn't even interested in.

### Wrapping up
Ten frames per second isn't buttery smooth, but posture changes slowly, so it's more than enough here. <!-- TODO: what's next, or what you'd do differently -->

Source code, setup instructions and the full benchmark: [github.com/dschoerk/sam3dbody-demo](https://github.com/dschoerk/sam3dbody-demo)
