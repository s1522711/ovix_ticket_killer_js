# Ovix ticket killer
A discord.js rewrite of my small and shitty discord.py bot made for ovix to auto delete tickets if they are created for a disabled game or delete password reset tickets that were not created for password resets

# setup
1. Clone the repository
2. Run `npm install`
3. Rename `config.example.json` to `config.json` and fill in the required fields
4. Run `npm start`

# config.json
```json
{
  "token": "BOT_TOKEN_HERE",
  "clientId": "CLIENT_ID_HERE",
  "guildId": "GUILD_ID_HERE",
  "tickettoolId": "TICKETTOOL_ID_HERE",
  "ticketCreationCode": "TICKET_CREATION_CODE_HERE",
  "statusChannelId": "STATUS_CHANNEL_ID_HERE",
  "staffRoleId": "STAFF_ROLE_ID_HERE",
  "modRoleId": "MOD_ROLE_ID_HERE",
  "trialStaffRoleId": "TRIAL_STAFF_ROLE_ID_HERE",
  "staffChatId": "STAFF_CHAT_ID_HERE",
  "autoDeleteChannelIds": ["AUTO_DELETE_CHANNEL_ID_HERE"],
  "autoDeleteTime": 5,
  "downEmoji": ":red_circle:",
  "upEmoji": ":green_circle:",
  "updatingEmoji": ":yellow_circle:"
}
```