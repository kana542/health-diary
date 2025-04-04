*** Settings ***
Library   Browser   auto_closing_level=TEST
Library   DateTime
Library   CryptoLibrary   variable_decryption=True
Test Teardown   Clean Up Test

*** Variables ***
${URL}   http://localhost:5000
${LOGIN_URL}   ${URL}/login
${DASHBOARD_URL}   ${URL}/dashboard
${VALID_USERNAME}   crypt:9lA/NEhRihbpPuHu3MQj82gOdTTAb/o5EBMMFh6i5SpuyGx1FDnPvxi1lW+4qFyRYpDkXVg=
${VALID_PASSWORD}   crypt:2SjJ63vKGG/kq6X3/AWFN88xzWsgUEXvQppK8tkyVw1KkjM1kwnk7yPfK5JzarTeW8ncI/pJScvYfChNWls=

*** Test Cases ***
Valid Login Test
   [Documentation]   Test login with valid credentials should succeed
   Open Login Page
   Check Login Page Title
   Input Valid Credentials
   Click Login Button
   Dashboard Should Be Visible
   Logout From Application

*** Keywords ***
Open Login Page
   New Browser   chromium   headless=No
   New Page   ${LOGIN_URL}

Check Login Page Title
   Get Title   ==   Dexter

Input Valid Credentials
   Type Text   id=username   ${VALID_USERNAME}
   Type Secret   id=password   $VALID_PASSWORD

Click Login Button
   Click   css=button[type="submit"]
   Sleep   1s

Dashboard Should Be Visible
   Get Url   ==   ${DASHBOARD_URL}
   Get Text   h1   ==   Health Diary
   Get Text   id=username-display   ==   ${VALID_USERNAME}

Logout From Application
   Click   id=logout-button
   Get Url   ==   ${LOGIN_URL}

Clean Up Test
   Close Browser   ALL
