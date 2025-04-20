# Health-Diary Robot Framework -testit: Kirjautuminen ja merkintöjen lisääminen

## Yleiskuvaus

Tämä Robot Framework -testitiedosto testaa Health-Diary -sovelluksen perustoiminnallisuuksia:
1. Kirjautuminen onnistuneesti
2. Kirjautuminen virheellisillä tunnuksilla
3. Uuden päiväkirjamerkinnän lisääminen

## Testitapaukset

### 1. Valid Login Test
- Testaa kirjautumista kelvollisilla tunnuksilla
- Varmistaa, että käyttäjä pääsee dashboard-näkymään
- Tarkistaa otsikon ja käyttäjänimen näkymisen

### 2. Invalid Username Test
- Testaa kirjautumista virheellisellä käyttäjänimellä
- Varmistaa, että virheilmoitus "Bad username/password" näytetään

### 3. Invalid Password Test
- Testaa kirjautumista virheellisellä salasanalla
- Varmistaa, että virheilmoitus "Bad username/password" näytetään

### 4. Add New Diary Entry
- Testaa uuden päiväkirjamerkinnän lisäämistä
- Etsii kalenterista vapaan päivän (jolla ei ole merkintää)
- Täyttää merkinnän lomakkeen (mieliala, paino, uni, muistiinpanot)
- Tallentaa merkinnän ja varmistaa, että se näkyy kalenterissa

## Keskeiset ominaisuudet

- **Älykkäät odotukset**: Testit odottavat elementtien näkyviin tulemista ennen interaktiota
- **Dynaaminen päivän valinta**: Etsii automaattisesti vapaan päivän kalenterista
- **Virheidensietokyky**: Sisältää useita vaihtoehtoisia tapoja suorittaa toimintoja, jos ensisijainen tapa epäonnistuu
- **JavaScript-integraatio**: Käyttää suoraa JavaScript-suoritusta monimutkaisissa toiminnoissa
- **Diagnostiikka**: Sisältää kattavaa lokitusta testien suorituksesta
