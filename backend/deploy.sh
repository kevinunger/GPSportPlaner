echo "Kill all the running PM2 actions"
pm2 kill

echo "Jump to app folder"
cd ~/actions-runner/_work/GPSportPlaner/GPSportPlaner/backend

export NODE_ENV=production

echo "Copying .env.production from /home/gps/envs/.env.production"
cp /home/gps/envs/.env.production .env.production

echo "Run new PM2 action"
pm2 start "npm run start" --update-env
