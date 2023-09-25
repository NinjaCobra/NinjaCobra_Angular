pushd ./dist
npx yalc publish
popd

npx lerna exec -- npx yalc add @ninja/ninja-angular
