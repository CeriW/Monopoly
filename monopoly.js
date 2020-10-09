
// All of the possible community chest cards
let communityChestCards = 
  [
    {description: 'card1'},
    {description: 'card2'},
    {description: 'card3'},
    {description: 'card4'},
    {description: 'card5'}
  ]

let popupMessage = document.querySelector('#popup-message')


initialisePage()

function initialisePage(){
    //TODO - Obviously this doesn't happen on click. Click will do for now.
    ;[].forEach.call(document.querySelectorAll('.community-chest'), function(node){
        // TODO - is this really the most efficient way of running this on click?
        node.addEventListener('click', function(){
            drawCard('community-chest')
        })
    })

    // Add the close functionality to the popup
    document.querySelector('#popup-close').addEventListener('click', closePopup)

}

function drawCard(type){

    // Note that chance and community chest cards are not drawn randomly.
    // They are shuffled at the beginning of the game.
    // When drawn, the card is returned to the bottom of the pile.
    // This way, they always stay in the same rotation.

    //TODO
    let chosenCard = Math.floor(Math.random() * communityChestCards.length)

    if (type === "community-chest"){
        openPopup(communityChestCards[chosenCard].description)
        console.log(communityChestCards[chosenCard].description)
    } else{
        console.log('oops!')
    }
}


function closePopup(){
    document.body.classList.remove('popup-open')
}

function openPopup(message){
    popupMessage.innerText = message
    document.body.classList.add('popup-open')
}