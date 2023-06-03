echo "Kill all the running PM2 actions"
pm2 kill

echo "Jump to app folder"
cd ~/actions-runner/_work/GPSportPlaner/GPSportPlaner/backend

echo "Sourcing Env Vars"
bash /home/gps/envs/envs.sh

echo "Run new PM2 action"
pm2 start "npm run start" --update-env



