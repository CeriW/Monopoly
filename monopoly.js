// monopoly.js by Ceri Woolway - cxv712@gmail.com

// VARIABLE DECLARATIONS -----------------------------------------------------//

/*
 Community chest and chance cards have a number of properties:
 type - the classification of card as follows:
    + : a card which gains the player money from the bank.
    - : a card which the player has to surrender money to the bank.
    getout : a get out of jail free card which is held onto by the player until used, sold or traded.
    exchange : a card where the players have to exchange money.
    calc : a card where the amount has to be calculated.
    move: a card which requires the player to move to a specified spot.

*/

let board = document.querySelector('#board')
let popupMessage = document.querySelector('#popup-message')

// Dice related elements
let doublesCount = 0
let diceContainer = document.querySelector('#dice-roll')
let dice1 = document.querySelector('#dice-1')
let dice2 = document.querySelector('#dice-2')
let diceTotal = document.querySelector('#dice-total')
let diceDoubles = document.querySelector('#doubles')
let diceRollButton = document.querySelector('#dice-roll-button')

// All of the possible community chest cards
let communityChestCards = 
  [
    {description: "Advance to Go (Collect £200)",                                               type: '+',        amount: 200},
    {description: "Bank error in your favor — Collect £200",                                    type: '+',        amount: 200},
    {description: "Doctor's fee — Pay £50",                                                     type: '-',        amount: 50},
    {description: "From sale of stock you get £50",                                             type: '+',        amount: 50},
    {description: "Get Out of Jail Free" ,                                                      type: 'getout',   amount: null},
    {description: "Go to Jail – Go directly to jail – Do not pass Go–Do not collect £200",      type: '+',        amount: 200},
    {description: "Grand Opera Night — Collect £50 from every player for opening night seats",  type: 'exchange', amount: 50 },
    {description: "Holiday Fund matures — Receive £100" ,                                       type: '+',        amount: 100},
    {description: "Income tax refund – Collect £20",                                            type: '+',        amount: 20 },
    {description: "It is your birthday — Collect £10",                                          type: '+',        amount: 10 },
    {description: "Life insurance matures – Collect £100",                                      type: '+',        amount: 100 },
    {description: "Pay hospital fees of £100",                                                  type: '-',        amount: 100 },
    {description: "Pay school fees of £150",                                                    type: '-',        amount: 150 },
    {description: "Receive £25 consultancy fee",                                                type: '-',        amount: 25 },
    {description: "You are assessed for street repairs – £40 per house – £115 per hotel",       type: 'calc',     amount: null },
    {description: "You have won second prize in a beauty contest–Collect £10",                  type: '+',        amount: 10},
    {description: "You inherit £100",                                                           type: '+',        amount: 100 }
  ]

let chanceCards = 
  [
    {description: "Advance to Go (Collect £200)",                                               type: '+',          amount: 2000 },
    {description: "Advance to Trafalgar Square — If you pass Go, collect £200",                 type: 'move',       amount: null },
    {description: "Advance to Pall Mall – If you pass Go, collect £200",                        type: 'move',       amount: null },
    {description: "Advance token to nearest Utility. If unowned, you may buy it from the Bank. If owned, throw dice and pay owner a total ten times the amount thrown.", type: 'move',   amount: null },
    {description: "Advance token to the nearest Railroad and pay owner twice the rental to which he/she {he} is otherwise entitled. If Railroad is unowned, you may buy it from the Bank.", type: 'move',   amount: null },
    {description: "Bank pays you dividend of £50",                                              type: '+',          amount: 50 },
    {description: "Get Out of Jail Free",                                                       type: 'getout',     amount: null },
    {description: "Go Back 3 Spaces",                                                           type: 'move',       amount: null },
    {description: "Go to Jail – Go directly to Jail – Do not pass Go, do not collect £200",     type: 'move',       amount: null },
    {description: "Make general repairs on all your property – For each house pay £25 – For each hotel £100", type: 'calc',   amount: null },
    {description: "Pay poor tax of £15",                                                        type: '-',          amount: 15 },
    {description: "Take a trip to Marylebone Station – If you pass Go, collect £200",           type: 'move',       amount: null },
    {description: "Advance to Mayfair",                                                         type: 'move',       amount: null },
    {description: "You have been elected Chairman of the Board–Pay each player £50",            type: 'exchange',   amount: 50 },
    {description: "Your building and loan matures — Collect £150",                              type: '+',          amount: 150 },
    {description: "You have won a crossword competition — Collect £100",                        type: '+',          amount: 100 }
  ]


