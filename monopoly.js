// monopoly.js by Ceri Woolway - cxv712@gmail.com

// VARIABLE DECLARATIONS -----------------------------------------------------//

let availableTokens = [
    {name: 'dog',           available: true},
    {name: 'thimble',       available: true},
    {name: 'hat',           available: true},
    {name: 'car',           available: true},
    {name: 'battleship',    available: true},
    {name: 'iron',          available: true},
    {name: 'penguin',       available: true},
    {name: 'dinosaur',      available: true},
    {name: 'cat',           available: true},
    {name: 'ducky',         available: true},
]


let board = document.querySelector('#board')
let popupMessage = document.querySelector('#popup-message')
let playerSummary = document.querySelector('#player-summary')
let feed = document.querySelector('#feed-content')
let bankContainer = document.querySelector('#bank')
let bank = document.querySelector('#bank-content')
let playerCreator = document.querySelector('#player-creator')

// Stores which player's turn it is.
// Since the function starts with a ++ we'll initialise as 0
let turn = 0


// Dice related elements
let doublesCount = 0
let diceContainer = document.querySelector('#dice-roll')
let dice1 = document.querySelector('#dice-1')
let dice2 = document.querySelector('#dice-2')
let diceTotal = document.querySelector('#dice-total')
let diceDoubles = document.querySelector('#doubles')

// A variable for how many sides the dice has. Used in testing where 
// larger/smaller numbers are desirable.
let diceSides = 6


// In a standard Monopoly set there are 32 houses and 12 hotels available.
// If there are no houses/hotels in the bank, nobody may build any more.
let availableHouses = 32
let availableHotels = 12

/*
 Community chest and chance cards have a number of properties:
 type - the classification of card as follows:
    + : a card which gains the player money from the bank.
    - : a card which the player has to surrender money to the bank.
    getout : a get out of jail free card which is held onto by the player until used, sold or traded.
    exchange : a card where the players have to exchange money.
    calc : a card where the value has to be calculated.
    move: a card which requires the player to move to a specified spot.

 value - for +  and - cards, this will be the amount to give/take.
       - for move cards, this will be which position to move to.


 
 Another thing to note about the Chance and Community Chest cards is their currency.
 Since 2008 Monopoly uses a currency called 'Monopoly dollars'. The symbol for this is not
 an official character with an alt code and does not appear in any fonts.
 However, it is effectively an upside  down '₩' character - this is for 'Won' - the currency used in North and South Korea.

 To keep the card arrays as simple as possible there is a function which
 replaces all £ signs with the correct symbol.
*/


// TODO - Could these arrays be better implemented as JSON files? They are
// already quite large, and will get even larger if I add support for multiple
// international/theme board types.

// All of the possible community chest cards
let communityChestCards = 
  [
    {description: "Advance to Go (Collect £200)",                                               type: 'move',     value: 0},
    {description: "Bank error in your favor — Collect £200",                                    type: '+',        value: 200},
    {description: "Doctor's fee — Pay £50",                                                     type: '-',        value: 50},
    {description: "From sale of stock you get £50",                                             type: '+',        value: 50},
    {description: "Get Out of Jail Free" ,                                                      type: 'getout',   value: null},
    {description: "Go to Jail – Go directly to jail – Do not pass Go–Do not collect £200",      type: 'move',     value: 10},
    {description: "Grand Opera Night — Collect £50 from every player for opening night seats",  type: 'exchange', value: 50 },
    {description: "Holiday Fund matures — Receive £100" ,                                       type: '+',        value: 100},
    {description: "Income tax refund – Collect £20",                                            type: '+',        value: 20 },
    {description: "It is your birthday — Collect £10",                                          type: '+',        value: 10 },
    {description: "Life insurance matures – Collect £100",                                      type: '+',        value: 100 },
    {description: "Pay hospital fees of £100",                                                  type: '-',        value: 100 },
    {description: "Pay school fees of £150",                                                    type: '-',        value: 150 },
    {description: "Receive £25 consultancy fee",                                                type: '-',        value: 25 },
    {description: "You are assessed for street repairs – £40 per house – £115 per hotel",       type: 'calc',     value: null },
    {description: "You have won second prize in a beauty contest – Collect £10",                type: '+',        value: 10},
    {description: "You inherit £100",                                                           type: '+',        value: 100 }
  ]

let chanceCards = 
  [
    {description: "Advance to Go (Collect £200)",                                               type: 'move',       value: 0 },
    {description: "Advance to Trafalgar Square — If you pass Go, collect £200",                 type: 'move',       value: 24 },
    {description: "Advance to Pall Mall – If you pass Go, collect £200",                        type: 'move',       value: 11 },
    {description: "Advance token to nearest Utility. If unowned, you may buy it from the Bank. If owned, throw dice and pay owner a total ten times the value thrown.", type: 'move',   value: 'nearest-utility' },
    {description: "Advance token to the nearest station and pay owner twice the rental to which he/she {he} is otherwise entitled. If Railroad is unowned, you may buy it from the Bank.", type: 'move',   value: 'nearest-station' },
    {description: "Bank pays you dividend of £50",                                              type: '+',          value: 50 },
    {description: "Get Out of Jail Free",                                                       type: 'getout',     value: null },
    {description: "Go Back 3 Spaces",                                                           type: 'move',       value: -3 },
    {description: "Go to Jail – Go directly to Jail – Do not pass Go, do not collect £200",     type: 'move',       value: 10 },
    {description: "Make general repairs on all your property – For each house pay £25 – For each hotel £100", type: 'calc',   value: null },
    {description: "Pay poor tax of £15",                                                        type: '-',          value: 15 },
    {description: "Take a trip to Marylebone Station – If you pass Go, collect £200",           type: 'move',       value: 15 },
    {description: "Advance to Mayfair",                                                         type: 'move',       value: 39 },
    {description: "You have been elected Chairman of the Board–Pay each player £50",            type: 'exchange',   value: 50 },
    {description: "Your building and loan matures — Collect £150",                              type: '+',          value: 150 },
    {description: "You have won a crossword competition — Collect £100",                        type: '+',          value: 100 }
  ]

//TODO - the rent values are placeholders and need to be updated to the actual values.

/* Rent values are set up as follows:
   0 : the base rent without any houses
   1 : the amount of rent with a full group set.
   2-5 : the amount of rent with 1-4 houses
   6 : the amount of rent with a hotel.
*/



