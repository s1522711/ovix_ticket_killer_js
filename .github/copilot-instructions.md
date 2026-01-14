# Ovix Ticket Killer Bot - AI Agent Instructions

## Project Overview
A Discord.js bot that automatically manages tickets for the Ovix game server community. The bot:
- Auto-deletes tickets for disabled games (GTA, RDR2, CS2), unverified users, giveaways, and recovery service
- Manages ticket creation codes with optional randomization
- Tracks server status and displays it in Discord embeds
- Enforces role-based permissions and cooldowns on commands

**Tech Stack:** Node.js, Discord.js v14, Sequelize ORM, SQLite

## Architecture & Data Flow

### Core State Management
- **[state.js](state.js)**: Single source of truth containing:
  - `killing`: Toggle flags for auto-delete rules (gtaKill, rdr2Kill, cs2Kill, etc.) + ticket code management
  - `status`: Server status (apiStatus, gtaStatus, rdr2Status, cs2Status)
  - Message IDs for status/code embeds (used for updates without resending)

### Lifecycle: `index.js` → `events/` → `commands/`
1. **[index.js](index.js)** bootstraps Discord client, loads commands/events dynamically from folders
2. **[events/](events/)** handlers react to Discord events:
   - `interactionCreate.js`: Slash command router + built-in cooldown system (per-command, per-user)
   - `messageCreate.js`: Ticket detection (from Tickettool bot), auto-delete enforcement, mention-based pings
   - `messageDelete.js`, `ready.js`: Cleanup and startup logic

3. **[commands/](commands/)** organized by category:
   - `tickets/`: Ticket management (close, code changes, kill toggles)
   - `products/`: Server status (get/set)
   - `utility/`: Pinging, user management, embeds

### Database Layer
- **[timeoutsDb.js](timeoutsDb.js)**: Sequelize SQLite schema tracking user ping attempts + timestamps
- Used for rate-limiting user pings to prevent abuse

## Key Patterns & Conventions

### Command Structure (All commands follow this export signature)
```javascript
module.exports = {
  cooldown: 1,  // in seconds, optional (defaults to 3)
  data: new SlashCommandBuilder()
    .setName('command-name')
    .setDescription('...')
    .addStringOption(...),
  async execute(interaction) { /* handler */ }
  // autocomplete() optional for string option suggestions
};
```

### Permission Checks
Most commands require role validation before execution:
- **staffRoleId, trialStaffRoleId**: Can execute ticket commands
- **modRoleId**: Can toggle killing rules and status
- **Administrator permission**: Overrides role checks
```javascript
if (!interaction.member.roles.cache.has(staffRoleId) && !interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
  return interaction.reply({ content: 'No permission', flags: MessageFlags.Ephemeral });
}
```

### State Updates & UI Sync
When ticket rules change ([set-killing.js](commands/tickets/set-killing.js)):
1. Update `state.killing` object
2. Call `updateStatusMessage(interaction.client)` from [statusAndLastState.js](statusAndLastState.js)
3. Bot edits the existing status embed (using stored `state.statusMessageId`) rather than resending

### Event Routing in `messageCreate.js`
Ticket messages are detected by checking `message.author.id === tickettoolId` (Tickettool bot ID from config). This distinguishes between:
- **Tickettool embeds** → trigger ticket logic
- **Auto-delete channels** → enforce deletion after delay (unless author is staff/bot)
- **Regular mentions** → trigger user ping tracking

### Error Handling
- **Uncaught exceptions**: Logged to `crash.log` with timestamps in [index.js](index.js), process exits
- **Command errors**: Caught in `interactionCreate.js`, reply sent but doesn't crash bot
- **Database errors**: Handle missing database gracefully (Sequelize auto-creates on startup)

## Setup & Development Workflow

### Commands
```bash
npm start              # Run bot (requires config.json + Discord token)
npm run register-commands  # Deploy slash commands to Discord (uses deploy-commands.js)
npm run lint          # Check code style (ESLint)
npm run lint:fix      # Auto-fix linting issues
```

### Config
Copy `config.json.example` to `config.json`. Required fields:
- Discord credentials: `token`, `clientId`, `guildId`
- Tickettool ID: `tickettoolId` (for detecting Tickettool messages)
- Role IDs: `staffRoleId`, `modRoleId`, `trialStaffRoleId`
- Channel IDs: `statusChannelId`, `ticketCodeMessageChannelId`, `autoDeleteChannelIds` (array)
- Timeouts: `pingTimeoutTime`, `autoDeleteTime` (seconds)
- External APIs: `statpingApiToken`, `statpingApiUrl` (for server status checks)

## Adding New Features

### Adding a Ticket Kill Rule
1. Add toggle flag to `state.killing` in [state.js](state.js) (e.g., `newGameKill: false`)
2. Add switch case in [set-killing.js](commands/tickets/set-killing.js)
3. Add detection logic in [messageCreate.js](events/messageCreate.js) `handleTicket()` function

### Adding a Command
1. Create file in `commands/{category}/command-name.js` with the export signature above
2. Auto-loaded by dynamic require in [index.js](index.js) (no manual registration needed)
3. Register to Discord API via `npm run register-commands`

### Adding an Event
1. Create file in `events/event-name.js` with `name` (Discord.js Events constant) and `execute()` export
2. Auto-loaded by dynamic require in [index.js](index.js)

## Logging & Debugging
- Use `logToConsole(message)` from [logger.js](logger.js) for timestamped console output
- All uncaught errors written to `crash.log` (file system persisted)
- ESLint enforces code consistency (`npm run lint`)