let spaces =  [
    {name: 'Go',                    type: 'special',            price: null,    colour: 'corner',       boardposition: 'south'},
    {name: 'Old Kent Road',         type: 'property',           price: 60,      colour: 'brown',        boardposition: 'south'},
    {name: 'Community Chest',       type: 'community-chest',    price: null,    colour: null,           boardposition: 'south'},
    {name: 'Whitechapel Road',      type: 'property',           price: 60,      colour: 'brown',        boardposition: 'south'},
    {name: 'Income tax',            type: 'special',            price: null,    colour: null,           boardposition: 'south'},
    {name: 'Kings Cross Station',   type: 'station',            price: 200,     colour: null,           boardposition: 'south'},
    {name: 'The Angel Islington',   type: 'property',           price: 100,     colour: 'lightblue',    boardposition: 'south'},
    {name: 'Chance',                type: 'chance',             price: null,    colour: null,           boardposition: 'south'},
    {name: 'Euston Road',           type: 'property',           price: 100,     colour: 'lightblue',    boardposition: 'south'},
    {name: 'Pentonville Road',      type: 'property',           price: 100,     colour: 'lightblue',    boardposition: 'south'},

    {name: 'Jail',                  type: 'special',            price: null,    colour: 'corner',       boardposition: 'west'},
    {name: 'Pall Mall',             type: 'property',           price: 140,     colour: 'pink',         boardposition: 'west'},
    {name: 'Electric Company',      type: 'utility',            price: 150,     colour: null,           boardposition: 'west'},
    {name: 'Whitehall',             type: 'property',           price: 140,     colour: 'pink',         boardposition: 'west'},
    {name: 'Northumberland Avenue', type: 'property',           price: 150,     colour: 'pink',         boardposition: 'west'},
    {name: 'Marylebone Station',    type: 'station',            price: 200,     colour: null,           boardposition: 'west'},
    {name: 'Bow Street',            type: 'property',           price: 180,     colour: 'orange',       boardposition: 'west'},
    {name: 'Community Chest',       type: 'community-chest',    price: null,    colour: null,           boardposition: 'west'},
    {name: 'Marlborough Street',    type: 'property',           price: 180,     colour: 'orange',       boardposition: 'west'},
    {name: 'Vine Street',           type: 'property',           price: 200,     colour: 'orange',       boardposition: 'west'},

    {name: 'Free Parking',          type: 'special',            price: null,    colour: 'corner',           boardposition: 'north'},
    {name: 'Strand',                type: 'property',           price: 220,     colour: 'red',          boardposition: 'north'},
    {name: 'Chance',                type: 'chance',             price: null,    colour: null,           boardposition: 'north'},
    {name: 'Fleet Street',          type: 'property',           price: 220,     colour: 'red',          boardposition: 'north'},
    {name: 'Trafalgar Square',      type: 'property',           price: 240,     colour: 'red',          boardposition: 'north'},
    {name: 'Fenchurch St. Station', type: 'station',            price: 200,     colour: null,           boardposition: 'north'},
    {name: 'Leicester Square',      type: 'property',           price: 220,     colour: 'yellow',       boardposition: 'north'},
    {name: 'Water Works',           type: 'utility',            price: 150,     colour: null,           boardposition: 'north'},
    {name: 'Coventry Street',       type: 'property',           price: 260,     colour: 'yellow',       boardposition: 'north'},
    {name: 'Piccadilly',            type: 'property',           price: 280,     colour: 'yellow',       boardposition: 'north'},
    
    {name: 'Go To Jail',            type: 'special',            price: null,    colour: 'corner',           boardposition: 'east'},
    {name: 'Regent Street',         type: 'property',           price: 300,     colour: 'green',        boardposition: 'east'},
    {name: 'Oxford Street',         type: 'property',           price: 300,     colour: 'green',        boardposition: 'east'},
    {name: 'Community Chest',       type: 'community-chest',    price: null,    colour: null,           boardposition: 'east'},
    {name: 'Bond Street',           type: 'property',           price: 320,     colour: 'green',        boardposition: 'east'},
    {name: 'Liverpool St. Station', type: 'station',            price: 200,     colour: null,           boardposition: 'east'},
    {name: 'Chance',                type: 'chance',             price: null,    colour: null,           boardposition: 'east'},
    {name: 'Park Lane',             type: 'property',           price: 350,     colour: 'darkblue',     boardposition: 'east'},
    {name: 'Super Tax',             type: 'special',            price: null,    colour: null,           boardposition: 'east'},
    {name: 'Mayfair',               type: 'property',           price: 400,     colour: 'darkblue',     boardposition: 'east'},
]




// Page setup functions ------------------------------------------------------//

initialisePage()

function initialisePage(){

    // Generate all of the spaces on the board
    // While this could be done in the HTML, doing it based on a JS array means
    // I can potentially add other international boards easily in the future.
    generateBoard()

    // Shuffle both decks of cards
    shuffleCards(communityChestCards)
    shuffleCards(chanceCards)

    // Make the board the same height as its width
    resizeBoard()

    // Add all of the required event listeners
    addEvents()
}

