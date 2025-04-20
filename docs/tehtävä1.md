# Ohjelmistotestaus - Yksilötehtävä 1

Tiedosto: [Tehtävä 1](https://github.com/kana542/health-diary/blob/testaus/docs/teht%C3%A4v%C3%A41.md)

## Asennetut työkalut
- Robot Framework - Automaatiotestauksen kehys
- Browser Library - Selaintestaukseen
- Requests Library - HTTP API -testaukseen
- CryptoLibrary - Salasanojen turvalliseen käsittelyyn

## Vaatimukset
- Python 3.8 tai uudempi
- Node.js (Browser Librarya varten)
- Visual Studio Code

## Asennusohjeet

### 1. Kansio rakenteen lisääminen
Lisätään seuraava kansiorakenne projektiin:
```
health-diary/
│
├── tests/
│   ├── front/
│   └── back/
└── ...
```

### 2. Luodaan ja aktivoidaan virtuaaliympäristö
**Git Bash:**
```
python -m venv .venv
source .venv/Scripts/activate
```

### 3. Asennetaan Robot Framework
```
python -m pip install robotframework
```

Testataan asennus:
```
python -m robot --version
```

### 4. Asennetaan Browser Library
Asennetaan ja alustetaan Browser Library:
```
python -m pip install robotframework-browser
python -m Browser.entry init
```

### 5. Asennetaan muut kirjastot
```
python -m pip install robotframework-requests
python -m pip install robotframework-crypto
python -m pip install robotframework-tidy
```

### 6. Tallennetaan riippuvuudet
```
python -m pip freeze > requirements.txt
```

### 7. Testataan asennukset
Lisätään valmis [asennustesti](https://github.com/sakluk/projekti-terveyssovelluksen-kehitys/blob/main/python/asennustesti.py) projektin juureen.

Suoritetaan testi:
```
python asennustesti.py
```

## Git-asetukset
Lisätään `.gitignore`-tiedostoon seuraavat rivit:
```
.venv/
__pycache__/
*.pyc
log.html
report.html
output.xml
```
