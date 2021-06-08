// monopoly.js by Ceri Woolway - ceriwoolway@gmail.com

// VARIABLE DECLARATIONS -----------------------------------------------------//

// If quick start is enabled, we'll skip over the player creation screen and
// start the game immediately with 2 default players. Ideal for testing.
let quickStartGame =  false;

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


const board = document.querySelector('#board')
const popupMessage = document.querySelector('#popup-message')
const popupTitle = document.querySelector('#popup-title')

const playerSummary = document.querySelector('#player-summary')
const feed = document.querySelector('#feed-content')
const bankContainer = document.querySelector('#bank')
const bank = document.querySelector('#bank-content')
const playerCreator = document.querySelector('#player-creator')

const warningMessage = document.querySelector('#warning-message')
const warningTitle = document.querySelector('#warning-title')

const bankruptcyMessage = document.querySelector('#bankruptcy-message')
const bankruptcyTitle = document.querySelector('#bankruptcy-title')

// Stores which player's turn it is.
// Since the function starts with a ++ we'll initialise as 0
let turn = 0


// Dice related elements
let doublesCount = 0
const diceContainer = document.querySelector('#dice-roll')
const dice1 = document.querySelector('#dice-1')
const dice2 = document.querySelector('#dice-2')
const diceTotal = document.querySelector('#dice-total')
const diceDoubles = document.querySelector('#doubles')

// A variable for how many sides the dice has. Used in testing where 
// larger/smaller numbers are desirable.
let diceSides = 6


// In a standard Monopoly set there are 32 houses and 12 hotels available.
// If there are no houses/hotels in the bank, nobody may build any more.
let availableHouses = 32
let availableHotels = 12

// An empty array that the proposed trade items will be stored in.
// Since this is used in a number of functions, it needs to be a global variable.
// The setup will be as follows:
// 0 - 39: properties
// 40, 41: get out of jail cards
// 42: money
let tradeProposal = [[], []]


// An array to hold properties to auction. When players go bankrupt this may 
// contain multiple properties, and since other players can go bankrupt during
// a bankruptcy auction, it is necessary to have this as a global variable so
// it can be added to in the middle of existing bankruptcy proceedings.
let propertiesToAuction = []

// The outcome of multiple auctions is stored in this. This is used when going
// bankrupt to multiple players at once - the proceeds will be evenly split
// among all the other players.
let auctionTotal = 0


// TODO - description
let transactionQueue = []


// This is the value of the current debt where the player is trying to get out
// of bankruptcy. Since there are multiple private functions which need access
// to this amount so they can update it, it is a global variable.
let currentDebt = 0


let feedDetails = []

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
       - for exchange cards, positive numbers are the amount the player RECEIVES
         from the other players. Negative numbers are the amount the player
         PAYS the other players.
        


 
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
    {description: "Get Out of Jail Free" ,                                                      type: 'getout',   value: null},
    {description: "Grand Opera Night — Collect £50 from every player for opening night seats",  type: 'exchange', value: 50 },
    {description: "You are assessed for street repairs – £40 per house – £115 per hotel",       type: 'repairs',  value: [40,115] },
    {description: "Doctor's fee — Pay £50",                                                     type: '-',        value: 50},
    {description: "Advance to Go (Collect £200)",                                               type: 'move',     value: 0},
    {description: "Bank error in your favor — Collect £200",                                    type: '+',        value: 200},
    {description: "Doctor's fee — Pay £50",                                                     type: '-',        value: 50},
    {description: "From sale of stock you get £50",                                             type: '+',        value: 50},
    {description: "Go to Jail – Go directly to jail – Do not pass Go – Do not collect £200",    type: 'move',     value: 10},
    {description: "Holiday Fund matures — Receive £100" ,                                       type: '+',        value: 100},
    {description: "Income tax refund – Collect £20",                                            type: '+',        value: 20 },
    {description: "It is your birthday — Collect £10",                                          type: '+',        value: 10 },
    {description: "Life insurance matures – Collect £100",                                      type: '+',        value: 100 },
    {description: "Pay hospital fees of £100",                                                  type: '-',        value: 100 },
    {description: "Pay school fees of £150",                                                    type: '-',        value: 150 },
    {description: "Receive £25 consultancy fee",                                                type: '-',        value: 25 },
    {description: "You have won second prize in a beauty contest – Collect £10",                type: '+',        value: 10},
    {description: "You inherit £100",                                                           type: '+',        value: 100 }
  ]

let chanceCards = 
  [
    {description: "You have been elected Chairman of the Board – Pay each player £50",          type: 'exchange',   value: -50 },
    /*{description: "Go Back 3 Spaces",                                                           type: 'move',       value: -3 },
    {description: "Get Out of Jail Free",                                                       type: 'getout',     value: null },
    {description: "Advance to Go (Collect £200)",                                               type: 'move',       value: 0 },
    {description: "Advance to Trafalgar Square — If you pass Go, collect £200",                 type: 'move',       value: 24 },
    {description: "Advance to Pall Mall – If you pass Go, collect £200",                        type: 'move',       value: 11 },
    {description: "Advance token to nearest Utility. If unowned, you may buy it from the Bank. If owned, throw dice and pay owner a total ten times the value thrown.", type: 'move',   value: 'nearest-utility' },
    {description: "Advance token to the nearest station and pay owner twice the rental to which he/she {he} is otherwise entitled. If Railroad is unowned, you may buy it from the Bank.", type: 'move',   value: 'nearest-station' },
    {description: "Bank pays you dividend of £50",                                              type: '+',          value: 50 },
    {description: "Go to Jail – Go directly to Jail – Do not pass Go, do not collect £200",     type: 'move',       value: 10 },
    {description: "Make general repairs on all your property – For each house pay £25 – For each hotel £100",   type: 'repairs',   value: [25, 100] },
    {description: "Pay poor tax of £15",                                                        type: '-',          value: 15 },
    {description: "Take a trip to Marylebone Station – If you pass Go, collect £200",           type: 'move',       value: 15 },
    {description: "Advance to Mayfair",                                                         type: 'move',       value: 39 },
    {description: "Your building and loan matures — Collect £150",                              type: '+',          value: 150 },
    {description: "You have won a crossword competition — Collect £100",                        type: '+',          value: 100 }*/
  ]



/* Rent values are set up as follows:
   0 : the base rent without any houses
   1 : the amount of rent with a full group set.
   2-5 : the amount of rent with 1-4 houses
   6 : the amount of rent with a hotel.
*/

let spaces =  [
    {name: 'Go',                    type: 'special',            price: null,    group: 'corner',       boardposition: 'south'},
    {name: 'Old Kent Road',         type: 'property',           price: 60,      group: 'brown',        boardposition: 'south', rent:[2,4,10,30,90,160,250],         houseCost: 50, hotelCost: 50, owner: null, houses: 0, mortgaged: false},
    {name: 'Community Chest',       type: 'community-chest',    price: null,    group: null,           boardposition: 'south'},
    {name: 'Whitechapel Road',      type: 'property',           price: 60,      group: 'brown',        boardposition: 'south', rent:[4,8,20,60,180,320,450],        houseCost: 50, hotelCost: 50, owner: null, houses: 0, mortgaged: false},
    {name: 'Income tax',            type: 'special',            price: null,    group: null,           boardposition: 'south', label: 'Pay £200'},
    {name: 'Kings Cross Station',   type: 'station',            price: 200,     group: 'train-station',boardposition: 'south', rent:[25,50,100,200],                owner: null},
    {name: 'The Angel Islington',   type: 'property',           price: 100,     group: 'lightblue',    boardposition: 'south', rent:[6,12,30,90,270,400,550],       houseCost: 50, hotelCost: 50, owner: null, houses: 0, mortgaged: false},
    {name: 'Chance',                type: 'chance',             price: null,    group: null,           boardposition: 'south'},
    {name: 'Euston Road',           type: 'property',           price: 100,     group: 'lightblue',    boardposition: 'south', rent:[6,12,30,90,270,400,550],       houseCost: 50, hotelCost: 50, owner: null, houses: 0, mortgaged: false},
    {name: 'Pentonville Road',      type: 'property',           price: 100,     group: 'lightblue',    boardposition: 'south', rent:[8,16,40,100,300,450,600],      houseCost: 50, hotelCost: 50, owner: null, houses: 0, mortgaged: false},

    {name: 'Jail',                  type: 'special',            price: null,    group: 'corner',       boardposition: 'west'},
    {name: 'Pall Mall',             type: 'property',           price: 140,     group: 'pink',         boardposition: 'west', rent:[10,20,50,150,450,625,750],      houseCost: 100, hotelCost: 100, owner: null, houses: 0},
    {name: 'Electric Company',      type: 'utility',            price: 150,     group: 'utility',      boardposition: 'west', rent:["If one utility is owned, rent is 4 times amount shown on dice.", "If both utilities are owned, rent is 10 times amount shown on dice."], owner: null, mortgaged: false},
    {name: 'Whitehall',             type: 'property',           price: 140,     group: 'pink',         boardposition: 'west', rent:[10,20,50,150,450,625,750],      houseCost: 100, hotelCost: 100, owner: null, houses: 0, mortgaged: false},
    {name: 'Northumberland Avenue', type: 'property',           price: 150,     group: 'pink',         boardposition: 'west', rent:[12,24,60,180,500,700,900],      houseCost: 100, hotelCost: 100, owner: null, houses: 0, mortgaged: false},
    {name: 'Marylebone Station',    type: 'station',            price: 200,     group: 'train-station',boardposition: 'west', rent:[25,50,100,200],                 owner: null},
    {name: 'Bow Street',            type: 'property',           price: 180,     group: 'orange',       boardposition: 'west', rent:[14,28,70,200,550,750,950],      houseCost: 100, hotelCost: 100, owner: null, houses: 0, mortgaged: false},
    {name: 'Community Chest',       type: 'community-chest',    price: null,    group: null,           boardposition: 'west'},
    {name: 'Marlborough Street',    type: 'property',           price: 180,     group: 'orange',       boardposition: 'west', rent:[14,28,70,200,550,750,950],      houseCost: 100, hotelCost: 100, owner: null, houses: 0, mortgaged: false},
    {name: 'Vine Street',           type: 'property',           price: 200,     group: 'orange',       boardposition: 'west', rent:[16,32,80,220,600,800,1000],     houseCost: 100, hotelCost: 100, owner: null, houses: 0, mortgaged: false},

    {name: 'Free Parking',          type: 'special',            price: null,    group: 'corner',       boardposition: 'north'},
    {name: 'Strand',                type: 'property',           price: 220,     group: 'red',          boardposition: 'north', rent:[18,36,90,250,700,875,1050],    houseCost: 150, hotelCost: 150, owner: null, houses: 0, mortgaged: false},
    {name: 'Chance',                type: 'chance',             price: null,    group: null,           boardposition: 'north'},
    {name: 'Fleet Street',          type: 'property',           price: 220,     group: 'red',          boardposition: 'north', rent:[18,36,90,250,700,875,1050],    houseCost: 150, hotelCost: 150, owner: null, houses: 0, mortgaged: false},
    {name: 'Trafalgar Square',      type: 'property',           price: 240,     group: 'red',          boardposition: 'north', rent:[20,40,100,300,750,925,1100],   houseCost: 150, hotelCost: 150, owner: null, houses: 0, mortgaged: false},
    {name: 'Fenchurch St. Station', type: 'station',            price: 200,     group: 'train-station',boardposition: 'north', rent:[25,50,100,200],                owner: null},
    {name: 'Leicester Square',      type: 'property',           price: 220,     group: 'yellow',       boardposition: 'north', rent:[22,44,110,330,800,975,1150],   houseCost: 150, hotelCost: 150, owner: null, houses: 0, mortgaged: false},
    {name: 'Water Works',           type: 'utility',            price: 150,     group: 'utility',      boardposition: 'north', rent:["If one utility is owned, rent is 4 times amount shown on dice.", "If both utilities are owned, rent is 10 times amount shown on dice."], owner: null, mortgaged: false},
    {name: 'Coventry Street',       type: 'property',           price: 260,     group: 'yellow',       boardposition: 'north', rent:[22,44,110,330,800,975,1150],   houseCost: 150, hotelCost: 150, owner: null, houses: 0, mortgaged: false},
    {name: 'Piccadilly',            type: 'property',           price: 280,     group: 'yellow',       boardposition: 'north', rent:[24,48,120,360,850,1025,1200],  houseCost: 150, hotelCost: 150, owner: null, houses: 0, mortgaged: false},
    
    {name: 'Go To Jail',            type: 'special',            price: null,    group: 'corner',       boardposition: 'east'},
    {name: 'Regent Street',         type: 'property',           price: 300,     group: 'green',        boardposition: 'east', rent:[26,52,130,390,900,1100,1275],   houseCost: 200, hotelCost: 200, owner: null, houses: 0, mortgaged: false},
    {name: 'Oxford Street',         type: 'property',           price: 300,     group: 'green',        boardposition: 'east', rent:[26,52,130,390,900,1100,1275],   houseCost: 200, hotelCost: 200, owner: null, houses: 0, mortgaged: false},
    {name: 'Community Chest',       type: 'community-chest',    price: null,    group: null,           boardposition: 'east'},
    {name: 'Bond Street',           type: 'property',           price: 320,     group: 'green',        boardposition: 'east', rent:[28,56,150,450,1000,1200,1400],  houseCost: 200, hotelCost: 200, owner: null, houses: 0, mortgaged: false},
    {name: 'Liverpool St. Station', type: 'station',            price: 200,     group: 'train-station',boardposition: 'east', rent:[25,50,100,200],                 houseCost: 50, hotelCost: 250, owner: null, houses: 0, mortgaged: false},
    {name: 'Chance',                type: 'chance',             price: null,    group: null,           boardposition: 'east'},
    {name: 'Park Lane',             type: 'property',           price: 350,     group: 'darkblue',     boardposition: 'east', rent:[35,70,175,500,1100,1300,1500],  houseCost: 200, hotelCost: 200, owner: null, houses: 0, mortgaged: false},
    {name: 'Super Tax',             type: 'special',            price: null,    group: null,           boardposition: 'east', label:'Pay £100'},
    {name: 'Mayfair',               type: 'property',           price: 400,     group: 'darkblue',     boardposition: 'east', rent:[50,100,200,600,1400,1700,2000], houseCost: 200, hotelCost: 200, owner: null, houses: 0, mortgaged: false},
]

// An empty array for now. Will be filled with player info later.
let players = []

// The maximum number of players allowed in the game.
let minNumberOfPlayers = 4
let maxNumberOfPlayers = 15

