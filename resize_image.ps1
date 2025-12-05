Add-Type -AssemblyName System.Drawing

$imagePath = "src/assets/53d124_121e6059d4ca445994939368d60ef45f~mv2.jpg"
$image = [System.Drawing.Image]::FromFile($imagePath)

# Resize to 80% of original size
$newWidth = [int]($image.Width * 0.8)
$newHeight = [int]($image.Height * 0.8)

$newImage = New-Object System.Drawing.Bitmap($newWidth, $newHeight)
$graphics = [System.Drawing.Graphics]::FromImage($newImage)
$graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$graphics.DrawImage($image, 0, 0, $newWidth, $newHeight)

$graphics.Dispose()
$image.Dispose()

# Save the resized image
$newImage.Save($imagePath, [System.Drawing.Imaging.ImageFormat]::Jpeg)
$newImage.Dispose()

Write-Host "Image resized to 80% of original size (${newWidth}x${newHeight})"












