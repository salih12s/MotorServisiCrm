$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
$src = (Resolve-Path ".\frontend\build").Path
$zip = (Join-Path (Get-Location).Path "frontend-build.zip")
if (Test-Path $zip) { Remove-Item $zip -Force }
$archive = [System.IO.Compression.ZipFile]::Open($zip, [System.IO.Compression.ZipArchiveMode]::Create)
try {
    $files = Get-ChildItem -Path $src -Recurse -File
    foreach ($f in $files) {
        $rel = $f.FullName.Substring($src.Length + 1).Replace('\', '/')
        [void][System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive, $f.FullName, $rel, [System.IO.Compression.CompressionLevel]::Optimal)
    }
}
finally {
    $archive.Dispose()
}
$size = [math]::Round((Get-Item $zip).Length / 1KB, 1)
Write-Host "Zip olusturuldu: $zip ($size KB)"
$test = [System.IO.Compression.ZipFile]::OpenRead($zip)
Write-Host "Ornek girisler (ilk 8):"
$test.Entries | Select-Object -First 8 | ForEach-Object { Write-Host ("  " + $_.FullName) }
$test.Dispose()
