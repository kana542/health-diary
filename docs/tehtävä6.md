# Health-Diary Robot Framework -testit: Kirjautuminen kryptatuilla tunnuksilla

Tiedosto: [Tehtävä 6](https://github.com/kana542/health-diary/blob/testaus/tests/front/crypted_login.robot)

## Yleiskuvaus
Tämä Robot Framework -testitiedosto testaa Health-Diary -sovelluksen kirjautumistoimintoa käyttäen CryptoLibrary-kirjastolla kryptattuja tunnuksia:
1. Hyödyntää Robot Frameworkin CryptoLibrary-kirjastoa
2. Käyttää kryptattuja käyttäjätunnuksia ja salasanoja
3. Testaa kirjautumista automaattisesti dekryptatuilla tunnuksilla

## Testitapaukset

### 1. Valid Login Test
- Testaa kirjautumista kryptatuilla tunnuksilla
- Varmistaa, että käyttäjä pääsee dashboard-näkymään
- Tarkistaa otsikon ja käyttäjänimen näkymisen
- Kirjautuu ulos sovelluksesta testin päätteeksi

## Keskeiset ominaisuudet
- **CryptoLibrary-integraatio**: Käyttää Robot Frameworkin CryptoLibrary-laajennusta tunnusten salaamiseen
- **Automaattinen dekryptaus**: Määrittelee variable_decryption=True, jolloin kryptatut arvot dekryptataan automaattisesti
- **Tietoturva**: Salasanat ja käyttäjätunnukset on salattu eikä niitä tallenneta selkokielisenä versionhallintaan
- **Kryptattu muoto**: Tunnistaa kryptatut arvot 'crypt:'-etuliitteestä
- **Yksinkertainen käyttö**: Kryptattuja arvoja voi käyttää kuten tavallisia muuttujia, kirjasto hoitaa dekryptauksen
- **Sensitiivisten tietojen suojaus**: Soveltuu erityisesti käyttäjätunnusten ja salasanojen suojaamiseen
