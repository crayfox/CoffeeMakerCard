# CoffeeMaker Card

CoffeeMaker Card is a user friendly UI version of the Home Connect integration in Home Assistant. It has two variants - desktop and mobile. For the mobile version the [swiper](http://idangero.us/swiper/) library was used.

> [!NOTE]
> 
> This card was created and tested with a `Siemens EQ.700`. 
> The list of coffees might vary depending on your appliance and therefore you
> might not see all pictures
> 

<br>

**[`Installation`](#installation)** **[`Configuration`](#configuration)** **[`Usage`](#usage)**

<br>

## Installation

<details>

<summary>Without HACS</summary>

<br>

1. Download the file from the dist folder
2. Add the file to your `<config>/www` folder
3. Restart your Home Assistant (just to be sure it recognizes the file)
4. Got to your prefered Home Assistant dashboard
5. Click in the top right corner on `Edit Dashboard`
6. Click on the three dots -> `Manage resources`
7. Click on the `Add resource` button
8. Copy and paste the following: `/local/coffeemaker-card.js?v=1`
9. Make sure `Javascript module` is highlighted (click it if not) and click `Create`
10. Go Back and refresh your page
11. Click again on `Edit Dashboard`
12. Create a new section if necessary and click on the `+`
13. Search for `Coffeemaker Card`
14. After an update to the card you will have to edit `/local/coffeemaker-card.js?vs=1` and change the number to any higher number

Try clearing browser cache if it is not working

</details>

<details>
<summary>With HACS</summary>

<br>

Coming Soon™

</details>

## Configuration

<details>
<summary>Home Connect NOT integrated</summary>
<br>

1. Go to [Home Assistant - Home Connect](https://www.home-assistant.io/integrations/home_connect/) and follow the steps (If you are done continue with step 2)
2. In your Home Assistant go to `Settings -> Home Connect`
3. Click on `Add entry` and create a SingleKey ID account
4. Sign into it and approve Home Connect
5. After that you should be able to connect a device to the Home Connect integration
6. Copy the name of you connected appliance
7. Add a new line `entity: <name of your coffeemaker appliance in Home Connect>`
8. When you see the card itself click save
9. Done!

It should look something like this:
![coffeemaker-card_configuration](/img/coffeemaker-card_configuration.png)

</details>

<details>
<summary>Home Connect already integrated</summary>

<br>

1. Select `Coffeemaker Card` from the list
2. Add a new line `entity: <name of your coffeemaker appliance in Home Connect>`
3. click save
4. Done!

It should look something like this:
![coffeemaker-card_configuration](/img/coffeemaker-card_configuration.png)

</details>

## Usage

The card is non-interactive as long as the appliance is offline. To start using it click on the red power icon and start your appliance. (It is online when the button turns green and reads `ON`)

<details>
<summary>Desktop Version</summary>
<br>

1. Click on `Select Coffee` button or on the coffee picture itself to get a list of available coffees
2. Select your favorite coffee from the list
3. Adjust sliders to your liking
4. Click `Start` and wait for it to finish
5. Enjoy!

![desktop-version](/img/desktop-version.png) ![desktop-version_list](/img/desktop-version_list.png)

</details>

<details>
<summary>Mobile Version</summary>
<br>

1. Swipe to your favorite coffee
2. Adjust sliders to your liking
3. Click `Start` and wait for it to finish
4. Enjoy!

![mobile-version](/img/mobile-version.png)

</details>
