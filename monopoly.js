// monopoly.js by Ceri Woolway - cxv712@gmail.com

// VARIABLE DECLARATIONS -----------------------------------------------------//

/*
 Community chest and chance cards have a number of properties:
 type - the classification of card as follows:
    + : a card which gains the player money from the bank.
    - : a card which the player has to surrender money to the bank.
    getout : a get out of jail free card which is held onto by the player until used.
    exchange : a card where the players have to exchange money.
    calc : a card where the amount has to be calculated.
    move: a card which requires the player to move to a specified spot.

*/

// All of the possible community chest cards
let communityChestCards = 
  [
    {description: "Advance to Go (Collect £200)",                                           type: '+',      amount: 200},
    {description: "Bank error in your favor — Collect £200",                                type: '+',      amount: 200},
    {description: "Doctor's fee — Pay £50",                                                 type: '-',      amount: 50},
    {description: "From sale of stock you get £50",                                         type: '+',      amount: 50},
    {description: "Get Out of Jail Free" ,                                                  type: 'getout', amount: null},
    {description: "Go to Jail – Go directly to jail – Do not pass Go–Do not collect £200",  type: '+',      amount: 200},
    {description: "Grand Opera Night — Collect £50 from every player for opening night seats",  type: 'exchange', amount: 50 },
    {description: "Holiday Fund matures — Receive £100" ,                                   type: '+',      amount: 100},
    {description: "Income tax refund – Collect £20",                                        type: '+',      amount: 20 },
    {description: "It is your birthday — Collect £10",                                      type: '+',      amount: 10 },
    {description: "Life insurance matures – Collect £100",                                  type: '+',      amount: 100 },
    {description: "Pay hospital fees of £100",                                              type: '-',      amount: 100 },
    {description: "Pay school fees of £150",                                                type: '-',      amount: 150 },
    {description: "Receive £25 consultancy fee",                                            type: '-',      amount: 25 },
    {description: "You are assessed for street repairs – £40 per house – £115 per hotel",   type: 'calc',   amount: null },
    {description: "You have won second prize in a beauty contest–Collect £10",              type: '+',      amount: 10},
    {description: "You inherit £100",                                                       type: '+',      amount: 100 }
  ]

let chanceCards = 
  [
    {description: "Advance to Go (Collect £200)",                                           type: '+',      amount: 2000 },
    {description: "Advance to Trafalgar Square — If you pass Go, collect £200",             type: 'move',   amount: null },
    {description: "Advance to Pall Mall – If you pass Go, collect £200",                    type: 'move',   amount: null },
    {description: "Advance token to nearest Utility. If unowned, you may buy it from the Bank. If owned, throw dice and pay owner a total ten times the amount thrown.", type: 'move',   amount: null },
    {description: "Advance token to the nearest Railroad and pay owner twice the rental to which he/she {he} is otherwise entitled. If Railroad is unowned, you may buy it from the Bank.", type: 'move',   amount: null },
    {description: "Bank pays you dividend of £50",                                          type: '+',      amount: 50 },
    {description: "Get Out of Jail Free",                                                   type: 'getout', amount: null },
    {description: "Go Back 3 Spaces",                                                       type: 'move',   amount: null },
    {description: "Go to Jail – Go directly to Jail – Do not pass Go, do not collect £200", type: 'move',   amount: null },
    {description: "Make general repairs on all your property – For each house pay £25 – For each hotel £100", type: 'calc',   amount: null },
    {description: "Pay poor tax of £15",                                                    type: '-',      amount: 15 },
    {description: "Take a trip to Marylebone Station – If you pass Go, collect £200",       type: 'move',   amount: null },
    {description: "Advance to Mayfair",                                                     type: 'move',   amount: null },
    {description: "You have been elected Chairman of the Board–Pay each player £50",        type: 'exchange',   amount: 50 },
    {description: "Your building and loan matures — Collect £150",                          type: '+',   amount: 150 },
    {description: "You have won a crossword competition — Collect £100",                    type: '+',   amount: 100 }
  ]


let popupMessage = document.querySelector('#popup-message')


// ---------------------------------------------------------------------------//

initialisePage()

function initialisePage(){
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

    // Shuffle the chance and community chest cards
    shuffleCards(communityChestCards)
    console.log(communityChestCards)
    shuffleCards(chanceCards)
    console.log(chanceCards)

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

