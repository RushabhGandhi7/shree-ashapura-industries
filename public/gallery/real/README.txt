Real factory, machine and team photos go in this folder. The website gallery switches to
them automatically on the next build (or instantly while `npm run dev` is running).

  Photos:   any .jpg / .jpeg / .png / .webp / .avif. Sorted by file name, so prefix with
            numbers to set the order: 01-header-machines.jpg, 02-thread-rolling.jpg ...
            Aim for about 1600 px on the long edge, 200-400 KB each. Photos under 1000 px
            are shown smaller instead of being stretched.
  Captions: optional captions.json next to the photos:
            { "01-header-machines.jpg": { "alt": "Five cold-heading machines in unit 24", "caption": "Cold heading, unit 24" } }
            Without it, the file name is used ("01-header-machines.jpg" -> "Header machines").
            Write real alt text: describe what is in the photo.
  Video:    unit-video.mp4 (or .webm), H.264, 1080p or 720p, ideally under 20 MB.
            Optional poster: unit-video-poster.jpg.

Do not use images taken from the printed catalogue.
