// monopoly.js by Ceri Woolway - cxv712@gmail.com

// VARIABLE DECLARATIONS -----------------------------------------------------//


// All of the possible community chest cards
let communityChestCards = 
  [
    {description: 'card1'},
    {description: 'card2'},
    {description: 'card3'},
    {description: 'card4'},
    {description: 'card5'}
  ]

let chanceCards = 
  [
    {description: 'cardA'},
    {description: 'cardB'},
    {description: 'cardC'},
    {description: 'cardD'},
    {description: 'cardE'}
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

    // Add the close functionality to the popup
    document.querySelector('#popup-close').addEventListener('click', closePopup)

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