let spaces =  [
    {name: 'Go',                    type: 'special',            price: null,    group: 'corner',       boardposition: 'south', rent:[2,4,10,30,90,160,250], houseCost: 50, hotelCost: 250, owner: null, houses: 0},
    {name: 'Old Kent Road',         type: 'property',           price: 60,      group: 'brown',        boardposition: 'south', rent:[2,4,10,30,90,160,250], houseCost: 50, hotelCost: 250, owner: null, houses: 0},
    {name: 'Community Chest',       type: 'community-chest',    price: null,    group: null,           boardposition: 'south', rent:[2,4,10,30,90,160,250], houseCost: 50, hotelCost: 250, owner: null, houses: 0},
    {name: 'Whitechapel Road',      type: 'property',           price: 60,      group: 'brown',        boardposition: 'south', rent:[2,4,10,30,90,160,250], houseCost: 50, hotelCost: 250, owner: null, houses: 0},
    {name: 'Income tax',            type: 'special',            price: null,    group: null,           boardposition: 'south'},
    {name: 'Kings Cross Station',   type: 'station',            price: 200,     group: 'train-station',boardposition: 'south', rent:[25,50,100,200], owner: null},
    {name: 'The Angel Islington',   type: 'property',           price: 100,     group: 'lightblue',    boardposition: 'south', rent:[2,4,10,30,90,160,250], houseCost: 50, hotelCost: 250, owner: null, houses: 0},
    {name: 'Chance',                type: 'chance',             price: null,    group: null,           boardposition: 'south'},
    {name: 'Euston Road',           type: 'property',           price: 100,     group: 'lightblue',    boardposition: 'south', rent:[2,4,10,30,90,160,250], houseCost: 50, hotelCost: 250, owner: null, houses: 0},
    {name: 'Pentonville Road',      type: 'property',           price: 100,     group: 'lightblue',    boardposition: 'south', rent:[2,4,10,30,90,160,250], houseCost: 50, hotelCost: 250, owner: null, houses: 0},

    {name: 'Jail',                  type: 'special',            price: null,    group: 'corner',       boardposition: 'west'},
    {name: 'Pall Mall',             type: 'property',           price: 140,     group: 'pink',         boardposition: 'west', rent:[2,4,10,30,90,160,250], houseCost: 50, hotelCost: 250, owner: null, houses: 0},
    {name: 'Electric Company',      type: 'utility',            price: 150,     group: 'utility',      boardposition: 'west', rent:["If one utility is owned, rent is 4 times amount shown on dice.", "If both utilities are owned, rent is 10 times amount shown on dice."], owner: null,},
    {name: 'Whitehall',             type: 'property',           price: 140,     group: 'pink',         boardposition: 'west', rent:[2,4,10,30,90,160,250], houseCost: 50, hotelCost: 250, owner: null, houses: 0},
    {name: 'Northumberland Avenue', type: 'property',           price: 150,     group: 'pink',         boardposition: 'west', rent:[2,4,10,30,90,160,250], houseCost: 50, hotelCost: 250, owner: null, houses: 0},
    {name: 'Marylebone Station',    type: 'station',            price: 200,     group: 'train-station',boardposition: 'west', rent:[25,50,100,200],        owner: null},
    {name: 'Bow Street',            type: 'property',           price: 180,     group: 'orange',       boardposition: 'west', rent:[2,4,10,30,90,160,250], houseCost: 50, hotelCost: 250, owner: null, houses: 0},
    {name: 'Community Chest',       type: 'community-chest',    price: null,    group: null,           boardposition: 'west', rent:[2,4,10,30,90,160,250], houseCost: 50, hotelCost: 250, owner: null, houses: 0},
    {name: 'Marlborough Street',    type: 'property',           price: 180,     group: 'orange',       boardposition: 'west', rent:[2,4,10,30,90,160,250], houseCost: 50, hotelCost: 250, owner: null, houses: 0},
    {name: 'Vine Street',           type: 'property',           price: 200,     group: 'orange',       boardposition: 'west', rent:[2,4,10,30,90,160,250], houseCost: 50, hotelCost: 250, owner: null, houses: 0},

    {name: 'Free Parking',          type: 'special',            price: null,    group: 'corner',       boardposition: 'north'},
    {name: 'Strand',                type: 'property',           price: 220,     group: 'red',          boardposition: 'north', rent:[2,4,10,30,90,160,250], houseCost: 50, hotelCost: 250, owner: null, houses: 0},
    {name: 'Chance',                type: 'chance',             price: null,    group: null,           boardposition: 'north'},
    {name: 'Fleet Street',          type: 'property',           price: 220,     group: 'red',          boardposition: 'north', rent:[2,4,10,30,90,160,250], houseCost: 50, hotelCost: 250, owner: null, houses: 0},
    {name: 'Trafalgar Square',      type: 'property',           price: 240,     group: 'red',          boardposition: 'north', rent:[2,4,10,30,90,160,250], houseCost: 50, hotelCost: 250, owner: null, houses: 0},
    {name: 'Fenchurch St. Station', type: 'station',            price: 200,     group: 'train-station',boardposition: 'north', rent:[25,50,100,200],        owner: null},
    {name: 'Leicester Square',      type: 'property',           price: 220,     group: 'yellow',       boardposition: 'north', rent:[2,4,10,30,90,160,250], houseCost: 50, hotelCost: 250, owner: null, houses: 0},
    {name: 'Water Works',           type: 'utility',            price: 150,     group: 'utility',      boardposition: 'north', rent:["If one utility is owned, rent is 4 times amount shown on dice.", "If both utilities are owned, rent is 10 times amount shown on dice."], owner: null},
    {name: 'Coventry Street',       type: 'property',           price: 260,     group: 'yellow',       boardposition: 'north', rent:[2,4,10,30,90,160,250], houseCost: 50, hotelCost: 250, owner: null, houses: 0},
    {name: 'Piccadilly',            type: 'property',           price: 280,     group: 'yellow',       boardposition: 'north', rent:[2,4,10,30,90,160,250], houseCost: 50, hotelCost: 250, owner: null, houses: 0},
    
    {name: 'Go To Jail',            type: 'special',            price: null,    group: 'corner',       boardposition: 'east'},
    {name: 'Regent Street',         type: 'property',           price: 300,     group: 'green',        boardposition: 'east', rent:[2,4,10,30,90,160,250], houseCost: 50, hotelCost: 250, owner: null, houses: 0},
    {name: 'Oxford Street',         type: 'property',           price: 300,     group: 'green',        boardposition: 'east', rent:[2,4,10,30,90,160,250], houseCost: 50, hotelCost: 250, owner: null, houses: 0},
    {name: 'Community Chest',       type: 'community-chest',    price: null,    group: null,           boardposition: 'east'},
    {name: 'Bond Street',           type: 'property',           price: 320,     group: 'green',        boardposition: 'east', rent:[2,4,10,30,90,160,250], houseCost: 50, hotelCost: 250, owner: null, houses: 0},
    {name: 'Liverpool St. Station', type: 'station',            price: 200,     group: 'train-station',boardposition: 'east', rent:[25,50,100,200],        houseCost: 50, hotelCost: 250, owner: null, houses: 0},
    {name: 'Chance',                type: 'chance',             price: null,    group: null,           boardposition: 'east'},
    {name: 'Park Lane',             type: 'property',           price: 350,     group: 'darkblue',     boardposition: 'east', rent:[2,4,10,30,90,160,250], houseCost: 50, hotelCost: 250, owner: null, houses: 0},
    {name: 'Super Tax',             type: 'special',            price: null,    group: null,           boardposition: 'east'},
    {name: 'Mayfair',               type: 'property',           price: 400,     group: 'darkblue',     boardposition: 'east', rent:[2,4,10,30,90,160,250], houseCost: 50, hotelCost: 250, owner: null, houses: 0},
]

// An empty array for now. Will be filled with player info later.
let players = []

// The maximum number of players allowed in the game.
let maxNumberOfPlayers = 4

let availableActions = {
    rollDice: true,
    endTurn: false,
    getOutOfJail: false,
    rollDoublesForJail: false,
    buildHouse: true,
    buildHotel: true,
    closePopup: true
}

let currencySymbol = '₩'
let currencySymbolSpan = '<span class="currencySymbol">&nbsp;' + currencySymbol + '</span>'

// Page setup functions ------------------------------------------------------//

initialisePage()

function initialisePage(){

    // Generate the page where the players are determined.
    intialisePlayerCreator()

    // Generate all of the spaces on the board
    // While this could be done in the HTML, doing it based on a JS array means
    // I can potentially add other international boards easily in the future.
    generateBoard()

    // Shuffle both decks of cards
    shuffleArray(communityChestCards)
    shuffleArray(chanceCards)
    cardCurrency()

    // Make the board the same height as its width
    resizeBoard()

    // Add all of the required event listeners
    addEvents()

    // Initialise the bank
    updateBank()
}

function cardCurrency(){
    communityChestCards.forEach(replaceSymbols)
    chanceCards.forEach(replaceSymbols)

    function replaceSymbols(card){
        card.description = card.description.replace(/£/g, currencySymbolSpan)
    }
}

function generateBoard(){

    let positionNumber = 0

    spaces.forEach(function(space){

        space.position = positionNumber

        let newSpace = document.createElement('div')
        newSpace.setAttribute('id', space.name.replace(/\s+/g, '-').toLowerCase())
        newSpace.classList.add(space.type)

        if (space.group){
            newSpace.classList.add(space.group)
        }
        
        newSpace.innerHTML = space.name.toUpperCase()

        if (space.price){
            newSpace.innerHTML += '<div class="property-price">' + currencySymbolSpan + space.price + '</div>'
            newSpace.setAttribute('price', space.price)
        }


        // TODO - this generates the house display for spaces it shouldn't and 
        // I can't currently figure out why. I'm currently hiding the
        // unwanted ones in the CSS but it would be better if they just
        // didnt't exist in the first place.
        if (space.houses != null){
            newSpace.setAttribute('houses', space.houses)
            let houseContainer = document.createElement('div')
            houseContainer.classList.add('property-house-display')

            for (i = 0; i <5; i++){
                let newHouse = document.createElement('div')
                houseContainer.appendChild(newHouse)
            }

            newSpace.appendChild(houseContainer)
        }

        

        // Add a position number to each property.
        // This will be used to move the tokens around the board
        newSpace.setAttribute('position', positionNumber)
        positionNumber++

        board.querySelector('#' + space.boardposition).appendChild(newSpace)
    })

}

function addEvents(){

    // Close the popup when the close button is clicked,
    // or the escape key is pressed.
    document.querySelector('#popup-close').addEventListener('click', closePopup)

    document.onkeydown = function(e) {
        e = e || window.event
        if (e.keyCode == 27 && document.getAttribute('close-popup') === true) {
            closePopup()
        }
    }

    board.addEventListener('click', function(e){
        let target = e.target
        if (target.classList.contains('property') || target.classList.contains('utility') || target.classList.contains('station')){
            displayPropertyDetails(e.target.getAttribute('position'))
        }
    })

    // TODO - this may be better achieved using a listener on the
    // availableActions object, rather than every time someone clicks.
    window.addEventListener('click', setAvailableActions)

    // Ensure the board's height is always the same as its width,
    // so it is always square
    window.addEventListener('resize', resizeBoard)

    //diceRollButton.addEventListener('click', rollDice)

    addTestingEvents()
    
}

function resizeBoard(){
    board.style.height = board.offsetWidth + 'px'

    feed.parentNode.style.height = (board.offsetWidth - bank.parentNode.offsetHeight - 3) + 'px'

    //feed.parentElement.style.height = (board.offsetHeight + 155) + 'px'
}

function setAvailableActions(){
    document.body.setAttribute('dice-roll-available', availableActions.rollDice)
    document.body.setAttribute('end-turn-available', availableActions.endTurn)
    document.body.setAttribute('get-out-of-jail', availableActions.getOutOfJail)
    document.body.setAttribute('roll-doubles-for-jail', availableActions.rollDoublesForJail)
    document.body.setAttribute('build-house', availableActions.buildHouse)
    document.body.setAttribute('build-hotel', availableActions.buildHotel)
    document.body.setAttribute('close-popup', availableActions.closePopup)
}


// This function should be run every time a player's details have been updated.
// This will trigger a nice animation.
function updatePlayerDetails(){

    players.forEach(function(player){

        // MONEY
        let updateNode = document.querySelector('#player-' + player.id + '-money')
        let oldValue = updateNode.textContent
        oldValue = parseInt(oldValue.replace(/\D/g, ''))
        let newValue = player.money
    
        // If the values have changed, animate it based on whether it's a good/bad change
        if (oldValue > newValue){
            animateUpdate(updateNode, 'bad')
        }else if (oldValue < newValue){
            animateUpdate(updateNode, 'good')
        }

        updateNode.innerHTML = currencySymbolSpan + player.money

        // JAIL
        updateNode = document.querySelector('#player' + player.id + 'summary')
        if (player.inJail !== 0){
            updateNode.setAttribute('inJail', true)
        } else{
            updateNode.setAttribute('inJail', false)
        }

        // PROPERTIES       
        updateNode = document.querySelector('#player-' + player.id + '-properties')
        
        // Clear the existing properties so we can start again. This has the
        // benefit of ensuring all colour groups end up together rather than
        // just adding them to the end.
        updateNode.innerHTML = ''

        player.properties.forEach(function(property){
            let propertyIcon = document.createElement('div')
            propertyIcon.classList.add('property-icon', property.group, player.properties.indexOf(property) )

            if (property.group === 'utility'){
                let propertyName = property.name
                propertyName = propertyName.replace(/\s/g, '-')
                propertyIcon.classList.add(propertyName.toLowerCase())
                console.log('utility')
            }

            updateNode.appendChild(propertyIcon)
        })

        // Re-append the station icons so they end up together at the end.
        ;[].forEach.call(updateNode.querySelectorAll('.train-station'), function(node){
            updateNode.appendChild(node)
        })

        // Re-append the utilirt icons so they end up together at the end
        // and with appropriate classes
        ;[].forEach.call(updateNode.querySelectorAll('.utility'), function(node){
            updateNode.appendChild(node)
        })

    })

    updateBank()
}

