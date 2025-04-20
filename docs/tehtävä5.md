# Health-Diary Robot Framework -testit: Kirjautuminen .env-tiedostosta

Tiedosto: [Tehtävä 5](https://github.com/kana542/health-diary/blob/testaus/tests/front/env_login_test.robot)

## Yleiskuvaus
Tämä Robot Framework -testitiedosto testaa Health-Diary -sovelluksen kirjautumistoimintoa käyttäen .env-tiedostoon tallennettuja käyttäjätunnuksia:
1. Lukee käyttäjätunnukset ja salasanat .env-tiedostosta
2. Testaa kirjautumista näillä tunnuksilla
3. Varmistaa, että käyttäjä pääsee dashboard-näkymään

## Testitapaukset

### 1. Valid Login Test
- Testaa kirjautumista kelvollisilla tunnuksilla, jotka on tallennettu .env-tiedostoon
- Varmistaa, että käyttäjä pääsee dashboard-näkymään
- Tarkistaa otsikon ja käyttäjänimen näkymisen
- Kirjautuu ulos sovelluksesta testin päätteeksi

## Keskeiset ominaisuudet
- **.env-tiedoston hyödyntäminen**: Lukee arkaluontoiset tunnukset erillisestä tiedostosta, jota ei tallenneta versionhallintaan
- **Ympäristömuuttujien käyttö**: Tallentaa luetut arvot ympäristömuuttujiin ja käyttää niitä testissä
- **Suite Setup**: Lataa ympäristömuuttujat ennen testien suorittamista
- **Tietoturva**: Käsittelee salasanaa erillisessä suite-muuttujassa, joka ei näy lokitiedostoissa
- **Merkkijonojen käsittely**: Hyödyntää String-kirjastoa .env-tiedoston parsimiseen
- **Dynaaminen ympäristömuuttujien asettaminen**: Mahdollistaa useiden eri ympäristömuuttujien määrittelyn samassa .env-tiedostossa
