#!/bin/bash
setup_service xvfb
setup_service google-chrome-stable 85.0.4183.102-1

cd /root/ninja/ninja-angular

export clientId=0oapmwm72082GXal14x6
export yourninjaDomain=samples-javascript.ninja.com
echo "export const environment = {production: false,clientId: '$clientId',yourninjaDomain:'$yourninjaDomain'};" > environment.ts
cat environment.ts

docker-compose up -d
sleep 120

cd /root/ninja/ninja-angular/test/selenium-test/selenium
npm install selenium-webdriver
wget https://chromedriver.storage.googleapis.com/85.0.4183.87/chromedriver_linux64.zip
unzip chromedriver_linux64.zip
mv chromedriver /usr/bin/chromedriver
chown root:root /usr/bin/chromedriver
chmod +x /usr/bin/chromedriver
get_terminus_secret "/" PASSWORD SIW_TEST_USER_PASSWORD
export SIW_TEST_USER_EMAIL=george@acme.com
if ! node /root/ninja/ninja-angular/test/selenium-test/selenium/ninja-angular-widget-test.ts; then
  echo "Test failed! Exiting..."
  exit ${TEST_FAILURE}
fi
