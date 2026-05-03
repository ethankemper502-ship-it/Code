# Sky Runner VR

Sky Runner VR is a lightweight browser-based VR arcade game built with A-Frame.

## How to play

- Click **Start / Restart** to begin.
- On desktop, drag to look and use **A/D** or **Left/Right Arrow** to strafe.
- In VR, enter headset mode and lean or use your controllers to dodge the incoming barriers.
- Every barrier you survive increases your score and slightly raises the speed.

## Run locally

Because this project is a static site, any simple file server works:

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000> in a browser with WebXR support.
