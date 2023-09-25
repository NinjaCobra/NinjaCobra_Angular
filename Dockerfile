FROM node:14.15.4-alpine3.12
RUN npm install -g @angular/cli@11.2.14
RUN ng new ninja-app --routing
WORKDIR ninja-app

RUN npm i rxjs
RUN npm install @angular/router
RUN npm i @angular/common

RUN npm install @ninja/ninja-signin-widget
WORKDIR ../

ADD . / ninja-angular/

WORKDIR ninja-angular
RUN rm -rf node_modules
RUN yarn install
RUN yarn build
RUN yarn link
WORKDIR ../
WORKDIR ninja-app
RUN yarn install
RUN yarn link @ninja/ninja-angular


COPY /test/selenium-test/sign-in-widget/app.module.ts /ninja-app/src/app
COPY /test/selenium-test/sign-in-widget/app.component.html /ninja-app/src/app
COPY /test/selenium-test/sign-in-widget/app.component.ts /ninja-app/src/app
COPY /test/selenium-test/sign-in-widget/protected.component.ts /ninja-app/src/app
COPY /test/selenium-test/sign-in-widget/login.component.ts /ninja-app/src/app
COPY /test/selenium-test/tsconfig.json /ninja-app
COPY environment.ts /ninja-app/src/environments