let availableActions = {
    rollDice: true,
    endTurn: false,
    getOutOfJail: false,
    rollDoublesForJail: false,
    cardOutOfJail: false,
    buildHouse: true,
    buildHotel: true,
    mortgageProperty: false,
    unmortgageProperty: false,
    closePopup: true,
    bankruptcyProceedings: false
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

    // If quick start is enabled, skip over the player creation and dice
    // rolling functionality.
    if(quickStartGame){
        quickStart()
    }
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
    generateShortNames()

    spaces.forEach(function(space){
        

        space.position = positionNumber

        let newSpace = document.createElement('div')
        newSpace.setAttribute('id', space.name.replace(/\s+/g, '-').toLowerCase())
        newSpace.classList.add(space.type)

        if (space.group){
            newSpace.classList.add(space.group)
        }
        
        newSpace.innerHTML = '<div class="property-name">' + space.name.toUpperCase() + '</div>'
        newSpace.innerHTML += '<div class="property-nickname">' + space.shortName.toUpperCase() + '</div>'

        if (space.price){
            newSpace.innerHTML += '<div class="property-price">' + currencySymbolSpan + space.price + '</div>'
            newSpace.setAttribute('price', space.price)
        }

        if (space.label){

            let labelText = space.label.toUpperCase()
            labelText = labelText.replace('£', currencySymbolSpan)

            newSpace.innerHTML += '<div class="space-label">' + labelText + '</div>'
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



    // A function to generate shorter nicknames for the spaces on smaller screens.
    // While I could set these manually, having a function like this will make
    // adding new board types much simpler as I won't have to figure out suitable
    // nicknames for all sorts of new property names.
    function generateShortNames(){
        
        spaces.forEach(function(space){

            let newName = space.name

            newName = newName.replace('Street',  'St.')
            newName = newName.replace('Avenue',  'Ave.')
            newName = newName.replace('Road',    'Rd.')
            newName = newName.replace('Station', 'Stat.')
            newName = newName.replace('The', '')
            newName = newName.replace('Square', 'Sq.')
            newName = newName.replace('Company', 'Co.')
            newName = newName.replace('Lane', 'Ln.')
            newName = newName.replace('Community Chest', 'Comm. Chest')
            

            let longNameTest = newName.match(/\b\w{8,}/g)
            if (longNameTest){
                newName.match(/\b\w{8,}/g).forEach(function(name){
                    newName = newName.replace(name, name.slice(0,4) + '.')

                })
            }

            space.shortName = newName
        })

    }

}

function addEvents(){


    // Close the popup when the close button is clicked,
    // or the escape key is pressed.
    document.querySelector('#popup-close').addEventListener('click', closePopup)


    window.addEventListener('keydown', function(e){
        let key = e.key

        switch (key){


            case 'Escape':

                document.querySelector('#testing-toggle').checked = false
                document.body.classList.remove('testing-panel-enabled')
                document.querySelector('#about').classList.add('hidden')

                if (document.body.getAttribute('close-popup') === 'true') {
                    closePopup()
                }
                break
            case 'Backspace':

                // If we're viewing the overview of a property which is owned,
                // and the back button exists (meaning we must have come from
                // the full portfolio), make it so that we can close the window
                // with backspace
                if (document.querySelector('.property-overview').getAttribute('player') && document.querySelector('.back-button')){
                    fullPortfolioView(e)
                }

                break


        }
    })
    


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

    addTestingEvents()
    

    // When the window is resized, put the tokens back where they belong.
    // While the game isn't really designed to be run in small windows, this is
    // a small touch that makes it slightly better,
    window.addEventListener('resize', function(){
        ;[].forEach.call(document.querySelectorAll('.token'), function(token){
            positionToken(token, token.getAttribute('position'))
        })
    })
}

function resizeBoard(){

    board.setAttribute('size', 'normal')
    
    let boardWidth = board.offsetWidth

    board.style.height = boardWidth + 'px'

    feed.parentNode.style.height = (board.offsetWidth - bank.parentNode.offsetHeight - 3) + 'px'

    
    if (boardWidth < 800 && boardWidth > 700){
        board.setAttribute('size', 'mini')
    } else if (boardWidth <= 700){
        board.setAttribute('size', 'super-mini')
    } else{
        board.setAttribute('size', 'normal')
    }
    //feed.parentElement.style.height = (board.offsetHeight + 155) + 'px'

    ;[].forEach.call(document.querySelectorAll('#board .row > div'), function(node){
      
        let name = node.querySelector('.property-name')
        node.setAttribute('name', null)

        if (name.offsetWidth < name.scrollWidth){
            node.setAttribute('name', 'short')
        } else{
            node.setAttribute('name', 'long')
        }
    })
}


function setAvailableActions(){
    document.body.setAttribute('dice-roll-available', availableActions.rollDice)
    document.body.setAttribute('end-turn-available', availableActions.endTurn)
    document.body.setAttribute('get-out-of-jail', availableActions.getOutOfJail)
    document.body.setAttribute('card-out-of-jail', availableActions.cardOutOfJail)
    document.body.setAttribute('roll-doubles-for-jail', availableActions.rollDoublesForJail)
    document.body.setAttribute('build-house', availableActions.buildHouse)
    document.body.setAttribute('build-hotel', availableActions.buildHotel)
    document.body.setAttribute('mortgage-property', availableActions.mortgageProperty)
    document.body.setAttribute('unmortgage-property', availableActions.unmortgageProperty)
    document.body.setAttribute('close-popup', availableActions.closePopup)
    document.body.setAttribute('bankruptcy-proceedings', availableActions.bankruptcyProceedings)
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
        updateNode = document.querySelector('.individual-player-summary[player="' + player.id + '"]')
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
            }

            updateNode.appendChild(propertyIcon)
        })

        // Re-append the station icons so they end up together at the end.
        ;[].forEach.call(updateNode.querySelectorAll('.train-station'), function(node){
            updateNode.appendChild(node)
        })

        // Re-append the utility icons so they end up together at the end
        // and with appropriate classes
        ;[].forEach.call(updateNode.querySelectorAll('.utility'), function(node){
            updateNode.appendChild(node)
        })

        // GET OUT OF JAIL CARDS
        updateNode = document.querySelector('.individual-player-summary[player="' + player.id + '"] .player-cards')
        updateNode.innerHTML = ''

        if (player.getOutCards.length === 0){
            updateNode.setAttribute('cards', false)
        } else{
            player.getOutCards.forEach(function(card){
                let cardIcon = createElement('div', 'player-card-icon', null, 'card-number', player.getOutCards.indexOf(card))
                updateNode.appendChild(cardIcon)
            })

            updateNode.setAttribute('cards', true)
        }

        // If the player has no money, open bankruptcy proceedings
        /*if (player.money < 0 && transactionDetails){
            availableActions.bankruptcyProceedings = true
            setAvailableActions()
            openBankruptcyProceedings(transactionDetails)
        }*/

    })

    updateBank()
}

function updateBank(){

    bank.innerHTML = ''

    // TODO - a lot of this could be done using CSS.

    let houseContainer = document.createElement('div')
    for (i = 1; i <= availableHouses; i++){
        let houseIcon = createElement('div', 'bank-house-icon')
        houseContainer.appendChild(houseIcon)
    }

    let hotelContainer = document.createElement('div')
    for (i = 1; i <= availableHotels; i++){
        let hotelIcon = createElement('div', 'bank-hotel-icon')
        hotelContainer.style.minWidth = '74px'
        hotelContainer.style.flexBasis = '74px'
        hotelContainer.appendChild(hotelIcon)
    }

    /*
    
    The build/sell house functions should take care of this

    if (availableHouses < 1){
        availableActions.buildHouse = false
    } else{
        availableActions.buildHouse = true
    }

    if (availableHotels < 1){
        availableActions.buildHotel = false
    } else{
        availableActions.buildHotel = true
    }*/

    setAvailableActions()

    bank.appendChild(houseContainer)
    bank.appendChild(hotelContainer)
}

// Add a class for 2 seconds. This is used in the CSS to run a suitable animation.
function animateUpdate(node, type){
    node.classList.remove(type + '-change')
    node.classList.add(type + '-change')
    window.setTimeout(function(){
        node.classList.remove(type + '-change')
    }, 1000)
}

// TESTING FUNCTIONS ---------------------------------------------------------//
// A number of functions intended to help with testing.
// Not intended for actual game use.

