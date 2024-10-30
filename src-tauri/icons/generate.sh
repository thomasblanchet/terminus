set -e
rm -rf *.iconset
rm -f *.png
rm -f *.icns
mkdir icon.iconset
magick raw/icon.png -filter box -resize 16x16 png32:icon.iconset/icon_16x16.png
magick raw/icon.png -filter box -resize 32x32 png32:icon.iconset/icon_16x16@2.png
magick raw/icon.png -filter box -resize 32x32 png32:icon.iconset/icon_32x32.png
magick raw/icon.png -filter box -resize 64x64 png32:icon.iconset/icon_32x32@2.png
magick raw/icon.png -filter box -resize 64x64 png32:icon.iconset/icon_64x64.png
magick raw/icon.png -filter box -resize 128x128 png32:icon.iconset/icon_64x64@2.png
magick raw/icon.png -filter box -resize 128x128 png32:icon.iconset/icon_128x128.png
magick raw/icon.png -filter box -resize 256x256 png32:icon.iconset/icon_12x128@2.png
magick raw/icon.png -filter box -resize 256x256 png32:icon.iconset/icon_256x256.png
magick raw/icon.png -filter box -resize 512x512 png32:icon.iconset/icon_256x256@2.png
magick raw/icon.png -filter box -resize 512x512 png32:icon.iconset/icon_512x512.png
magick raw/icon.png -filter box -resize 1024x1024 png32:icon.iconset/icon_512x512@2.png
magick raw/icon.png -filter box -resize 1024x1024 png32:icon.iconset/icon_1024x1024.png
iconutil -c icns icon.iconset
cp icon.iconset/icon_16x16.png 16x16.png
cp icon.iconset/icon_32x32.png 16x16@2.png
cp icon.iconset/icon_32x32.png 32x32.png
cp icon.iconset/icon_64x64.png 32x32@2.png
cp icon.iconset/icon_64x64.png 64x64.png
cp icon.iconset/icon_128x128.png 64x64@2.png
cp icon.iconset/icon_128x128.png 128x128.png
cp icon.iconset/icon_256x256.png 128x128@2.png
cp icon.iconset/icon_256x256.png 256x256.png
cp icon.iconset/icon_512x512.png 256x256@2.png
cp icon.iconset/icon_512x512.png 512x512.png
cp icon.iconset/icon_1024x1024.png 512x512@2.png
cp icon.iconset/icon_1024x1024.png 1024x1024.png
rm -rf icon.iconset
