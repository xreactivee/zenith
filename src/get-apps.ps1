[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$wsh = New-Object -ComObject WScript.Shell
$startDirs = @(
    "$env:ProgramData\Microsoft\Windows\Start Menu\Programs",
    "$env:APPDATA\Microsoft\Windows\Start Menu\Programs"
)

$shortcuts = @{}
Get-ChildItem -Path $startDirs -Filter '*.lnk' -Recurse -ErrorAction SilentlyContinue | ForEach-Object {
    try {
        $sc = $wsh.CreateShortcut($_.FullName)
        $target = $sc.TargetPath
        if ($target -and (Test-Path $target) -and ($target -match '\.exe$') -and ($target -notmatch 'uninstall|unins|setup|package cache')) {
            $base = $_.BaseName.ToLower().Trim()
            if (-not $shortcuts.ContainsKey($base)) {
                $shortcuts[$base] = $target
            }
        }
    } catch {}
}

$regPaths = @(
    'HKLM:\Software\Microsoft\Windows\CurrentVersion\Uninstall\*',
    'HKLM:\Software\Wow6432Node\Microsoft\Windows\CurrentVersion\Uninstall\*',
    'HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall\*'
)

$rawApps = Get-ItemProperty -Path $regPaths -ErrorAction SilentlyContinue | Where-Object {
    $_.DisplayName -and 
    $_.SystemComponent -ne 1 -and 
    (-not $_.ParentKeyName) -and
    $_.ReleaseType -ne 'Security Update' -and
    $_.ReleaseType -ne 'Update' -and
    ($_.DisplayName -notmatch '^KB\d{6,}')
}

$excludePatterns = @(
    '\bAgent\b',
    '\bOnline Services\b',
    '\bBug Report\b',
    '\bCrashpad\b',
    '\bCrash Handler\b',
    '\bRedistributable\b',
    '\bPrerequisites\b',
    '\bPython Launcher\b',
    '\bInstall Manager\b'
)

$filtered = $rawApps | Where-Object {
    $name = $_.DisplayName.Trim()
    $skip = $false
    foreach ($pat in $excludePatterns) {
        if ($name -match $pat) {
            $skip = $true
            break
        }
    }
    -not $skip
}

$results = foreach ($item in $filtered) {
    $name = $item.DisplayName.Trim()
    $pub = if ($item.Publisher) { $item.Publisher.Trim() } else { "Uygulama" }
    $cleanIcon = $null
    $cleanExe = $null

    if ($name -match 'AMD Software') {
        if (Test-Path 'C:\Program Files\AMD\CNext\CNext\RadeonSoftware.exe') {
            $cleanExe = 'C:\Program Files\AMD\CNext\CNext\RadeonSoftware.exe'
        }
    } elseif ($name -match '^Steam$') {
        if (Test-Path 'C:\Program Files (x86)\Steam\steam.exe') {
            $cleanExe = 'C:\Program Files (x86)\Steam\steam.exe'
        }
    } elseif ($name -match 'File Converter') {
        if (Test-Path 'C:\Program Files\File Converter\FileConverter.exe') {
            $cleanExe = 'C:\Program Files\File Converter\FileConverter.exe'
        }
    } elseif ($name -match 'Python\s*3\.14') {
        if (Test-Path "$env:LOCALAPPDATA\Programs\Python\Python314\python.exe") {
            $cleanExe = "$env:LOCALAPPDATA\Programs\Python\Python314\python.exe"
        }
    }

    if (-not $cleanExe) {
        $nameLower = $name.ToLower()
        foreach ($key in $shortcuts.Keys) {
            if ($nameLower -eq $key -or $nameLower.StartsWith($key) -or $key.StartsWith($nameLower)) {
                $cleanExe = $shortcuts[$key]
                break
            }
        }
        if (-not $cleanExe) {
            $norm = ($nameLower -replace '\b\d+(\.\d+)+\b', '' -replace '\([^\)]+\)', '').Trim()
            foreach ($key in $shortcuts.Keys) {
                $normKey = ($key -replace '\([^\)]+\)', '').Trim()
                if ($norm.Length -gt 2 -and ($normKey.Contains($norm) -or $norm.Contains($normKey))) {
                    $cleanExe = $shortcuts[$key]
                    break
                }
            }
        }
    }

    if ($item.DisplayIcon) {
        $iconProp = $item.DisplayIcon -replace '^"|"$', ''
        if ($iconProp -match '^(.*?\.exe)(?:,\d+)?$') {
            $cand = $matches[1]
            if (Test-Path $cand) {
                if ($cand -notmatch 'uninstall|unins|setup|package cache') {
                    if (-not $cleanExe) { $cleanExe = $cand }
                }
                if (-not $cleanIcon) { $cleanIcon = $cand }
            }
        } elseif ($iconProp -match '^(.*?\.ico)(?:,\d+)?$') {
            $cand = $matches[1]
            if (Test-Path $cand) {
                $cleanIcon = $cand
            }
        } elseif (Test-Path $iconProp) {
            if ($iconProp -match '\.ico$') { $cleanIcon = $iconProp }
            elseif ($iconProp -notmatch 'uninstall|unins|setup|package cache') {
                if (-not $cleanExe) { $cleanExe = $iconProp }
            }
        }
    }

    if (-not $cleanExe -and $item.InstallLocation -and (Test-Path $item.InstallLocation)) {
        $candidates = Get-ChildItem -Path $item.InstallLocation -Filter '*.exe' -Recurse -Depth 3 -ErrorAction SilentlyContinue |
            Where-Object { $_.Name -notmatch 'unins|setup|crash|update|helper|error' } |
            Sort-Object Length -Descending
        if ($candidates -and $candidates.Count -gt 0) {
            $cleanExe = $candidates[0].FullName
        }
    }

    if (-not $cleanExe) {
        $checkDirs = @(
            "$env:ProgramFiles\$name",
            "$env:ProgramFiles\AMD\$name",
            "${env:ProgramFiles(x86)}\$name",
            "$env:LOCALAPPDATA\Programs\$name",
            "$env:APPDATA\$name"
        )
        foreach ($dir in $checkDirs) {
            if (Test-Path $dir) {
                $cand = Get-ChildItem -Path $dir -Filter '*.exe' -Recurse -Depth 2 -ErrorAction SilentlyContinue |
                    Where-Object { $_.Name -notmatch 'unins|setup|crash|helper|error' } |
                    Sort-Object Length -Descending | Select-Object -First 1
                if ($cand) {
                    $cleanExe = $cand.FullName
                    break
                }
            }
        }
    }

    if (-not $cleanIcon -and $item.PSChildName -match '^\{[0-9A-Fa-f\-]+\}$') {
        $msiDir = "C:\WINDOWS\Installer\$($item.PSChildName)"
        if (Test-Path $msiDir) {
            $ico = Get-ChildItem -Path $msiDir -Filter '*.ico' -ErrorAction SilentlyContinue | Select-Object -First 1
            if ($ico) { $cleanIcon = $ico.FullName }
            if (-not $cleanExe) {
                $msiExe = Get-ChildItem -Path $msiDir -Filter '*.exe' -ErrorAction SilentlyContinue | Select-Object -First 1
                if ($msiExe) { $cleanExe = $msiExe.FullName }
            }
        }
    }

    $finalPath = if ($cleanExe) { $cleanExe } else { $cleanIcon }
    $finalIcon = if ($cleanIcon) { $cleanIcon } else { $cleanExe }

    [PSCustomObject]@{
        name = $name
        publisher = $pub
        path = $finalPath
        iconFile = $finalIcon
    }
}

$unique = @{}
foreach ($result in $results) {
    if (-not $unique.ContainsKey($result.name)) {
        $unique[$result.name] = $result
    }
}

$finalApps = $unique.Values | Sort-Object name
$finalApps | ConvertTo-Json -Depth 2