function updateBank(){

    bank.innerHTML = ''

    // TODO - a lot of this could be done using CSS.

    let houseContainer = document.createElement('div')
    for (i = 1; i <= availableHouses; i++){
        let houseIcon = document.createElement('div')
        houseIcon.classList.add('bank-house-icon')
        houseContainer.appendChild(houseIcon)
    }

    let hotelContainer = document.createElement('div')
    for (i = 1; i <= availableHotels; i++){
        let hotelIcon = document.createElement('div')
        hotelIcon.classList.add('bank-hotel-icon')
        hotelContainer.style.minWidth = '74px'
        hotelContainer.style.flexBasis = '74px'
        hotelContainer.appendChild(hotelIcon)
    }

    if (availableHouses < 1){
        availableActions.buildHouse = false
    } else{
        availableActions.buildHouse = true
    }

    if (availableHotels < 1){
        availableActions.buildHotel = false
    } else{
        availableActions.buildHotel = true
    }

    setAvailableActions()

    bank.appendChild(houseContainer)
    bank.appendChild(hotelContainer)
}

// Add a class for 2 seconds. This is used in the CSS to run a suitable animation.
function animateUpdate(node, type){
    node.classList.add(type + '-change')
    window.setTimeout(function(){
        node.classList.remove(type + '-change')
    }, 2000)
}

// TESTING FUNCTIONS ---------------------------------------------------------//
// A number of functions intended to help with testing.
// Not intended for actual game use.

function addTestingEvents(){
    
    let testingToggle = document.querySelector('#testing-toggle')
    testingToggle.addEventListener('change', function(){
        document.body.classList.toggle('testing-panel-enabled')
    })
    
    let fakeDiceRollInput = document.querySelector('#fake-dice-roll-total')
    let fakeDiceRollButton = document.querySelector('#fake-dice-roll-total-button')
    fakeDiceRollButton.addEventListener('click', function(){
        fakeRollDice(fakeDiceRollInput.value)
    })

    

    let availableHousesInput = document.querySelector('#available-houses-test')
    availableHousesInput.addEventListener('change', function(){
        availableHouses = parseInt(availableHousesInput.value)
        updateBank()
    })

    let availableHotelsInput = document.querySelector('#available-hotels-test')
    availableHotelsInput.addEventListener('change', function(){
        availableHotels = parseInt(availableHotelsInput.value)
        updateBank()
    })
}


// Runs a dice roll where you specify the total.
// Helpful when you need to land on a certain space to test.
function fakeRollDice(fakeTotal){
    let roll1 = fakeTotal - 1
    let roll2 = 1
    let total = roll1 + roll2

    // If the two numbers are the same, report that we rolled doubles.
    // Three doubles in a row sends you to jail.
    let doubles = (roll1 === roll2) ? true : false

    //return [roll1, roll2, total, doubles]

    dice1.className = "dice dice-roll-" + roll1
    dice2.className = "dice dice-roll-" + roll2
    diceTotal.innerText = total
    

    if (doubles){
        doublesCount++
        availableActions.rollDice = true
    } else{
        diceDoubles.innerText = ""
        doublesCount = 0
        availableActions.rollDice = false
        availableActions.endTurn = true
    }

    if (doublesCount === 3){
        let token = document.querySelector('#' + document.body.getAttribute('turn') + 'token')
        goToJail(token)
        addToFeed(players[turn-1].name + ' rolled 3 doubles and went to jail!', 'go-to-jail')
    } else{
        moveToken(total)
    }

    switch (doublesCount){
        case 0:
            diceDoubles.innerText = ""
            diceContainer.className = "double0"
            break
        case 1:
            diceDoubles.innerText = "1st double"
            diceContainer.className ="double1"
            addToFeed(players[turn-1].name + ' rolled doubles', 'doubles')
            break
        case 2:
            diceDoubles.innerText = "2nd double"
            diceContainer.className = "double2"
            addToFeed(players[turn-1].name + ' rolled their second double. Careful!', 'doubles-2nd')
            break
        case 3:
            diceDoubles.innerText = "3rd double! Go to jail."
            diceContainer.className = "double3"
            
            //goToJail()
            doublesCount = 0
    }
}



// PLAYER CREATION FUNCTIONS -------------------------------------------------//

function intialisePlayerCreator(){

    shuffleArray(availableTokens)
    
    // Create the 'Add player' button
    let addPlayer = document.createElement('div')
    addPlayer.classList.add('add-player-button')
    addPlayer.textContent = 'ADD PLAYER'
    let icon = document.createElement('img')
    icon.src = 'images/plus.svg'
    addPlayer.appendChild(icon)
    playerCreator.appendChild(addPlayer)

    addPlayer.addEventListener('click', function(){
        currentNumberOfPlayers++
        createPlayerCreationPanel(currentNumberOfPlayers)

        if (currentNumberOfPlayers === maxNumberOfPlayers){
            playerCreator.removeChild(addPlayer)
        }
    })

    

    document.querySelector('#new-player-overlay').addEventListener('click', function(e){

        let condition = e.target.classList.contains('token-option')
        let existingPanel = document.querySelector('.available-token-choices')

        if (!condition && existingPanel){
            existingPanel.parentNode.removeChild(existingPanel)
        }
    })

    createPlayerCreationPanel(1)
    createPlayerCreationPanel(2)
    let currentNumberOfPlayers = 2

    function createPlayerCreationPanel(playerID){
        let newPanel = document.createElement('div')
        newPanel.classList.add('player-creation-panel')
        newPanel.setAttribute('player', playerID)

        // Create a nice title
        let title = document.createElement('h2')
        title.textContent = 'PLAYER ' + playerID
        newPanel.appendChild(title)


        // Create a token selector
        let tokenSelector = document.createElement('div')
        tokenSelector.classList.add('token-selector')

        // Create a div at the top of the selector to display the chosen one
        let tokenSelectorChosenIndicator = document.createElement('div')
        tokenSelectorChosenIndicator.classList.add('token-selector-chosen-indicator')
        tokenSelectorChosenIndicator.setAttribute('chosenToken', availableTokens[playerID - 1].name)
        tokenSelectorChosenIndicator.setAttribute('chosenTokenID', (playerID - 1))
        tokenSelectorChosenIndicator.classList.add('token-option', 'token-option-' + availableTokens[playerID - 1].name)
        availableTokens[playerID - 1].available = false
        tokenSelector.appendChild(tokenSelectorChosenIndicator)


        // When the token indicator is clicked, generate a panel to allow users
        // to choose their own token from a list.
        tokenSelectorChosenIndicator.addEventListener('click', function(){

            let alreadyDisplayingTokenChoicesPanel = document.querySelector('.available-token-choices')

            if (alreadyDisplayingTokenChoicesPanel){
                alreadyDisplayingTokenChoicesPanel.parentNode.removeChild(alreadyDisplayingTokenChoicesPanel)
            }

            let availableTokenChoices = document.createElement('div')
            availableTokenChoices.classList.add('available-token-choices')
            
            availableTokens.forEach(function(token){
                if (token.available === true){
                    let tokenOption = document.createElement('div')
                    tokenOption.classList.add('token-option', 'token-option-' + token.name)
                    tokenOption.setAttribute('token', token.name)
                    tokenOption.setAttribute('id', availableTokens.indexOf(token))
                    availableTokenChoices.appendChild(tokenOption)
                }
            })

            tokenSelector.appendChild(availableTokenChoices)

            // Add a function so that it stores which token has been chosen
            availableTokenChoices.addEventListener('click', function(e){
                let clickedOption = e.target

                if (e.target.classList.contains('token-option')){

                    // Set an attribute on the chosen indicator to show what token has been chosen.
                    tokenSelectorChosenIndicator.setAttribute('chosentoken', clickedOption.getAttribute('token'))
                    
                    // Determind what the old chosen one was and reset its availability.                    
                    let oldSelectedOption = availableTokenChoices.previousElementSibling.getAttribute('chosentokenid')
                    availableTokens[oldSelectedOption].available = true
                    tokenSelectorChosenIndicator.setAttribute('chosentokenid', clickedOption.getAttribute('id'))
                    
                    // Mark the token we have chosen as unavailable to other players.
                    availableTokens[clickedOption.getAttribute('id')].available = false

                    // Close the window
                    availableTokenChoices.parentNode.removeChild(availableTokenChoices)
                }

            })
        })        

        // Add the token selector to the new player panel
        newPanel.appendChild(tokenSelector)


        // Create a name input
        let name = document.createElement('input')
        name.classList.add('player-name-input')
        name.setAttribute('placeholder', 'player name')
        newPanel.appendChild(name)



        // Insert this new player panel before the add player button
        playerCreator.insertBefore(newPanel, playerCreator.lastChild)
    }


    
}


