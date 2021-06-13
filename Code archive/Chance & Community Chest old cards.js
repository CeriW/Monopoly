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
    {description: "Go Back 3 Spaces",                                                           type: 'move',       value: -3 },
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
    {description: "You have won a crossword competition — Collect £100",                        type: '+',          value: 100 }
  ]