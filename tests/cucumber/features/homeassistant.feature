Feature: Home Assistant Custom Card

  Scenario: Card non-interactive when offline
    Then the coffee image should be disabled
    And the "Select Coffee" button should be disabled
    And the "Start" button should be disabled

  Scenario: Stats button opens stats view
    And I click the stats button
    Then the stats view should be visible

  Scenario: Start device
    And I click the power button
    Then the power view should be visible
    When I confirm the power start
    Then the power spinner should appear
    And the device status should be "ON"

  Scenario: Change coffee type
    And I open the coffee selection
    And I choose "Cappuccino"
    And I accept the selection
    Then the coffee picture "Cappuccino" should be visible