function createPlayers(){
    let newPlayersOverlay = document.querySelector('#new-player-overlay')


    // Generate an object for each player, and add it to the players array
    ;[].forEach.call(document.querySelectorAll('.player-creation-panel'), function(playerCreationPanel){
        let newPlayer = {money:1500, inJail: 0, properties: [], position: 0}
        newPlayer.id = playerCreationPanel.getAttribute('player')
        newPlayer.token = playerCreationPanel.querySelector('.token-selector-chosen-indicator').getAttribute('chosentoken')

        // If the user has entered a name for this player, set the name to that.
        // Otherwise just call them Player 1/2/3/4 as appropriate.
        let newPlayerName = playerCreationPanel.querySelector('.player-name-input').value
        newPlayerName = newPlayerName.charAt(0).toUpperCase() + newPlayerName.slice(1)
        newPlayer.name = newPlayerName ? newPlayerName : 'Player ' + playerCreationPanel.getAttribute('player')

        players.push(newPlayer)
    })

    /* Note - the inJail numbers mean:
       0   - not in jail
       1-3 - on their 1st, 2nd or 3rd turn in jail. Can attempt to roll for doubles,
             pay £50 or use a get out of jail free card.
       4   - have used all their chances to get out by rolling doubles.
             MUST pay £50 to get out of jail.
    */

    // Generate a summary for each player
    players.forEach(generatePlayerSummary)

    // Create a token for each player
    players.forEach(function(player){
        let newToken = document.createElement('div')
        newToken.classList.add('token')
        newToken.classList.add(player.token)
        newToken.setAttribute('id', 'player' + (player.id) + 'token')
        newToken.setAttribute('position', 0)
        newToken.setAttribute('area', 'south')
        board.appendChild(newToken)

        

    })





    // Remove the player select overlay once done.
    newPlayersOverlay.parentNode.removeChild(newPlayersOverlay)

    // Start off with player 1's turn
    // TODO - at the beginning of the game, players should all roll the dice.
    // The highest roll wins. If it is a tie, the tying players should roll again.
    increasePlayerTurn()
    
}

function generatePlayerSummary(player){
    let newSummary = document.createElement('div')
    newSummary.setAttribute('id', 'player' + player.id + 'summary')
    
    let playerSummaryHeader = document.createElement('div')
    playerSummaryHeader.classList.add('player-summary-header')

    // Player's token
    let playerToken = document.createElement('div')
    playerToken.classList.add('player-token-icon')
    playerToken.setAttribute('token', player.token)
    playerSummaryHeader.appendChild(playerToken)


    // Player's name
    let title = document.createElement('h2')
    title.innerText = player.name
    playerSummaryHeader.appendChild(title)


    let playerMoney = document.createElement('div')
    playerMoney.setAttribute('id', 'player-' + player.id + '-money')
    playerMoney.innerHTML = currencySymbolSpan + player.money
    playerSummaryHeader.appendChild(playerMoney)

    newSummary.appendChild(playerSummaryHeader)
    

    // Note - this was originally done with a loop.
    // Eventually it became the case that I didn't want all of the player values
    // to display in the summary, and I wanted different ones to display differently.
    // The code below creates a more streamlined interface, even if the JS
    // isn't as simple as it could be.


    // PROPERTIES
    let playerPortfolioTitle = document.createElement('span')
    playerPortfolioTitle.setAttribute('player', player.id)
    playerPortfolioTitle.addEventListener('click', fullPortfolioView)
    playerPortfolioTitle.innerText = 'Property portfolio⯈'
    playerPortfolioTitle.classList.add('property-portfolio-title')
    newSummary.appendChild(playerPortfolioTitle)

    let playerPortfolio = document.createElement('div')
    playerPortfolio.setAttribute('id', 'player-' + player.id + '-properties')
    playerPortfolio.classList.add('property-portfolio')
    playerPortfolio.addEventListener('click', portfolioItemPreview)

    newSummary.appendChild(playerPortfolio)

    
    // TODO - much of this could probably be achieved much more simply with a loop

    // Create the buttons that allow players to end their turns.
    // CSS will be used to only show this for the player whose turn it is.
    let newEndTurnButton = document.createElement('button')
    newEndTurnButton.innerText = 'End turn'
    newEndTurnButton.classList.add('end-turn-button', 'player-action-button')
    newEndTurnButton.addEventListener('click', increasePlayerTurn)


    // Create the buttons that allow players to roll the dice.
    let newRollDiceButton = document.createElement('button')
    newRollDiceButton.innerText = 'Roll dice'
    newRollDiceButton.classList.add('roll-dice-button', 'player-action-button')
    newRollDiceButton.addEventListener('click', rollDice)

    
    // Create the "Pay £50 to get out of jail" buttons
    let newGetOut50Button = document.createElement('button')
    newGetOut50Button.innerHTML = 'Pay ' + currencySymbolSpan + '50 to get out of jail'
    newGetOut50Button.classList.add('get-out-50-button', 'player-action-button')
    newGetOut50Button.addEventListener('click', function(){getOutOfJail('pay')})

    // Create the "Roll doubles to get out of jail" buttons
    let newRollDoublesForJailButton = document.createElement('button')
    newRollDoublesForJailButton.innerText = "Roll doubles to get out of jail"
    newRollDoublesForJailButton.classList.add('roll-doubles-for-jail', 'player-action-button')
    newRollDoublesForJailButton.addEventListener('click', rollDoublesForJail)

    // Append all these new elements to the relevant player summary
    newSummary.appendChild(newGetOut50Button)
    newSummary.appendChild(newRollDoublesForJailButton)
    newSummary.appendChild(newRollDiceButton)
    newSummary.appendChild(newEndTurnButton)
    playerSummary.appendChild(newSummary)

}



// COMMUNITY CHEST AND CHANCE FUNCTIONS --------------------------------------//

function drawCard(type){

    // Note that chance and community chest cards are not drawn randomly.
    // They are shuffled at the beginning of the game.
    // When drawn, the card is returned to the bottom of the pile.
    // This way, they always stay in the same rotation.

    let cardList = (type === "community-chest") ? communityChestCards : chanceCards
    let chosenCard = cardList.shift()
    openPopup(chosenCard.description)
    cardList.push(chosenCard)
    
    switch (chosenCard.type){
        case '+':
            // A card which gains the player money from the bank
            players[turn - 1].money += chosenCard.value
            addToFeed(players[turn - 1].name + ' got ' + currencySymbolSpan + chosenCard.value + ' from a ' + getReadableCardName(type) + ' card', 'money-plus')
            break
        case '-':
            // A card where the player has to surrender money to the bank
            players[turn - 1].money -= chosenCard.value

            addToFeed(players[turn - 1].name + ' lost ' + currencySymbolSpan + chosenCard.value + ' to a ' + getReadableCardName(type) +' card', 'money-minus')
            break
        case 'getout':
            // TODO
            console.log('getout: a get out of jail free card which is held onto by the player until used, sold or traded.')
            addToFeed('Get out of jail free card', 'get-out-card')
            break
        case 'exchange':
            // TODO
            console.log('exhange: a card where the value has to be calculated.')
            addToFeed('Exchange card')
            break
        case 'calc':
            // TODO
            console.log('calc: a card where the value has to be calculated.')
            addToFeed('Calc card')
            break
        case 'move':
            // TODO
            cardBasedMovement(chosenCard, type)
            break
        }

    // While not all cards will require this, a large majority will
    updatePlayerDetails()
}

// TODO - are there other Monopoly sets where the cards aren't called
// Community Chest or 'Chance'? I could achieve the same thing with a regex.

// Generates a player-friendly card type name.
// Used in certain output messages
function getReadableCardName(type){
    if(type === 'community-chest'){
        return 'Community Chest'
    } else{
        return 'Chance'
    }
  }


// Move the token after drawing a card. 
// Calculations depending on exactly what type of 'move' card has been drawn.
function cardBasedMovement(chosenCard, type){

    let currentPosition = parseInt(document.querySelector('#player' + turn  + 'token').getAttribute('position'))

    switch (chosenCard.value){
        // Go to jail
        case 10:
            goToJail(document.querySelector('#player' + turn + 'token'))
            addToFeed(players[turn - 1].name + ' drew a ' + getReadableCardName(type) + ' card and went to jail!', 'go-to-jail')
            break
        
        // Advance to Go
        case 0:
            // The moveToken function works with the number of spaces to move, rather than a position to move to.
            // Therefore a little maths is required.
            let endTotal = 40 - document.querySelector('#player' + turn  + 'token').getAttribute('position')
            moveToken(endTotal)
            addToFeed(getCardMovementFeedMessage(0), 'advance')
            break

        case 'nearest-utility':
            // TODO - player should pay rent to the value of 10x dice roll
            if (currentPosition < 12 || currentPosition > 27){
                // Electric company
                moveToken(calculateCardMovement(12))
                addToFeed(getCardMovementFeedMessage(12), 'advance')
            } else{
                // Water works
                moveToken(calculateCardMovement(27))
                addToFeed(getCardMovementFeedMessage(27), 'advance')
            }
            break

        case 'nearest-station':
            // TODO - player should pay double rent

            if (currentPosition < 5 || currentPosition > 35){
                // Station 1 (King's Cross)
                moveToken(calculateCardMovement(5))
                addToFeed(getCardMovementFeedMessage(5), 'advance')
              } else if (currentPosition < 15){
                // Station 2 (Marylebone)
                moveToken(calculateCardMovement(15))
                addToFeed(getCardMovementFeedMessage(15), 'advance')
            } else if (currentPosition < 25){
                // Station 3 (Fenchurch St)
                moveToken(calculateCardMovement(25))
                addToFeed(getCardMovementFeedMessage(25), 'advance')
            } else{
                // Station 4 (Liverpool St)
                moveToken(calculateCardMovement(35))
                addToFeed(getCardMovementFeedMessage(35), 'advance')
            }

            
            break 
        // A basic move card which tells you to move to a numbered position that requires no complicated maths.
        default:
            //moveToken(chosenCard.value)
            addToFeed(getCardMovementFeedMessage(chosenCard.value), 'advance')
            moveToken(calculateCardMovement(chosenCard.value))
    }


    // Outputs a nice player readable message to put in the feed.
    function getCardMovementFeedMessage(position){
        return players[turn-1].name + ' drew a ' + getReadableCardName(type) + ' card and advanced to ' + spaces[position].name
    }


    // Calculate how far a token needs to move to reach a specified position,
    // considering whether we need to pass Go or not.
    function calculateCardMovement(endPosition){
        // If we don't need to pass go
        if (currentPosition < endPosition){
            return endPosition - currentPosition
        }
        
        // If we DO need to pass go
        else{  
            return (40 + endPosition) - currentPosition
        }
    }
}





