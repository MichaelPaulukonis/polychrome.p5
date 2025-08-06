## Animations

Output multiple images
Run the `pcttool` to stitch them together using `ffmpeg` and  ImageMagick's `convert`

- `brew install ffmpeg` and `brew install imagemagick`
- more options at [StackOverflow](https://askubuntu.com/a/837574/613420)


## ffmpeg

This will take all png files in a folder and make one .mp4 from all them.
The size will be of the largest image, with all other images centered (unscaled) and padded with black.
See [notes on `pad`](http://ffmpeg.org/ffmpeg-filters.html#pad) for more.


`ffmpeg -r 15 -f image2 -pattern_type glob -i '*.png' -vf pad="max(iw\,ih):ow:(ow-iw)/2:(oh-ih)/2" -vcodec libx264 -crf 17 -pix_fmt yuv420p 'combined.mp4'`


```
mogrify -path '/home/hamy/Documents/JP2_Wrangling/2DArtist_066/Processed' -verbose -quality 95 -format jpg *.jp2

magick mogrify -path './' -verbose  -format png *.jp2

magick mogrify -path './' -verbose -format jpg *.jp2

mkdir denslow
pdfimages -verbose -j denslow.goose.2003goudy25765.pdf ./denslow
```

for FILENAME in $(ls *.bpm; do convert $FILENAME ${FILENAME%.*}.png 

for x in *.webp; do dwebp {} -o ${x%.*}.png ::: $x; done

for x in *.bpm; do convert ${x%.*}.png ::: $x; done

convert *.pbm -set filename:fn '%[basename]' '%[filename:fn].png'

