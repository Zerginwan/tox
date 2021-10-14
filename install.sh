#! /bin/bash
echo "Write your email for getting letsencrypt certificate - you will need it for enabling https"
read EMAIL
if [[ "$EMAIL" == "" ]];
then
    echo "Email can't be empty"
    exit 1
fi
echo "OK"
echo "Write domain name for your service like hostname.example.com. You had to put A-record with ip of this computer alredy"
read HOSTNAME
if [[ "$HOSTNAME" == "" ]];
then
    echo "Hostname can't be empty"
    exit 1
fi
echo "OK"
SCRIPT_DIR="$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
echo "Installing yq. Probably will need sudo"
apt install yq -y

yq e -i '.service.flask.labels[1] = "traefik.http.routers.whoami.rule=\'Host(\`strenv(NAME)\`) && PathPrefix(\`/py/\`)\'"' "$SCRIPT_DIR/docker-compose.yml"
yq e -i '.service.js.labels[1] = "traefik.http.routers.whoami.rule=Host(\`strenv(NAME)\`)"' "$SCRIPT_DIR/docker-compose.yml"
