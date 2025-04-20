# Robot Framework -testit: Web-lomakkeen kenttien testaus

Tiedosto: [Tehtävä 3](https://github.com/kana542/health-diary/blob/testaus/tests/front/webform_test.robot)

## Yleiskuvaus
Tämä Robot Framework -testitiedosto testaa web-lomakkeen eri elementtien toimintaa Selenium.dev:in esimerkkisivulla:
1. Pudotusvalikon (dropdown) käyttö
2. Datalistin käyttö
3. Tiedoston lataaminen (file upload)
4. Valintaruutujen (checkbox) toiminta
5. Valintanappien (radio button) toiminta
6. Värin valitsimen (color picker) toiminta
7. Liukusäätimen (range slider) toiminta
8. Päivämäärävalitsimen (date picker) toiminta
9. Lomakkeen lähettäminen (form submission)

## Testitapaukset

### 1. Test Form Dropdown Selection
- Testaa pudotusvalikon valinnan toimivuutta
- Valitsee pudotusvalikosta vaihtoehdon "Two"
- Varmistaa, että valinta on tallentunut oikein

### 2. Test Form Datalist Input
- Testaa datalist-syötekentän toimintaa
- Syöttää kenttään arvon "New York"
- Varmistaa, että syötetty arvo tallentuu oikein

### 3. Test Form File Upload
- Testaa tiedoston lataamistoimintoa
- Luo testitiedoston ja lataa sen lomakkeelle
- Varmistaa, että tiedosto on ladattu onnistuneesti

### 4. Test Form Checkboxes
- Testaa valintaruutujen toimintaa
- Varmistaa, että ensimmäinen valintaruutu on oletuksena valittu
- Varmistaa, että toinen valintaruutu ei ole valittu
- Valitsee toisen valintaruudun ja varmistaa valinnan onnistumisen

### 5. Test Form Radio Buttons
- Testaa valintanappien toimintaa
- Varmistaa, että ensimmäinen nappi on oletuksena valittu
- Valitsee toisen napin ja varmistaa, että ensimmäinen ei ole enää valittu
- Tarkistaa, että vain yksi nappi voi olla valittuna kerrallaan

### 6. Test Form Color Picker Default Value
- Testaa värinvalitsimen oletusarvoa
- Varmistaa, että elementti on tyypiltään värinvalitsin

### 7. Test Form Range Slider
- Testaa liukusäätimen toimintaa
- Tarkistaa liukusäätimen oletusarvon (5)

### 8. Test Form Date Picker
- Testaa päivämäärävalitsimen toimintaa
- Syöttää päivämäärän "08/15/2023" kenttään
- Varmistaa, että päivämäärä tallentuu oikein

### 9. Test Form Submission
- Testaa lomakkeen lähettämistä
- Lähettää lomakkeen painamalla lähetysnappia
- Varmistaa, että lomake lähetetään onnistuneesti ("Received!" viesti näkyy)

## Keskeiset ominaisuudet
- **Browser Library**: Käyttää modernin Browser-kirjaston toiminnallisuuksia
- **Tiedostonhallinta**: Luo ja poistaa testitiedostoja OperatingSystem-kirjaston avulla
- **Lomake-elementtien testaus**: Kattaa kaikki yleisimmät web-lomakkeiden elementit
- **Tilan varmistaminen**: Tarkistaa jokaisen elementin tilan ennen ja jälkeen toimenpiteiden
- **Puhdas testiympäristö**: Varmistaa testien jälkeen, että luodut testitiedostot poistetaan
