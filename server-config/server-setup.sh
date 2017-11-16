#!/bin/sh

#args
USER_HOME=$(getent passwd $SUDO_USER | cut -d: -f6)
APP_PATH="/srv"
USER=$SUDO_USER
LIST_OF_MAIN_APPS="python python-dev python-pip git libgeos-dev libjpeg-dev zlib1g-dev apache2"
LIST_OF_PYTHON_APPS="Mako cherrypy xlwt shapely pillow"

#install cert
wget https://raw.githubusercontent.com/USGS-WiM/nwis-mapper/master/server-config/DOIRootCA.crt --no-check-certificate
cp DOIRootCA.crt /usr/local/share/ca-certificates/DOIRootCA.crt
update-ca-certificates

#install apps
apt-get update  # To get the latest package lists
apt-get install -y $LIST_OF_MAIN_APPS
pip install $LIST_OF_PYTHON_APPS

#get repo from github
GIT_SSL_NO_VERIFY=true git clone https://github.com/USGS-WiM/nwis-mapper.git ${APP_PATH}/nwis-mapper

#copy bucket info file if exists (should have been placed by cloud formation)
if [ -f /tmp/s3bucket.json ]; then
  cp /tmp/s3bucket.json ${APP_PATH}/nwis-mapper/mapper/s3bucket.json
fi

#set proper permissions on nwis mapper folder
chown ${SUDO_USER} -R ${APP_PATH}/nwis-mapper
chgrp ${SUDO_USER} -R ${APP_PATH}/nwis-mapper
chmod +x ${APP_PATH}/nwis-mapper/server-config/chkCherry.sh

#create symbolic link
ln -s ${APP_PATH}/nwis-mapper/mapper /var/www/mapper

#start up cherrypy services
sh ${APP_PATH}/nwis-mapper/server-config/chkCherry.sh

#setup up cron jobs
(crontab -u ${USER} -l; echo "*/5 * * * * ${APP_PATH}/nwis-mapper/server-config/chkCherry.sh" ) | crontab -u ${USER} -
(crontab -u ${USER} -l; echo "0 0 * * 0 rm -rf ${APP_PATH}/nwis-mapper/mapper/exporter/temp/*" ) | crontab -u ${USER} -

#add redirect from root and favicon
cp ${APP_PATH}/nwis-mapper/server-config/favicon.ico /var/www/favicon.ico
cp ${APP_PATH}/nwis-mapper/server-config/index.html /var/www/index.html

#cleanup html folder
if [ -d /var/www/html ]; then
  rm -R /var/www/html
fi

#install mod-proxy
a2enmod proxy_http
a2enmod rewrite
a2enmod ssl

#add new virtual site
cp ${APP_PATH}/nwis-mapper/server-config/nwis-mapper.conf /etc/apache2/sites-available/nwis-mapper.conf
cp ${APP_PATH}/nwis-mapper/server-config/nwis-mapper-ssl.conf /etc/apache2/sites-available/nwis-mapper-ssl.conf
a2dissite 000-default
a2ensite nwis-mapper
a2ensite nwis-mapper-ssl
service apache2 restart
