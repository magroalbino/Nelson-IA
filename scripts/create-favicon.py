from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[1]
source = root / "public/assets/logo-nelson-transparent.png"
target = root / "public/favicon.ico"
image = Image.open(source).convert("RGBA")
alpha = image.getchannel("A")
bbox = alpha.getbbox()
if bbox:
    image = image.crop(bbox)
size = max(image.size)
canvas = Image.new("RGBA", (size, size), (255, 255, 255, 0))
canvas.alpha_composite(image, ((size - image.width) // 2, (size - image.height) // 2))
icons = [canvas.resize((n, n), Image.Resampling.LANCZOS) for n in (16, 32, 48, 64)]
icons[0].save(target, format="ICO", sizes=[(16, 16), (32, 32), (48, 48), (64, 64)], append_images=icons[1:])
print(target)
