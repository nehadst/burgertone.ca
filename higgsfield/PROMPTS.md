# Higgsfield generation kit: Burgertone hero loop

Goal: one ultra-HD, seamless loop of a single Burgertone burger slowly turning on a pure black
background. It sits centered in the hero behind "Turn up the flavour." and never stops turning,
the same idea as the spinning barber pole. The page fades the edges into the site's black, so the
background has to be clean and empty.

## Input
- `public/assets/classic.jpg`: the real Classic burger (1600x900, shot on black). Use it as the
  reference so the generated burger looks like ours, not a stock burger.

## Step 1: hero still (image edit, keep the burger)
Model: Nano Banana Pro, Seedream 4 or GPT Image edit, whichever is in the account.
Reference: `classic.jpg`. Make a 16:9 version and a 9:16 version with the same prompt:

> The exact same burger: same toasted brioche bun, same smashed patty, cheese, onion, tomato and
> lettuce. Remove the fries. The burger stands alone, centered, filling about 40% of the frame
> width, on an invisible surface. Pure black seamless studio background, no table, no horizon line.
> Soft key light from the upper left, warm rim light from behind, glossy bun highlights.
> Photorealistic food commercial, ultra sharp, 4K detail, no text, no logo.

## Step 2: seamless turntable loop (first and last frame)
Model: Kling 2.5 / 2.1 Master (start and end frame), or Seedance Pro. 1080p or higher, 10 s.
Start frame and end frame: the same still from step 1. Using the same image for both is what makes
the loop seamless. Prompt:

> Locked-off camera, no camera movement. The burger rotates slowly and evenly on an invisible
> turntable, one full 360 degree turn, ending exactly where it started. Pure black seamless
> background stays perfectly black. A thin wisp of steam rises from the patty, the cheese glistens.
> Photorealistic food commercial, consistent lighting, no flicker, no morphing, no hands, no text.

Generate 3 or 4 takes and keep the one where the burger keeps its shape for the whole turn.
Repeat with the 9:16 still for phones. If the account has an upscaler, upscale the winner to 4K.

## Step 3: encode and drop it in
```bash
ffmpeg -i hero-loop-raw.mp4 -vf "scale=1920:-2,fps=30" -c:v libx264 -crf 19 -preset slow -pix_fmt yuv420p -movflags +faststart -an public/assets/hero-loop.mp4
ffmpeg -i hero-loop-portrait-raw.mp4 -vf "scale=1080:-2,fps=30" -c:v libx264 -crf 20 -preset slow -pix_fmt yuv420p -movflags +faststart -an public/assets/hero-loop-portrait.mp4
ffmpeg -i public/assets/hero-loop.mp4 -frames:v 1 -c:v libwebp -quality 85 public/assets/hero-loop-poster.webp
```

Then point `HERO_LOOP` in `src/data.js` at the files:

```js
export const HERO_LOOP = {
  video: '/assets/hero-loop.mp4',
  mobileVideo: '/assets/hero-loop-portrait.mp4',
  poster: '/assets/hero-loop-poster.webp',
}
```

Also change the image preload in `index.html` to the new poster.
