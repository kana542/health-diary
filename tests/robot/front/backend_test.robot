*** Settings ***
Library    RequestsLibrary
Library    Collections
Library    DateTime

*** Variables ***
${BASE_URL}    http://localhost:3000/api
${USERNAME}    -
${PASSWORD}    -

*** Test Cases ***
Login and Get Token
    Create Session    authsession    ${BASE_URL}    verify=true
    &{body}=    Create Dictionary    username=${USERNAME}    password=${PASSWORD}
    ${response}=    POST On Session    authsession    /auth/login    json=${body}

    # Validation
    ${status_code}=    Convert To String    ${response.status_code}
    Should Be Equal    ${status_code}    200
    Log To Console    Login successful: OK

    # Extract token from response without logging it
    ${token}=    Set Variable    ${response.json()}[token]
    Set Suite Variable    ${token}
    Log    Token retrieved successfully

Get Current User
    Create Session    apisession    ${BASE_URL}    verify=true
    &{headers}=    Create Dictionary    Authorization=Bearer ${token}
    ${response}=    GET On Session    apisession    /auth/me    headers=${headers}

    # Validation
    ${status_code}=    Convert To String    ${response.status_code}
    Should Be Equal    ${status_code}    200
    Log To Console    User information retrieved: OK
    Should Be Equal    ${response.json()}[username]    ${USERNAME}

Create Diary Entry
    Create Session    apisession    ${BASE_URL}    verify=true
    &{headers}=    Create Dictionary    Authorization=Bearer ${token}    Content-Type=application/json
    ${entry_date}=    Get Current Date    result_format=%Y-%m-%d
    &{body}=    Create Dictionary    entry_date=${entry_date}    mood=Happy    weight=70.5    sleep_hours=8    notes=Test entry created by Robot Framework
    ${response}=    POST On Session    apisession    /entries    json=${body}    headers=${headers}

    # Validation
    ${status_code}=    Convert To String    ${response.status_code}
    Should Be Equal    ${status_code}    201
    Log To Console    Entry created: OK

    # Extract entry ID without logging full response
    ${entry_id}=    Set Variable    ${response.json()}[entry_id]
    Set Suite Variable    ${entry_id}
    Log    Entry ID saved
