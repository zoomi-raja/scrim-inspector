<p align="center">
  <img src="https://cdn.discordapp.com/app-icons/1200458919856853002/e3afa6f1d9fc61fb7eff5533c2f2baac.png" width="120" />
</p>

# Discord PUBG Scrim Bot

A Discord bot to manage PUBG scrim matches, teams, check-ins, lootspot lobbies, and staff workflows.

This bot is built for server owners, staff, and players. It creates the required channels and roles, then lets registered teams and mix teams participate in a PUBG-style scrim flow.

## What it does

- Manages PUBG scrim match setup and team check-ins
- Creates channels and roles automatically with `/init`
- Supports private staff commands and public player commands
- Generates lobby-based lootspot selection channels
- Handles team check-in, checkout, voice channel creation, and matchmaking priority

## Command types

There are two command groups:

- **Public (Open)**: for all server members
- **Private**: for staff members only

To start, the server owner must run `/init`. This command creates the required channels and roles, and configures the bot for the server.

After initialization, all private commands must be used inside the `📑│bot-commands` channel.

## Setup and install

### Requirements

- `node` and `npm` installed on your machine
- MySQL and Redis for backend storage
- Discord bot token and permissions for channel/role management

### Recommended setup

- Use Docker for MySQL and Redis if you want an isolated local environment
- Install Node.js and npm directly on the host, then run the bot from source

### Install and run

```bash
git clone https://github.com/zoomi-raja/discord-scrim-bot.git
cd discord-scrim-bot
npm install
npm start
```

### Register commands with Discord

```bash
node src/commands/register-command.js
```

## Environment variables

Rename `.env.example` to `.env` and populate the values.

Required variables:

```env
BOT_TOKEN=******
SERVER_ID=******
BOT_USER_ID=******
DB_HOST=localhost
DB_PORT=3306
DB_NAME=dcbot
DB_PASS=12345
DB_USER=root
REDIS_HOST=localhost
REDIS_PORT=6379
DEFAULT_BOT_ICON=https://cdn.discordapp.com/attachments/1076881825030471721/1162883445337362472/KDJQo3k.png
```

## How clean uninstall works

The bot stores initialization metadata in the database and creates a root category for the scrim.
If you need to remove everything created by `/init`, delete the root category that was generated with the scrim name.

For example, if the scrim name was `mea scrims`, delete the category named `mea scrims` in Discord. The bot will then remove the related channels and roles created for that scrim and perform a clean uninstall of that configuration.

## Folder structure

```
src/
  index.js
  commands/
    help.js
    register-command.js
    lootspots/
    scrims/
    teams/
  db/
    mysql.js
    redis.js
    models/
  utils/
    alerts.js
    commandParser.js
    helper.js
    logger.js
    tempCache.js
scr/
  vikandi/
admin/
  backend/
  frontend/
```

## Command overview

To initialize the bot for the first time, run:

- `/init` — only the server owner can run this command

This creates the required channels and roles, including:

- `📑│bot-commands`
- `✅│check-in`
- `❌│check-out`
- `📢│final-lobby`
- `📢│lobby-status`
- `voice channels` category
- `Staff`, `Team Captain`, `Mix Approved`, and tier roles

### Scrim commands

- `/scrim` — open, close, reset, announce
- `/scrim_edit` — change min/max teams and scrim mode

### Lootspot commands

- `/ls_create` — create lobby category and selection channels
- `/ls_active` — send lootspot selection options to channels
- `/ls_lock` — lock/unlock lootspots in a lobby

### Team commands

- `/add` — register a team, create role, assign players
- `/list` — list registered teams
- `/player` — search for team by player
- `/team` — search for a team
- `/checkin` — registered teams check in
- `/checkin_mix` — mix teams check in with `Mix Approved` role
- `/checkout` — checkout a team and release their lootspot

## Intro to commands

To initialize the bot for the first time, use `/init`. This command creates mandatory channels and roles and sets up the server for scrim operations.

![picture](/scr/init.PNG)

On success, the bot will create channels, roles, and instructions for next steps.

![picture](/scr/role.PNG) ![picture](/scr/channels.PNG)

**Note:** private commands can only be run in the `📑│bot-commands` channel.

### Scrim modes

Based on the selected mode, teams are prioritized in lobby assignment:

- **Team** — registered teams have priority over mix teams
- **Tier** — teams with higher tier have priority (Pro, Tier1, Tier2, Tier3, Tier4, Tier5, Team)
- **FCFS** — first come, first served

### Check-in / Checkout process

When the scrim is open with `/scrim open`, teams can check in and checkout. Checkout frees the lootspot and deletes the team voice channel.

Mix check-in requires at least three players and the `Mix Approved` role. The player who runs `/checkin_mix` becomes the mix team captain.

![picture](/scr/checkin.PNG)

When a team checks in, a voice channel is created for that team and only its members can join. The captain can invite two additional members into the team voice chat.

![picture](/scr/teamvc.PNG)

**Note:** use `/scrim close` to disable check-in.

### Lobby / lootspot commands

`/ls_create`, `/ls_active`, and `/ls_lock` support multiple lobbies. Each lobby gets its own lootspot selection channels.

`/ls_create` creates the lobby category and required channels. To delete a lobby, delete the lobby category in Discord — the bot will remove the related channels automatically.

![picture](/scr/lobby.PNG)

`/ls_active` sends lootspot selection options into the lobby channels.

![picture](/scr/lootspot.PNG)

`/ls_lock` temporarily disables lootspot selection for a lobby.

![picture](/scr/taala.PNG)

**Note:** if a team moves lobbies, staff can remove and reassign their lootspot to keep lobby assignments correct.

## Dependencies

- Node.js and npm
- Discord.js
- dotenv
- mysql2
- redis
- winston
- winston-daily-rotate-file

If you want to use MySQL and Redis via Docker, run the provided Docker setup for backend services and install Node/npm on the host machine.

## FAQs

- Can a removed bot delete channels after being kicked?
  - No. Once the bot is removed from the server, it cannot delete channels until it is re-added with proper permissions.
- How do I pause work and resume later?

## Contributions

- Report issues
- Open pull requests with improvements
- Spread the word
- Reach out with feedback: [Zamurd Ali](https://twitter.com/zoomirajpoot)

## License

See the [license file](./license) for details.
