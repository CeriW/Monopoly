// monopoly.js by Ceri Woolway - cxv712@gmail.com

// VARIABLE DECLARATIONS -----------------------------------------------------//


let board = document.querySelector('#board')
let popupMessage = document.querySelector('#popup-message')
let playerSummary = document.querySelector('#player-summary')

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
let diceRollButton = document.querySelector('#dice-roll-button')

// A variable for how many sides the dice has. Used in testing where 
// larger/smaller numbers are desirable.
let diceSides = 1


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
    {description: "You have won second prize in a beauty contest–Collect £10",                  type: '+',        value: 10},
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

    {name: 'Free Parking',          type: 'special',            price: null,    colour: 'corner',       boardposition: 'north'},
    {name: 'Strand',                type: 'property',           price: 220,     colour: 'red',          boardposition: 'north'},
    {name: 'Chance',                type: 'chance',             price: null,    colour: null,           boardposition: 'north'},
    {name: 'Fleet Street',          type: 'property',           price: 220,     colour: 'red',          boardposition: 'north'},
    {name: 'Trafalgar Square',      type: 'property',           price: 240,     colour: 'red',          boardposition: 'north'},
    {name: 'Fenchurch St. Station', type: 'station',            price: 200,     colour: null,           boardposition: 'north'},
    {name: 'Leicester Square',      type: 'property',           price: 220,     colour: 'yellow',       boardposition: 'north'},
    {name: 'Water Works',           type: 'utility',            price: 150,     colour: null,           boardposition: 'north'},
    {name: 'Coventry Street',       type: 'property',           price: 260,     colour: 'yellow',       boardposition: 'north'},
    {name: 'Piccadilly',            type: 'property',           price: 280,     colour: 'yellow',       boardposition: 'north'},
    
    {name: 'Go To Jail',            type: 'special',            price: null,    colour: 'corner',       boardposition: 'east'},
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

// An empty array for now. Will be filled with player info later.
let players = []

let availableActions = {
    rollDice: true,
    endTurn: false,
    getOutOfJail: false,
    rollDoublesForJail: false
}


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

    // Close the popup when the close button is clicked,
    // or the escape key is pressed.
    document.querySelector('#popup-close').addEventListener('click', closePopup)

    document.onkeydown = function(e) {
        e = e || window.event
        if (e.keyCode == 27) {
            closePopup()
        }
    }

    // TODO - this may be better achieved using a listener on the
    // availableActions object, rather than every time someone clicks.
    window.addEventListener('click', setAvailableActions)

    // Ensure the board's height is always the same as its width,
    // so it is always square
    window.addEventListener('resize', resizeBoard)

    //diceRollButton.addEventListener('click', rollDice)
    
}

function resizeBoard(){
    board.style.height = board.offsetWidth + 'px'
}

function setAvailableActions(){
    document.body.setAttribute('dice-roll-available', availableActions.rollDice)
    document.body.setAttribute('end-turn-available', availableActions.endTurn)
    document.body.setAttribute('get-out-of-jail', availableActions.getOutOfJail)
    document.body.setAttribute('roll-doubles-for-jail', availableActions.rollDoublesForJail)
}

function updatePlayerDetails(){
    players.forEach(function(player){
        let keys = Object.keys(player)
        let values = Object.values(player)

        // Starting at 1 as the first attribute is 'id' which will never change
        for (i = 1; i < keys.length; i++){
            let updateNode = document.querySelector('#player-' + (player.id) + '-' + keys[i])
            let currentValue = parseInt(updateNode.innerText)
            updateNode.innerText = values[i]
            
            // If the values have changed, animate it based on whether it's a good/bad change
            if (currentValue > updateNode.innerText){
                animateUpdate(updateNode, 'bad')
            }else if (currentValue < updateNode.innerText){
                animateUpdate(updateNode, 'good')
            }
        }
    })
}

// Add a class for 2 seconds. This is used in the CSS to run a suitable animation.
function animateUpdate(node, type){
    node.classList.add(type + '-change')
    window.setTimeout(function(){
        node.classList.remove(type + '-change')
    }, 2000)
}

// PLAYER CREATION FUNCTIONS -------------------------------------------------//