// A function which does a Durstenfeld shuffle
// https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}





// POPUP FUNCTIONS -----------------------------------------------------------//

function closePopup(){
    document.body.classList.remove('popup-open')
    availableActions.closePopup = true
    setAvailableActions()
    
    // Reset the build house available action. We'll recheck whether it's
    // appropriate when the window is next opened.
    //availableActions.buildHouse = false
}

// TODO - there's at least one instance in this project where I'd had to hack
// this since I needed to attach nodes with event listeners; HTML alone isn't
// always enough. This might be able to be improved.
function openPopup(message){
    popupMessage.innerHTML = message
    document.body.classList.add('popup-open')
}

// DICE FUNCTIONS ------------------------------------------------------------//


function rollDice(){
    let roll1 = Math.ceil(Math.random() * diceSides)
    let roll2 = Math.ceil(Math.random() * diceSides)
    let total = roll1 + roll2

    // If the two numbers are the same, report that we rolled doubles.
    // Three doubles in a row sends you to jail.
    let doubles = (roll1 === roll2) ? true : false

    dice1.className = "dice dice-roll-" + roll1
    dice2.className = "dice dice-roll-" + roll2
    diceTotal.innerText = total
    

    if (doubles){
        doublesCount++
        availableActions.rollDice = true
    } else{
        diceDoubles.innerText = ""
        doublesCount = 0
        availableActions.rollDice = false
        availableActions.endTurn = true
    }

    if (doublesCount === 3){
        let token = document.querySelector('#' + document.body.getAttribute('turn') + 'token')
        goToJail(token)
        addToFeed(players[turn-1].name + ' rolled 3 doubles and went to jail!', 'go-to-jail')
    } else{
        moveToken(total)
    }

    switch (doublesCount){
        case 0:
            diceDoubles.innerText = ""
            diceContainer.className = "double0"
            break
        case 1:
            diceDoubles.innerText = "1st double"
            diceContainer.className ="double1"
            addToFeed(players[turn-1].name + ' rolled doubles', 'doubles')
            break
        case 2:
            diceDoubles.innerText = "2nd double"
            diceContainer.className = "double2"
            addToFeed(players[turn-1].name + ' rolled their second double. Careful!', 'doubles-2nd')
            break
        case 3:
            diceDoubles.innerText = "3rd double! Go to jail."
            diceContainer.className = "double3"
            
            //goToJail()
            doublesCount = 0
    }
}

// TOKEN FUNCTIONS -----------------------------------------------------------//

// The actual maths involved in moving the token, including passing go and going to jail.
function moveToken(total){
    let token = document.querySelector('#' + document.body.getAttribute('turn') + 'token')

    let startPosition = parseInt(token.getAttribute('position'))
    let endPosition = startPosition + total
    endPosition <= 39 ? token.setAttribute('position', endPosition) : token.setAttribute('position', endPosition - 40)
    players[turn - 1].position = endPosition
    //token.setAttribute('position', endPosition)


    // If we're going to jail, do that, otherwise animate the token
    if (endPosition === 30){
        // TODO - we should animate the token even if we're going to jail.
        goToJail(token)
    } else{
        let i = startPosition
        let myInterval = setInterval(function(){
            if (i <= endPosition){
                positionToken(token, i)
                i++

                // If i is 40, that means we've landed back on 'Go.
                // Reset i and endPosition and give the player £200
                if (i === 40){
                    i = 0
                    endPosition = endPosition - 40
                    players[turn - 1].money += 200
                    updatePlayerDetails()
                    addToFeed(players[turn - 1].name + ' has passed Go and collected ' + currencySymbolSpan + '200', 'advance')
                }
            }

            else{
                // Once the token has reached where it needs to be, stop the animation
                window.clearInterval(myInterval)
                specialEndPositions(endPosition)
            }

        }, 100)
    }
}
    
// Deal with the consequences for when players land on spaces that aren't properties
function specialEndPositions(endPosition){
    switch (endPosition){
        case 2:
        case 17:
        case 33:
            drawCard('community-chest')
            break
        case 7:
        case 22:
        case 36:
            drawCard('chance')
            break
        case 4:
            // Income tax
            players[turn - 1].money -= 200
            addToFeed(players[turn-1].name + ' paid ' + currencySymbolSpan + '200 income tax', 'money-minus')
            updatePlayerDetails()
            break
        case 38:
            // Super tax
            players[turn - 1].money -= 100
            addToFeed(players[turn-1].name + currencySymbolSpan + ' paid 100 super tax', 'money-minus')
            updatePlayerDetails()
            break
        case 0:
        case 10:
        case 20:
            // Go, Jail and Free Parking. Do nothing.
            // The £200 for passing go is dealt with elsewhere in the code.
            break



        default:
            //displayPropertyDetails(endPosition)
            landOnProperty(endPosition)
    }
}


// Puts the token where you want it to be using CSS. No maths is involved.
function positionToken(token, position){
    let matchingProperty = document.querySelector('#board > .row div[position="' + position + '"]')
    let row = matchingProperty.parentNode.getAttribute('id')

    //token.style.top = matchingProperty.offsetTop + 'px'
    //token.style.left = matchingProperty.offsetLeft + 'px'
    //token.style.right = matchingProperty.offsetRight + 'px'
    //token.style.bottom = matchingProperty.offsetBottom + 'px'  
    
    // The token should sit half way from the top of the property, minus half the token's height.
    let desiredTop = matchingProperty.offsetTop += ((matchingProperty.offsetHeight / 2) - (token.offsetHeight / 2))

    // The token should sit half way from the left of the property, minus half the token's width.
    let desiredLeft = matchingProperty.offsetLeft += ((matchingProperty.offsetWidth / 2) - (token.offsetWidth / 2))

    let desiredRight = matchingProperty.offsetRight
    let desiredBottom = matchingProperty.offsetBottom

    let desiredZindex = 1

    // If there are already tokens on the property, move ours
    for (i = 0; i < players.length; i++){
        if (players[i].position === position){
            desiredTop += 10
            desiredZindex++
        }
    }

    token.style.top = desiredTop + 'px'
    token.style.left = desiredLeft + 'px'
    token.style.right = desiredRight + 'px'
    token.style.bottom = desiredBottom + 'px'
    token.style.Zindex = desiredZindex
    token.setAttribute('area', row)

    players[turn - 1].position = position
}

// Puts the token in jail and plays an animation. No maths is involved.
function goToJail(token){
    token.setAttribute('position', 10)
    token.setAttribute('area', 'west')
    positionToken(token,10)
    availableActions.rollDice = false
    availableActions.endTurn = true
    players[turn - 1].inJail++
    players[turn-1].position = 10
    updatePlayerDetails()


    // Add a class which allows a police animation to play.
    // After 3 seconds, remove it.
    document.body.classList.add('jailAnimation')
    window.setTimeout(function(){
        document.body.classList.remove('jailAnimation')
    }, 3000)
}

// GET OUT OF JAIL -----------------------------------------------------------//

function rollDoublesForJail(){
    let roll1 = Math.ceil(Math.random() * diceSides)
    let roll2 = Math.ceil(Math.random() * diceSides)

    // Update the interface
    dice1.className = "dice dice-roll-" + roll1
    dice2.className = "dice dice-roll-" + roll2

    // If the two numbers are the same, report that we rolled doubles.
    // Three doubles in a row sends you to jail.
    let doubles = (roll1 === roll2) ? true : false

    if(roll1 === roll2){
        getOutOfJail('doubles')
        availableActions.rollDice = false
        availableActions.endTurn = true
        moveToken(roll1 + roll2)
        // Note - feed is updated in the GetOutOfJail function
    } else{
        //diceContainer.className = "failed-jail-roll"
        diceDoubles.innerText = "Failure! You have " + (3 - players[turn - 1].inJail + ' attempts remaining')
        availableActions.rollDice = false
        availableActions.endTurn = true
        availableActions.getOutOfJail = false
        addToFeed(players[turn-1].name + ' attempted to roll doubles to get out of jail but failed. They have ' + (3 - players[turn - 1].inJail + ' attempts remaining.'), 'failed-jail-roll')
        players[turn - 1].inJail++
    }

    setAvailableActions()
}

function getOutOfJail(method){
    // TODO
    let player = players[turn - 1]
  
    switch (method){
        case 'pay':
            player.money -= 50
            availableActions.rollDice = true
            addToFeed(players[turn-1].name + ' paid ' + currencySymbolSpan + '50 to get out of jail', 'money-minus')
            break
        case 'card':
            //TODO
            availableActions.rollDice = true
            addToFeed(players[turn-1].name + ' used a Get Out Of Jail Free card to get out of jail', 'get-out-card')
            break
        case 'doubles':
            // Note - you do not get to roll again after rolling doubles to get out of jail
            addToFeed(players[turn-1].name + ' rolled doubles and got out of jail', 'doubles-out-of-jail')
            diceContainer.className = "successful-jail-roll"
            diceDoubles.innerText = "Success!"
            break
    }

    
    availableActions.getOutOfJail = false
    player.inJail = 0
    setAvailableActions()
    updatePlayerDetails()
  
  }

