Add-Type -AssemblyName System.Drawing
$imgPath = "C:\Users\joema\.gemini\antigravity\brain\7b7ac8d4-7d01-4565-b0f8-3ef87126f510\.user_uploaded\media__1785530219986.jpg"
$src = [System.Drawing.Bitmap]::FromFile($imgPath)

$outDir = "c:\Users\joema\Downloads\Vassio-Pots-main\Vassio-Pots-main\src\assets\features"

# Let's find exact bounding boxes for 4 rows x 3 columns
# Image W: 652, H: 1024
# We can find column centers: X ≈ 125, X ≈ 326, X ≈ 525
# We can find row centers: Y ≈ 130, Y ≈ 400, Y ≈ 660, Y ≈ 915

$centers = @(
    @{c=0; r=0; cx=125; cy=132},
    @{c=1; r=0; cx=326; cy=132},
    @{c=2; r=0; cx=525; cy=132},

    @{c=0; r=1; cx=125; cy=395},
    @{c=1; r=1; cx=326; cy=395},
    @{c=2; r=1; cx=525; cy=395},

    @{c=0; r=2; cx=125; cy=652},
    @{c=1; r=2; cx=326; cy=652},
    @{c=2; r=2; cx=525; cy=652},

    @{c=0; r=3; cx=125; cy=905},
    @{c=1; r=3; cx=326; cy=905},
    @{c=2; r=3; cx=525; cy=905}
)

$names = @(
    "uv-protected", "durable", "lightweight",
    "frost-resistant", "indoor-outdoor", "handmade",
    "make-in-india", "fade-resistant", "customized-design",
    "low-maintenance", "color-options", "water-resistant"
)

# For each center, find min/max X and Y where pixel is image (not off-white background)
# Background pixel check: R>235 & G>235 & B>235
function IsBg($color) {
    return ($color.R -gt 238 -and $color.G -gt 238 -and $color.B -gt 238)
}

for ($i = 0; $i -lt 12; $i++) {
    $item = $centers[$i]
    $cx = $item.cx
    $cy = $item.cy
    $name = $names[$i]

    # Find Top
    $top = $cy
    while ($top -gt $cy - 120) {
        $c = $src.GetPixel($cx, $top)
        if (IsBg $c) { break }
        $top--
    }
    $top++

    # Find Bottom
    $bottom = $cy
    while ($bottom -lt $cy + 120) {
        $c = $src.GetPixel($cx, $bottom)
        if (IsBg $c) { break }
        $bottom++
    }
    $bottom--

    # Find Left
    $left = $cx
    while ($left -gt $cx - 120) {
        $c = $src.GetPixel($left, $cy)
        if (IsBg $c) { break }
        $left--
    }
    $left++

    # Find Right
    $right = $cx
    while ($right -lt $cx + 120) {
        $c = $src.GetPixel($right, $cy)
        if (IsBg $c) { break }
        $right++
    }
    $right--

    $w = $right - $left + 1
    $h = $bottom - $top + 1

    # Ensure square aspect ratio
    $dim = [Math]::Min($w, $h)

    $rect = New-Object System.Drawing.Rectangle($left, $top, $dim, $dim)
    $cropped = $src.Clone($rect, $src.PixelFormat)
    $destPath = Join-Path $outDir "$name.jpg"
    $cropped.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Jpeg)
    $cropped.Dispose()

    Write-Host "Card $name -> Left:$left Top:$top W:$dim H:$dim"
}

$src.Dispose()
Write-Host "Smart crop completed!"