function addTestingEvents(){
    
    let testingToggle = document.querySelector('#testing-toggle')
    testingToggle.addEventListener('change', function(){
        document.body.classList.toggle('testing-panel-enabled')
    })
    
    let fakeDiceRollForm = document.querySelector('form#fake-dice-roll-form')
    fakeDiceRollForm.addEventListener('submit', function(e){
        e.preventDefault()
        fakeRollDice(e.target.querySelector('input').value)
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

function fakePlayerMoney(){
    let fakeMoneyPanel = document.querySelector('#fake-player-money')
    players.forEach(function(player){
        let form = createElement('form', '', '', '', '')
        let label = createElement('label', '', player.name, '', '')
        let input = createElement('input', '', '', 'type', 'number')
        input.setAttribute('step', 1)
        form.appendChild(label)
        form.appendChild(input)
        fakeMoneyPanel.appendChild(form)

        input.addEventListener('input', function(){
            let newMoney = parseInt(input.value)
            if (newMoney){
                player.money = newMoney
            }
            updatePlayerDetails()

            window.setTimeout(function(){
                input.value = ''
            }, 1300)
        })


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


// Note - all of this function is a teeny bit messy and could probably be improved.
// However it is intended as a quick fix to make testing easier, not to be
// an actual game feature.
function quickStart(){
    
    createPlayers()

    players.forEach(function(player){
        player.money = 10000
    })

    let newPlayerDiceRoll = document.querySelector('.new-game-dice-roll')
    newPlayerDiceRoll.parentNode.removeChild(newPlayerDiceRoll)


    let player = 0
    quickPropertyOwnership(4,1,player)
    quickPropertyOwnership(3,3,player)
    quickPropertyOwnership(0,6,player)
    quickPropertyOwnership(0,12,player)
    quickPropertyOwnership(0,27,player)
    //quickMortgage(6, player)
    //quickMortgage(12, player)

    communityChestCards.forEach(function(card){
        if (card.description === 'Get Out of Jail Free'){
            communityChestCards.unshift(card)
        }
    })


    player = 1
    quickPropertyOwnership(0,5,player)
    quickPropertyOwnership(0,15,player)
    quickPropertyOwnership(0,25,player)
    quickPropertyOwnership(0,35,player)
    quickPropertyOwnership(0,21,player)

    quickMortgage(5, player)
    quickMortgage(25, player)
    quickMortgage(21, player)


    player = 2
    quickPropertyOwnership(4,37,player)
    quickPropertyOwnership(5,39,player)
    quickPropertyOwnership(4,19,player)
    quickPropertyOwnership(5,18,player)
    quickPropertyOwnership(4,16,player)


    player = 3
    //quickPropertyOwnership(4,31,player)
    //quickPropertyOwnership(5,32,player)
    //quickPropertyOwnership(4,34,player)
    //quickPropertyOwnership(0,28,player)
    //quickMortgage(28, player)

    addToFeed('Quick start mode initiated')


    function quickPropertyOwnership(houses, position, playerIndex){

        buyProperty(position, players[playerIndex], 'purchase', spaces[position].price)
        spaces[position].owner = players[playerIndex]
        players[playerIndex].properties[position] = spaces[position]

        if (spaces[position].type === 'property'){
            spaces[position].houses = houses
            //players[playerIndex].money -= spaces[position].houseCost * houses
            updateHouseDisplay(position)
        }
    }

    function quickMortgage(position, player){
        spaces[position].mortgaged = true
        document.querySelector('div[position="' + position + '"]').setAttribute('mortgaged', true)
        players[player].money += spaces[position].price / 2
    }


    // Instant bankruptcy
    //players[0].money = -1

    players.forEach(function(player){
        player.money = 1
    })

    updatePlayerDetails()

    console.clear()

    //fakeRollDice(4)

    
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
    let currentNumberOfPlayers = minNumberOfPlayers

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

    for (i = 1; i <= minNumberOfPlayers; i++){
        createPlayerCreationPanel(i)
        let currentNumberOfPlayers = 4
    }


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
        let newPlayer = {money:1500, inJail: 0, properties: [], getOutCards: []}
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
        newToken.setAttribute('player', player.id)
        //newToken.setAttribute('jail', false)
        board.appendChild(newToken)   
    })





    // Remove the player select overlay once done.
    newPlayersOverlay.parentNode.removeChild(newPlayersOverlay)

    // Start off with player 1's turn
    // TODO - at the beginning of the game, players should all roll the dice.
    // The highest roll wins. If it is a tie, the tying players should roll again.
    increasePlayerTurn()

    // Position the tokens where they need to be on the board.
    // Due to the way the positionToken function works when there are multiple
    // tokens on the same space, it was necessary to move them all to 0, THEN
    // set the player's position attribute.
    let i = 0
    ;[].forEach.call(document.querySelectorAll('.token'), function(token){
        positionToken(token, 0)
        players[i].position = 0
        i++
    })

    newGameDiceRoll()

    // Add the inputs and associated events to the testing panel. This is done
    // here as it can't be done until after the players are created.
    fakePlayerMoney()
}



function generatePlayerSummary(player){
    let newSummary = createElement('div', 'individual-player-summary', '', 'player', player.id)
    //let newSummary = document.createElement('div')
    //newSummary.setAttribute('id', 'player' + player.id + 'summary')

    
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

    // Player's money
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


    // GET OUT CARDS    
    let playerCards = createElement('div', 'player-cards', null, 'cards', false)
    newSummary.appendChild(playerCards)

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

    let newCardOutOfJailButton = createElement('button', 'card-out-of-jail-button', 'Use a get out of jail free card', null, null)
    newCardOutOfJailButton.classList.add('player-action-button')
    newCardOutOfJailButton.addEventListener('click', function(){
        getOutOfJail('card')
    })

    let newTradeButton = createElement('button', 'player-action-button', 'Initiate trade', '', '')
    newTradeButton.addEventListener('click', function(){
        initiateTrade(false)
    })

    // Append all these new elements to the relevant player summary
    newSummary.appendChild(newGetOut50Button)
    newSummary.appendChild(newRollDoublesForJailButton)
    newSummary.appendChild(newCardOutOfJailButton)
    newSummary.appendChild(newRollDiceButton)
    newSummary.appendChild(newTradeButton)
    newSummary.appendChild(newEndTurnButton)
    playerSummary.appendChild(newSummary)

}

function newGameDiceRoll(){

    // An array to store the dice rolls so we can compare later.
    let diceRolls = []

    // The number of players to roll. This is originally all the players
    // but will change if multiple players roll the joint highest roll
    let numberOfPlayersToRoll = players.length

    // Create a new screen to display all this info
    let diceRollScreen = document.createElement('div')
    diceRollScreen.classList.add('new-game-dice-roll')
    document.body.appendChild(diceRollScreen)

    // Create a heading
    let heading = document.createElement('h2')
    heading.textContent = "Roll to see which player goes first"
    diceRollScreen.appendChild(heading)

    let diceRollContainer = document.createElement('div')
    diceRollContainer.classList.add('dice-roll-container')
    diceRollScreen.appendChild(diceRollContainer)

    // Create an area for the winner to be announced
    let winnerAnnouncement = document.createElement('div')
    winnerAnnouncement.classList.add('winner-annoucement')
    diceRollScreen.appendChild(winnerAnnouncement)

    // Generate the dice roll functionality for each player
    players.forEach(function(player){
        // Container
        let diceRollBox = document.createElement('div')
        diceRollBox.classList.add('new-player-dice-roll')
        diceRollBox.setAttribute('player', player.id)
        
        // Token
        let playerToken = document.createElement('img')
        playerToken.src = 'images/tokens/' + player.token + '.svg'
        diceRollBox.appendChild(playerToken)
        
        let playerName = document.createElement('h3')
        playerName.textContent = player.name
        diceRollBox.appendChild(playerName)
        //diceRollBox.textContent = player.name

        let diceContainer = document.createElement('div')
        diceContainer.classList.add('dice-container')


            let dice1 = document.createElement('span')
            dice1.classList.add('dice', 'dice-1')
            diceContainer.appendChild(dice1)

            let plus = document.createElement('span')
            plus.textContent = ' + '
            diceContainer.appendChild(plus)

            let dice2 = document.createElement('span')
            dice2.classList.add('dice', 'dice-2')
            diceContainer.appendChild(dice2)

            let equals = document.createElement('span')
            equals.textContent = ' = '
            diceContainer.appendChild(equals)

            let total = document.createElement('span')
            total.classList.add('total')
            diceContainer.appendChild(total)


        diceRollBox.appendChild(diceContainer)

        diceRollContainer.appendChild(diceRollBox)
    })

    let diceRollButton = document.createElement('button')
    diceRollButton.textContent = 'Roll dice'

    // Run the dice roll on all non-losing players
    diceRollButton.addEventListener('click', newPlayerDiceRoll)





    function newPlayerDiceRoll(){

        let diceRollElements = diceRollScreen.querySelectorAll('.new-player-dice-roll:not(.losing-dice-roll)')
        let diceRollButton = diceRollScreen.querySelector('button')

        let i = 0

        displayDiceRoll()
        let interval = window.setInterval(function(){
            if(i === diceRollElements.length){
                window.clearInterval(interval)
                checkDiceRollWinner()
                diceRollButton.style.pointerEvents = 'all'
            } else{
                displayDiceRoll()
                diceRollButton.style.pointerEvents = 'none'
            }
        }, 600)

        function displayDiceRoll(){

            let node = diceRollElements[i]

            let roll1 = Math.ceil(Math.random() * diceSides)
            let roll2 = Math.ceil(Math.random() * diceSides)


            let dice1 = node.querySelector('.dice-1')
            let dice2 = node.querySelector('.dice-2')

            // Update the interface to show the dice roll
            dice1.setAttribute('roll', roll1)
            animateUpdate(dice1, 'spin')
            dice2.setAttribute('roll', roll2)
            animateUpdate(dice2, 'spin')

            node.querySelector('.total').textContent = roll1 + roll2

            // Store the current roll
            node.setAttribute('total', roll1 + roll2)
            let playerWhoIsRolling = parseInt(node.getAttribute('player'))
            diceRolls[playerWhoIsRolling - 1] = roll1 + roll2

            i++
        }


        function checkDiceRollWinner(){

            let max = 0
            let maxCount = 0


            diceRolls.forEach(function(roll){
                if (roll > max){
                    max = roll
                }
            })

            // How many players have rolled the highest roll?
            diceRolls.forEach(function(roll){
                if (roll === max){
                    maxCount++
                }
            })
            
            // If only one player has rolled the highest roll,
            // we can begin the game
            if(maxCount === 1){
                let winningPlayer = diceRolls.indexOf(max)
                winnerAnnouncement.textContent = players[winningPlayer].name + ' wins with a roll of ' + max
                diceRollScreen.querySelector('.new-player-dice-roll[total="' + max + '"]').classList.add('winning-dice-roll')
                diceRollButton.textContent = 'Begin game ⯈'
                turn = winningPlayer // Set to one less because we're about to increase it
                increasePlayerTurn()
                createConfetti()

                diceRollButton.removeEventListener('click', newPlayerDiceRoll)
                diceRollButton.addEventListener('click', function(){
                    diceRollScreen.style.opacity = 0
                    let confetti = document.querySelector('.confetti-container')

                    confetti.style.opacity = 0
                    window.setTimeout(function(){
                        document.body.removeChild(diceRollScreen)
                        document.body.removeChild(confetti)
                    }, 1000)
                })
            
            
            // If multiple players have rolled joint highest rolls, they
            // need to roll again.
            } else{

                let playerNames = []
                
                ;[].forEach.call(document.querySelectorAll('.new-player-dice-roll'), function(node){

                    // Loose comparison since we're comparing a string to a number
                    if(node.getAttribute('total') == max){
                        let player = parseInt(node.getAttribute('player'))
                        player--
                        playerNames.push(players[player].name)
                    } else{
                        node.setAttribute('total', 0)
                        node.classList.add('losing-dice-roll')
                    }

                })

                // Generate a player-readable message for the screen
                let message = ''

                // Check how many players we are announcing about.
                // This affects the grammar of the message.
                if(playerNames.length === 2){
                    message += playerNames[0] + ' and ' + playerNames[1] + ' have both rolled ' + max + '. Please roll again.'
                } else{
                    for (i=0; i < playerNames.length - 1; i++){
                        message += playerNames[i]

                        // If we're not on the last one, add a comma
                        if (i < playerNames.length - 1){
                            message += ', '
                        }
                    }

                    message += ' and ' + playerNames[playerNames.length - 1] + ' have all rolled ' + max + '. Please roll again'

                }

                winnerAnnouncement.textContent = message
                numberOfPlayersToRoll = maxCount
                diceRolls = []

            }

        }

        
    }
            
    diceRollScreen.appendChild(diceRollButton)
}


// PAY MONEY -----------------------------------------------------------------//


// Every time money changes hands, this function should be used. This will
// check the player has suffient money and run appropriate actions if not.

// transationDetails should be an object with the following properties:
// debtorID, creditorID, amount, purchase, method

// Purchase should be an array of the properties being purchased (although optional).
// The bankruptcy proceedings will allow this purchase to go through if the player gets
// themselves out.

// Method is used when it's an auction. This will tell the game to re-auction
// the property if the player fails to get out of bankruptcy.

function payMoney(transactionDetails){

    // Check whether we're dealing with a list of transactions or just one
    if (transactionDetails && typeof(transactionDetails === 'object')){
        transactionQueue.push(transactionDetails)
    }

    transactionDetails = transactionQueue[0]

    console.log(transactionDetails)

    // Set up a bunch of variables we'll use throughout this process.
    debtor = players[transactionDetails.debtorID - 1]
    creditor = typeof transactionDetails.creditorID === 'string' ? transactionDetails.creditorID : players[transactionDetails.creditorID - 1]

    let debt = 0

    // Check whether we're dealing with a preset amount or the cost of a purchase
    if (transactionDetails.amount >= 0){
        debt = transactionDetails.amount
    } else{
        let properties = transactionDetails.purchase
        properties.forEach(function(property){
            debt += property.price
        })
    }

    // Check whether we're going bankrupt or not as a result of this transaction.
    // If we're not, we need to make sure any necessary ownerships get transferred.
    let bankruptcy = (debtor.money < debt) ? true : false

    if (bankruptcy){
        openBankruptcyProceedings(transactionDetails)

    } else{

        if (transactionDetails.purchase){

            // Actually give ownership of the purchase over to the player
            // now we've established they have enough money.
            transactionDetails.purchase.forEach(function(property){

                //console.log(property)
                
                let propertyID = property.position

                //buyProperty(propertyID, players[creditorID - 1], transactionDetails.method, transactionDetails.amount)

                // Actual ownership
                spaces[propertyID].owner = debtor
                if (typeof creditor === 'object' && creditor.properties[propertyID]){
                    delete creditor.properties[propertyID]
                }
                
                debtor.properties[propertyID] = spaces[propertyID]
                
                // Money exchange
                debtor.money -= property.price

                if (creditor !== 'bank'){
                    creditor.money += property.price
                }
            })

        } else if (debt > 0){
                debtor.money -= debt

                // If this debt is to all the other players (e.g. through a Chance
                // or Community Chest card), share the money out
                if (creditor === "allOtherPlayers"){

                    credit = transactionDetails.amount/(players.length - 1)

                    players.forEach(function(player){
                        if (player.id != turn){
                            player.money += credit
                        }
                    })

                // Otherwise if it is a debt to anyone else but the bank...
                } else if (creditor !== 'bank'){
                    creditor.money += debt
                }
    
            
        }

        updatePlayerDetails()
    }

    transactionQueue.shift()
    if (transactionQueue.length > 0 && !bankruptcy){
        payMoney()
    }

}




// COMMUNITY CHEST AND CHANCE FUNCTIONS --------------------------------------//

function drawCard(type){

    let transactionDetails = null

    // Note that chance and community chest cards are not drawn randomly.
    // They are shuffled at the beginning of the game.
    // When drawn, the card is returned to the bottom of the pile.
    // This way, they always stay in the same rotation.

    let cardList = (type === "community-chest") ? communityChestCards : chanceCards
    let chosenCard = cardList.shift()
    openPopup(chosenCard.description, (type === "community-chest") ? 'Community Chest' : 'Chance')


    let description = (chosenCard.type === 'move' && chosenCard.value === 10)
    ? 'go-to-jail'
    : chosenCard.type

    let cardMessage = createElement('div', 'card-message', '', 'type', description)




    let innerCardMessage = createElement('div', '', chosenCard.description)
    cardMessage.appendChild(innerCardMessage)
    openPopup('', (type === "community-chest") ? 'Community Chest' : 'Chance')
    popupMessage.appendChild(cardMessage)

    cardList.push(chosenCard)


    
    switch (chosenCard.type){
        case '+':
            // A card which gains the player money from the bank
            players[turn - 1].money += chosenCard.value
            addToFeed(players[turn - 1].name + ' got ' + currencySymbolSpan + chosenCard.value + ' from a ' + getReadableCardName(type) + ' card', 'money-plus')
            break
        case '-':
            // A card where the player has to surrender money to the bank

            transactionDetails = {debtorID: players[turn - 1].id, creditorID: 'bank', amount: chosenCard.value}
            payMoney(transactionDetails)
            //players[turn - 1].money -= chosenCard.value
            addToFeed(players[turn - 1].name + ' lost ' + currencySymbolSpan + chosenCard.value + ' to a ' + getReadableCardName(type) +' card', 'money-minus')

            break
        case 'getout':
            // TODO
            addToFeed(players[turn - 1].name + ' drew a \'get out of jail free\' card. It may be kept until needed, traded or sold.', 'get-out-card')

            // Keep a record of what card type this is, so we can return it
            // to the correct deck once used.
            chosenCard.deck = type

            // Store this card on the player's object.
            players[turn - 1].getOutCards.push(chosenCard)

            // Remove this card from its list so it can't be drawn
            // again until it is used.
            cardList.pop()



            break
        case 'exchange':


            // The player is receiving money from all the other players
            if (chosenCard.value > 0){
                players.forEach(function(player){
                    if (player.id != turn){
                        transactionQueue.push({debtorID: player.id, creditorID: turn, amount: chosenCard.value, method: 'card'})
                    }
                })

            // The player is paying money to all of the other players.
            // Note - there are no official rules regarding what happens if a
            // player doesn't have enough money to pay this. Phil Orbanes (who 
            // is generally considered the authority on the rules) says to
            // auction off all the properties in case of bankruptcy and split
            // the proceeds among all the other players. This is the fairest
            // way. I'm not a fan of this however since it's not how it would
            // actually work in real life, but who am I to argue?
            } else{

                let totalDebt = Math.abs(chosenCard.value * (players.length -1))
                transactionQueue.push({debtorID: players[turn - 1].id, creditorID: 'allOtherPlayers', amount: totalDebt, method: 'card'})

            }

            if (transactionQueue.length){
                payMoney()
            }



            break
        case 'repairs':

            let numberOfHouses = 0
            let numberOfHotels = 0

            spaces.forEach(function(space){

                // This is the current player's property. Let's figure out how many houses/hotels we have.
                if(space.owner && space.owner.id == turn){
                    if (space.houses === 5){
                        numberOfHotels += 1
                    } else if (space.houses > 0){
                        numberOfHouses += space.houses
                    }
                }
            })

            let houseRepairCost = chosenCard.value[0]
            let hotelRepairCost = chosenCard.value[1]

            totalRepairCost = (houseRepairCost * numberOfHouses) + (hotelRepairCost * numberOfHotels)
            //players[turn - 1].money -= totalRepairCost
            payMoney({debtorID: players[turn - 1].id, creditorID: 'bank', amount: totalRepairCost})

            let repairMessage = players[turn - 1].name + ' drew a ' + getReadableCardName(type) + ' card'

            if (totalRepairCost > 0){
                repairMessage += ' and spent ' + currencySymbolSpan + totalRepairCost + ' repairing their properties'
            } else{
                repairMessage += ' requiring them to make general repairs to their properties, but they don\'t have any buildings'
            }

            addToFeed(repairMessage, 'repairs')
            break
        case 'move':
            // TODO
            cardBasedMovement(chosenCard, type)
            break
        }

    // While not all cards will require this, a large majority will
    updatePlayerDetails(transactionDetails)
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

            if (chosenCard.value < 0){
                addToFeed(getCardMovementFeedMessage(chosenCard.value), 'go-back')
                moveToken(chosenCard.value)
            } else{
                addToFeed(getCardMovementFeedMessage(chosenCard.value), 'advance')
                moveToken(calculateCardMovement(chosenCard.value))
            }
    }


    // Outputs a nice player readable message to put in the feed.
    function getCardMovementFeedMessage(position){

        // Note - if the card is a 'go back' card, the 'position' will actually
        // be the negative number of spaces to go back, rather than the actual
        // position they're supposed to advance to.

        if (position < 0){

            // Check whether we need to pass go or not
            let newPosition = players[turn - 1].position + position
            if (newPosition < 0){
                newPosition = newPosition + 40
            }

            return players[turn-1].name + ' drew a ' + getReadableCardName(type) + ' card and went back ' + Math.abs(position) + ' spaces to ' + spaces[newPosition].name
        } else{
            return players[turn-1].name + ' drew a ' + getReadableCardName(type) + ' card and advanced to ' + spaces[position].name
        }

    }


    // Calculate how far a token needs to move to reach a specified position,
    // considering whether we need to pass Go or not.
    function calculateCardMovement(endPosition){

        // Moving forwards
        if (endPosition > 0){
            // If we don't need to pass go
            if (currentPosition < endPosition){
                return endPosition - currentPosition
            }
            
            // If we DO need to pass go
            else{  
                return (40 + endPosition) - currentPosition
            }

        // Moving backwards
        } else{
            return (40 + currentPosition + endPosition)
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
function openPopup(message, title){

    // The trade negotiation window requires the overflow to be set to visible.
    // This resets it.
    document.querySelector('#popup-inner').style.overflow = 'auto'

    popupMessage.innerHTML = message
    if (title){
        popupTitle.innerHTML = title
    } else{
        popupTitle.innerHTML = ''
    }
    document.body.classList.add('popup-open')
}

function aboutToggle(){
    document.querySelector('#about').classList.toggle('hidden')
}


// WARNING FUNCTIONS ---------------------------------------------------------//

function openWarning(title, message){
    document.body.classList.add('warning-open')
    warningTitle.innerHTML = title
    warningMessage.innerHTML = message
}

function closeWarning(){
    document.body.classList.remove('warning-open')
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

    // The token we wish to move
    let token = document.querySelector('#' + document.body.getAttribute('turn') + 'token')

    // The position the token is currently at
    let startPosition = parseInt(token.getAttribute('position'))

    // The place we wish the token to end up
    // Note - adding a negative number will subtract it. Therefore we want to
    // add it regardless of whether it's positive or negative
    let endPosition = startPosition + total

    // If the end position is less than 39 (so not passing Go), set the token's position attribute to that number. Otherwise set it to the end position minus 40 (so resetting once you pass Go)    
    //endPosition <= 39 ? token.setAttribute('position', endPosition) : token.setAttribute('position', endPosition - 40)
    players[turn - 1].position = endPosition  


    // If we're going to jail, do that, otherwise animate the token
    if (endPosition === 30){
        // TODO - we should animate the token even if we're going to jail.
        goToJail(token)
    } else{

        let i = startPosition

        // Moving backwards
        if (total < 0){

            endPosition <= 39 ? token.setAttribute('position', endPosition) : token.setAttribute('position', endPosition - 40)

            let myInterval = setInterval(function(){
                
                if (i >= endPosition){
                    positionToken(token, i)
                    i--

                    // If we've landed back on Go, we need to reset where we're moving to.
                    if (i < 0){

                        endPosition = 40 + endPosition
                        i = 39

                    }

                } else{
                    // Once the token has reached where it needs to be, stop the animation
                    window.clearInterval(myInterval)
                    specialEndPositions(endPosition)
                }
            }, 100)


        // Moving forwards
        } else{

            endPosition <= 39 ? token.setAttribute('position', endPosition) : token.setAttribute('position', endPosition - 40)


            let myInterval = setInterval(function(){
                if (i <= endPosition){
    
                    // The space after 39 is 0, not 40
                    if (i === 40){
                        positionToken(token, 0)
                    } else{
                        positionToken(token, i)
                    }
    
                    i++
    
                    // If i is 40, that means we've landed back on 'Go.
                    // Reset i and endPosition and give the player £200
                    if (i === 41){
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
    
                //console.log('i=' + i + ' endPosition = ' + endPosition)
    
    
            }, 100)
        }



        
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
            //players[turn - 1].money -= 200
            payMoney({debtorID: players[turn - 1].id, creditorID: 'bank', amount: 200})
            addToFeed(players[turn-1].name + ' paid ' + currencySymbolSpan + '200 income tax', 'money-minus')
            //updatePlayerDetails({debtorID: players[turn - 1].id, creditorID: 'bank', amount: 200})
            break
        case 38:
            // Super tax
            players[turn - 1].money -= 100
            addToFeed(players[turn-1].name + currencySymbolSpan + ' paid 100 super tax', 'money-minus')
            //updatePlayerDetails({debtorID: players[turn - 1].id, creditorID: 'bank', amount: 100})
            payMoney({debtorID: players[turn - 1].id, creditorID: 'bank', amount: 200})
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


// Puts the token where you want it to be visually using CSS. No maths is involved.
function positionToken(token, position){
    let matchingProperty = document.querySelector('#board > .row div[position="' + position + '"]')

    let row = matchingProperty.parentNode.getAttribute('id')
    
    // The token should sit half way from the top of the property, minus half the token's height.
    let desiredTop = matchingProperty.offsetTop += ((matchingProperty.offsetHeight / 2) - (token.offsetHeight / 2))

    // The token should sit half way from the left of the property, minus half the token's width.
    let desiredLeft = matchingProperty.offsetLeft += ((matchingProperty.offsetWidth / 2) - (token.offsetWidth / 2))

    let desiredRight = matchingProperty.offsetRight
    let desiredBottom = matchingProperty.offsetBottom


    if (matchingProperty.getAttribute('id') === 'jail'){

        // If the player is in jail
        if (players[turn - 1].inJail !== 0){
            desiredLeft = matchingProperty.offsetLeft + (matchingProperty.offsetWidth - token.offsetWidth) - 5
            desiredTop -= 10
            token.setAttribute('jail', true)

        // If the player is just visiting
        } else{
            desiredLeft = 0
            desiredBottom = 0
            desiredTop = matchingProperty.offsetTop + matchingProperty.offsetHeight - token.offsetHeight
            token.setAttribute('jail', false)
        }


    }

    // If there are already tokens on the property, reshuffle them so they don't
    // sit on top of each other.
    let desiredZindex = 1

    if (matchingProperty.getAttribute('id') !== 'jail'){
        ;[].forEach.call(document.querySelectorAll('.token[position="' + position + '"]'), function(node){
            node.style.transform = 'translateY(' + ((desiredZindex - 1) * 8) + 'px)'
            node.style.Zindex = desiredZindex
            desiredZindex++
        })
    } else{

        let jailTokens = document.querySelectorAll('.token[position="10"][jail="true"]')
        let distance = 8
        
        for (i = 0; i < jailTokens.length; i++){
            let transform = 1/2 * distance * (2 * i - jailTokens.length + 1)

            jailTokens[i].style.transform = 'translateY(' + transform + 'px'
        }

        let visitingTokens = document.querySelectorAll('.token[position="10"][jail="false"]')
        for (i = 0; i < visitingTokens.length; i++){
            visitingTokens[i].style.transform = 'translateX(' + (i * 8) + 'px'
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
    //token.setAttribute('jail', true)
    
    availableActions.rollDice = false
    availableActions.endTurn = true
    players[turn - 1].inJail++
    players[turn-1].position = 10
    positionToken(token,10)
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
    let player = players[turn - 1]
  
    switch (method){
        case 'pay':
            //player.money -= 50
            payMoney({debtorID: players[turn - 1].id, creditorID:'bank', amount: 50})
            availableActions.rollDice = true
            addToFeed(players[turn-1].name + ' paid ' + currencySymbolSpan + '50 to get out of jail', 'money-minus')
            break
        case 'card':
            //TODO
            availableActions.rollDice = true
            addToFeed(players[turn-1].name + ' used a \'get out of jail free\' card', 'get-out-card')

            // Remove the card from the player, and return it to the deck it came from.
            let usedCard = player.getOutCards.pop()
            let cardList = usedCard.deck === 'community-chest' ? communityChestCards : chanceCards
            cardList.push(usedCard)

            // Remove the icon from the player's summary
            //let cardIcon = document.querySelector('.current-player-summary .player-cards .player-card-icon')
            //cardIcon.classList.add('zoomOut')

            //window.setTimeout(function(){
                //cardIcon.parentNode.removeChild(cardIcon)
            //}, 1000)

            // Remove the attribute so the CSS can transition the card
            // container to disappear if this is their last get out card.
            if (player.getOutCards.length === 0){
                document.querySelector('.current-player-summary .player-cards').setAttribute('cards', false)
            }

            break
        case 'doubles':
            // Note - you do not get to roll again after rolling doubles to get out of jail
            addToFeed(players[turn-1].name + ' rolled doubles and got out of jail', 'doubles-out-of-jail')
            diceContainer.className = "successful-jail-roll"
            diceDoubles.innerText = "Success!"
            break
    }

    
    availableActions.getOutOfJail = false

    document.querySelector('#player' + turn + 'token').setAttribute('jail', false)

    player.inJail = 0
    setAvailableActions()
    
  
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

        // Check whether the player has any get out of jail free cards,
        // and allow their use if so.
        availableActions.cardOutOfJail = players[turn - 1].getOutCards.length > 0 ? true : false
        
        setAvailableActions()
        
    }
}

// TURN BASED FUNCTIONS ------------------------------------------------------//

function increasePlayerTurn(){

    incrementTurn()

    // Increment turn, making sure that we're landing on a turn for which an
    // actual player exists. A player won't exist if that player has lost and 
    // left the game, or we've gone past the end of the players array.
    function incrementTurn(){
        turn++

        if (turn > players.length){
          turn = 1
        }
        
        if (!players[turn -1]){
          incrementTurn()
        }
    }
      
      
    doublesCount = 0



    availableActions.rollDice = true
    availableActions.endTurn = false
    document.body.setAttribute('turn', 'player' + turn)

    // Move where the class of 'currentPlayer' sits. This allows buttons to be
    // enabled and disabled in the CSS.
    let currentPlayer = document.querySelector('.current-player-summary')

    if (currentPlayer){
        currentPlayer.classList.remove('current-player-summary')
    }

    document.querySelector('.individual-player-summary[player="' + turn + '"]').classList.add('current-player-summary')
    
    // TODO - check whether this is being run twice?
    checkJail()
}

// PROPERTY FUNCTIONS --------------------------------------------------------//


function displayPropertyDetails(number){
    htmlOutput = generatePropertyDetails(number)
    openPopup(htmlOutput, 'Property details')
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

    let target = e.target.closest('.full-portfolio-item')


    // TODO - Why am I doing this with classes and not attributes?

    if (target){
        let targetProperty = target.getAttribute('property')
        displayPropertyDetails(targetProperty)
        let backButton = document.createElement('div')
        backButton.classList.add('back-button')
        backButton.setAttribute('player', spaces[targetProperty].owner.id)
        document.querySelector('.property-overview').appendChild(backButton)
        backButton.addEventListener('click', fullPortfolioView)
    }
}

function fullPortfolioView(e){
    let player = (e.type === 'keydown') ? document.querySelector('.property-overview').getAttribute('player') :  e.target.getAttribute('player')
    //let portfolioOutput = generateFullPortfolioView(player)
    openPopup('', players[player - 1].name + '\'s property portfolio')
    popupMessage.appendChild(generateFullPortfolioView(player))
    document.querySelector('.full-portfolio').addEventListener('click', portfolioItemPreview, true)
}

function generateFullPortfolioView(player){

    let portfolioOutput = createElement('div', 'full-portfolio')
    let stations = []
    let utilities = []

    players[player - 1].properties.forEach(function(property){

        // Create a containing div to hold all the info relating to this property
        let propertyContainer = createElement('div', 'full-portfolio-item', '', 'property', property.position)
        propertyContainer.setAttribute('mortgaged', property.mortgaged)
        propertyContainer.setAttribute('group', property.group)

        // Create the icon
        let propertyIcon = createElement('div', 'property-icon')
        propertyIcon.classList.add(property.group, property.position)
        if (property.group === 'utility'){
            propertyIcon.classList.add(property.name.replace(' ', '-').toLowerCase())
        }

        propertyContainer.appendChild(propertyIcon)

        // Add the name
        let propertyName = createElement('div', 'property-name', property.name)
        propertyContainer.appendChild(propertyName)

        // Add icons if there are houses/hotels
        if (property.houses === 5){
            let hotelIcon = createElement('span', 'full-portfolio-hotel')
            propertyContainer.appendChild(hotelIcon)
        } else{
            for (i = 1; i <= property.houses; i++){
                let houseIcon = createElement('span', 'full-portfolio-house')
                propertyContainer.appendChild(houseIcon)
            }
        }

        // Display the value of the property
        let value = property.price

        if (property.mortgaged){
            value = property.price / 2
        } else{

            // Note - in every Monopoly game I have played, the hotel cost is
            // the same as the house cost. However, I have coded this bit this 
            // way just in case in the future I add a different type of board
            // where they actually are different.
            if (property.houses === 5){
                value += property.hotelCost + (property.houseCost * 4)
            } else if (property.houses){
                value += property.houses * property.houseCost
            }
        }

        let valueDisplay = createElement('div', 'portfolio-item-value', 'value: ' + currencySymbolSpan + value)
        propertyContainer.appendChild(valueDisplay)


        // If this is a station or utility, add these to an array to be looped
        // through and added at the end of the list.
        // Otherwise just add it to the end.

        if (property.group === 'train-station'){
            stations.push(propertyContainer)
        } else if (property.group === 'utility'){
            utilities.push(propertyContainer)
        } else{
            portfolioOutput.appendChild(propertyContainer)
        }
    })

    stations.forEach(function(station){
        portfolioOutput.appendChild(station)
    })

    utilities.forEach(function(station){
        portfolioOutput.appendChild(station)
    })


    // Group each group into their own section.
    Array.from(portfolioOutput.children).forEach(function(child){
        if (child.previousElementSibling){
            let previousGroup = child.previousElementSibling ? child.previousElementSibling.querySelector('.property-icon').classList[1] : child.nextElementSibling.querySelector('.property-icon').classList[1]
            let currentGroup = child.querySelector('.property-icon').classList[1]
    
            if (previousGroup !== currentGroup && child.previousElementSibling){
                let divider = createElement('div', 'portfolio-divider')
                portfolioOutput.insertBefore(divider, child)
            }
        }

    })
     
    if (!portfolioOutput.innerHTML){
        portfolioOutput.innerHTML = players[player - 1].name + ' does not own any properties'
        portfolioOutput.style.justifyContent = 'center'
    }

    return portfolioOutput
}

function displayPropertyOptions(number){
    let optionsPanel = createElement('div', 'property-overview-options')
    
    let propertyOwner = spaces[number].owner

    let optionsPanelInner = createElement('div', 'property-options')
    optionsPanel.appendChild(optionsPanelInner)

    // If this property is unowned, display a button to buy it
    if (!propertyOwner){
        if (players[turn - 1].position === number){

            // Buy property elements
            let buyButton = document.createElement('button')
            buyButton.innerText = 'Buy this property'
            buyButton.addEventListener('click', function(){
                buyProperty(number, players[turn - 1], 'purchase', null)
            })
            optionsPanelInner.appendChild(buyButton)


            // Auction property elements
            let auctionButton = document.createElement('button')
            auctionButton.innerText = 'Go to auction'
            auctionButton.addEventListener('click', function(){
                auctionProperty(number)
            })
            optionsPanelInner.appendChild(auctionButton)

        } else{
            optionsPanelInner.innerHTML = 'This property is unonwned'
        }
    } 

    // If this space is owned, display appropriate options.
    else if (spaces[number].owner){
        
        //optionsPanel.innerHTML = 'You own this property!<br>'

        optionsPanelOwner = createElement('div', 'options-panel-owner')
        optionsPanelOwner.appendChild(createElement('div', 'token', '', 'token', spaces[number].owner.token))
        optionsPanelOwner.appendChild(createElement('div', '', '<span class="smallText">OWNED BY</span><br>' + spaces[number].owner.name))
        optionsPanel.appendChild(optionsPanelOwner)




        let propertyType = spaces[number].type
        let colour = spaces[number].group


        // Display house building options if this is a standard property (not station or utility)
        if (propertyType === 'property'){
            // If the owner of the property owns the full colour set...
            if (checkColourSet(colour, spaces[number].owner.id)){
                //availableActions.buildHouse = true

                // Player may build houses/hotels.
                let colourSetButton = document.createElement('button')
                colourSetButton.classList.add('colour-set-button')
                colourSetButton.innerText = 'Manage colour set'
                colourSetButton.addEventListener('click', function(){
                    displayBuildHousePanel(colour)
                })

                optionsPanelInner.appendChild(colourSetButton)
            }
        } else if (propertyType === 'station'){

            let stationSet = getColourSet('train-station')
            let stationCount = 0
            stationSet.forEach(function(station){
                if (station.owner && station.owner.id === spaces[number].owner.id){
                    stationCount++
                }
            })

            if (stationCount > 1){
                let stationMessage = createElement('div', 'station-message', spaces[number].owner.name + ' also owns ' + (stationCount - 1) + ' other station')
                if (stationCount > 2){
                    stationMessage.innerHTML += 's'
                }
                optionsPanel.appendChild(stationMessage)
            }

        } else if (propertyType === 'utility'){

            let currentUtilityName = spaces[number].name
            let utilityCount = []

            spaces.forEach(function(space){
                if (space.type === 'utility' && space.name !== currentUtilityName){
                    utilityCount.push(space.name)
                }
            })

            // Note - I am unaware of any board that has more than two utilities. However, this WILL work with more than two even if the grammar output isn't perfect.
            if (utilityCount.length > 1){
                let utilityMessage = createElement('div', 'utility-message', spaces[number].owner.name + ' also owns ' + utilityCount)
                optionsPanel.appendChild(utilityMessage)      
            }
        }

        // If this space has a truthy group, it must be a property, station or
        // utility, and therefore may be mortgaged.
        // It must also belong to the current player.
        if (colour && spaces[number].owner.id == turn){

            // Create the mortgage button. We'll disable this and change its 
            // text even if we determine mortgaging isn't allowed on
            // this property

            let mortgageButton = createElement('button', 'mortgage-button', 'Mortgage property for ' + currencySymbolSpan + '<span style="font-size: 108%">' + (spaces[number].price / 2) + '</span>', null, null)
            mortgageButton.addEventListener('click', function(){
                mortgageProperty(spaces[number])
            })
            optionsPanelInner.appendChild(mortgageButton)

            // Create the unmortgage button

            let unmortgageButton = createElement('button', 'unmortgage-button', 'Unmortgage property for ' + currencySymbolSpan + '<span style="font-size: 108%">' +  (Math.round((spaces[number].price / 2) * 1.1)) + '</span>', null, null)
            unmortgageButton.addEventListener('click', function(){
                unmortgageProperty(spaces[number])
            })
            optionsPanelInner.appendChild(unmortgageButton)



            
            // If the current player owns all of the properties in this set,
            // we need to check that they don't have houses/hotels before
            // they are able to mortgage.

            // If this property is already mortgaged...
            if(spaces[number].mortgaged === true){
                availableActions.mortgageProperty = false
                availableActions.unmortgageProperty = true
                mortgageMessage = createElement('div', 'mortgage-message', '', null, null)
                optionsPanel.appendChild(mortgageMessage)
                mortgageMessage.innerText = 'This property is mortgaged.'

            // If the player owns the full colour set...
            } else if(checkColourSet(colour, spaces[number].owner.id)){

                let colourSet = getColourSet(colour)

                // Check whether there are houses anywhere on this colour set.
                let housesPresent = false
                colourSet.forEach(function(property){
                    if(property.houses > 0){
                        housesPresent = true
                    }
                })

                if (housesPresent){
                    // There are houses present on this colour set. Disable
                    // mortgaging and enable buildng.
                    availableActions.mortgageProperty = false
                    availableActions.unmortgageProperty = false    // This property shouldn't be able to be mortgaged in the first place, but this will hide the button.
                    availableActions.buildHouse = true
                    availableActions.buildHotel = true
                    mortgageMessage = createElement('div', 'mortgage-message', '', null, null)
                    optionsPanel.appendChild(mortgageMessage)
                    mortgageMessage.innerText = 'You may not mortgage this while any properties in the colour set have houses or hotels.'
                } else{
                    // There are no houses on this colour set. Enable both
                    // mortgaging and building.
                    availableActions.mortgageProperty = true
                    availableActions.unmortgageProperty = false
                    availableActions.buildHouse = true
                    availableActions.buildHotel = true
                }

                // If there are properties mortgaged in this group, disable building.
                if (checkMortgagesInColourSet(colour)){
                    availableActions.buildHouse = false
                    availableActions.buildHotel = false
                    mortgageMessage = createElement('div', 'mortgage-message', '', null, null)
                    optionsPanel.appendChild(mortgageMessage)
                    mortgageMessage.innerText = 'You may not build houses while properties in this colour set are mortgaged.'
                }

   
            } else{
                // The space is not mortgaged, and the player does not own
                // the full colour set. Allow mortgaging.
                availableActions.mortgageProperty = true
                availableActions.unmortgageProperty = false
            }

            setAvailableActions()

        }


        // If there's no options available, delete the options container
        if (!optionsPanelInner.innerHTML){
            optionsPanelInner.parentNode.removeChild(optionsPanelInner)
        }

        if (optionsPanel.children.length === 1){
            optionsPanel.classList.add('single-item')
        }




          
    }
    


    popupMessage.appendChild(optionsPanel)
}

function mortgageProperty(property, bankruptcy){

    let mortgageValue = property.price / 2

    // Set the property as mortgaged and add this info to the feed.
    property.mortgaged = true
    addToFeed(players[turn - 1].name + ' mortgaged ' + property.name + ' for ' + currencySymbolSpan + mortgageValue, 'mortgage')

    // Give the player the money if we are not dealing with bankruptcy.
    // If we ARE dealing with bankruptcy, that function will deal with handing
    // over the remainder if this transaction gets them back in the black.
    if (!bankruptcy){
        players[turn - 1].money += mortgageValue
        updatePlayerDetails()
    }


    // Show the property as mortgaged on the board.
    document.querySelector('div[position="' + property.position + '"]').setAttribute('mortgaged', true)

    // Change what actions are appropriate
    availableActions.mortgageProperty = false
    availableActions.unmortgageProperty = true
    availableActions.buildHouse = false
    availableActions.buildHotel = false

    setAvailableActions()

    return mortgageValue
}     

function displayBuildHousePanel(colour){

    // Get an array of all of the properties in that colour set.
    let colourSet = []
    for (i = 0; i < spaces.length; i++){
        let property = spaces[i]
        if (property.group === colour){
            colourSet.push(property)
            feedDetails.push({name: property.name, position: property.position, newBuildings:0, originalBuildings: property.houses, owner: property.owner.name})
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

        ;['build-house', 'build-hotel', 'no-more-houses-in-bank', 'no-more-hotels-in-bank', 'not-enough-money', 'maximum-number-of-buildings-reached'].forEach(function(message){
            let innerSpan = document.createElement('span')
            innerSpan.classList.add(message)
            let readableMessage = message.replace(/-/g, ' ')
            innerSpan.textContent = readableMessage
            buildHouseBtn.appendChild(innerSpan)
        })

        //buildHouseBtn.innerText = 'Build house'
        //buildHouseBtn.textContent = (spaces[property.position].houses === 4) ? 'Build hotel' : 'Build house'
        buildHouseBtn.addEventListener('click', function(){
            buildHouse(property.position) 
        })
        buttonPanel.appendChild(buildHouseBtn)

        
        // Create a button to sell houses, but only if the current player is the
        // owner. Players can build houses when it's not their turn, but cannot
        // sell them.
        if (colourSet[0].owner.id == turn){
            
            let sellHouseBtn = document.createElement('button')
            sellHouseBtn.classList.add('sell-house-button')

            ;['sell-house', 'sell-hotel'].forEach(function(message){
                let innerSpan = document.createElement('span')
                innerSpan.classList.add(message)
                let readableMessage = message.replace(/-/g, ' ')
                innerSpan.textContent = readableMessage
                sellHouseBtn.appendChild(innerSpan)
            })

            sellHouseBtn.addEventListener('click', function(){
                sellHouse(property.position)
            })
            buttonPanel.appendChild(sellHouseBtn)
        }



         


        housePanel.appendChild(buttonPanel)

        // Add all this stuff to the options panel       
        setItemDetails.appendChild(housePanel)

        //console.log('bottom of displayBuildHousePanel')
        //toggleHouseBuildButtons()


    })

    updateBank()

    // Because we're involving event listeners that can't just be copy and
    // pasted from the HTML, we'll open a blank popup then append the nodes.
    openPopup('', 'Manage colour group')
    popupMessage.appendChild(houseBuildPanel)

    toggleHouseBuildButtons(colour)

    // According to the rules, players must build houses evenly. For example,
    // they can't have 4 houses on one property in the set and 1 on another.
    // This function will toggle the buttons as appropriate to force
    // this behaviour.
    
    
    
    
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
            document.querySelector('.house-building-panel[position="' + number + '"] .button-panel .sell-house-button').classList.remove('disabled-button')
        }
    
        payMoney({debtorID: spaces[number].owner.id, creditorID: 'bank', amount: spaces[number].houseCost})
        //players[spaces[number].owner.id - 1].money -= spaces[number].houseCost
        //updatePlayerDetails()
    
        // Update visual display to show new higher number of houses
        document.querySelector('.house-building-panel[position="' + number + '"] .house-visual-display').setAttribute('houses', spaces[number].houses)
    
        // Find the item in the feedDetails array and update the number
        feedDetails.forEach(function(property){
            if (property.name === spaces[number].name){
                property.newBuildings++
            }
        })

        updateHouseDisplay(number)
        toggleHouseBuildButtons(spaces[number].group)
        updateBank()
    }

    document.querySelector('#popup-close').addEventListener('click', runHouseBuildingFeedMessage, {once: true})
    document.addEventListener('keydown', runHouseBuildingFeedMessage)

    function runHouseBuildingFeedMessage(e){
        // If it's a keydown event, check whether it's the escape key.
        // If so, run the feed message and remove the listener from the close button
        if (e.key === 'Escape'){
            houseBuildingFeedMessage()
            document.querySelector('#popup-close').removeEventListener('click', runHouseBuildingFeedMessage)
            document.removeEventListener('keydown', runHouseBuildingFeedMessage)

        // If it's a click  event, just remove the eventlistener from keydown (since the click event is set to only run once anyway)
        } else if(e.type === "click"){
            houseBuildingFeedMessage()
            document.removeEventListener('keydown', runHouseBuildingFeedMessage)
        }

        // If it's neither a click event or an escape key press, do nothing.
    }



    // Build a player-readable message for the feed
    function houseBuildingFeedMessage(){

        let feedMessageBuy = []
        let feedMessageSell = []

        feedDetails.forEach(function(property){

            // The player is leaving this property with more buildings than it started with
            if (property.newBuildings > 0){

                // Only create this message if there's actually something to say
                let newMessage = ''

                // The player has built a hotel
                if (spaces[property.position].houses === 5){
                    newMessage += 'a hotel on '
                
                // The player has built 1 house
                } else if (property.newBuildings === 1){
                    newMessage += property.newBuildings + ' house on '

                // The player has built multiple houses (but no hotels)
                } else if (property.newBuildings > 1){
                    newMessage += property.newBuildings + ' houses on '
                }

                newMessage += property.name

                feedMessageBuy.push(newMessage)

            // The player is leaving this property with less buildings than     
            } else if (property.newBuildings < 0){

                // Only create this message if there's actually something to say
                let newMessage = ''

                // We've sold a hotel
                if (property.originalBuildings === 5){
                    newMessage = 'a hotel'

                    // We've sold a hotel AND houses
                    if (property.newBuildings <= -2){
                        newMessage += ' and ' + ' 1 house on '
                    }
                    if (property.newBuildings <= -3){
                        newMessage += ' and ' + Math.abs(property.newBuildings) + ' houses on '
                    } else{
                        newMessage += ' on '
                    }
                } else if (property.newBuildings === -1){
                    newMessage += '1 house on '
                } else if (property.newBuildings <= -2){
                    newMessage += Math.abs(property.newBuildings) + ' houses on '
                }


                newMessage += property.name
                feedMessageSell.push(newMessage)



            }

        })

        let feedMessage = ''

        // Build the message
        if (feedMessageBuy.length || feedMessageSell.length){
            feedMessage += feedDetails[0].owner + ' has '
        }
        

        // Loop through the buildings that are new
        if (feedMessageBuy.length > 0){
            feedMessage += ' built '

            for (i = 0; i < feedMessageBuy.length; i++){

                addSeparator(feedMessageBuy, i)
                feedMessage += feedMessageBuy[i]
            }
        }

        if (feedMessageBuy.length > 0 && feedMessageSell.length > 0){
            feedMessage += '. They have also '
        }


        // Loop through the buildings that have been sold
        if (feedMessageSell.length > 0){
            feedMessage += ' sold '

            for (i = 0; i < feedMessageSell.length; i++){

                addSeparator(feedMessageSell, i)
                feedMessage += feedMessageSell[i] + ''
            }
        }

        function addSeparator(array, i){
            if (i > 0 && i !== array.length - 1){
                feedMessage += ', '
            } else if (i > 0 && i === array.length - 1){
                feedMessage += ' & '
            }
        }

        if (feedMessage){
            addToFeed(feedMessage, 'construction')
        }

        //document.querySelector('#popup-close').removeEventListener('click', houseBuildingFeedMessage)

    }

}

function toggleHouseBuildButtons(group){

    console.log(group)

    if (group === 'utility' || group === 'train-station'){
        return
    }
        
    // Create an array of the number of houses on all the properties
    // in the colour set.
    let colourSetHouses = []

    let colourSet = getColourSet(group)
    
    colourSet.forEach(function(property){
        colourSetHouses.push(spaces[property.position].houses)
    })


    

    
    // Get the highest number of houses in the set.
    let highestNumberOfHouses = Math.max(...colourSetHouses)
    let lowestNumberOfHouses = Math.min(...colourSetHouses)

    //console.log('least houses = ' + lowestNumberOfHouses)


    // Functions to check whether all the properties have the same number of buildings
    function checkHouseAmount(houses){
        return highestNumberOfHouses === houses
    }
      
    function checkAllHousesSame(){
        return(colourSetHouses.every(checkHouseAmount))
    }

    
    // If all of the properties have the same number of houses...
    if (checkAllHousesSame()){

        //console.log('all houses are the same')

        
        if (highestNumberOfHouses === 5){


            // If all the properties have hotels, enable all the sell buttons
            ;[].forEach.call(document.querySelectorAll('.colour-set-overview .house-visual-display + .button-panel .sell-house-button,     .full-portfolio-item[group="' + group + '"] .house-visual-display + .button-panel .sell-house-button'), function(button){
                button.classList.remove('disabled-button')
            })
        }
        
        // If all the properties have the same amount of houses but they're NOT hotels, enable all of the build and sell buttons
        else{
            ;[].forEach.call(document.querySelectorAll('.colour-set-overview .house-visual-display + .button-panel .build-house-button,      .colour-set-overview .house-visual-display:not([houses="0"]) + .button-panel .sell-house-button,       .full-portfolio-item[group="' + group + '"] .house-visual-display:not([houses="0"]) + .button-panel .sell-house-button'), function(button){
                button.classList.remove('disabled-button')
            })

        }

    // If all the properties DON'T have the same number of houses...
    } else{

        // Prevent building on properties that have the most number of houses
        ;[].forEach.call(document.querySelectorAll('.house-visual-display[houses="' + highestNumberOfHouses + '"] + .button-panel .build-house-button' ), function(button){
            button.classList.add('disabled-button')
        })

        // Prevent selling buildings on properties that have the least
        ;[].forEach.call(document.querySelectorAll('.colour-set-overview .house-visual-display[houses="' + lowestNumberOfHouses + '"] + .button-panel .sell-house-button, .full-portfolio-item[group="' + group + '"] .house-visual-display[houses="' + lowestNumberOfHouses + '"] + .button-panel .sell-house-button'), function(button){
            button.classList.add('disabled-button')
        })


    }

    
    // Despite the rule of building evenly, check there are
    // enough buildings in the bank. This will set an attribute on the
    // body which is used in the CSS to disable the appropriate
    // buttons regardless of what the other maths returns


    if (!availableHouses){
        availableActions.buildHouse = 'none-left'
    }
    

    if (!availableHotels){
        availableActions.buildHotel = 'none-left'
    }

    //console.log(colourSet)

    if (players[colourSet[0].owner.id - 1].money < colourSet[0].houseCost){
        availableActions.buildHouse = 'not-enough-money'
    }
    

    if (players[colourSet[0].owner.id - 1].money < colourSet[0].hotelCost){
        availableActions.buildHotel = 'not-enough-money'
    }




    setAvailableActions()
}

function sellHouse(number){

    let proceeds = 0
    let currentHousesOnProperty = spaces[number].houses
  
    // If there is a hotel
    if (currentHousesOnProperty === 5){
  
        // When hotels are sold, they are exchanged for 4 houses...
        if (availableHouses >= 4){
            availableHotels++
            availableHouses -= 4
            spaces[number].houses--
            updateHouseDisplay(number)
            proceeds = spaces[number].hotelCost / 2

        }
  
        // but if there aren't 4 houses left in the bank...
        else{
  
            // The player must sell their hotels wholesale and return all
            // properties in that group to 0 houses. This is known as
            // the hotel trap.
            let wholeColourSet = getColourSet(spaces[number].group)
  
            wholeColourSet.forEach(function(property){
                let propertyNumber = property.position
  
                // Reset the number of houses to 0
                spaces[propertyNumber].houses = 0
  
                // Refund the player the cost of 5 houses, halved
                players[spaces[number].owner.id - 1].money -= ((spaces[propertyNumber].houseCost / 2) * 5)
  
                // Return the hotel and houses to the bank
                availableHotels++
                availableHouses += 4
  
                updateHouseDisplay(propertyNumber)
  
                toggleHouseBuildButtons(spaces[number].group)
  
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
        toggleHouseBuildButtons(spaces[number].group)

        proceeds = spaces[number].houseCost / 2
  
    }
  
    // Players get half the value back for houses/hotels
    players[spaces[number].owner.id - 1].money += (spaces[number].houseCost / 2)
    updatePlayerDetails()
  
    //console.log(players[spaces[number].owner.id - 1])
  
  
    // Find the property in the feedDetails array and update the number of buildings
    feedDetails.forEach(function(property){
        if (property.name === spaces[number].name){
            property.newBuildings--
        }
    })
  
    toggleHouseBuildButtons(spaces[number].group)

    return proceeds
  
    //document.querySelector('#popup-close').addEventListener('click', houseBuildingFeedMessage)
  }




function unmortgageProperty(property, player, multiple){

    // Half the property price, plus 10%
    let mortgageValue = Math.round((property.price / 2) * 1.1)

    property.mortgaged = false
    //addToFeed(players[turn - 1].name + ' unmortgaged ' + property.name + ' for ' + currencySymbolSpan + mortgageValue, 'money-minus')

    // Take the mortgage money from the player

    if (player){
        transactionQueue.push({debtorID: player.id, creditorID: 'bank', amount: mortgageValue, method:'unmortgage'})
    } else{
        transactionQueue.push({debtorID: players[turn - 1].id, creditorID: 'bank', amount: mortgageValue, method:'unmortgage'})
    }

    // If we are in the middle of bankruptcy proceedings, we don't want to
    // retrigger payMoney. The only way the length can be 1 is if the entry
    // we've just added is the only one and there is nothing else in the queue.
    if (transactionQueue.length === 1){
        payMoney()
    }

    let playerName = player ? player.name : players[turn-1].name 
    addToFeed(playerName + ' unmortgaged ' + property.name + ' for ' + currencySymbolSpan + mortgageValue, 'money-minus')
    
    //updatePlayerDetails()

    // Change what actions are appropriate. If we are dealing with a
    // post-bankruptcy so don't want to disable additional unmortgages.

    if (!multiple){
        availableActions.mortgageProperty = true
        availableActions.unmortgageProperty = false    
        // Clear the message
        mortgageMessage.innerText = ''
    }

    
    // If there are still other mortgaged properties in this set,
    // prevent the player from building.
    if (checkMortgagesInColourSet(property.colour)){
        mortgageMessage.innerText = 'You may not build houses while properties in this colour set are mortgaged.'
    } else{
        availableActions.buildHouse = true
        availableActions.buildHotel = true
    }

    // Show the property as unmortgaged on the board.
    document.querySelector('div[position="' + property.position + '"]').setAttribute('mortgaged', false)


    setAvailableActions()

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
    //spaces[number].owner = player
    closePopup()

    // If we've set a price, this will be a result of an auction.
    // Otherwise go with the default price.
    let property = Object.assign({}, spaces[number]) 
    if (price){
        property.price = price
    } else{
        let price = spaces[number].price
    }

    let transactionDetails = {debtorID: player.id, creditorID: 'bank', purchase: [property]}
    
    // Check that the player actually has enough money before granting them ownership.
    if(player.money > price){
        
        switch(method){
            case 'purchase':
                //player.money -= spaces[number].price
                //price = spaces[number].price
                addToFeed(player.name + ' bought ' + spaces[number].name + ' for ' + currencySymbolSpan + property.price, 'buy-property')
                break
            case 'auction':
                //player.money -= price
                //property.price = price
                addToFeed(player.name + ' won an auction for ' + spaces[number].name + ' for ' + currencySymbolSpan + property.price, 'auction')
                transactionDetails.method = 'auction'
        }

        // Now redundant since payMoney now deals with this.
        //player.properties[number] = spaces[number]
       
    }

    payMoney({debtorID: player.id, creditorID: 'bank', purchase: [property]})



    
}

function auctionProperty(number, proceedsToAll){

    if (number){
        propertiesToAuction.push(spaces[number])
    }
    
    let propertyID = propertiesToAuction[0].position

    let currentBid = 0
    let currentNumberOfBidders = nonNullArrayItems(players)


    let auctionScreen = document.createElement('div')
    auctionScreen.classList.add('auction-screen')

    // Generate the rent table so players can see what they're buying
    let auctionRentTable = document.createElement('div')
    auctionRentTable.classList.add('auction-rent-table')
    auctionRentTable.innerHTML += generatePropertyDetails(propertyID)
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

        // Check the player exists before running the stuff
        if (players[i]){

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

    }

    auctionBidArea.appendChild(playerBidInterfacesContainer)
    auctionScreen.appendChild(auctionBidArea)

    // Attach this to the popup message
    availableActions.closePopup = false
    openPopup('', 'Auction')
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
                endAuction()
            } else if (currentNumberOfBidders === 0 && !currentBid){
                addToFeed(spaces[propertyID].name + ' was available for auction but nobody bid on it.', 'auction')
                spaces[propertyID].owner = null
                closePopup()
                endAuction()
            }



        }
    
        function declareAuctionWinner(){
            let winner = auctionScreen.querySelector('.current-winner').getAttribute('player')
            buyProperty(propertyID, players[winner - 1], 'auction', currentBid)

            if (proceedsToAll){
                let equalShare = Math.floor(currentBid / (players.length - 1))                
                players.forEach(function(player){
                    player.money += equalShare
                })
                updatePlayerDetails()
            }
        }


        function endAuction(){
            // Auction is concluded one way or the other.
            // Delete the first entry from the propertiesToAuction array
            // If there are still properties to auction, run this again.
            propertiesToAuction.shift()
            if (propertiesToAuction[0]){
                auctionProperty()
            }
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


function checkMortgagesInColourSet(colour){
    // Check whether any properties in this set are mortgaged.
    colourSet = getColourSet(colour)
    let mortgaged = false
    colourSet.forEach(function(property){
        if(property.mortgaged){
            mortgaged = true
        }
    })

    if (mortgaged){
        availableActions.buildHouse = false
        availableActions.buildHotel = false
    }

    return mortgaged
}



// RENT FUNCTIONS ------------------------------------------------------------//

function landOnProperty(position){

    let owner = checkPropertyOwner(position) // The id of the owner
    let currentPlayer = players[turn - 1]

    if (owner && owner !== currentPlayer.id){

        // If the property is mortgaged, the player does not need to pay rent.
        if(spaces[position].mortgaged){
            addToFeed(currentPlayer.name + ' landed on ' + spaces[position].name + ' but it is mortgaged. No rent is due.', 'land-on-mortgaged')
        } else{
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

            // If the player doesn't have enough money, don't pay anything now.
            // This might be given to the creditor later if the debtor gets
            // out of bankruptcy.
            /*if (currentPlayer.money < rentAmount){
                let transactionDetails = {debtorID: currentPlayer.id, creditorID: owner, amount: rentAmount, shortfall: rentAmount - currentPlayer.money}
                updatePlayerDetails(transactionDetails)
            } else{
                players[owner - 1].money += rentAmount
                currentPlayer.money -= rentAmount
                addToFeed(currentPlayer.name + ' landed on ' + spaces[position].name + ' and paid ' + players[owner - 1].name + ' ' + currencySymbolSpan + rentAmount + ' in rent', 'rent')
                updatePlayerDetails()
            }*/


            payMoney({debtorID: players[turn - 1].id, creditorID: owner, amount: rentAmount, method: 'rent'})

            //players[owner - 1].money += rentAmount
            //currentPlayer.money -= rentAmount

            let feedMessage = currentPlayer.money > rentAmount
                            ? currentPlayer.name + ' landed on ' + spaces[position].name + ' and paid ' + players[owner - 1].name + ' ' + currencySymbolSpan + rentAmount + ' in rent'
                            : currentPlayer.name + ' landed on ' + spaces[position].name + ' but does not have ' + currencySymbolSpan + rentAmount + ' to pay rent.'
            addToFeed(feedMessage, 'rent')

            //updatePlayerDetails()


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
                rentAmount = spaces[position].rent[rentIndex]
                
            }
        }


    } else if (owner && owner === currentPlayer.id){
        // The property is owned by the current player. Do nothing.
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

// TRADING FUNCTIONS ---------------------------------------------------------//

// If this is happening as part of bankruptcy proceedings, the bankruptcy
// parameter will be passed to acceptTrade() as true via this function, which
// will indicate that we need to update the bankruptcy display once a trade
// has been accepted. 

function initiateTrade(bankruptcy){


    let tradeWindow = document.createElement('div')
    tradeWindow.classList.add('trade-summary-window')


    // Summary for the player initiating the trade

    let currentPlayerSummary = createElement('div', 'current-player-summary', '', '', '')

    let playerIdentity = createElement('div', 'player-identity')
    currentPlayerSummary.appendChild(playerIdentity)

    // Token
    playerIdentity.appendChild(createElement('div', 'player-token-icon', '', 'token', players[turn-1].token))

    // Name
    playerIdentity.appendChild(createElement('h2', '', players[turn-1].name, '', ''))

    // Money
    playerIdentity.appendChild(createElement('div', 'money', currencySymbolSpan +  players[turn-1].money, '', ''))

    // Portfolio
    currentPlayerSummary.appendChild(createElement('h3', '', 'YOU HAVE:', '', ''))
    
    let currentPlayerPortfolio = createElement('div', 'current-player-portfolio', '', '', '')
    currentPlayerPortfolio.appendChild(generateFullPortfolioView(turn))
    if (!currentPlayerPortfolio.querySelector('.full-portfolio').innerHTML){
        currentPlayerPortfolio.querySelector('.full-portfolio').innerHTML = 'You do not have any properties to trade.'
    }
    currentPlayerSummary.appendChild(currentPlayerPortfolio)
    
    // Get out cards

    if (players[turn-1].getOutCards.length > 0){
        let playerCards = createElement('div', 'player-cards', '', '', '')
        currentPlayerPortfolio.appendChild(playerCards)

        players[turn-1].getOutCards.forEach(function(card){
            playerCards.appendChild(createElement('div', 'player-card-icon', '', 'card-number', players[turn - 1].getOutCards.indexOf(card)))
        })
    }


    tradeWindow.appendChild(currentPlayerSummary)





    // Summaries for other players

    tradeWindow.appendChild(createElement('h2', '', 'OTHER PLAYERS', '', ''))

    let otherSummaries = createElement('div', 'other-player-summaries', '', '', '')

    i = 0
    players.forEach(function(player){
        if (player !== players[turn - 1]){
            let summary = createElement('div', 'other-player-summary', '' , 'player', player.id)
            let playerIdentity = createElement('div', 'player-identity')
            playerIdentity.appendChild(createElement('div', 'player-token-icon', '', 'token', player.token))
            playerIdentity.appendChild(createElement('h3', '', player.name, '', ''))
            playerIdentity.appendChild(createElement('div', 'money', currencySymbolSpan + player.money, '', ''))
            summary.appendChild(playerIdentity)


            let portfolio = generateFullPortfolioView(player.id)
            // TODO - this won't work now the function doesn't do HTML strings.
            if (portfolio.length === 34){
                portfolio = 'This player does not have any properties to trade.'
            }
            summary.appendChild(createElement('div', 'full-portfolio'))
            summary.lastChild.appendChild(generateFullPortfolioView(player.id))

            let cardDisplay = createElement('div', 'player-cards', '', '', '')


            if (player.getOutCards){
                player.getOutCards.forEach(function(card){
                    cardDisplay.appendChild(createElement('div', 'player-card-icon', '', 'card-number', player.getOutCards.indexOf(card)))
                })
            }


            summary.appendChild(cardDisplay)

            let tradeButton = createElement('button', 'trade-button', 'Trade', '', '')
            tradeButton.addEventListener('click', function(){
                negotiateTrade(event, bankruptcy)
            })
            summary.appendChild(tradeButton)


            otherSummaries.appendChild(summary)

        }

    })
    
    
    tradeWindow.appendChild(otherSummaries)


    openPopup('', 'Trade')
    popupMessage.appendChild(tradeWindow)

}

function negotiateTrade(e, bankruptcy){

    console.log(bankruptcy)

    let receiver = e.target.parentNode.getAttribute('player')
    let currentPlayerInControl = true

    let tradeNegotiationsWindow = createElement('div', 'trade-negotiations-window', '', 'trade-status', 'unproposed')
    let playerSummaries = createElement('div', 'trade-negotiation-summaries', '', '', '')

    // Place the full details for both players on the trade negotiations window
    let currentPlayerSummary = document.querySelector('.trade-summary-window .current-player-summary')
    let otherPlayerSummary = e.target.parentNode
    playerSummaries.appendChild(currentPlayerSummary)
    playerSummaries.appendChild(otherPlayerSummary)
    tradeNegotiationsWindow.appendChild(playerSummaries)



    //  Create the relevant buttons for the trade window

    // Propose trade button
    let proposeTradeButton = createElement('button', 'propose-trade', 'Propose trade', '', '')
    proposeTradeButton.classList.add('disabled-button')
    proposeTradeButton.addEventListener('click', function(){

        if (currentPlayerInControl){
            popupTitle.innerHTML = players[receiver - 1].name + ' is considering ' + players[turn - 1].name + '\'s offer'
        } else{
            popupTitle.innerHTML = players[turn - 1].name + ' is considering ' + players[receiver - 1].name + '\'s offer'
        }

        currentPlayerInControl = !currentPlayerInControl
        tradeNegotiationsWindow.setAttribute('trade-status', 'proposed')
        availableActions.closePopup = false
    })

    tradeNegotiationsWindow.appendChild(proposeTradeButton)

    // Accept trade button
    let acceptTradeButton = createElement('button', 'accept-trade', 'Accept trade', '', '')
    acceptTradeButton.addEventListener('click', acceptTrade)
    tradeNegotiationsWindow.appendChild(acceptTradeButton)
    
    
    // Counter offer button
    let counterOfferButton = createElement('button', 'make-counter-offer', 'Make a counter offer', '', '')
    counterOfferButton.addEventListener('click', function(){
        tradeNegotiationsWindow.setAttribute('trade-status', 'counter-in-progress')

        if (currentPlayerInControl){
            popupTitle.innerHTML = players[turn - 1].name + ' is making a counter offer'
        } else{
            popupTitle.innerHTML = players[receiver - 1].name + ' is making a counter offer'
        }
    })
    tradeNegotiationsWindow.appendChild(counterOfferButton)

    let rejectTradeButton = createElement('button', '', 'Reject trade', '', '')
    rejectTradeButton.addEventListener('click', function(){
        // REJECT TRADE
        closePopup()
        addToFeed(players[turn - 1].name + ' proposed a trade with ' + players[receiver - 1].name + ' but it was rejected.', 'trade-rejected')
    })
    tradeNegotiationsWindow.appendChild(rejectTradeButton)


    // Create inputs to propose money
    let proposalHTML = 'Money to trade: ' + currencySymbolSpan


    let currentPlayerMoneyProposal = document.createElement('div')
    currentPlayerMoneyProposal.classList.add('money-proposal-container')
    currentPlayerMoneyProposal.innerHTML = proposalHTML
    let input = document.createElement('input')
    input.setAttribute('class', 'money-proposal')
    input.setAttribute('placeholder', 'money')
    input.setAttribute('type', 'number')
    input.setAttribute('min', '1')
    input.setAttribute('max', players[turn-1].money)

    // If this trade is happening as part of bankruptcy proceedings, the 
    // current player shouldn't be allowed to trade money away.
    if (bankruptcy){
        currentPlayerMoneyProposal.setAttribute('bankruptcy-in-progress', true)
        input.setAttribute('disabled', true)
    }

    input.addEventListener('input', updateProposal)
    currentPlayerMoneyProposal.appendChild(input)
    currentPlayerSummary.insertBefore(currentPlayerMoneyProposal, currentPlayerSummary.querySelector('.player-identity').nextElementSibling)


    let otherPlayerMoneyProposal = document.createElement('div')
    otherPlayerMoneyProposal.classList.add('money-proposal-container')
    otherPlayerMoneyProposal.innerHTML = proposalHTML
    input = document.createElement('input')
    input.setAttribute('class', 'money-proposal')
    input.setAttribute('placeholder', 'money')
    input.setAttribute('type', 'number')
    input.setAttribute('min', '1')
    input.setAttribute('max', players[receiver-1].money)
    input.addEventListener('input', updateProposal)
    otherPlayerMoneyProposal.appendChild(input)


    otherPlayerSummary.insertBefore(otherPlayerMoneyProposal, otherPlayerSummary.querySelector('.player-identity').nextElementSibling)

    openPopup('', 'Negotiate trade')
    popupMessage.appendChild(tradeNegotiationsWindow)


    // Generate more info windows for each property
    ;[].forEach.call(tradeNegotiationsWindow.querySelectorAll('.full-portfolio-item'), function(node){
        let propertyNumber = node.getAttribute('property')
        let rentTable = createElement('div', 'rent-table-window', generatePropertyDetails(propertyNumber), '', '')
        node.appendChild(rentTable)

        // Since the windows are displayed using absolute positioning they may
        // disappear off the edge of the screen. Check whether the screen is
        // tall enough to accommodate them, and if not add a class to the trade
        // popup so we can disable them. It is necessary to do this as part of 
        // the foreach loop as it's possible that the top of the list will fit
        // but the bottom of the list won't.
        if (rentTable.getBoundingClientRect().bottom > window.innerHeight){
            tradeNegotiationsWindow.classList.add('too-short-for-rent-tables')
            document.querySelector('#popup-inner').style.overflow = 'auto'
        } else{
            document.querySelector('#popup-inner').style.overflow = 'visible'
        }
    })



    ;[].forEach.call(tradeNegotiationsWindow.querySelectorAll('.current-player-portfolio .full-portfolio, .other-player-summary > .full-portfolio'), function(node){
        node.addEventListener('click', function(e){
            updateProposal(e)
        })
    })

    ;[].forEach.call(tradeNegotiationsWindow.querySelectorAll('.player-card-icon'), function(node){
        node.addEventListener('click', function(e){
            updateProposal(e)
        })
    })






    // Event, type,
    function updateProposal(e){


        let item = e.target.parentNode
        

        // Check whether this is the money being updated
        if (e.target.nodeName === 'INPUT'){

            // Check whether the input is valid before we go any further
            let min = parseInt(e.target.getAttribute('min'))
            let max = parseInt(e.target.getAttribute('max'))
            let valid = (e.target.value >= min && e.target.value <= max) ? true : false

            
            let parent = e.target.parentNode.parentNode

            if (parent.classList.contains('current-player-summary')){
                tradeProposal[0][42] = valid ? e.target.value : undefined
            } else{
                tradeProposal[1][42] = valid ? e.target.value : undefined
            }

                
            // Mark the money as being proposed/unproposed according to whether it has a valid value in it.
            // This will allow the propose button to be updated as applicable.
            if (e.target.value && valid){
                e.target.parentNode.setAttribute('proposed', true)
            } else{
                e.target.parentNode.setAttribute('proposed', false)
            }
        } 
        
        // If we're adding/removing a property to the proposal
        else if (item.classList.contains('full-portfolio-item')){

            // Check which property we're dealing with
            let property = item.getAttribute('property')


            if (item.parentNode.parentNode.classList.contains('current-player-portfolio') && (!item.getAttribute('proposed') || item.getAttribute('proposed') === 'false')){
                // If the item belongs to the current player, and has NOT already been proposed, add it to the proposal
                tradeProposal[0][property] = spaces[property]
                
                if (checkHousesInGroup()){
                    toggleGroupInTrade(0, 'add')
                } else{
                    toggleProposalAttribute(item)
                }

            } else if (item.parentNode.parentNode.classList.contains('current-player-portfolio') && item.getAttribute('proposed')){
                // If the item belongs to the current player and it HAS already been proposed, remove it from the proposal
        
                if (checkHousesInGroup()){
                    toggleGroupInTrade(0, 'remove')
                } else{
                    toggleProposalAttribute(item)
                    delete tradeProposal[0][property]
                }
            
            } else if (!item.parentNode.parentNode.classList.contains('current-player-portfolio') && (!item.getAttribute('proposed') || item.getAttribute('proposed') === 'false') && !item.parentNode.classList.contains('player-cards')){
                // If the item belongs to the other player and has NOT already been proposed, add it to the proposal
                tradeProposal[1][property] = spaces[property]
                
                if (checkHousesInGroup()){
                    toggleGroupInTrade(1, 'add')
                } else{
                    toggleProposalAttribute(item)
                }

            } else{
                // If it fails all the previous tests, it must belong to the other player and already been proposed. Therefore remove it from the proposal.
                
                if (checkHousesInGroup()){
                    toggleGroupInTrade(1, 'remove')
                } else{
                    toggleProposalAttribute(item)
                    delete tradeProposal[1][property]
                }
            }


            function toggleProposalAttribute(node){
                let currentStatus = node.getAttribute('proposed')
                if (currentStatus === "true"){
                    node.setAttribute('proposed', false)
                } else{
                    node.setAttribute('proposed', true)
                }
            }

            // Return whether there are houses on ANY of the properties in the
            // group. If so, the whole set must be traded.
            function checkHousesInGroup(){
                let group = spaces[property].group
                let colourSet = getColourSet(group)
                let confirmation = false

                colourSet.forEach(function(tradeProperty){
                    if (tradeProperty.houses > 0){
                        confirmation = true
                    }
                })

                return confirmation
            }

            // Players are not allowed to trade properties with buildings unless
            // they trade the whole set.
            // Index should be 0/1 for current/other player.
            // Action should be 'add' or 'remove'
            function toggleGroupInTrade(index, action){
                let colourSet = getColourSet(spaces[property].group)
                
                if (action ==="add"){
                    colourSet.forEach(function(tradeProperty){
                        tradeProposal[index][tradeProperty.position] = spaces[tradeProperty.position]
                        toggleProposalAttribute(document.querySelector('.full-portfolio-item[property="' + tradeProperty.position + '"]'))
                    })
                } else{
                    colourSet.forEach(function(tradeProperty){
                        delete tradeProposal[index][tradeProperty.position]
                        toggleProposalAttribute(document.querySelector('.full-portfolio-item[property="' + tradeProperty.position + '"]'))
                    })
                }
            }


        // If we're adding a 'get out of jail' card to the proposal
        } else if (item.classList.contains('player-cards')){

            // Determine whether we're dealing with the current player or the receiver, and how many cards they have
            let trader = item.parentNode.classList.contains('current-player-portfolio') ? 0 : 1
            let cardIndex = parseInt(e.target.getAttribute('card-number'))

            // If not already proposed, add it to the proposal
            if (!e.target.getAttribute('proposed') || e.target.getAttribute('proposed') === 'false'){
                if (trader === 0){
                    tradeProposal[0][40 + cardIndex] = players[turn - 1].getOutCards[cardIndex]
                } else{
                    tradeProposal[1][40 + cardIndex] = players[receiver - 1].getOutCards[cardIndex]
                }

                e.target.setAttribute('proposed', true)

            // If already proposed, remove it from the proposal
            } else{
                e.target.setAttribute('proposed', false)

                if (trader === 0){
                    delete tradeProposal[0][40 + cardIndex]
                } else{
                    delete tradeProposal[1][40 + cardIndex]
                }
            }

        }





        // Get an array of all the non-undefined entries in the array
        let entries0 = tradeProposal[0].filter(checkEntryExists)
        let entries1 = tradeProposal[1].filter(checkEntryExists)
        function checkEntryExists(entry){
            if (entry){
                return entry
            }
        }

        // Check that both sides of the trade isn't just money.
        // Note - if you add money and then remove money, the length remains 43. This is why it 
        let bothSidesMoney = tradeProposal[0][42] && tradeProposal[1][42] ? true : false

        // TODO - this simply checks whether both sides have money in their proposal and disables the trade if so.
        // I could be extra and make it so that if you add money on one side when the other side already has money, deduct it.


        
        // Check if the proposal has items in it on both sides. If so...
        if (entries0.length > 0 && entries1.length > 0){
            // If we're not in bankruptcy, check both sides don't have money in their proposal.
            // If we ARE in bankruptcy, the other player must be trading money.
            if ((!bankruptcy && !bothSidesMoney) || (bankruptcy && tradeProposal[1][42])){
                proposeTradeButton.classList.remove('disabled-button')
            } else{
                proposeTradeButton.classList.add('disabled-button')
            }
        } else{
            proposeTradeButton.classList.add('disabled-button')
        }
    }

    function acceptTrade(){

        // Properties the current player has traded away.
        // Will be used in the generation of the feed message.
        let nameList0 = []

        // Properties the other player has traded away.
        // Will be used in the generation of the feed message.
        let nameList1 = []


        // Keeps a list of any properties in the trade that are mortgaged. Each
        // player will need to decide whether to unmortgage or pay the bank
        // 10% after accepting the trade.
        let mortgageList0 = []
        let mortgageList1 = []

        // Properties
        for (i = 0; i <= 39; i++){

            let property = tradeProposal[0][i]

            
            if (property){

                // Reset the property, so we're using the most up to date version
                // from the spaces array (rather than the one from the players
                // array which might be out of date and should only be used for
                // constants like the name etc)
                property = spaces[property.position]

                // Swap the owner property to its new owner
                property.owner = players[receiver - 1]

                // Add the most recent version of the property from the spaces
                // array, rather than the possibly out of date array from the player object.
                players[receiver - 1].properties[i] = spaces[i]

                
                delete players[turn - 1].properties[i]
                nameList0.push(property.name)

                if (property.mortgaged){
                    mortgageList0.push(property)
                }
            }

            property = tradeProposal[1][i]

            if (property){

                // Reset the property, so we're using the most up to date version
                // from the spaces array (rather than the one from the players
                // array which might be out of date and should only be used for
                // constants like the name etc)
                property = spaces[property.position]

                // Swap the owner property to its new owner
                property.owner = players[turn - 1]

                // Add the most recent version of the property from the spaces
                // array, rather than the possibly out of date array from the player object.
                players[turn - 1].properties[i] = spaces[property.position]

                delete players[receiver - 1].properties[i]
                nameList1.push(property.name)

                if (property.mortgaged){
                    mortgageList1.push(property)
                }
            } 
        }

        // Get out of jail cards

        for (i = 0; i <= 1; i++){

            
            let card  = tradeProposal[0][i + 40]
            
    
            if (card){
                players[receiver - 1].getOutCards.push(card)
                players[turn - 1].getOutCards.splice(0,1)
            }
    
            card  = tradeProposal[1][i + 40]
    
            if (card){
                players[turn - 1].getOutCards.push(card)
                players[receiver - 1].getOutCards.splice(0,1)
            }
        }

        // Money

        let money = parseInt(tradeProposal[0][42])
        if (money){
            nameList0.push(currencySymbolSpan + money)
            players[turn - 1].money -= money
            players[receiver - 1].money += money
        }

        money = parseInt(tradeProposal[1][42])
        if (money){
            nameList1.push(currencySymbolSpan + money)
            players[receiver - 1].money -= money
            players[turn - 1].money += money
        }


        // If this trade is happening during bankruptcy proceedings, make sure
        // the amount the player has left to raise gets updated.
        if (bankruptcy){
            updateCurrentDebt(tradeProposal[1][42])
        }

        let feedMessage = players[turn - 1].name + ' traded ' + generateTradeFeedMessage(nameList0) + ' for ' + players[receiver - 1].name + '\'s ' + generateTradeFeedMessage(nameList1)

        addToFeed(feedMessage, 'trade-accepted')
        updatePlayerDetails()
        closePopup()
        if (mortgageList0.length > 0 || mortgageList1.length > 0){
            tradeMortgageWarning()
        }
        tradeProposal = [[], []]
          






        // Generate a nice, readable message for the feed.


        // Count how many cards the trade proposal has, and create a
        // user-friendly string to be added to the feed
        function countCardsInTrade(index, list){

            let cardCount = 0

            for (i = 0; i <= 1; i++){
                let card = tradeProposal[index][i + 40]

                if (card){
                    cardCount++
                }
            }

            switch (cardCount){
                case 0:
                    // Do nothing
                    break
                case 1:
                    list.push('1 Get Out Of Jail Free card')
                    break
                case 2:
                    list.push('2 Get Out Of Jail Free cards')
            }
        }

        countCardsInTrade(0, nameList0)
        countCardsInTrade(1, nameList1)



        function generateTradeFeedMessage(array){

            let output = ''

            switch (array.length){
                case 1:
                    output += array[0]
                    break
                case 2:
                    output += array[0] + ' and ' + array[1]
                    break
                default:
                    for (i = 0; i < (array.length - 1); i++){
                        output += array[i]
    
                        if (i < (array.length - 2)){
                            output += ', '
                        }
                    }
                    output += ' and ' + array[array.length - 1]
            }

            return output
        }


        function tradeMortgageWarning(){

            availableActions.closePopup = false
            setAvailableActions()

            let tradeMortgageWarning = createElement('div', 'trade-mortage-warning', '', '', '')

            tradeMortgageWarning.appendChild(createElement('div', '', 'This trade contains properties which are mortgaged. You must decide whether to unmortgage them at 110% of the mortgage value, or keep them mortgaged and pay the bank 10%.'))


            // Properties the current player is receiving (and so needs to make mortgage decisions on)
            if (mortgageList1.length > 0){
                let column = createElement('div', 'trade-mortgage-list')

                let playerName = createElement('div', 'player-name')
                playerName.appendChild(createElement('div', 'player-token-icon', '', 'token', players[turn - 1].token))
                playerName.appendChild(createElement('div', '', players[turn-1].name))
                column.appendChild(playerName)

                column.appendChild(setupMortgageTable(mortgageList1, turn))
                tradeMortgageWarning.appendChild(column)
            }

            // Properties the receiver is receiving (and so needs to make mortgage decisions on)
            if (mortgageList0.length > 0){
                let column = createElement('div', 'trade-mortgage-list')

                let playerName = createElement('div', 'player-name')
                playerName.appendChild(createElement('div', 'player-token-icon', '', 'token', players[receiver - 1].token))
                playerName.appendChild(createElement('div', '', players[receiver - 1].name))
                column.appendChild(playerName)

                column.appendChild(setupMortgageTable(mortgageList0, receiver))
                tradeMortgageWarning.appendChild(column)
            }
            
            // Check whether there are still mortgages that need to be decided.
            // If they are all sorted, close the window.
            ;[].forEach.call(tradeMortgageWarning.querySelectorAll('button'), function(button){
                button.addEventListener('click', function(){
                    if (!tradeMortgageWarning.querySelector('button:not(.disabled-button)')){
                        closePopup()
                    }
                })
            })

            openPopup('','Mortgages')
            popupMessage.appendChild(tradeMortgageWarning)


            function setupMortgageTable(array, playerID){

                let list = createElement('div', '', '', '', '')

                array.forEach(function(property){
                    let entry = createElement('div', 'trade-mortgage-entry', '', '', '')
                    list.appendChild(entry)      
                    
                    let icon = createElement('div', 'property-icon')
                    icon.classList.add(property.group)
                    entry.appendChild(icon)
    
                    let name  = createElement('div', 'property-name', property.name, '', '')
                    entry.appendChild(name)
    
                    let unmortgageCost = Math.floor((property.price / 2) * 1.1)
                    let unmortgageButton = createElement('button', '', 'Unmortgage for ' + currencySymbolSpan +  unmortgageCost, '', '')
                    
                    unmortgageButton.addEventListener('click', function(){
                        unmortgageProperty(property, players[property.owner.id - 1])
                        unmortgageButton.classList.add('disabled-button')
                        unmortgageButton.innerHTML = 'Unmortgaged for ' + currencySymbolSpan + unmortgageCost
                        entry.removeChild(keepMortgageButton)
                    })
    
                    entry.appendChild(unmortgageButton)
                    
                    let keepMortgageCost = Math.floor((property.price / 2) / 10)
                    let keepMortgageButton = createElement('button', '', 'Keep mortgage for ' + currencySymbolSpan + keepMortgageCost)
                    keepMortgageButton.addEventListener('click', function(){
                        keepMortgageButton.innerHTML = 'Mortgage kept for ' + currencySymbolSpan + keepMortgageCost
                        keepMortgageButton.classList.add('disabled-button')
                        entry.removeChild(unmortgageButton)
                        players[playerID - 1].money -= keepMortgageCost
                        updatePlayerDetails()
                        addToFeed(players[playerID - 1].name + ' received ' + property.name + ' in a trade. They chose to keep the mortgage on it and have paid the bank ' + currencySymbolSpan + keepMortgageCost, 'money-minus')
                    })
    
                    entry.appendChild(keepMortgageButton)
                })

                return list
            }
        }



    }

}

// BANKRUPTCY  ---------------------------------------------------------------//


function openBankruptcyProceedings(transactionDetails){

    availableActions.bankruptcyProceedings = true
    setAvailableActions()

    let debtorID = transactionDetails.debtorID
    let creditorID = transactionDetails.creditorID
    let amount = transactionDetails.purchase ? transactionDetails.purchase[0].price : transactionDetails.amount


    let debtor = players[debtorID - 1]
    let creditor = creditorID === 'bank' ? 'bank' : players[creditorID - 1]


    bankruptcyTitle.innerHTML = ''
    bankruptcyMessage.innerHTML = ''

    // Generate the title of the bankruptcy window, including icon and debtor name
    let bankruptcyTitleContent = createElement('div', 'bankruptcy-title')
    bankruptcyTitle.appendChild(bankruptcyTitleContent)

    let debtorIcon = createElement('div', 'token', '', 'token', debtor.token)
    bankruptcyTitleContent.appendChild(debtorIcon)

    let debtorTitle =  createElement('h2', '', 'BANKRUPTCY WARNING - ' + debtor.name.toUpperCase())
    bankruptcyTitleContent.appendChild(debtorTitle)


    // We'll store any mortgages made here, and actually process them if
    // the player gets out of bankruptcy. This ensures creditors aren't
    // receiving mortgaged properties unnecessarily if the debtor 
    // doesn't get out.
    let mortgageQueue = []

    // Generate the message
    // TO FIX

    let creditorName = ''
    switch (creditorID){
        case 'bank':
            creditorName = 'the bank'
            break
        case 'allOtherPlayers':
            creditorName = 'all the other players'
            break
        default:
            creditorName = creditor.name
    }

    // This doesn't get used until much later, but I need to store it before
    // it gets deleted from the players array.
    let debtorName = players[debtorID - 1].name


    let message = ''
    if (creditorID === 'allOtherPlayers'){
        message += players[debtorID - 1].name + ', you owe ' + currencySymbolSpan + (transactionDetails.amount / (players.length - 1)) + ' each  to ' + creditorName + '. '
    } else{
        message += players[debtorID - 1].name + ', you owe ' + currencySymbolSpan + amount + ' to ' + creditorName + '. '
    }


    let bankruptcyDescription = createElement('div', 'bankruptcy-description',
        message
        + 'However you only have ' + currencySymbolSpan + (players[debtorID - 1].money) + '. <br>'

    )

    bankruptcyMessage.appendChild(bankruptcyDescription)



    // Generate the financial details section

    currentDebt = -Math.abs(players[debtorID - 1].money)

    if (transactionDetails.amount){
        currentDebt += transactionDetails.amount
    } else{
        transactionDetails.purchase.forEach(function(property){
            currentDebt += property.price
        })
    }

    let financialDetails = createElement('div', 'bankruptcy-financial-details')
    financialDetails.innerHTML =
        'You will need to raise at least <div class="amount-to-raise-display" style="font-size:2em; line-height: 1; color: #DB0926;">' + currencySymbolSpan 
        + currentDebt
        + '</div> if you wish to stay in the game.'

    bankruptcyMessage.appendChild(financialDetails)


    let worthDetails = createElement('div', 'bankruptcy-worth-details', '')
    worthDetails.innerHTML = '<span style="font-size: 1.3em;">Your current worth is <b>' + currencySymbolSpan + (calculatePlayerWorth(debtorID)) + '</b>.</span><br>'

    if (currentDebt > calculatePlayerWorth(debtorID)){
        worthDetails.innerHTML += 'You are unable to raise enough money for this unless another player agrees to trade properties for more than they\'re worth.'
        worthDetails.setAttribute('ableToRaise', false)
    } else{
        worthDetails.innerHTML += 'You should be able to raise enough money by trading with other players, mortgaging properties and selling buildings.'
        worthDetails.setAttribute('ableToRaise', true)
    }

    bankruptcyMessage.appendChild(worthDetails)



    // Generate the functions which will allow the player to get themselves out
    // of bankruptcy

    let functionsArea = generateFullPortfolioView(debtorID)
    bankruptcyMessage.appendChild(functionsArea)
    
    ;[].forEach.call(functionsArea.querySelectorAll('.full-portfolio-item'), function(node){
        
        let property = spaces[node.getAttribute('property')]

        let display = document.querySelector('.amount-to-raise-display')

        // Group the houses together so we can use the same CSS as sellHouse

        let houseVisualDisplay = createElement('div', 'house-visual-display', '', 'houses', property.houses)
        node.appendChild(houseVisualDisplay)


        let buttonPanel = createElement('div', 'button-panel')
        node.appendChild(buttonPanel)


        // Sell houses button -------------------*/

        let sellHouseButton = createElement('button', 'sell-house-button', 'Sell house', 'group', property.group)
        sellHouseButton.setAttribute('houses', property.houses)
        changeSellHouseButtonText(sellHouseButton)
        buttonPanel.appendChild(sellHouseButton)
        if (property.houses > 0){
            toggleHouseBuildButtons(property.group)
        }


        function changeSellHouseButtonText(button){
            button.innerHTML = button.getAttribute('houses') === '5' ? 'Sell hotel' : 'Sell house'
        }

        sellHouseButton.addEventListener('click', function(e){
            //sellHouseButton.closest('.full-portfolio-item').querySelector('.house-visual-display').setAttribute('houses', property.houses)
            currentDebt -= sellHouse(property.position)
            sellHouseButton.closest('.full-portfolio-item').querySelector('.house-visual-display').setAttribute('houses', property.houses)
            sellHouseButton.setAttribute('houses', property.houses)
            changeSellHouseButtonText(sellHouseButton)
            toggleHouseBuildButtons(property.group)
            display.innerHTML = currencySymbolSpan + currentDebt
            animateUpdate(display, 'good')


            // Check whether there are houses elsewhere in the group. This will
            // determine whether the other properties in the group can be mortgaged.
            let housesRemainingInGroup = 0
            debtor.properties.forEach(function(soldHouseProperty){
                if (soldHouseProperty.group === property.group){
                    housesRemainingInGroup += soldHouseProperty.houses
                }
            })

            housesRemainingInGroup = (housesRemainingInGroup > 0) ? false : true

            ;[].forEach.call(bankruptcyMessage.querySelectorAll('.full-portfolio .full-portfolio-item'), function(node){
                if (node.getAttribute('group') === property.group ){
                    node.setAttribute('mortgageable', housesRemainingInGroup)
                }
            })

            bankruptcyEscapeCheck()

        })




        // Mortgage button -----------------------*/

        let mortgageButton = createElement('button', 'mortgage-button', 'Mortgage property (' + currencySymbolSpan + property.price/2 + ')')

        // If the property is already mortgaged, disable this button
        if (property.mortgaged){
            mortgageButton.classList.add('disabled-button')
            mortgageButton.innerHTML = 'Already mortgaged'
        }

        mortgageButton.addEventListener('click', function(){

            mortgageQueue.push(property)
            currentDebt -= Math.floor(property.price / 2)
            mortgageButton.classList.add('disabled-button')
            mortgageButton.innerHTML = 'Already mortgaged'

            //currentDebt -= mortgageProperty(property, true)


            
            display.innerHTML = currencySymbolSpan + currentDebt
            animateUpdate(display, 'good')

            bankruptcyEscapeCheck()

        })

        buttonPanel.appendChild(mortgageButton)
    })




    // Check whether we're out of bankruptcy, and end proceedings if so.
    function bankruptcyEscapeCheck(){

        if (currentDebt <= 0){

            // Hand over the excess money they raised
            debtor.money -= currentDebt
            
            // If the creditor is an object, that means it's another player,
            // who should receive the proceeds.
            if (typeof(creditor) === 'object'){
                players[creditorID - 1].money += amount

            // If it's all the other players (as a result of a chance/CC card)
            } else if (creditorID === 'allOtherPlayers'){
                
                // Figure out what share of the proceeds each player should get
                let shareOfProceeds = Math.floor(amount / (nonNullArrayItems(players) - 1))

                players.forEach(function(player){
                    player.money += shareOfProceeds
                })

            }


            // Close the bankruptcy window
            availableActions.bankruptcyProceedings = false

            // Do the mortgages that are in the queue, now we've established 
            // that the player actually has enough money for it.
            mortgageQueue.forEach(function(property){
                mortgageProperty(property, true)
            })


            // Add a message to the feed
            addToFeed(debtor.name + ' successfully escaped out of bankruptcy', 'bankrupt')
    
            updatePlayerDetails()

        }


    }



    /*players[debtorID - 1].properties.forEach(function(property){
        let propertyDisplay = createElement('div', 'get-out-of-bankruptcy-table-entry')

        // Name
        propertyDisplay.appendChild(createElement('div', '', property.name))

        // Icon
        let propertyIcon = createElement('div', 'property-icon', '', 'mortgaged', property.mortgaged)
        propertyIcon.classList.add(property.group)
        if (property.group === 'utility'){
            let propertyName = property.name.replace(/\s/g, '-').toLowerCase()
            propertyIcon.classList.add(propertyName)
        }
        propertyDisplay.appendChild(propertyIcon)


        // Mortgage button
        let mortgageButton = createElement('button', '', 'Mortgage property (' + currencySymbolSpan + property.price/2 + ')')

        // If the property is already mortgaged, disable this button
        if (property.mortgaged){
            mortgageButton.classList.add('disabled-button')
            mortgageButton.innerHTML = 'Already mortgaged'
        }

        mortgageButton.addEventListener('click', function(){
            mortgageProperty(spaces[property.position])
        })
        propertyDisplay.appendChild(mortgageButton)


        // House display

        if (property.type === 'property'){

            let houses = createElement('div', 'house-visual-display', '', 'houses', property.houses)
            propertyDisplay.appendChild(houses)
    
            // Sell house button
            let sellHouseButton = createElement('button')
            propertyDisplay.appendChild(sellHouseButton)
    
            if (property.houses === 5){
                sellHouseButton.innerHTML = 'Sell hotel (' + currencySymbolSpan + property.hotelCost/2 + ')'
            } else{
                sellHouseButton.innerHTML = 'Sell house (' + currencySymbolSpan + property.houseCost/2 + ')'
            }
            
        }

        getOutOfBankruptcyTable.appendChild(propertyDisplay)
        

    })*/

    




    // Generate the trade button
    let tradeButton = createElement('button', '', 'Initiate trade')
    tradeButton.addEventListener('click', function(){
        initiateTrade(true)
    })
    bankruptcyMessage.appendChild(tradeButton)



    // Generate the bankrupt button
    let declareBankruptcyButton = createElement('button', '', 'Declare bankruptcy')
    declareBankruptcyButton.addEventListener('click', declareBankruptcy)
    bankruptcyMessage.appendChild(declareBankruptcyButton)





    function declareBankruptcy(){
        
        openWarning('Are you sure?', '')

        let warningContent = createElement('div', '', 'Declaring bankruptcy will remove you from the game and pass all of your assets to ' + creditorName + '. Are you sure you would like to declare bankruptcy? <br><br>')

        // Confirm bankruptcy button
        let confirmButton = createElement('button', '', 'Confirm bankruptcy')
        confirmButton.addEventListener('click', confirmBankruptcy)
        
        warningContent.appendChild(confirmButton)

        // Go back button
        let goBackButton = createElement('button', '', 'Go back')
        goBackButton.addEventListener('click', closeWarning)
        warningContent.appendChild(goBackButton)


        warningMessage.appendChild(warningContent)

        


        function confirmBankruptcy(){

            // Close the bankruptcy and warning windows.
            closeWarning()
            availableActions.bankruptcyProceedings = false
            setAvailableActions()
            let mortgagedProperties = []



            // Generate a nice message for the feed.
            let feedMessage = players[debtorID - 1].name + ' has gone bankrupt to ' + creditorName + ' and is out of the game. '
            addToFeed(feedMessage, 'bankrupt')

            debtor.properties.forEach(function(property){
                // If the property has houses/ hotels, return them to the bank.
                // This happens regardless of who you're in debt to. The
                // proceeds will be given to the creditor(s) later on.
                if (property.houses){
                    if (property.houses === 5){
                        availableHouses += 4
                        availableHotels++
                        debtor.money += (property.hotelCost / 2) + (property.houseCost * 2) 
                    } else{
                        availableHouses += property.houses
                        debtor.money += property.houses * (property.houseCost / 2)
                    }

                    spaces[property.position].houses = 0
                    updateHouseDisplay(property.position)
                }
            })

            // Update the bank now that we've sorted the houses/hotels
            updateBank()

            
            removePlayerFromGame(debtor.id)

            // If the player is in debt to the bank or everyone, auction all their properties
            if (creditorID === 'bank' || creditorID === 'allOtherPlayers'){

                // Reset the auctionTotal. We are probably about to do
                // multiple auctions which we may need to know the total proceeds from.
                auctionTotal = 0

                debtor.properties.forEach(function(property){

                    // Add the property to a queue to be auctioned
                    propertiesToAuction.push(spaces[property.position])

                    // Unmortgage the property and show it as such on the board
                    property.mortgaged = false
                    document.querySelector('div[position="' + property.position + '"]').setAttribute('mortgaged', false)
                })

                // If they are declaring a bankruptcy as a result of winning an
                // auction, add this property to the list so it can be re-auctioned
                if (transactionDetails.method && transactionDetails.method === 'auction'){
                    propertiesToAuction = transactionDetails.purchase.concat(propertiesToAuction)
                }

                // If going bankrupt to all other players (usually via a card),
                // split the money evenly among all the other players.
                if (creditorID === 'allOtherPlayers'){
                    players.forEach(function(player){
                        player.money += Math.floor(debtor.money / nonNullArrayItems(players))
                    })

                    updatePlayerDetails()
                }

                if (propertiesToAuction.length > 0){
                    // True/false is passed to the auctionProperty function to 
                    // indicate that the proceeds should be split between all
                    // the other players once concluded.
                    auctionProperty(null, transactionDetails.creditorID === 'allOtherPlayers')
                }

                // Return all held get out of jail cards to their decks.
                debtor.getOutCards.forEach(function(card){
                    let cardList = card.deck === 'community-chest' ? communityChestCards : chanceCards
                    cardList.push(card)
                })

            
                



            // Otherwise give all their assets to the creditor player
            } else{



                //Properties
                debtor.properties.forEach(function(property){
                    spaces[property.position].owner = players[creditorID - 1]
                    players[creditorID - 1].properties[property.position] = spaces[property.position]

                    // If the property is mortgaged, add it to an array. The
                    // new owner will need to choose what to do about this.
                    if (property.mortgaged){
                        mortgagedProperties.push(property)
                    }
                })

                // Get out of jail cards
                debtor.getOutCards.forEach(function(card){
                    players[creditorID - 1].getOutCards.push(card)
                })

                // Money
                creditor.money += debtor.money


                updatePlayerDetails()
                if (mortgagedProperties.length){
                    mortgagesAfterBankruptcyTransfer(transactionDetails, mortgagedProperties, debtorName)
                }

            }



            if (transactionQueue.length && !mortgagedProperties.length){
                payMoney()
            }
        }
    }
}


// Update the current debt by a given amount, and also update the display in
// the bankruptcy window
function updateCurrentDebt(amount){

    // Deduct the amount from the currentDebt variable
    currentDebt -= amount

    // Update the display
    let display = document.querySelector('.amount-to-raise-display')
    display.innerHTML = currencySymbolSpan + currentDebt
}

function mortgagesAfterBankruptcyTransfer(transactionDetails, mortgagedProperties, debtorName){

    availableActions.closePopup = false
    availableActions.unmortgageProperty = true
    setAvailableActions()


    let mortgageTable = createElement('div', 'bankruptcy-mortgage-table')

    mortgagedProperties.forEach(function(property){
        let row = createElement('div', '', )

        let propertyName = createElement('div', 'property-name', property.name)
        row.appendChild(propertyName)

        let keepMortgageButton = createElement('button', 'keep-mortgage-button', 'Keep mortgage (' + currencySymbolSpan + (Math.ceil((property.price/2) * 0.1)) + ')', 'property', property.position)
        row.appendChild(keepMortgageButton)

        let unmortgageButton = createElement('button', 'unmortgage-button', 'Unmortgage (' + currencySymbolSpan + (Math.ceil(property.price * 1.05)) + ')', 'property', property.position)
        row.appendChild(unmortgageButton)

        mortgageTable.appendChild(row)
    })

    let newMessage = 'Congratulations ' + players[transactionDetails.creditorID - 1].name + ', you are the new owner of all of ' + debtorName + '\''
    if (!debtorName.match(/s$/gm)){
        newMessage += 's'
    }
    newMessage += ' properties. <br><br> Unfortunately some of them are mortgaged. You must decide whether to pay off the mortgages or pay the bank 10% to keep them mortgaged.<br><br>'


    openPopup(newMessage, 'Mortgaged properties')
    popupMessage.appendChild(mortgageTable)

    mortgageTable.addEventListener('click', function(e){

        let button = e.target.closest('button')

        if (button.classList.contains('keep-mortgage-button')){
            let originalPrice = spaces[button.getAttribute('property')].price
            transactionQueue.push({debtorID: transactionDetails.creditorID, creditorID: 'bank', amount: (Math.ceil((originalPrice/2) * 0.1))})

            ;[].forEach.call(button.parentNode.querySelectorAll('button'), function(button){
                button.classList.add('disabled-button')
            })


        } else{

            unmortgageProperty(spaces[button.getAttribute('property')], players[transactionDetails.creditorID - 1], true)
            availableActions.unmortgageProperty = true
            setAvailableActions()

            ;[].forEach.call(button.parentNode.querySelectorAll('button'), function(button){
                button.classList.add('disabled-button')
            })
            
        }

        if (!mortgageTable.querySelector('button:not(.disabled-button)')){
            closePopup()
            
            // Note that the transaction queue won't have anything in it if the
            // creditor has chosen to unmortgage everything (since
            // unmortgageProperty() deals with that)
            if (transactionQueue.length){
                payMoney()     
            }
       
        }


    })



}

function removePlayerFromGame(playerID){

    // The empty space in the players array is intentional, since the ID
    // numbers are linked to their index in the array.
    delete players[playerID - 1]

    // Remove the player's summary
    let playerSummary = document.querySelector('.individual-player-summary[player="' + playerID + '"]')
    playerSummary.classList.add('bankrupt')

    // Remove the player's token
    let token = document.querySelector('.token[player="' + playerID + '"]')
    token.classList.add('bankrupt')
    
    setTimeout(function(){
        playerSummary.parentNode.removeChild(playerSummary)
        token.parentNode.removeChild(token)
    }, 2000)


  increasePlayerTurn()
}


// GENERATE WORTH ------------------------------------------------------------//

// Figure out what a player's total worth is. Originally created for the
// bankruptcy screen but has potential uses elsewhere.

function calculatePlayerWorth(playerID){

    let worth = 0
    let player = players[playerID - 1]

    // Money
    worth += player.money

    // Properties
    player.properties.forEach(function(property){
        
        // While the properties array does store a copy of the property object,
        // it is not kept up to date. We need to reference the spaces array
        // for the most recent details
        let space = spaces[property.position]

        // If it's mortgaged, add half the price
        if (space.mortgaged){
            worth += (space.price / 2)

        // If it's not mortgaged...
        } else {

            // Add the standard cost of the property
            worth += space.price

            // Note that houses and hotels are only worth half their original
            // cost (since that's what they sell for)

            // If it has a hotel
            if (space.houses && space.houses === 5){
                worth += (space.hotelCost / 2) + (space.houseCost * 2)
            }
            // If it doesn't have a hotel
            else if (space.houses){
                worth += ((space.houseCost * space.houses) / 2)
            }

        }

        
    })

    return worth
}



// FEED FUNCTIONS ------------------------------------------------------------//

function addToFeed(message,type){
    let newMessage = document.createElement('div')
    newMessage.innerHTML = '<div>' + message + '</div>'
    newMessage.classList.add(type)
    
    //feed.appendChild(newMessage)

    feed.insertBefore(newMessage, feed.firstChild)
}




// CONFETTI ------------------------------------------------------------------//

function createConfetti(){
    let confettiContainer = document.createElement('div')
    confettiContainer.classList.add('confetti-container')
    document.body.appendChild(confettiContainer)
    
    let confettiParticleCount = window.innerWidth / 10
    
    
    for (i=0; i < confettiParticleCount; i++){
      let particle = document.createElement('div')
      particle.classList.add('particle')
      let particleInner = document.createElement('div')
      particle.appendChild(particleInner)
      
      confettiContainer.appendChild(particle)
      
  
      
      particle.style.left = (Math.random() * 100) + '%'
      particle.style.animationDelay = ((Math.random() * 20) - 1) + 's'
      
      let size = ((Math.random() * 7) + 7) + 'px'
      particle.style.width = size
      particle.style.height = size
      
      particleInner.style.animationDuration = (Math.random() * 2 + 1) + 's'
    }
  }
  

// ELEMENT CREATION  ---------------------------------------------------------//

function createElement(elementType, elementClass, elementHTML, elementAttribute, elementAttributeValue){
    let element = document.createElement(elementType)
    
    if(elementClass){
        element.classList.add(elementClass)
    }

    if(elementHTML){
        element.innerHTML = elementHTML
    }

    if(elementAttribute){
        element.setAttribute(elementAttribute, elementAttributeValue)
    }

    return element
}
  

// ARRAY LENGTH  -------------------------------------------------------------//
// As players lose the game, the players array will inevitably need to contain
// null entries. This function does what players.length normally would

function nonNullArrayItems(array){
    let length = 0
    for (i = 0; i < array.length; i++){
        if (array[i]){
            length++
        }
    }

    return length

}
