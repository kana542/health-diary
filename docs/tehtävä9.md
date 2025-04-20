# Health-Diary Robot Framework -testit: API-taustapalvelimen testaus

## Yleiskuvaus
Tämä Robot Framework -testitiedosto testaa Health-Diary -sovelluksen taustapalvelimen API-toimintoja:
1. Kirjautuminen ja API-tokenin hakeminen
2. Kirjautuneen käyttäjän tietojen hakeminen
3. Uuden päiväkirjamerkinnän luominen API:n kautta

## Testitapaukset

### 1. Login and Get Token
- Luo HTTP-session taustapalvelimelle
- Lähettää kirjautumistiedot API:lle
- Tarkistaa, että vastauskoodi on 200 (onnistunut)
- Ottaa talteen autentikaatiotokenin tulevaa käyttöä varten
- Turvallisuushuomio: token ei näy lokeissa

### 2. Get Current User
- Hakee kirjautuneen käyttäjän tiedot käyttäen saatua tokenia
- Tarkistaa, että vastauskoodi on 200 (onnistunut)
- Varmistaa, että palautettu käyttäjänimi vastaa kirjautumistunnusta
- Osoittaa näin, että autentikaatio toimii oikein

### 3. Create Diary Entry
- Luo uuden päiväkirjamerkinnän API:n kautta käyttäen autentikaatiotokenia
- Käyttää nykyistä päivämäärää merkinnän päiväksi
- Lähettää testiarvot mielialalle, painolle, unitunneille ja muistiinpanoille
- Tarkistaa, että vastauskoodi on 201 (luotu)
- Ottaa talteen luodun merkinnän tunnisteen (entry_id) mahdollista jatkokäyttöä varten

## Keskeiset ominaisuudet
- **RequestsLibrary**: Hyödyntää HTTP-pyyntöjen lähettämiseen ja vastausten käsittelyyn
- **Token-autentikaatio**: Käyttää Bearer-tokenia API-pyyntöjen autentikointiin
- **Riippuvuusketju**: Testit suoritetaan loogisessa järjestyksessä, jossa seuraava testi hyödyntää edellisen testin tuloksia
- **Dynaaminen päivämäärä**: Käyttää nykyistä päivämäärää merkinnän luonnissa
- **HTTP-vastausten validointi**: Tarkistaa sekä vastauksen statuskoodin että sisällön
- **Tietoturva**: Huomioi arkaluontoisten tietojen (token) suojaamisen lokeissa
