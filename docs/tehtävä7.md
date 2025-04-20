# Health-Diary Robot Framework -testit: Raportoinnin ohjaus

## Yleiskuvaus
Tämä tehtävä keskittyy Robot Framework -testien tulosten hallintaan:
1. Loki- ja raporttitiedostojen ohjaaminen erilliseen outputs-kansioon
2. Testitulosten ja -dokumentaation organisointi
3. Testitulosteiden hallinnan peruskomentosyntaksi

## Toteutuksen vaiheet

### 1. Kansion luominen
- Luodaan erillinen outputs-kansio samaan hakemistoon, jossa .robot testitiedostot sijaitsevat
- Varmistetaan, että kansiolla on oikeat käyttöoikeudet

### 2. Testien suorittaminen ohjaamalla tulosteet
- Käytetään Robot Frameworkin -d parametria määrittämään tulosteiden kohde
- Komento: `robot -d output login_test.robot`
- Kaikki testien tuottamat tiedostot (log.html, report.html, output.xml) ohjautuvat määriteltyyn kansioon

### 3. Tulosteiden organisointi
- Kaikki skriptin tuottamat tiedostot ja alikansiot tallentuvat määriteltyyn kansioon
- Erillinen kansiorakenne pitää projektihakemiston siistimpänä
- Helpottaa tulosten arkistointia ja jakamista

### 4. Lisäparametrien käyttö
- Voidaan hallita tuotettujen raporttien määrää ja sisältöä lisäparametreilla
- Esimerkiksi: `robot -d output --log none --report none login_test.robot` (tuotetaan vain output.xml)
- Tai: `robot -d output --name "Kirjautumistestit" login_test.robot` (muutetaan raportin nimeä)

## Keskeiset ominaisuudet
- **Tulosten hallinta**: Testien tulosteet tallentuvat järjestelmällisesti yhteen paikkaan
- **Järjestyksen säilyttäminen**: Projektikansio pysyy siistinä ja organisoituna
- **Konfiguroitavuus**: Mahdollisuus mukauttaa tulostettavia raportteja eri parametreilla
- **Tulosten arkistointi**: Helpottaa testitulosten säilyttämistä ja vertailua
- **CI/CD -integraatio**: Mahdollistaa tulosten helpon keräämisen jatkuvan integraation järjestelmissä
