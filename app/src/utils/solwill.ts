/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/solwill.json`.
 */
export type Solwill = {
  "address": "4bfagECyGUMHaaQF9mfTvJBpmyxTVFhzPNhb3xfTPMfF",
  "metadata": {
    "name": "solwill",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "addBeneficiary",
      "discriminator": [
        105,
        214,
        106,
        141,
        180,
        166,
        123,
        238
      ],
      "accounts": [
        {
          "name": "owner",
          "writable": true,
          "signer": true,
          "relations": [
            "will"
          ]
        },
        {
          "name": "will",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  119,
                  105,
                  108,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "owner"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "beneficiaryAddress",
          "type": "pubkey"
        },
        {
          "name": "shareBps",
          "type": "u16"
        }
      ]
    },
    {
      "name": "checkin",
      "discriminator": [
        223,
        175,
        165,
        27,
        123,
        7,
        54,
        252
      ],
      "accounts": [
        {
          "name": "owner",
          "signer": true,
          "relations": [
            "will"
          ]
        },
        {
          "name": "will",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  119,
                  105,
                  108,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "owner"
              }
            ]
          }
        }
      ],
      "args": []
    },
    {
      "name": "claim",
      "discriminator": [
        62,
        198,
        214,
        193,
        213,
        159,
        108,
        210
      ],
      "accounts": [
        {
          "name": "beneficiary",
          "writable": true,
          "signer": true
        },
        {
          "name": "will",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  119,
                  105,
                  108,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "will.owner",
                "account": "willAccount"
              }
            ]
          }
        },
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "will"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "closeWill",
      "discriminator": [
        45,
        211,
        135,
        172,
        40,
        251,
        152,
        102
      ],
      "accounts": [
        {
          "name": "owner",
          "writable": true,
          "signer": true,
          "relations": [
            "will"
          ]
        },
        {
          "name": "will",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  119,
                  105,
                  108,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "owner"
              }
            ]
          }
        },
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "will"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "deposit",
      "discriminator": [
        242,
        35,
        198,
        137,
        82,
        225,
        242,
        182
      ],
      "accounts": [
        {
          "name": "owner",
          "writable": true,
          "signer": true,
          "relations": [
            "will"
          ]
        },
        {
          "name": "will",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  119,
                  105,
                  108,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "owner"
              }
            ]
          }
        },
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "will"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "initialize",
      "discriminator": [
        175,
        175,
        109,
        31,
        13,
        152,
        155,
        237
      ],
      "accounts": [
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "will",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  119,
                  105,
                  108,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "owner"
              }
            ]
          }
        },
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "will"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "timeoutSeconds",
          "type": "u64"
        },
        {
          "name": "gracePeriod",
          "type": "u64"
        }
      ]
    },
    {
      "name": "pauseWill",
      "discriminator": [
        116,
        46,
        71,
        203,
        100,
        241,
        40,
        247
      ],
      "accounts": [
        {
          "name": "owner",
          "signer": true,
          "relations": [
            "will"
          ]
        },
        {
          "name": "will",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  119,
                  105,
                  108,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "owner"
              }
            ]
          }
        }
      ],
      "args": []
    },
    {
      "name": "removeBeneficiary",
      "discriminator": [
        67,
        27,
        24,
        153,
        135,
        64,
        202,
        77
      ],
      "accounts": [
        {
          "name": "owner",
          "writable": true,
          "signer": true,
          "relations": [
            "will"
          ]
        },
        {
          "name": "will",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  119,
                  105,
                  108,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "owner"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "beneficiaryAddress",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "transferOwnership",
      "discriminator": [
        65,
        177,
        215,
        73,
        53,
        45,
        99,
        47
      ],
      "accounts": [
        {
          "name": "owner",
          "signer": true,
          "relations": [
            "will"
          ]
        },
        {
          "name": "will",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  119,
                  105,
                  108,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "owner"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "newOwner",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "unpauseWill",
      "discriminator": [
        197,
        203,
        165,
        93,
        80,
        26,
        106,
        6
      ],
      "accounts": [
        {
          "name": "owner",
          "signer": true,
          "relations": [
            "will"
          ]
        },
        {
          "name": "will",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  119,
                  105,
                  108,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "owner"
              }
            ]
          }
        }
      ],
      "args": []
    },
    {
      "name": "updateBeneficiary",
      "discriminator": [
        126,
        122,
        219,
        70,
        188,
        126,
        243,
        126
      ],
      "accounts": [
        {
          "name": "owner",
          "writable": true,
          "signer": true,
          "relations": [
            "will"
          ]
        },
        {
          "name": "will",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  119,
                  105,
                  108,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "owner"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "beneficiaryAddress",
          "type": "pubkey"
        },
        {
          "name": "newShareBps",
          "type": "u16"
        }
      ]
    },
    {
      "name": "updateTimeout",
      "discriminator": [
        123,
        115,
        53,
        248,
        18,
        97,
        101,
        209
      ],
      "accounts": [
        {
          "name": "owner",
          "signer": true,
          "relations": [
            "will"
          ]
        },
        {
          "name": "will",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  119,
                  105,
                  108,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "owner"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "newTimeout",
          "type": {
            "option": "u64"
          }
        },
        {
          "name": "newGracePeriod",
          "type": {
            "option": "u64"
          }
        }
      ]
    },
    {
      "name": "withdraw",
      "discriminator": [
        183,
        18,
        70,
        156,
        148,
        109,
        161,
        34
      ],
      "accounts": [
        {
          "name": "owner",
          "writable": true,
          "signer": true,
          "relations": [
            "will"
          ]
        },
        {
          "name": "will",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  119,
                  105,
                  108,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "owner"
              }
            ]
          }
        },
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "will"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "willAccount",
      "discriminator": [
        53,
        79,
        176,
        71,
        204,
        63,
        102,
        188
      ]
    }
  ],
  "events": [
    {
      "name": "beneficiaryAdded",
      "discriminator": [
        215,
        140,
        118,
        77,
        111,
        73,
        163,
        233
      ]
    },
    {
      "name": "beneficiaryRemoved",
      "discriminator": [
        91,
        177,
        35,
        58,
        199,
        203,
        65,
        249
      ]
    },
    {
      "name": "beneficiaryShareUpdated",
      "discriminator": [
        67,
        167,
        202,
        137,
        220,
        81,
        168,
        135
      ]
    },
    {
      "name": "gracePeriodUpdated",
      "discriminator": [
        209,
        159,
        54,
        137,
        187,
        183,
        139,
        255
      ]
    },
    {
      "name": "ownerCheckedIn",
      "discriminator": [
        154,
        216,
        237,
        205,
        128,
        162,
        34,
        191
      ]
    },
    {
      "name": "ownershipTransferred",
      "discriminator": [
        172,
        61,
        205,
        183,
        250,
        50,
        38,
        98
      ]
    },
    {
      "name": "shareClaimed",
      "discriminator": [
        235,
        144,
        44,
        130,
        190,
        141,
        139,
        176
      ]
    },
    {
      "name": "solDeposited",
      "discriminator": [
        111,
        73,
        30,
        181,
        111,
        34,
        200,
        6
      ]
    },
    {
      "name": "solWithdrawn",
      "discriminator": [
        145,
        249,
        69,
        48,
        206,
        86,
        91,
        66
      ]
    },
    {
      "name": "timeoutUpdated",
      "discriminator": [
        72,
        168,
        158,
        6,
        92,
        8,
        202,
        36
      ]
    },
    {
      "name": "willClosed",
      "discriminator": [
        178,
        71,
        93,
        28,
        240,
        134,
        21,
        89
      ]
    },
    {
      "name": "willInitialized",
      "discriminator": [
        30,
        254,
        197,
        179,
        100,
        190,
        1,
        6
      ]
    },
    {
      "name": "willPausedEvent",
      "discriminator": [
        18,
        113,
        11,
        23,
        147,
        86,
        2,
        252
      ]
    },
    {
      "name": "willUnpausedEvent",
      "discriminator": [
        164,
        63,
        67,
        214,
        228,
        2,
        37,
        187
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "notAuthorized",
      "msg": "You are not authorized to perform this action"
    },
    {
      "code": 6001,
      "name": "shareOverflow",
      "msg": "Total beneficiary shares would exceed 100% (10000 basis points)"
    },
    {
      "code": 6002,
      "name": "timedOut",
      "msg": "The timeout period has elapsed, owner can no longer withdraw"
    },
    {
      "code": 6003,
      "name": "tooEarly",
      "msg": "The timeout + grace period has not yet elapsed"
    },
    {
      "code": 6004,
      "name": "notBeneficiary",
      "msg": "The caller is not a listed beneficiary"
    },
    {
      "code": 6005,
      "name": "alreadyClaimed",
      "msg": "This beneficiary has already claimed their share"
    },
    {
      "code": 6006,
      "name": "beneficiaryAlreadyExists",
      "msg": "The beneficiary already exists in the will"
    },
    {
      "code": 6007,
      "name": "maxBeneficiariesReached",
      "msg": "Maximum number of beneficiaries reached"
    },
    {
      "code": 6008,
      "name": "zeroDeposit",
      "msg": "Deposit amount must be greater than zero"
    },
    {
      "code": 6009,
      "name": "zeroWithdraw",
      "msg": "Withdrawal amount must be greater than zero"
    },
    {
      "code": 6010,
      "name": "insufficientBalance",
      "msg": "Insufficient vault balance for withdrawal"
    },
    {
      "code": 6011,
      "name": "zeroShare",
      "msg": "Share basis points must be greater than zero"
    },
    {
      "code": 6012,
      "name": "timeoutTooShort",
      "msg": "Timeout must be at least 1 day (86400 seconds)"
    },
    {
      "code": 6013,
      "name": "gracePeriodTooShort",
      "msg": "Grace period must be at least 1 hour (3600 seconds)"
    },
    {
      "code": 6014,
      "name": "willPaused",
      "msg": "The will is currently paused"
    },
    {
      "code": 6015,
      "name": "willClosed",
      "msg": "The will is already closed"
    },
    {
      "code": 6016,
      "name": "willNotPaused",
      "msg": "The will is not paused"
    },
    {
      "code": 6017,
      "name": "beneficiaryNotFound",
      "msg": "The beneficiary was not found in the will"
    },
    {
      "code": 6018,
      "name": "unclaimedSharesExist",
      "msg": "Cannot close will while there are unclaimed shares after timeout"
    },
    {
      "code": 6019,
      "name": "cannotUpdateAfterTimeout",
      "msg": "Cannot update timeout or grace period after the will has timed out"
    },
    {
      "code": 6020,
      "name": "sameOwner",
      "msg": "Cannot transfer ownership to the same address"
    }
  ],
  "types": [
    {
      "name": "beneficiary",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "address",
            "type": "pubkey"
          },
          {
            "name": "shareBps",
            "type": "u16"
          },
          {
            "name": "hasClaimed",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "beneficiaryAdded",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "will",
            "type": "pubkey"
          },
          {
            "name": "beneficiary",
            "type": "pubkey"
          },
          {
            "name": "shareBps",
            "type": "u16"
          },
          {
            "name": "totalShares",
            "type": "u16"
          }
        ]
      }
    },
    {
      "name": "beneficiaryRemoved",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "will",
            "type": "pubkey"
          },
          {
            "name": "beneficiary",
            "type": "pubkey"
          },
          {
            "name": "shareBps",
            "type": "u16"
          }
        ]
      }
    },
    {
      "name": "beneficiaryShareUpdated",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "will",
            "type": "pubkey"
          },
          {
            "name": "beneficiary",
            "type": "pubkey"
          },
          {
            "name": "oldShareBps",
            "type": "u16"
          },
          {
            "name": "newShareBps",
            "type": "u16"
          }
        ]
      }
    },
    {
      "name": "gracePeriodUpdated",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "will",
            "type": "pubkey"
          },
          {
            "name": "oldGracePeriod",
            "type": "u64"
          },
          {
            "name": "newGracePeriod",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "ownerCheckedIn",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "will",
            "type": "pubkey"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "ownershipTransferred",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "will",
            "type": "pubkey"
          },
          {
            "name": "oldOwner",
            "type": "pubkey"
          },
          {
            "name": "newOwner",
            "type": "pubkey"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "shareClaimed",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "beneficiary",
            "type": "pubkey"
          },
          {
            "name": "will",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "shareBps",
            "type": "u16"
          },
          {
            "name": "totalClaimed",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "solDeposited",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "will",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "totalDeposited",
            "type": "u64"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "solWithdrawn",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "will",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "totalWithdrawn",
            "type": "u64"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "timeoutUpdated",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "will",
            "type": "pubkey"
          },
          {
            "name": "oldTimeout",
            "type": "u64"
          },
          {
            "name": "newTimeout",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "willAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "timeoutSeconds",
            "type": "u64"
          },
          {
            "name": "gracePeriod",
            "type": "u64"
          },
          {
            "name": "lastCheckin",
            "type": "i64"
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "totalDeposited",
            "type": "u64"
          },
          {
            "name": "totalWithdrawn",
            "type": "u64"
          },
          {
            "name": "totalClaimed",
            "type": "u64"
          },
          {
            "name": "isPaused",
            "type": "bool"
          },
          {
            "name": "isClosed",
            "type": "bool"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "vaultBump",
            "type": "u8"
          },
          {
            "name": "beneficiaries",
            "type": {
              "vec": {
                "defined": {
                  "name": "beneficiary"
                }
              }
            }
          }
        ]
      }
    },
    {
      "name": "willClosed",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "will",
            "type": "pubkey"
          },
          {
            "name": "remainingBalance",
            "type": "u64"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "willInitialized",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "will",
            "type": "pubkey"
          },
          {
            "name": "timeoutSeconds",
            "type": "u64"
          },
          {
            "name": "gracePeriod",
            "type": "u64"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "willPausedEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "will",
            "type": "pubkey"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "willUnpausedEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "will",
            "type": "pubkey"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    }
  ]
};
