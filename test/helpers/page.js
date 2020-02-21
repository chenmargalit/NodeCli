const puppeteer = require('puppeteer');
const sessionFactory = require('../factories/sessionFactory');
const userFactory = require('../factories/userFactory');

class CustomPage {
  static async build() {
    const browser = await puppeteer.launch({
      // dont open a real ui browser
      headless: true,
      // makes things run faster
      args: ['--no-sandbox']
    });
    const page = await browser.newPage();
    const customPage = new CustomPage(page);

    return new Proxy(customPage, {
      get: function(target, property) {
        return customPage[property] || browser[property] || page[property];
      }
    });
  }
  constructor(page) {
    this.page = page;
  }
  async login() {
    const user = await userFactory();
    const { session, sig } = sessionFactory(user);

    await this.page.setCookie({ name: 'express:sess', value: session });
    await this.page.setCookie({ name: 'express:sess.sig', value: sig });

    await this.page.goto('http://localhost:3000/blogs');
    // as everything runs as fast as possible, our eval test runs before the button is uplodaded, hence it fails because it cannot find what is not yet there. This waitFor method will allow us to wait for the button before running more tests functions.
    await this.page.waitFor('a[href="/auth/logout"]');
  }
  getContentOf(selector) {
    return this.page.$eval(selector, el => el.innerHTML);
  }

  get(path) {
    return this.page.evaluate(_path => {
      return fetch(_path, {
        method: 'GET',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(res => res.json());
    }, path);
  }

  post(path, data) {
    return this.page.evaluate(
      (_path, _data) => {
        return fetch(_path, {
          method: 'POST',
          credentials: 'same-origin',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(_data)
        }).then(res => res.json());
      },
      path,
      data
    );
  }

  execRequest(actions) {
    // this is an array of operations, an array of functions that specificically each returns a promise. Promise.all will make it wait until all promises are resolved
    return Promise.all(
      actions.map(({ path, method, data }) => {
        return this[method](path, data);
      })
    );
  }
}

module.exports = CustomPage;