// TODO - this runs at the beginning of each player's turn to check whether the
// current player is in jail and run appropriate actions if they are. There is 
// probably a much better way of doing this.

function checkJail(){

    let jailTurn = players[turn - 1].inJail

    if (jailTurn > 0){
        availableActions.getOutOfJail = true
        availableActions.rollDice = false
        
        // You only get 3 attempts at rolling doubles before you are forced
        // to pay/use a card to get out of jail.
        availableActions.rollDoublesForJail = jailTurn > 3 ? false : true


        
        setAvailableActions()
        
    }
}

// TURN BASED FUNCTIONS ------------------------------------------------------//

function increasePlayerTurn(){


    if (turn === players.length){
        turn = 1
    } else{
        turn ++
    }

    availableActions.rollDice = true
    availableActions.endTurn = false
    document.body.setAttribute('turn', 'player' + turn)

    // Move where the class of 'currentPlayer' sits. This allows buttons to be
    // enabled and disabled in the CSS.
    let currentPlayer = document.querySelector('.current-player-summary')

    if (currentPlayer){
        currentPlayer.classList.remove('current-player-summary')
    }

    document.querySelector('#player' + turn + 'summary').classList.add('current-player-summary')
    
    // TODO - check whether this is being run twice?
    checkJail()
}

// PROPERTY FUNCTIONS --------------------------------------------------------//


function displayPropertyDetails(number){
    htmlOutput = generatePropertyDetails(number)
    openPopup(htmlOutput)
    displayPropertyOptions(number)
}

function generatePropertyDetails(number){

    let htmlOutput = '<div class="property-overview"'

    // If the property is owned, set an attribute on the div we can use elsewhere.
    let owner = spaces[number].owner
    if (owner){
        htmlOutput += ' player="' + owner.id + '">'
    }   else{
        htmlOutput += '>'
    }

    

    switch (spaces[number].type){
        case 'property':
            htmlOutput += generateRentTable(number)
        
            break

        case 'utility':
            let className = spaces[number].name
            className = className.replace(/\s/g, '-')
            htmlOutput += '<div class="card-icon card-icon-' + className + '"></div>'
            htmlOutput += '<div class="property-overview-title">' + spaces[number].name + '</div>'
            htmlOutput += '<div class="price">PRICE: ' + currencySymbolSpan + spaces[number].price + '</div>'

            spaces[number].rent.forEach(function(content){
                htmlOutput += '<div style="max-width: 250px; float: none; margin: 0 auto;"><br>' + content + '</div>'
            })

            htmlOutput += '<br>'

            break

        case 'station':

            htmlOutput += '<div class="card-icon card-icon-station"></div>'
            htmlOutput += '<div class="property-overview-title">' + spaces[number].name + '</div>'
            htmlOutput += '<div class="price">PRICE: ' + currencySymbolSpan + spaces[number].price + '</div>'
            htmlOutput += '<br>'

            // Rent table
            htmlOutput += '<table class="property-overview-table">'
            htmlOutput += '<tr><td>RENT</td><td>' + currencySymbolSpan + spaces[number].rent[0] + '</td></tr>'

            for (i = 2; i <=4; i++){
                htmlOutput += '<tr><td>If ' + i + ' stations are owned</td><td>' + currencySymbolSpan + spaces[number].rent[i - 1] + '</td></tr>'
            }

            htmlOutput += '</table>'
            htmlOutput += '<br>'


            break
        
        }

    return htmlOutput
}


function generateRentTable(number){

    let htmlOutput = ''

    // Rent table
    htmlOutput += '<div class="' + spaces[number].group + ' property-overview-color"><span class="title-deed">TITLE DEED</span><br><div class="property-overview-title">' + spaces[number].name + '</div></div>'
    htmlOutput += '<div class="price">PRICE: ' + currencySymbolSpan + spaces[number].price + '</div>'
    htmlOutput += '<table class="rent-table" style="border-bottom: 1px solid #000; padding-bottom: 10px;"><tr>'
    htmlOutput += '<td style="text-align: left">Rent</td><td style="text-align: right">' + currencySymbolSpan + spaces[number].rent[0] + '</td>'
    htmlOutput += '<tr><td style="text-align: left">Rent with colour set</td><td style="text-align: right">' + currencySymbolSpan + spaces[number].rent[1] + '</td>'
    for (i = 2; i <=6; i++){
        htmlOutput += '<tr><td style="text-align: left">Rent with <span class="property-overview-house-icon">' + (i-1) + '</span></td><td style="text-align: right">' + currencySymbolSpan + spaces[number].rent[i] + '</td></tr>'
    }

    htmlOutput += '</table>'

    // Houses table
    htmlOutput += '<table class="house-price-table">'
    htmlOutput += '<tr><td style="text-align: left">Houses cost</td><td style="text-align: right">' + currencySymbolSpan + spaces[number].houseCost + '</td></tr>'
    htmlOutput += '<tr><td style="text-align: left">Hotels cost</td><td style="text-align: right">' + currencySymbolSpan + spaces[number].houseCost + '</td></tr>'
    htmlOutput += '</table>'


    htmlOutput += '</div>'

    return htmlOutput
}

function portfolioItemPreview(e){
    let target = e.target

    // TODO - Why am I doing this with classes and not attributes?

    if (target.classList.contains('property-icon')){
        let targetProperty = target.classList.value
        targetProperty = targetProperty.replace(/\D/g, '')
        targetProperty = parseInt(targetProperty)
        displayPropertyDetails(targetProperty)

        // If we have come from a full portfolio, give us a back button
        if (e.target.parentNode.classList.contains('full-portfolio-item')){
            let backButton = document.createElement('div')
            backButton.classList.add('back-button')
            backButton.setAttribute('player', spaces[targetProperty].owner.id)
            document.querySelector('.property-overview').appendChild(backButton)
            backButton.addEventListener('click', fullPortfolioView)
        }
    }
}

function fullPortfolioView(e){
    
    let player = e.target.getAttribute('player')


    let portfolioOutput = '<div class="full-portfolio">'

    players[player - 1].properties.forEach(function(property){

        portfolioOutput += '<div class="full-portfolio-item">'
        portfolioOutput += '<div class="property-icon ' + property.group + ' ' + spaces.indexOf(property) + '"></div>' 
        portfolioOutput += '<div>' + property.name + '</div>'
        
        if (property.houses === 5){
            portfolioOutput += '<span class="full-portfolio-hotel"></span>'
        } else{
            for (i = 1; i <= property.houses; i++){
                portfolioOutput += '<span class="full-portfolio-house"></span>'
            }
        }

        portfolioOutput += '</div>'

        //portfolioOutput += '<div class="full-portfolio-item">' + property.name + '</div>'
    })

    portfolioOutput += '</div>'

    openPopup(portfolioOutput)
    document.querySelector('.full-portfolio').addEventListener('click', portfolioItemPreview)
}

function displayPropertyOptions(number){
    let optionsPanel = document.createElement('div')
    
    let propertyOwner = spaces[number].owner
    // If this property is unowned, display a button to buy it
    if (!propertyOwner){
        if (players[turn - 1].position === number){

            // Buy property elements
            let buyButton = document.createElement('button')
            buyButton.innerText = 'Buy this property'
            buyButton.addEventListener('click', function(){
                buyProperty(number, players[turn - 1], 'purchase', null)
            })
            optionsPanel.appendChild(buyButton)


            // Auction property elements
            let auctionButton = document.createElement('button')
            auctionButton.innerText = 'Go to auction'
            auctionButton.addEventListener('click', function(){
                auctionProperty(number)
            })
            optionsPanel.appendChild(auctionButton)

        }
    } 

    // If the player owns this property and it is their turn, display options to build/sell houses
    else if (spaces[number].owner.id == turn){
        
        optionsPanel.innerHTML = 'You own this property!<br>'

        // Display house building options if this is a standard property (not station or utility)
        if (spaces[number].type === 'property'){

            let colour = spaces[number].group

            // If the owner of the property owns the full colour set, bring up the build house window.
            if (checkColourSet(colour, players[turn -  1].id)){
                //availableActions.buildHouse = true
                let colourSetButton = document.createElement('button')
                colourSetButton.classList.add('colour-set-button')
                colourSetButton.innerText = 'Manage colour set'
                colourSetButton.addEventListener('click', function(){
                    displayBuildHousePanel(colour)
                })

                optionsPanel.appendChild(colourSetButton)
            }
        }
        
    }
    
    // If this property is unowned, or it is not currently the owner's turn,
    // display a message
    else{
        optionsPanel.innerHTML = 'This property is owned by ' + spaces[number].owner.name
    }

    popupMessage.appendChild(optionsPanel)
}

