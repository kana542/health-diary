# Health-Diary Robot Framework -testit: Päiväkirjamerkinnän lisääminen

Tiedosto: [Tehtävä 4](https://github.com/kana542/health-diary/blob/testaus/tests/front/login_test.robot)

## Yleiskuvaus
Tämä Robot Framework -testitiedosto testaa Health-Diary -sovelluksen päiväkirjamerkintöjen lisäämistoimintoa sekä kirjautumista:
1. Onnistunut kirjautuminen
2. Kirjautuminen virheellisellä käyttäjänimellä
3. Kirjautuminen virheellisellä salasanalla
4. Uuden päiväkirjamerkinnän lisääminen kalenteriin

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
- Kirjautuu sovellukseen valideilla tunnuksilla
- Etsii kalenterista päivän, jolle ei ole vielä tehty merkintää
- Avaa valitun päivän merkintäikkunan
- Täyttää merkinnän lomakkeen (mieliala, paino, unimäärä, muistiinpanot)
- Tallentaa merkinnän
- Varmistaa merkinnän onnistuneen tallennuksen
- Kirjautuu ulos sovelluksesta

## Keskeiset ominaisuudet
- **Dynaaminen kalenteripäivän valinta**: Etsii automaattisesti vapaan päivän kalenterista
- **JavaScript-integraatio**: Käyttää suoraa JavaScript-suoritusta liukusäätimen arvojen asettamiseen
- **Monipuolinen virheidensietokyky**: Sisältää useita vaihtoehtoisia tapoja tallentaa lomake
- **Älykäs modaalin käsittely**: Osaa sulkea modaalin manuaalisesti, jos automaattinen sulkeutuminen ei toimi
- **Kalenterin päivityksen varmistaminen**: Käyttää uloskirjautumista ja sisäänkirjautumista varmistaakseen kalenterin päivityksen
- **Kattava validointi**: Tarkistaa päivän luokkamuutokset varmistaakseen merkinnän onnistuneen tallennuksen