function createPlayers(){
    let newPlayersOverlay = document.querySelector('#new-player-overlay')
    let numberOfPlayers = document.querySelector('#no-of-players').value

    //console.log(numberOfPlayers)

    // Generate an object for each player, and add it to the players array
    for (i = 0; i < numberOfPlayers; i++){
        let newPlayer = {id:i + 1, name:"Player " + (i + 1), money:1500, inJail: 0}
        players.push(newPlayer)
    }

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
        newToken.setAttribute('id', 'player' + (player.id) + 'token')
        newToken.setAttribute('position', 0)
        newToken.setAttribute('area', 'south')
        board.appendChild(newToken)

        positionToken(newToken, 0)

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
    
    let title = document.createElement('h2')
    title.innerText = player.name
    newSummary.appendChild(title)
    
    // Generate the table of label/value pairs
    let newTable = document.createElement('table')
    let keys = Object.keys(player)
    let values = Object.values(player)

    // We don't want to do value 0 as it already has a h2
    for (i = keys.length - 1; i > 0; i--){
        
        //  Create the new row
        let newRow = newTable.insertRow(0)
        
        // Generate the label
        let newLabel = newRow.insertCell(0)
        newLabel.innerText = keys[i] + ':'
        newRow.appendChild(newLabel)

        // Generate the value
        let newValue = newRow.insertCell(1)
        newValue.setAttribute('id', 'player-' + player.id + '-' + keys[i])
        newValue.innerText = values[i]
        newRow.appendChild(newValue)
    }
    
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
    newGetOut50Button.innerText = 'Pay 50 to get out of jail'
    newGetOut50Button.classList.add('get-out-50-button', 'player-action-button')
    newGetOut50Button.addEventListener('click', function(){getOutOfJail('pay')})

    // Create the "Roll doubles to get out of jail" buttons
    let newRollDoublesForJailButton = document.createElement('button')
    newRollDoublesForJailButton.innerText = "Roll doubles to get out of jail"
    newRollDoublesForJailButton.classList.add('roll-doubles-for-jail', 'player-action-button')
    newRollDoublesForJailButton.addEventListener('click', rollDoublesForJail)

    // Append all these new elements to the relevant player summary
    newSummary.appendChild(newTable)
    newSummary.appendChild(newRollDiceButton)
    newSummary.appendChild(newEndTurnButton)
    newSummary.appendChild(newGetOut50Button)
    newSummary.appendChild(newRollDoublesForJailButton)
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
            break
        case '-':
            // A card where the player has to surrender money to the bank
            players[turn - 1].money -= chosenCard.value
            break
        case 'getout':
            // TODO
            console.log('getout: a get out of jail free card which is held onto by the player until used, sold or traded.')
            break
        case 'exchange':
            // TODO
            console.log('exhange: a card where the value has to be calculated.')
            break
        case 'calc':
            // TODO
            console.log('calc: a card where the value has to be calculated.')
            break
        case 'move':
            // TODO
            cardBasedMovement(chosenCard)
            break
        }

    // While not all cards will require this, a large majority will
    updatePlayerDetails()
}

// Move the token after drawing a card. 
// Calculations depending on exactly what type of 'move' card has been drawn.
function cardBasedMovement(chosenCard){

    let currentPosition = parseInt(document.querySelector('#player' + turn  + 'token').getAttribute('position'))

    switch (chosenCard.value){
        // Go to jail
        case 10:
            goToJail(document.querySelector('#player' + turn + 'token'))
            players[turn - 1].inJail++
            break
        
        // Advance to Go
        case 0:
            // The moveToken function works with the number of spaces to move, rather than a position to move to.
            // Therefore a little maths is required.
            let endTotal = 40 - document.querySelector('#player' + turn  + 'token').getAttribute('position')
            moveToken(endTotal)
            break

        case 'nearest-utility':
            // TODO - player should pay rent to the value of 10x dice roll
            if (currentPosition < 12 || currentPosition > 27){
                // Electric company
                moveToken(calculateCardMovement(12))
            } else{
                // Water works
                moveToken(calculateCardMovement(27))
            }
            break

        case 'nearest-station':
            // TODO - player should pay double rent

            if (currentPosition < 5 || currentPosition > 35){
                // Station 1 (King's Cross)
                moveToken(calculateCardMovement(5))
              } else if (currentPosition < 15){
                // Station 2 (Marylebone)
                moveToken(calculateCardMovement(15))
            } else if (currentPosition < 25){
                // Station 3 (Fenchurch St)
                moveToken(calculateCardMovement(25))
            } else{
                // Station 4 (Liverpool St)
                moveToken(calculateCardMovement(35))
            }
            break 
        // A basic move card which tells you to move to a numbered position that requires no complicated maths.
        default:
            //moveToken(chosenCard.value)
            moveToken(calculateCardMovement(chosenCard.value))
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
            break
        case 2:
            diceDoubles.innerText = "2nd double"
            diceContainer.className = "double2"
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

    //token.setAttribute('position', endPosition)


    // If we're going to jail, do that, otherwise animate the token
    if (endPosition === 30){
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
            updatePlayerDetails()
            break
        case 38:
            // Super tax
            players[turn - 1].money -= 100
            updatePlayerDetails()
            break
        // Note that jail is covered before the token moves, so is not included here.
    }
}


// Puts the token where you want it to be using CSS. No maths is involved.
function positionToken(token, position){
    let matchingProperty = document.querySelector('#board > .row div[position="' + position + '"]')
    token.style.top = matchingProperty.offsetTop + 'px'
    token.style.left = matchingProperty.offsetLeft + 'px'
    token.style.right = matchingProperty.offsetRight + 'px'
    token.style.bottom = matchingProperty.offsetBottom + 'px'    
}

// Puts the token in jail and plays an animation. No maths is involved.
function goToJail(token){
    token.setAttribute('position', 10)
    token.setAttribute('area', 'west')
    positionToken(token,10)
    availableActions.rollDice = false
    availableActions.endTurn = true
    players[turn - 1].inJail++
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
    } else{
        diceContainer.className = "failed-jail-roll"
        diceDoubles.innerText = "Failure! You have " + (3 - players[turn - 1].inJail + ' attempts remaining')
        availableActions.rollDice = false
        availableActions.endTurn = true
        availableActions.getOutOfJail = false
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
            break
        case 'card':
            //TODO
            availableActions.rollDice = true
            break
        case 'doubles':
            // Note - you do not get to roll again after rolling doubles
            // to get out of jail
            diceContainer.className = "successful-jail-roll"
            diceDoubles.innerText = "Success!"
            break
    }

    
    availableActions.getOutOfJail = false
    player.inJail = 0
    setAvailableActions()
    updatePlayerDetails()
  
  }

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
    
    checkJail()
}