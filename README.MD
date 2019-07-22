## Server setup

#### 1.  Deploy instance on AWS

##### current system specs

 - m3.large
 - 8GB attached volume
 - ubuntu server 14.04 LTS

#### 2.  Set up server

copy server setup script from github
```bash
wget https://raw.githubusercontent.com/USGS-WiM/nwis-mapper/master/server-config/server-setup.sh --no-check-certificate
```

run server setup script
```bash
sudo sh server-setup.sh
```

copy keys for SSL (HTTPS)
```bash
sudo cp [path to key]/server.crt /etc/ssl/certs/server.crt
sudo cp [path to key]/server.key /etc/ssl/private/server.key
sudo cp [path to key]/DigiCertCA.crt /etc/ssl/certs/DigiCertCA.crt
```

restart apache
```bash
sudo service apache2 restart
```

the nwis mapper application should now be running @ localhost

## Generate new NWIS mapper tile cache

##### required software
>[ESRI ArcGIS Desktop ~10.3.1](https:/esri.com)   
>[Python 2.7](https://www.python.org/download/releases/2.7/)  
>[Python Pillow image library](https://pillow.readthedocs.org/en/3.0.x/installation.html)  
>[AWS CLI](https://aws.amazon.com/cli/)

#### 1.  Run script to pull NWIS sites from USGS waterservices (tile-creation/1_getNWISSites.py)

```bash
python generateTileCache.py
```

- takes about 3 hours minutes to run
- queries NWIS site service for sites, adds them to a fileGDB
- fileGDB feature classes are referenced within MXDs for each site type
- this is a wrapper script that generates an ESRI tile cache, cleans it up then converts to TMS tiles
- output can be uploaded directly to s3

#### 2.  Upload to amazon S3 (tile-creation/3_updateS3Bucket.py)

- check to make sure paths are correct

```bash
python updateS3Bucket.py
```

- takes about 8 minutes to run
- loops over each folder in tile cache location, recursively deletes from s3 bucket then re-uploads new cache
