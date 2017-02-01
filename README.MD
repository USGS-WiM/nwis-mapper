## Routine site updates/ bug fixes

This site is set up for automated deployment via deployhq and will deploy at any new Pull Request to USGS-WiM/nwis-mapper

## Server setup

#### 1.  Deploy instance on AWS

##### current system specs

 - m3.large
 - 8GB attached volume
 - ubuntu server 14.04 LTS

#### 2.  Set up server

copy server setup script from github
```bash
wget https://raw.githubusercontent.com/USGS-OWI/nwis-mapper/master/server-config/server-setup.sh --no-check-certificate
```

run server setup script
```bash
sudo sh server-setup.sh
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
python 1_getNWISSites.py
```

- takes about 90 minutes to run (with 16GB RAM Intel Core i7-3720QM)
- queries NWIS site service for sites, adds them to a fileGDB
- fileGDB feature classes are referenced within MXDs for each site type

#### 2.  Run script to create new tile cache (tile-creation/2_generateTileCache.py)

```bash
python 2_generateTileCache.py D:/
```

- takes about 70 minutes to run (with 16GB RAM Intel Core i7-3720QM)
- this is a wrapper script that generates an ESRI tile cache, cleans it up then converts to TMS tiles
- output can be uploaded directly to s3

#### 3.  Upload to amazon S3 (tile-creation/3_updateS3Bucket.py)

```bash
python 3_updateS3Bucket.py d:/cache s3://nwismapper
```

- takes about 8 minutes to run
- loops over each folder in tile cache location, recursively deletes from s3 bucket then re-uploads new cache
