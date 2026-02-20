# 메인 동영상을 connectsell 프로젝트로 복사
# 사용법: Downloads 폴더에 "25_02_06_완료 (8).mp4" 파일을 넣은 뒤 이 스크립트 실행

$src = "C:\Users\USER\Downloads\25_02_06_완료 (8).mp4"
$dstDir = "C:\Users\USER\connectsell\video"
$dst = "$dstDir\25_02_06_완료 (8).mp4"

if (-not (Test-Path $src)) {
    Write-Host "파일을 찾을 수 없습니다: $src" -ForegroundColor Red
    Write-Host "Downloads 폴더에 동영상 파일을 넣어주세요." -ForegroundColor Yellow
    exit 1
}

if (-not (Test-Path $dstDir)) { New-Item -ItemType Directory -Path $dstDir -Force }
Copy-Item -LiteralPath $src -Destination $dst -Force
$sizeMB = [math]::Round((Get-Item $dst).Length / 1MB, 2)
Write-Host "복사 완료: $dst ($sizeMB MB)" -ForegroundColor Green

if ($sizeMB -gt 100) {
    Write-Host "`n경고: 파일이 100MB를 초과합니다. GitHub에는 100MB 제한이 있습니다." -ForegroundColor Yellow
    Write-Host "Cloudinary 등 외부 호스팅을 사용하세요." -ForegroundColor Yellow
} else {
    Write-Host "`n다음 명령으로 GitHub에 푸시하세요:" -ForegroundColor Cyan
    Write-Host "  cd C:\Users\USER\connectsell"
    Write-Host "  git add video/"
    Write-Host "  git commit -m `"Add hero video`""
    Write-Host "  git push"
}
