export const CONTRACT_ABI = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "exploreHistory",
    outputs: [
      {
        components: [
          {
            internalType: "uint8",
            name: "player1_score",
            type: "uint8",
          },
          {
            internalType: "uint8",
            name: "player2_score",
            type: "uint8",
          },
          {
            internalType: "uint64",
            name: "player1_id",
            type: "uint64",
          },
          {
            internalType: "uint64",
            name: "player2_id",
            type: "uint64",
          },
          {
            internalType: "uint64",
            name: "tournamentId",
            type: "uint64",
          },
        ],
        internalType: "struct Storage.Game[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getOwner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint64",
        name: "tournamentId",
        type: "uint64",
      },
      {
        internalType: "uint64[]",
        name: "matchIdArray",
        type: "uint64[]",
      },
      {
        internalType: "uint8[]",
        name: "player1ScoreArray",
        type: "uint8[]",
      },
      {
        internalType: "uint8[]",
        name: "player2ScoreArray",
        type: "uint8[]",
      },
      {
        internalType: "uint64[]",
        name: "player1IdArray",
        type: "uint64[]",
      },
      {
        internalType: "uint64[]",
        name: "player2IdArray",
        type: "uint64[]",
      },
    ],
    name: "storeScore",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

