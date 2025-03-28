*** Settings ***
Library   Browser   auto_closing_level=TEST
Library   OperatingSystem
Test Teardown   Clean Up Test

*** Variables ***
${FORM_URL}   https://www.selenium.dev/selenium/web/web-form.html
${TEST_FILE}   ${CURDIR}/test_upload.txt
${RANGE_VALUE}   8
${DATE_VALUE}   08/15/2023
${DATALIST_VALUE}   New York

*** Test Cases ***
Test Form Dropdown Selection
   [Documentation]   Test that dropdown select works correctly
   Open Web Form
   Select Option From Dropdown   Two
   Verify Selected Option   Two

Test Form Datalist Input
   [Documentation]   Test that datalist input works correctly
   Open Web Form
   Input Datalist Value   ${DATALIST_VALUE}
   Verify Datalist Value   ${DATALIST_VALUE}

Test Form File Upload
   [Documentation]   Test that file upload works correctly
   Open Web Form
   Upload Test File
   Verify File Upload

Test Form Checkboxes
   [Documentation]   Test that checkboxes work correctly
   Open Web Form
   Verify First Checkbox Is Checked
   Verify Second Checkbox Is Unchecked
   Check Second Checkbox
   Verify Second Checkbox Is Checked

Test Form Radio Buttons
   [Documentation]   Test that radio buttons work correctly
   Open Web Form
   Verify First Radio Is Checked
   Verify Second Radio Is Unchecked
   Select Second Radio Button
   Verify Second Radio Is Checked
   Verify First Radio Is Unchecked

Test Form Color Picker Default Value
   [Documentation]   Test that color picker shows the default value
   Open Web Form
   Verify Color Picker Default Value

Test Form Range Slider
   [Documentation]   Test that range slider works correctly
   Open Web Form
   Set Range Value To Default
   Verify Range Default Value

Test Form Date Picker
   [Documentation]   Test that date picker works correctly
   Open Web Form
   Input Date Value   ${DATE_VALUE}
   Verify Date Value   ${DATE_VALUE}

Test Form Submission
   [Documentation]   Test that form submits correctly
   Open Web Form
   Submit Form
   Verify Submission Success

*** Keywords ***
Open Web Form
   New Browser   chromium   headless=No
   New Page   ${FORM_URL}
   Get Title   ==   Web form

Select Option From Dropdown
   [Arguments]   ${option}
   Select Options By   select[name="my-select"]   text   ${option}

Verify Selected Option
   [Arguments]   ${expected_option}
   ${options}=   Get Selected Options   select[name="my-select"]
   Should Be Equal   ${options[0]}   ${expected_option}

Input Datalist Value
   [Arguments]   ${value}
   Type Text   input[name="my-datalist"]   ${value}

Verify Datalist Value
   [Arguments]   ${expected_value}
   ${actual_value}=   Get Property   input[name="my-datalist"]   value
   Should Be Equal   ${actual_value}   ${expected_value}

Upload Test File
   Create File   ${TEST_FILE}   This is a test file for upload
   Upload File By Selector   input[name="my-file"]   ${TEST_FILE}

Verify File Upload
   ${file_name}=   Get Property   input[name="my-file"]   files
   ${file_count}=   Get Length   ${file_name}
   Should Be True   ${file_count} > 0

Verify First Checkbox Is Checked
   Get Checkbox State   \#my-check-1   ==   True

Verify Second Checkbox Is Unchecked
   Get Checkbox State   \#my-check-2   ==   False

Check Second Checkbox
   Check Checkbox   \#my-check-2

Verify Second Checkbox Is Checked
   Get Checkbox State   \#my-check-2   ==   True

Verify First Radio Is Checked
   Get Checkbox State   \#my-radio-1   ==   True

Verify Second Radio Is Unchecked
   Get Checkbox State   \#my-radio-2   ==   False

Select Second Radio Button
   Check Checkbox   \#my-radio-2

Verify Second Radio Is Checked
   Get Checkbox State   \#my-radio-2   ==   True

Verify First Radio Is Unchecked
   Get Checkbox State   \#my-radio-1   ==   False

Verify Color Picker Default Value
   Get Element   input[name="my-colors"]
   ${type}=   Get Attribute   input[name="my-colors"]   type
   Should Be Equal   ${type}   color

Set Range Value To Default
   ${initial_value}=   Get Attribute   input[name="my-range"]   value
   Log   Initial Range Value: ${initial_value}

Verify Range Default Value
   ${value}=   Get Attribute   input[name="my-range"]   value
   Should Be Equal   ${value}   5

Input Date Value
   [Arguments]   ${date}
   Type Text   input[name="my-date"]   ${date}
   Press Keys   input[name="my-date"]   Tab
   Sleep   1s

Verify Date Value
   [Arguments]   ${expected_date}
   ${actual_date}=   Get Property   input[name="my-date"]   value
   Should Contain   ${actual_date}   ${expected_date}

Submit Form
   Click   button[type="submit"]
   Sleep   1s

Verify Submission Success
   Get Text   \#message   ==   Received!

Clean Up Test
   ${file_exists}=   Run Keyword And Return Status   File Should Exist   ${TEST_FILE}
   Run Keyword If   ${file_exists}   Remove File   ${TEST_FILE}
   Close Browser   ALL
