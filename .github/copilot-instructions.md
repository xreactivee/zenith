# Zenith — Development Guide

Professional Copilot key and Win + C hotkey remapping, multi-press gesture triggers, and keyboard customization application built with Electron.

## Proje Yapısı

```
zenith/
├── src/
│   ├── types.ts              # Merkezi TypeScript veri tipleri ve kontratlar
│   ├── main.js               # Ana süreç orkestratörü
│   ├── preload.js            # Güvenli IPC köprüsü
│   ├── get-apps.ps1          # Yüklü uygulama tarayıcı betiği
│   └── lib/
│       ├── config.js         # Konfigürasyon ve profil yöneticisi
│       ├── hotkey.js         # Donanım kancası ve çoklu basış algılayıcı
│       ├── appScanner.js     # Uygulama keşfi ve simge çıkarıcı
│       ├── executor.js       # Eylem yürütücü (Zenith / App / Command)
│       ├── window.js         # BrowserWindow yaşam döngüsü
│       ├── tray.js           # Sistem tepsisi ve dinamik menü
│       └── response.js       # Standart HTTP status response yardımcıları
├── renderer/
│   ├── index.html            # Kullanıcı arayüzü
│   ├── styles.css            # Minimalist arayüz stilleri
│   └── app.js                # Arayüz durumu ve etkileşimleri
├── assets/
│   └── icon.png              # Uygulama simgesi
└── package.json
```

## Hızlı Başlangıç

### 1. Bağımlılıkları Yükleyin
```bash
npm install
```

### 2. Geliştirme Modunda Başlatın
```bash
npm start
```

## Temel Modüller

- **src/main.js**: IPC işleyicilerini ve uygulama yaşam döngüsünü yöneten merkezi orkestratör
- **src/lib/config.js**: JSON konfigürasyonunu yükleme, kaydetme, doğrulama ve profil yönetimi
- **src/lib/hotkey.js**: PowerShell ve C# ile düşük seviyeli klavye kancası (F23/F24/Win+C); tek basış, çift basış ve uzun basış sürelerini algılar
- **src/lib/executor.js**: Zenith penceresi, harici uygulamalar ve CMD/PowerShell komutlarını yürütür
- **src/lib/appScanner.js**: Windows Registry ve Başlangıç menüsünden yüklü programları ve simgeleri çıkarır
- **src/lib/tray.js**: Sistem tepsisi simgesi ve profil değiştirme menüsü
- **src/lib/response.js**: 200 OK, 201 CREATED, 204 NO CONTENT gibi standart durum yanıtlarını sağlar
- **src/types.ts**: Tüm sistem veri modellerini ve IPC köprü tiplerini barındıran TypeScript tanım dosyası
- **renderer/app.js**: Ön yüz etkileşimleri, profil ve jest sekmeleri, arama ve filtreleme mantığı

## Yapılandırma

Ayarlar şurada saklanır: `%APPDATA%\zenith\config.json`