function displayBuildHousePanel(colour){

    // Get an array of all of the properties in that colour set.
    let colourSet = []
    for (i = 0; i < spaces.length; i++){
        let property = spaces[i]
        if (property.group === colour){
            colourSet.push(property)
        }
    }

    let houseBuildPanel = document.createElement('div')

    // Create a div to show an overview of the properties in this colour set
    let colourSetOverview = document.createElement('div')
    colourSetOverview.classList.add('colour-set-overview')
    houseBuildPanel.appendChild(colourSetOverview)

    colourSet.forEach(function(property){

        // Generate details of the property (rent etc) for reference
        let setItemDetails = document.createElement('div')
        setItemDetails.classList.add('property-overview')
        setItemDetails.innerHTML += generateRentTable(property.position)
        colourSetOverview.appendChild(setItemDetails)

        // Generate house building buttons
        let housePanel = document.createElement('div')
        housePanel.classList.add('house-building-panel')
        housePanel.setAttribute('position', property.position)
        setItemDetails.appendChild(housePanel)

        // Create a nice little display to show how many houses are on this property
        let houseVisualDisplay = document.createElement('div')
        houseVisualDisplay.classList.add('house-visual-display')
        houseVisualDisplay.setAttribute('houses', spaces[property.position].houses)
        housePanel.appendChild(houseVisualDisplay)

        // Create a panel for the buttons to go in
        let buttonPanel = document.createElement('div')
        buttonPanel.classList.add('button-panel')

        // Create a button to build houses
        let buildHouseBtn = document.createElement('button')
        buildHouseBtn.classList.add('build-house-button')
        buildHouseBtn.innerText = 'Build house'
        buildHouseBtn.textContent = (spaces[property.position].houses === 4) ? 'Build hotel' : 'Build house'
        buildHouseBtn.addEventListener('click', function(){
            buildHouse(property.position) 
        })
        buttonPanel.appendChild(buildHouseBtn)


        // Create a button to sell houses
        let sellHouseBtn = document.createElement('button')
        sellHouseBtn.classList.add('sell-house-button')
        sellHouseBtn.innerText = 'Sell house'
        sellHouseBtn.textContent = (spaces[property.position].houses === 4) ? 'Sell hotel' : 'Sell house'
        sellHouseBtn.addEventListener('click', function(){
            sellHouse(property.position) 
        })
        buttonPanel.appendChild(sellHouseBtn)

        housePanel.appendChild(buttonPanel)

        // Add all this stuff to the options panel       
        setItemDetails.appendChild(housePanel)

        //console.log('bottom of displayBuildHousePanel')
        //toggleHouseBuildButtons()


    })

    // Because we're involving event listeners that can't just be copy and
    // pasted from the HTML, we'll open a blank popup then append the nodes.
    openPopup('')
    popupMessage.appendChild(houseBuildPanel)

    toggleHouseBuildButtons()

    // According to the rules, players must build houses evenly. For example,
    // they can't have 4 houses on one property in the set and 1 on another.
    // This function will toggle the buttons as appropriate to force
    // this behaviour.
    
    function toggleHouseBuildButtons(){
        
        // Create an array of the number of houses on all the properties
        // in the colour set.
        let colourSetHouses = []
        colourSet.forEach(function(property){
            colourSetHouses.push(spaces[property.position].houses)
        })

        
        // Get the highest number of houses in the set.
        let highestNumberOfHouses = Math.max(...colourSetHouses)
        let lowestNumberOfHouses = Math.min(...colourSetHouses)
    
    
        // Functions to check whether all the properties have the same number of buildings
        function checkHouseAmount(houses){
            return highestNumberOfHouses === houses
        }
          
        function checkAllHousesSame(){
            return(colourSetHouses.every(checkHouseAmount))
        }

        
        // If all of the properties have the same number of houses...
        if (checkAllHousesSame()){

            
            if (highestNumberOfHouses === 5){

                // If all the properties have hotels, disable all the build buttons
                ;[].forEach.call(document.querySelectorAll('.house-visual-display + .button-panel .build-house-button'), function(button){
                    button.classList.add('disabled-button')
                })

                // If all the properties have hotels, enable all the sell buttons and update their text 
                ;[].forEach.call(document.querySelectorAll('.house-visual-display + .button-panel .sell-house-button'), function(button){
                    button.classList.remove('disabled-button')
                    button.textContent = 'Sell hotel'
                })
            }
            
            // If all the properties have the same amount of houses but they're NOT hotels, enable all of the build and sell buttons
            else{
                ;[].forEach.call(document.querySelectorAll('.house-visual-display + .button-panel .build-house-button, .house-visual-display:not([houses="0"]) + .button-panel .sell-house-button'), function(button){
                    button.classList.remove('disabled-button')
                })

                ;[].forEach.call(document.querySelectorAll('.house-visual-display + .button-panel .build-house-button'), function(button){
                    button.textContent = 'Build house'
                })
            }

        // If all the properties DON'T have the same number of houses...
        } else{
            // Prevent building on properties that have the most number of houses
            ;[].forEach.call(document.querySelectorAll('.house-visual-display[houses="' + highestNumberOfHouses + '"] + .button-panel .build-house-button' ), function(button){
                button.classList.add('disabled-button')
            })

            // Prevent selling buildings on properties that have the least
            ;[].forEach.call(document.querySelectorAll('.house-visual-display[houses="' + lowestNumberOfHouses + '"] + .button-panel .sell-house-button' ), function(button){
                button.classList.add('disabled-button')
            })
        }

        // For properties that have 4 houses, make the build house button say 'build hotel' instead
        ;[].forEach.call(document.querySelectorAll('.house-visual-display[houses="4"] + .button-panel .build-house-button'), function(node){
            node.textContent = 'Build hotel'
        })

        ;[].forEach.call(document.querySelectorAll('.house-visual-display[houses="4"] + .button-panel .sell-house-button'), function(node){
            node.textContent = 'Sell house'
        })

        // Display message on properties that have a hotel
        ;[].forEach.call(document.querySelectorAll('.house-visual-display[houses="5"] + .button-panel .build-house-button'), function(node){
            node.textContent = 'Maximum number of buildings reached'
        })

        ;[].forEach.call(document.querySelectorAll('.house-visual-display[houses="5"] + .button-panel .sell-house-button'), function(node){
            node.textContent = 'Sell hotel'
        })
        
        // Despite the rule of  building evenly, check there are
        // enough buildings in the bank. This will set an attribute on the
        // body which is used in the CSS to disable the appropriate
        // buttons regardless of what the other maths returns

        if (!availableHouses){
            document.body.setAttribute('build-house', false)
            ;[].forEach.call(document.querySelectorAll('.house-visual-display:not([houses="4"]) + .button-panel .build-house-button:not(.disabled-button)'), function(node){
                node.textContent = 'No houses left in bank'
            })
        }
        
    
        if (!availableHotels){
            document.body.setAttribute('build-hotel', false)
            ;[].forEach.call(document.querySelectorAll('.house-visual-display[houses="4"] + .button-panel .build-house-button:not(.disabled-button)'), function(node){
                node.textContent = 'No hotels left in bank'
            })
        }
    }
    
    
    function buildHouse(number){
        let currentHousesOnProperty = spaces[number].houses
        spaces[number].houses += 1
    
        // If there are 3 or less houses, let us build a house.
        // If there are 4 houses, sell the houses and build a hotel.
        if (currentHousesOnProperty < 4){
            availableHouses--
        } else if (currentHousesOnProperty === 4){
            availableHouses += 4
            availableHotels--
            document.querySelector('.house-building-panel[position="' + number + '"] .button-panel .build-house-button').classList.add('disabled-button')
        }
    
        players[turn - 1].money -= spaces[number].houseCost
        updatePlayerDetails()
    
        // Update visual display to show new higher number of houses
        document.querySelector('.house-building-panel[position="' + number + '"] .house-visual-display').setAttribute('houses', spaces[number].houses)
    
        updateHouseDisplay(number)
        toggleHouseBuildButtons()
    
    }


    function sellHouse(number){
        let currentHousesOnProperty = spaces[number].houses

        // If there is a hotel
        if (currentHousesOnProperty === 5){

            // When hotels are sold, they are exchanged for 4 houses...
            if (availableHouses >= 4){
                availableHotels++
                availableHouses -= 4
                spaces[number].houses--
                updateHouseDisplay(number)
            }

            // but if there aren't 4 houses left in the bank...
            else{

                // The player must sell their hotels wholesale and return all
                // properties in that group to 0 houses. This is known as
                // the hotel trap.
                let wholeColourSet = getColourSet(spaces[number].group)
                console.log(wholeColourSet)

                wholeColourSet.forEach(function(property){
                    let propertyNumber = property.position

                    // Reset the number of houses to 0
                    spaces[propertyNumber].houses = 0

                    // Refund the player the cost of 5 houses, halved
                    players[turn - 1].money -= ((spaces[propertyNumber].houseCost / 2) * 5)

                    // Return the hotel and houses to the bank
                    availableHotels++
                    availableHouses += 4

                    updateHouseDisplay(propertyNumber)
                    toggleHouseBuildButtons()
                })


                // TODO - While not in the official rulebook, Phil Orbanes,
                // Chief Judge at US & World Championships allows ONLY IN
                // CIRCUMSTANCES WHERE PLAYERS ARE TRYING TO GET OUT OF
                // BANKRUPTCY that players may sell houses down to the stage
                // where the bank has enough to cover it.
                // https://www.reddit.com/r/monopoly/comments/8fa7ee/please_describe_the_hotel_trap_selling_hotels/

                

            }


        } else{
            availableHouses++
            spaces[number].houses--
            updateHouseDisplay(number)
            toggleHouseBuildButtons()
        }

        // Players get half the value back for houses/hotels
        players[turn - 1].money -= (spaces[number].houseCost / 2)
        updatePlayerDetails()

        toggleHouseBuildButtons()
        
    }

}



function updateHouseDisplay(number){

    // Update the display on the board
    let property = document.querySelector('.property[position="' + number + '"]')
    property.setAttribute('houses', spaces[number].houses)

    // If the colour set overview is open, update the house display in the window
    let houseBuildPanel = document.querySelector('.house-building-panel[position="' + number + '"] .house-visual-display')
    if (houseBuildPanel){
        houseBuildPanel.setAttribute('houses', spaces[number].houses)
    }
}

function buyProperty(number, player, method, price){
    spaces[number].owner = player
    closePopup()

    switch(method){
        case 'purchase':
            player.money -= spaces[number].price
            addToFeed(player.name + ' bought ' + spaces[number].name + ' for ' + currencySymbolSpan + spaces[number].price, 'buy-property')
            break
        case 'auction':
            player.money -= price
            addToFeed(player.name + ' won an auction for ' + spaces[number].name + ' for ' + currencySymbolSpan + price, 'auction')
    }

    
    player.properties[number] = spaces[number]
    updatePlayerDetails()

    
}

