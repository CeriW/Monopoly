/*  This was the original version of updatePlayerDetails() It needed rewriting
    after the game was updated to use currency symbols and simply comparing
    values didn't work any more.

    At that point, I also realised that looping through all of the values was
    somewhat inefficient. There are several properties that the player never
    sees (like the inJail), and of the others there are some that are never
    going to change (like the player name).

    Therefore it now seems like it's more efficient to just update
    the properties which are likely to have actually changed.
*/


function updatePlayerDetails(){
    players.forEach(function(player){
        let keys = Object.keys(player)
        let values = Object.values(player)

        // Starting at 1 as the first attribute is 'id' which will never change
        for (i = 1; i < keys.length; i++){
            let updateNode = document.querySelector('#player-' + (player.id) + '-' + keys[i])
            let currentValue = parseInt(updateNode.innerText)
            
            // For the money section we want to add the currency symbol.
            // For all the others just display the value as-is
            if (keys[i] === 'money'){
                updateNode.innerHTML = currencySymbolSpan + values[i]
            } else{
                updateNode.innerHTML = values[i]
            }
            
            // If the values have changed, animate it based on whether it's a good/bad change
            if (currentValue > updateNode.innerText){
                animateUpdate(updateNode, 'bad')
            }else if (currentValue < updateNode.innerText){
                animateUpdate(updateNode, 'good')
            }


        }
    })
  }
