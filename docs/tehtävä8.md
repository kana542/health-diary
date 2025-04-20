# GitHub Pages: Robot Framework -testitulosten julkaisu

## Yleiskuvaus
Tämä tehtävä käsittelee Robot Framework -testien tulosten julkaisua GitHub Pages -sivuston kautta:
1. Henkilökohtaisen GitHub Pages -sivuston luominen
2. Testitulosten julkaiseminen web-käyttöliittymän kautta
3. Dynaaminen tuloslistaus GitHub API:n avulla

## Toteutuksen vaiheet

### 1. GitHub Pages -sivuston perustaminen
- Luodaan GitHub-repositorio nimellä `käyttäjänimi.github.io` (esim. kana542.github.io)
- Repository asetetaan julkiseksi, jotta GitHub Pages toimii
- Lisätään repositorioon perussisältö (index.html ja README.md)

### 2. Kansiorakenteen luominen testiraporteille
- Luodaan kansio `robot-results` testitulosten säilyttämiseen
- Luodaan alikansiot `logs` ja `reports` eri tyyppisille tulostiedostoille
- Varmistetaan kansiorakenne GitHub-repositoriossa

### 3. HTML-sivun toteutus
- Luodaan index.html-sivu, joka näyttää testien tulokset
- Käytetään JavaScript-toiminnallisuutta, joka hakee tiedostolistat GitHub API:n kautta
- Muotoillaan sivu CSS:llä selkeämmäksi ja responsiiviseksi
- Näytetään erilliset osiot lokitiedostoille ja raporteille

### 4. Testiraporttien julkaisu
- Ajetaan Robot Framework -testit
- Ohjataan tulokset erillisiin kansioihin (esim. `robot -d output login_test.robot`)
- Kopioidaan tulostiedostot GitHub-repositorion kansiorakenteeseen
- Viedään muutokset GitHubiin esimerkiksi komennolla `git push`

## Keskeiset ominaisuudet
- **GitHub Pages -integraatio**: Hyödyntää ilmaista GitHub Pages -palvelua testitulosten julkaisuun
- **Dynaaminen listaus**: JavaScript hakee automaattisesti saatavilla olevat raporttitiedostot
- **API-integraatio**: Käyttää GitHub API:a tiedostolistausten noutamiseen
- **Responsiivinen käyttöliittymä**: Mukautuu eri näyttökokoisiin laitteisiin
- **Selkeä organisointi**: Erilliset osiot lokitiedostoille ja raporteille
- **Jatkuva saatavuus**: Testiraportit ovat helposti kaikkien tiimin jäsenten saatavilla
