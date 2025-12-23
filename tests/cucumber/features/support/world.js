const { setWorldConstructor } = require('@cucumber/cucumber');

class CustomWorld {
  constructor() {
    this.page = null;
    this.frontpage = null;
  }
}

setWorldConstructor(CustomWorld);