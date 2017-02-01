#!/bin/sh

main() {
  exportStatus $@
}

exportStatus() {
  
  # check NWIS mapper exporter
  isExp=`ps -ef|grep export.py|grep python`
  if [ -z "$isExp" ] ; then
	/usr/bin/nohup python /var/www/mapper/exporter/export.py > /dev/null 2>&1 &
  fi

  # check NWIS Query mapper exporter
  isExp=`ps -ef|grep exportSM.py|grep python`
  if [ -z "$isExp" ] ; then
        /usr/bin/nohup python /var/www/mapper/exporter/exportSM.py > /dev/null 2>&1 &
  fi

  # check NWIS Query mapper siteCounter
  isExp=`ps -ef|grep siteCounter.py|grep python`
  if [  -z "$isExp" ] ; then
        /usr/bin/nohup python /var/www/mapper/exporter/siteCounter.py > /dev/null 2>&1 &
  fi

 # check RGBFinder service 
  isExp=`ps -ef|grep getTileRGB.py|grep python`
  if [  -z "$isExp" ] ; then
        /usr/bin/nohup python /var/www/mapper/RGBFinder/getTileRGB.py > /dev/null 2>&1 &
  fi

}

main $@


