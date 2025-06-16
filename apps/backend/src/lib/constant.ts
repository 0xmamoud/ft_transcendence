export const CONTRACT_ABI = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      {
        internalType: "uint64",
        name: "playerId",
        type: "uint64",
      },
    ],
    name: "explorePlayerHistory",
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
          {
            internalType: "uint64",
            name: "matchId",
            type: "uint64",
          },
          {
            internalType: "string",
            name: "date",
            type: "string",
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
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "matchHistory",
    outputs: [
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
      {
        internalType: "uint64",
        name: "matchId",
        type: "uint64",
      },
      {
        internalType: "string",
        name: "date",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
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
          {
            internalType: "uint64",
            name: "matchId",
            type: "uint64",
          },
          {
            internalType: "string",
            name: "date",
            type: "string",
          },
        ],
        internalType: "struct Storage.Game[]",
        name: "matches",
        type: "tuple[]",
      },
    ],
    name: "storeScore",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];
