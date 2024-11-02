#!/usr/bin/env bash
# stop the bot
pm2 stop "ovixTicketKillerBot"
# pull the latest changes
git pull
# install the latest dependencies
npm install
# start the bot
pm2 start "ovixTicketKillerBot"