function generateBoard(){

    let board = document.querySelector('#board')
    let positionNumber = 0

    spaces.forEach(function(space){
        let newSpace = document.createElement('div')
        newSpace.setAttribute('id', space.name.replace(/\s+/g, '-').toLowerCase())
        newSpace.classList.add(space.type)

        if (space.colour){
            newSpace.classList.add(space.colour)
        }
        
        newSpace.innerHTML = space.name.toUpperCase()

        if (space.price){
            newSpace.innerHTML += '<div class="property-price">£' + space.price + '</div>'
            newSpace.setAttribute('price', space.price)
        }

        // Add a position number to each property.
        // This will be used to move the tokens around the board
        newSpace.setAttribute('position', positionNumber)
        positionNumber++

        board.querySelector('#' + space.boardposition).appendChild(newSpace)
    })
}

function addEvents(){
    //TODO - Obviously this doesn't happen on click. Click will do for now.
    ;[].forEach.call(document.querySelectorAll('.community-chest'), function(node){
        // TODO - is this really the most efficient way of running this on click?
        node.addEventListener('click', function(){
            drawCard('community-chest')
        })
    })

    ;[].forEach.call(document.querySelectorAll('.chance'), function(node){
        // TODO - is this really the most efficient way of running this on click?
        node.addEventListener('click', function(){
            drawCard('chance')
        })
    })

    // Close the popup when the close button is clicked,
    // or the escape key is pressed.
    document.querySelector('#popup-close').addEventListener('click', closePopup)

    document.onkeydown = function(e) {
        e = e || window.event
        if (e.keyCode == 27) {
            closePopup()
        }
    }

    // Ensure the board's height is always the same as its width,
    // so it is always square
    window.addEventListener('resize', resizeBoard)

    diceRollButton.addEventListener('click', rollDice)
    
}

function resizeBoard(){
    board.style.height = board.offsetWidth + 'px'
}


// COMMUNITY CHEST AND CHANGE FUNCTIONS --------------------------------------//

function drawCard(type){

    // Note that chance and community chest cards are not drawn randomly.
    // They are shuffled at the beginning of the game.
    // When drawn, the card is returned to the bottom of the pile.
    // This way, they always stay in the same rotation.

    let cardList = (type === "community-chest") ? communityChestCards : chanceCards
    let chosenCard = cardList.shift()
    openPopup(chosenCard.description)
    cardList.push(chosenCard)
  
}


// A function which does a Durstenfeld shuffle
// https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
function shuffleCards(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}


// POPUP FUNCTIONS -----------------------------------------------------------//

function closePopup(){
    document.body.classList.remove('popup-open')
}

function openPopup(message){
    popupMessage.innerText = message
    document.body.classList.add('popup-open')
}

// DICE FUNCTIONS ------------------------------------------------------------//

// A variable for how many sides the dice has. Used in testing where 
// smaller numbers are desirable.
let diceSides = 2

function rollDice(){
    let roll1 = Math.ceil(Math.random() * diceSides)
    let roll2 = Math.ceil(Math.random() * diceSides)
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
    } else{
        diceDoubles.innerText = ""
        doublesCount = 0
    }

    switch (doublesCount){
        case 0:
            diceDoubles.innerText = ""
            diceContainer.className = "double0"
            break
        case 1:
            diceDoubles.innerText = "1st double"
            diceContainer.className ="double1"
            break
        case 2:
            diceDoubles.innerText = "2nd double"
            diceContainer.className = "double2"
            break
        case 3:
            diceDoubles.innerText = "3rd double! Go to jail."
            diceContainer.className = "double3"
            doublesCount = 0
            // Presumably there'll be a goToJail function eventually.
    }

    moveToken(total)

}

// TOKEN FUNCTIONS -----------------------------------------------------------//

function moveToken(total){
    let token = document.querySelector('#token')
    let startPosition = parseInt(token.getAttribute('position'))
    let endPosition = startPosition + total
    token.setAttribute('position', endPosition)



    let matchingProperty = document.querySelector('#board > .row div[position="' + endPosition + '"]')
    token.style.top = matchingProperty.offsetTop + 'px'
    token.style.left = matchingProperty.offsetLeft + 'px'
    token.style.right = matchingProperty.offsetright + 'px'
    token.style.bottom = matchingProperty.offsetBottom + 'px'

    // TODO
    // I'm sure this cannot be the most efficient way of doing this, but I had
    // some trouble getting it to evaluate <= statements
    switch (endPosition){
        case 0:
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
        case 6:
        case 7:
        case 8:
        case 9:
        case 10:
            token.setAttribute('area', 'south')
            break
        case 11:
        case 12:
        case 13:
        case 14:
        case 15:
        case 16:
        case 17:
        case 18:
        case 19:
        case 20:
            token.setAttribute('area', 'west')
            break
        case 21:
        case 22:
        case 23:
        case 24:
        case 25:
        case 26:
        case 27:
        case 28:
        case 29:
        case 30:
            token.setAttribute('area', 'north')
            break
        case 31:
        case 32:
        case 33:
        case 34:
        case 35:
        case 36:
        case 37:
        case 38:
        case 39:
        case 40:
            token.setAttribute('area', 'east')
    }   


}