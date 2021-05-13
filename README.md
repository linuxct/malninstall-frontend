# Malninstall Web frontend (in Next.js + Tailwind CSS)  

This is the Malninstall Web frontend. It is intended to be used in the cases where the mobile client stops working due to a rogue application bypassing it.  

You can check the service live in https://malninstall.linuxct.space. Press on the Help button to display instructions on how to use it.  

## Build  

First, make sure you have installed and properly configured the following packages: `docker docker-compose git traefik`.  

Execute the `build.sh` command. It will automatically build a local Docker image and bring it up using docker-compose.  

## Deploy  

This application is deployed with Traefik as edge router. If you wish to check its configurations, please refer to the `docker-compose.yml` file.  