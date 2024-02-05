# Discord PUBG Scrim Bot
This bot helps to make managing PUBG scrim easy. It provides utils for both Players and Server owner. Each command is either.
- Open
- Private

To utilize private command person should have staff role. Any one on server can use open commands.

**Commands**
```
Scrimn Bot
│── scrims
│    └── init (`Only for server owner`)
|    └── scrim_edit (`Private`)
│    └── scrim (`Private`)
│       │── Open
│       │── Close
│       │── Reset
│       └── Announce
└── lootspots
│    └── ls_create (`Private`)
|    └── ls_active (`Private`)
│    └── ls_lock (`Private`)
└── teams
     └── add (`Private`)
     └── list (`Open`)
     └── checkin (`Open`)
     └── checkin_mix (`Open`)
     └── checkout (`Open`)
     └── tier (`Open`)
     └── get (`Open`)
```

**`note`** rename .env.example to .env<br />

`following are the required environment variable`

```
BOT_TOKEN = ******
SERVER_ID = ******
BOT_USER_ID = ******
DB_HOST = localhost
DB_NAME = dcbot
DB_PASS = 12345
DB_USER = root
DEFAULT_BOT_ICON = https://cdn.discordapp.com/attachments/1076881825030471721/1162883445337362472/KDJQo3k.png
```
To **`Register`** commands with discord server run

```
 node .\src\commands\register-command.js
```
To **`Run`** Bot
```bash
git clone https://github.com/zoomi-raja/discord-scrim-bot.git
yarn install
yarn start
```

## Intro to Commands
To initilize Bot for the first time use following command. There is two type of locks one is to lock checkin/checkout and one is to lock lobby lootspots.

![picture](/scr/init.PNG)

It will create mandatory channels and roles, And on success will return message for further actions.

![picture](/scr/role.PNG)![picture](/scr/channels.PNG)

**`Note.!`** Staff can run private commands in `bot-command` channel<br />

**`scrim_edit`** command can be used to modify teams limit and scrim mode which was set during **`init`** command

`Scrim can have one of the following Mode`
Based on priority teams will have slot in lobbies when scrim announced.
- Team -> In team mode priority registered teams will have priority over Mix checked in team
- Tier -> Team with higher tier will have periority then Mix checked in team. (Pro, Tier1, Tier2, Tier3, Tier4, Tier5, Team)
- FSFC -> No priority whoever checkin in first will get the slot in lobby

`CheckIn/Checkout Procedure`

Once scrim is open using command **`/scrim open`** teams can checkIn or checkedIn team can checkout to avoid palenty. On checkout team VC will be deleted and lootspot taken will be made available for other team to select.
Mix Checkin is available using command **`checkin_mix`**, atleast three players required to check in as Mix team. All players need to have **`Mix Approved`** role and the person who will run command will became captain of that mix team. To checkout both Mix team and registered team can use **`/checkout`** command only difference is for mix team captain need to pass Mix Approved instead of Team name.

![picture](/scr/checkin.PNG)

On checkin team voice channel will be created where only team member of that team can join. In chat of that channel team captain can invite any two member of server to join the chat.

![picture](/scr/teamvc.PNG)

**`Note.!`** to disable checkIn **`/scrim close`** can be used<br />

`Lobby/Lootspt commands`

**`ls_create, ls_active, ls_lock`** There can be multiple lobbies and each lobby will have its on lootspot selection channels.

**`ls_create`** Will create Lobby and its required channels. to delete generated lobby you dont have to delete individual channels separately instead delete category on discord it will delete everything for that Lobby.
![picture](/scr/lobby.PNG)

**`ls_active`** Will send lootspot selection options for particular lobby selected in the response of the command.

![picture](/scr/lootspot.PNG)

**`/ls_lock`** is to disable lootspots of any particular lobby temporarly.

![picture](/scr/taala.PNG)


**`Note.!`** As for scrims there is periority logic and due to which if team who has selected e.g Spot in lobby 1 and later moved to lobby 2 staff can remove its lootspot so same player can pick lootspot in correct lobby.

## FAQs

Feel free to open an issue if there is something that we can improve. Would love to have your helping hand.
Next open points.
1- team with higher priority can take lootspot from Mix checked in team?
2- Strike system?

## Contributions
- Report issues.
- Open pull request with improvements
- Spread the word
- Reach out with any feedback [Zamurd Ali](https://twitter.com/zoomirajpoot)

## License

Have a look at the [license file](./license) for details
