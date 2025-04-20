*** Settings ***
Library    Browser    auto_closing_level=TEST
Library    OperatingSystem
Library    String
Suite Setup    Load Env File
Test Teardown    Clean Up Test

*** Variables ***
${URL}    http://localhost:5000
${LOGIN_URL}    ${URL}/login
${DASHBOARD_URL}    ${URL}/dashboard
${ENV_FILE}    ${CURDIR}/.env

*** Test Cases ***
Valid Login Test
    [Documentation]    Test login with valid credentials should succeed
    Open Login Page
    Check Login Page Title
    Input Valid Credentials
    Click Login Button
    Dashboard Should Be Visible
    Logout From Application

*** Keywords ***
Load Env File
    ${env_content}=    Get File    ${ENV_FILE}
    @{lines}=    Split To Lines    ${env_content}

    FOR    ${line}    IN    @{lines}
        ${line}=    Strip String    ${line}
        ${parts}=    Split String    ${line}    =    max_split=1
        ${key}=    Strip String    ${parts}[0]
        ${value}=    Strip String    ${parts}[1]
        Set Environment Variable    ${key}    ${value}

        IF    '${key}' == 'PASSWORD'
            Set Suite Variable    ${PASSWORD_VAR}    ${value}
        END
    END

Open Login Page
    New Browser    chromium    headless=No
    New Page    ${LOGIN_URL}

Check Login Page Title
    Get Title    ==    Dexter

Input Valid Credentials
    Type Text    id=username    %{USERNAME}
    Type Secret    id=password    $PASSWORD_VAR

Click Login Button
    Click    css=button[type="submit"]
    Sleep    1s

Dashboard Should Be Visible
    Get Url    ==    ${DASHBOARD_URL}
    Get Text    h1    ==    Health Diary
    Get Text    id=username-display    ==    %{USERNAME}

Logout From Application
    Click    id=logout-button
    Get Url    ==    ${LOGIN_URL}

Clean Up Test
    Close Browser    ALL
