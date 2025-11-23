// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  version: '3.0.7',
  build: 3,
  showBuild: true,
  maximumFileSize: 2048,
  apiBaseUrl: 'http://localhost:9000/v1',
  stripeKey:
    'pk_test_51MALYlCXbLO4otsv0byg0W0E7Yn1qPRTi3OBULesGOcyD7e9bkusu6w2IhRcnA6VXROMDHdVioqOZtH00cBa2J7p000IIOfQvt',
  slickpayKey: '5kpfp1jtgi46htwsg1y0h0l0tnxvyjhsg1tphvimagmch4cimh', //Added: Secret Key
  url: 'http://localhost:4200',
  socketUrl: 'http://localhost:9000',
  zoomSDK: '9NLkK6D58rk55oGvztVu2RZ5bWFnDsQ0WLQH',
  zoomDomain: 'localhost',
  zoomSiteUrl: 'http://127.0.0.1:1338',
  recaptcha: {
    // siteKey: '6LfKNi0cAAAAACeYwFRY9_d_qjGhpiwYUo5gNW5-',
    siteKey: '6LcEargnAAAAAJ0x6gH7ckK74aflw70fLXVKtHsn'
  },
  localPayment: 'SLICKPAY' // 'SLICKPAY' OR 'SATIM'
};