function auctionProperty(number){

    let currentBid = 0
    let currentNumberOfBidders = players.length


    let auctionScreen = document.createElement('div')
    auctionScreen.classList.add('auction-screen')

    // Generate the rent table so players can see what they're buying
    let auctionRentTable = document.createElement('div')
    auctionRentTable.classList.add('auction-rent-table')
    auctionRentTable.innerHTML += generatePropertyDetails(number)
    auctionScreen.appendChild(auctionRentTable)

    // Generate the areas for players to bid on the property
    let auctionBidArea = document.createElement('div')
    auctionBidArea.classList.add('auction-bidding-area')

    // Generate the auction heading
    let auctionHeading = document.createElement('h2')
    auctionHeading.classList.add('auction-heading')
    auctionHeading.textContent = 'Auction'
    auctionBidArea.appendChild(auctionHeading)

    // Generate an area to show the current bid

    let currentBidContainer = document.createElement('div')
    currentBidContainer.classList.add('current-bid-container')

    let currentBidHeading = document.createElement('h3')
    currentBidHeading.textContent = 'Current bid:'
    currentBidHeading.classList.add('current-bid-heading')
    currentBidContainer.appendChild(currentBidHeading)

    let currentBidAmount = document.createElement('div')
    currentBidAmount.classList.add('current-bid-amount')
    currentBidAmount.innerHTML = currencySymbolSpan + currentBid
    currentBidContainer.appendChild(currentBidAmount)


    auctionBidArea.appendChild(currentBidContainer)

    let playerBidInterfacesContainer = document.createElement('div')
    playerBidInterfacesContainer.classList.add('player-bid-interfaces-container')

    for(i = 0; i < players.length; i++){
        // The container for this player's interface
        let playerBidInterface = document.createElement('div')
        playerBidInterface.classList.add('player-bid-interface')
        playerBidInterface.setAttribute('player', players[i].id)
        
        // Generate the player's token
        let playerToken = document.createElement('div')
        playerToken.classList.add('player-token-icon')
        playerToken.setAttribute('player', players[i].id)
        playerToken.setAttribute('token', players[i].token)
        playerBidInterface.appendChild(playerToken)

        // Generate the player's name
        let playerHeading = document.createElement('h3')
        playerHeading.classList.add('player-heading')
        playerHeading.textContent = players[i].name
        playerBidInterface.appendChild(playerHeading)

        // Generate the player's money
        let playerMoney = document.createElement('div')
        playerMoney.classList.add('player-money')
        playerMoney.innerHTML = currencySymbolSpan + players[i].money
        playerBidInterface.appendChild(playerMoney)

        // Generate the input field for the player's bid.
        let bidInput = document.createElement('input')
        bidInput.setAttribute('type', 'number')
        bidInput.setAttribute('placeholder', 'Your bid')
        bidInput.setAttribute('min', 10)
        playerBidInterface.appendChild(bidInput)

        // Generate the buttons for players to submit their bids.
        let submitBidButton = document.createElement('button')
        submitBidButton.textContent = 'Bid'
        submitBidButton.classList.add('bid-button')
        playerBidInterface.appendChild(submitBidButton)

        // Generate the buttons for players to abstain from bidding
        let abstainButton = document.createElement('button')
        abstainButton.textContent = 'Withdraw'
        abstainButton.classList.add('abstain-button')
        playerBidInterface.appendChild(abstainButton)


        // Add an event listener to the panel so we can run various events
        playerBidInterface.addEventListener('click', bidOnProperty)

        // Add all of this to the bid area
        playerBidInterfacesContainer.appendChild(playerBidInterface)

    }

    auctionBidArea.appendChild(playerBidInterfacesContainer)
    auctionScreen.appendChild(auctionBidArea)

    // Attach this to the popup message
    availableActions.closePopup = false
    openPopup('')
    popupMessage.appendChild(auctionScreen)



    function bidOnProperty(e){

        // If a bid button has been clicked...
        if (e.target.classList.contains('bid-button')){
            let bidBox = e.target.parentNode
            let currentBidder = bidBox.getAttribute('player')

            // Check the new bid is greater than the current bid, and if so
            // display that info
            let newBid = parseInt(bidBox.querySelector('input').value)
            if (currentBid < newBid && newBid >= 10){

                currentBid = newBid

                // When nobody has bid yet, this class won't exist, hence the if statement.
                let currentWinnerDisplay = auctionScreen.querySelector('.current-winner')
                if (currentWinnerDisplay){
                    currentWinnerDisplay.classList.remove('current-winner')
                }

                // Add a class to the current winner's display so we can style it nicely (or pass it on to the declareAuctionWinner() function)
                auctionScreen.querySelector('.player-bid-interface[player="' + currentBidder + '"]').classList.add('current-winner')

                if (currentNumberOfBidders === 1){
                    // If we are down to our final bidder and an actual bid
                    // has been made, they have won.
                    declareAuctionWinner()
                } else{
                    currentBidAmount.innerHTML = currencySymbolSpan + currentBid
                }

            }

            
            // Make it so that other players cannot bid less or equal to this.
            ;[].forEach.call(document.querySelectorAll('.auction-bidding-area input[type="number"]'), function(node){
                node.setAttribute('min', (currentBid + 1))
                node.value = ''
            })
        
        // If an abstain button has been clicked...
        } else if (e.target.classList.contains('abstain-button')){
            
            // Remove this player from the bidding interface
            e.target.parentNode.classList.add('abstained-from-bidding')
            currentNumberOfBidders--

            // If there is now one bidder left and someone has actually bid on this.
            if (currentNumberOfBidders === 1 && currentBid){
                declareAuctionWinner()
            } else if (currentNumberOfBidders === 0 && !currentBid){
                addToFeed(spaces[number].name + ' was available for auction but nobody bid on it.', 'auction')
                closePopup()
            }

        }
    
        function declareAuctionWinner(){
            let winner = auctionScreen.querySelector('.current-winner').getAttribute('player')
            buyProperty(number, players[winner - 1], 'auction', currentBid)
        }
    
    }

}

// COLOUR SET FUNCTIONS ------------------------------------------------------//

// Get an array of all of the properties in that colour set.
function getColourSet(colour){

    let colourSet = []

    for (i = 0; i < spaces.length; i++){
        let property = spaces[i]
        if (property.group === colour){
            colourSet.push(property)
        }
    }

    return colourSet
}

// colour - the group of the property
// player - id of the player you are checking ownership of
function checkColourSet(colour, player){

    let fullSetOwned = false
    let colourSet = getColourSet(colour)


    // Go through the colour set to get a list of the owners of all these properties
    let owners = []
    colourSet.forEach(function(property){
        if (property.owner){
            owners.push(property.owner.id)
        } else{
            owners.push(null)
        }
    })

    // Check whether all of the owners are the same as the specified player
    fullSetOwned = owners.every(function(owner){
        return (owner === player)
    })

    return fullSetOwned

}


// RENT FUNCTIONS ------------------------------------------------------------//

function landOnProperty(position){

    let owner = checkPropertyOwner(position) // The id of the owner
    let currentPlayer = players[turn - 1]

    if (owner && owner.id !== currentPlayer.id){
        // Rent is due.

        // Initialise a variable to store the amount of rent owed.
        let rentAmount = 0

        // Check whether the owner of the space owns the entire colour group.
        // If they do, we need to check for houses/hotels.
        // If not, just charge the base rent.

        switch (spaces[position].type){
            case 'property':
                standardPropertyRent()
                break
            case 'utility':
                utilityRent()
                break
            case 'station':
                stationRent()
        }
        
        // Give/take the money between players as appropriate.
        players[owner - 1].money += rentAmount
        currentPlayer.money -= rentAmount

        addToFeed(currentPlayer.name + ' landed on ' + spaces[position].name + ' and paid ' + players[owner - 1].name + ' ' + currencySymbolSpan + rentAmount + ' in rent', 'rent')
        updatePlayerDetails()


        // Rent for standard properties which may have houses/hotels
        function standardPropertyRent(){
            if (checkColourSet(spaces[position].group, owner)){
                let numberOfHouses = spaces[position].houses
            
                // The second (index 1) entry in the rent array is the rent with
                // a full colour set but no houses, hence the + 1 to get
                // the correct index.
                rentAmount = spaces[position].rent[numberOfHouses + 1]
            } else{
                rentAmount = spaces[position].rent[0]
            }
        }

        function utilityRent(){
            let diceRoll = parseInt(document.querySelector('#dice-total').textContent)

            if ((checkColourSet(spaces[position].group, owner))){
                rentAmount = diceRoll * 10
            } else{
                rentAmount = diceRoll * 4
            }
        }

        function stationRent(){

            let stationSet = getColourSet('train-station')
        
        
            // Go back through the array to get a list of the owners of all these properties
            let owners = []
            stationSet.forEach(function(property){
                if (property.owner){
                    owners.push(property.owner.id)
                }
            })
        
            // Check whether all of the owners are the same as the specified player
            stationSet = owners.every(function(stationOwner){
                //return (stationOwner === owner)
            })

            let rentIndex = owners.length - 1
            console.log(rentIndex)
            rentAmount = spaces[position].rent[rentIndex]
            
        }


    } else{
        // Nobody owns this property
        availableActions.closePopup = false
        setAvailableActions()
        displayPropertyDetails(position)
    }
}


function checkPropertyOwner(position){
    let owner = spaces[position].owner

    if (owner){
        return owner.id
    } else{
        return null
    }

}



// FEED FUNCTIONS ------------------------------------------------------------//

function addToFeed(message,type){
    let newMessage = document.createElement('div')
    newMessage.innerHTML = '<div>' + message + '</div>'
    newMessage.classList.add(type)
    
    //feed.appendChild(newMessage)

    feed.insertBefore(newMessage, feed.firstChild)
}

