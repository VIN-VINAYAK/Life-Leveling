Add-Type -AssemblyName System.Drawing

$ErrorActionPreference = 'Stop'
$root = Resolve-Path (Join-Path $PSScriptRoot '..')

function New-LifeLevelingIcon([int]$size, [string]$path) {
  $bitmap = [System.Drawing.Bitmap]::new($size, $size)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $graphics.Clear([System.Drawing.ColorTranslator]::FromHtml('#0a1110'))
  $scale = $size / 512.0
  $graphics.ScaleTransform($scale, $scale)

  $flame = [System.Drawing.PointF[]]@(
    [System.Drawing.PointF]::new(264, 72), [System.Drawing.PointF]::new(285, 132),
    [System.Drawing.PointF]::new(254, 185), [System.Drawing.PointF]::new(265, 222),
    [System.Drawing.PointF]::new(294, 244), [System.Drawing.PointF]::new(312, 219),
    [System.Drawing.PointF]::new(304, 174), [System.Drawing.PointF]::new(348, 205),
    [System.Drawing.PointF]::new(391, 274), [System.Drawing.PointF]::new(391, 340),
    [System.Drawing.PointF]::new(354, 402), [System.Drawing.PointF]::new(294, 438),
    [System.Drawing.PointF]::new(222, 438), [System.Drawing.PointF]::new(159, 412),
    [System.Drawing.PointF]::new(121, 362), [System.Drawing.PointF]::new(115, 305),
    [System.Drawing.PointF]::new(140, 250), [System.Drawing.PointF]::new(192, 203),
    [System.Drawing.PointF]::new(182, 265), [System.Drawing.PointF]::new(201, 284),
    [System.Drawing.PointF]::new(226, 277), [System.Drawing.PointF]::new(237, 251),
    [System.Drawing.PointF]::new(224, 208), [System.Drawing.PointF]::new(239, 148)
  )
  $graphics.FillPolygon([System.Drawing.SolidBrush]::new([System.Drawing.ColorTranslator]::FromHtml('#e6a047')), $flame)

  $inner = [System.Drawing.PointF[]]@(
    [System.Drawing.PointF]::new(248, 237), [System.Drawing.PointF]::new(267, 265),
    [System.Drawing.PointF]::new(280, 298), [System.Drawing.PointF]::new(272, 328),
    [System.Drawing.PointF]::new(252, 339), [System.Drawing.PointF]::new(232, 324),
    [System.Drawing.PointF]::new(228, 297)
  )
  $graphics.FillPolygon([System.Drawing.SolidBrush]::new([System.Drawing.ColorTranslator]::FromHtml('#fff0c9')), $inner)

  $blade = [System.Drawing.PointF[]]@(
    [System.Drawing.PointF]::new(190, 279), [System.Drawing.PointF]::new(271, 198),
    [System.Drawing.PointF]::new(286, 213), [System.Drawing.PointF]::new(205, 294)
  )
  $graphics.FillPolygon([System.Drawing.SolidBrush]::new([System.Drawing.ColorTranslator]::FromHtml('#f5f1e5')), $blade)
  $hilt = [System.Drawing.PointF[]]@(
    [System.Drawing.PointF]::new(181, 273), [System.Drawing.PointF]::new(210, 302),
    [System.Drawing.PointF]::new(197, 315), [System.Drawing.PointF]::new(168, 286)
  )
  $graphics.FillPolygon([System.Drawing.SolidBrush]::new([System.Drawing.ColorTranslator]::FromHtml('#bd6434')), $hilt)

  $graphics.ResetTransform()
  $bitmap.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  $graphics.Dispose()
  $bitmap.Dispose()
}

New-LifeLevelingIcon 1024 (Join-Path $root 'assets\icon-only.png')
New-LifeLevelingIcon 512 (Join-Path $root 'public\icons\icon-512.png')
New-LifeLevelingIcon 192 (Join-Path $root 'public\icons\icon-192.png')
New-LifeLevelingIcon 1024 (Join-Path $root 'ios\App\App\Assets.xcassets\AppIcon.appiconset\AppIcon-512@2x.png')

$androidSizes = @{ 'mipmap-mdpi' = 48; 'mipmap-hdpi' = 72; 'mipmap-xhdpi' = 96; 'mipmap-xxhdpi' = 144; 'mipmap-xxxhdpi' = 192 }
foreach ($density in $androidSizes.Keys) {
  $resourceDir = Join-Path $root "android\app\src\main\res\$density"
  New-LifeLevelingIcon $androidSizes[$density] (Join-Path $resourceDir 'ic_launcher.png')
  New-LifeLevelingIcon $androidSizes[$density] (Join-Path $resourceDir 'ic_launcher_round.png')
  New-LifeLevelingIcon $androidSizes[$density] (Join-Path $resourceDir 'ic_launcher_foreground.png')
}
