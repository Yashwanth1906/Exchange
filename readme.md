  To create a express project in typescript:

  Step1 : npm install express
      npm install --save-dev @types/express,npm install --save-dev typescript ts-node-dev,npm install --save-dev @types/node

  step2: npx tsc --init

  step3: add the script

  "scripts": {'
    "start": "node dist/index.js",
    "dev": "ts-node-dev --respawn src/index.ts"
  }


  step4: to build the application , npx tsc