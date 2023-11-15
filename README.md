# GPSportPlaner

## Frontend
Angular

setup:
`npm install`

develop with 
`npm run dev` or `npm run hostdev` (to be able to access it from your phone)

## Backend
Express with Typescript and Mongoose

setup:

`npm install`

develop with:

`npm run dev`

run tests with:

`npm run test` or `npm run testwatch`


### local mongodb setup
```bash
docker run -d -p 27017:27017 --name gpsmongo -e MONGO_INITDB_ROOT_USERNAME=gpsbackend -e MONGO_INITDB_ROOT_PASSWORD=gpstest mongo:latest
```

send POST to http://localhost:3000/auth/setInitialPw with
```json
{
    "role": "user",
    "newPassword": "pw"
}
```
to set user pw and set pws for all other roles (admin and master)

### run mongodb docker

`npm run start:db`


### Deployment to VPS

Point A-Record to VPS-IP

adduser username
usermod -aG sudo username
sudo su - username
mkdir ~/.ssh
chmod 700 ~/.ssh
Enter your key: nano ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
sudo service ssh restart
try to login as the user
sudo nano /etc/ssh/sshd_config
change PermitRootLogin no
PasswordAuthentication no if it is yes

sudo systemctl reload sshd
sudo apt install nginx ufw
sudo ufw enable

sudo ufw allow ssh
sudo ufw allow 'Nginx Full'

Optional (new repo)
Goto Github Actions and use the deploy-backend.yml
Goto settings -> actions -> add runner
Enter each command on the server
then
sudo ./svc.sh install
sudo ./svc.sh start

install NodeJs
curl -sL https://deb.nodesource.com/setup_16.x -o nodesource_setup.sh
sudo bash nodesource_setup.sh
sudo apt-get install -y nodejs

setup pm2
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
nano ~/.profile
add "export PATH=~/.npm-global/bin:$PATH"

npm install -g pm2

