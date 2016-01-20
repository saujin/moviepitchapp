# Moviepitch.com

This Moviepitch.com repository is the frontend service for submitting movie pitches via the web. It is used in conjunction with the backend services located [here](https://github.com/strvcom/Node-MoviePitch).

# Getting Started

A barebones Node.js app using [Express 4](http://expressjs.com/).

This application supports the [Getting Started with Node on Heroku](https://devcenter.heroku.com/articles/getting-started-with-nodejs) article - check it out.

## Running Locally

Make sure you have [Node.js](http://nodejs.org/) and the [Heroku Toolbelt](https://toolbelt.heroku.com/) installed.

```
$ git clone https://github.com/saujin/moviepitch.git
$ cd moviepitchapp
$ npm install (installs required node modules)
$ heroku local (starts a local server running the app)
```

Your app should now be running on [localhost:5000](http://localhost:5000/).

## Deploying Changes to Heroku

```
$ git push heroku master (pushes changes to Heroku and rebuilds site)
$ heroku open (opens the site in the default browser)
```

[![Deploy to Heroku](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy)

## Updating the Site

This site uses Gulp to compile SCSS and JS assets. Run Gulp from the command line and reload the page after the Gulp tasks complete on every change.

```
$ gulp (starts the Gulp service, watches for JS and SCSS changes)
```

## Making Content changes to the site

Most of the site's content is served up from .html pages contained in the /public/views/ folder. A brief overview of where content is located:

- Home: /public/views/home.html
- FAQ: /public/views/faq.html
- Press: /public/views/press.html
- Legal: /public/views/legal.html
- Contact Us: /public/views/contact-us.html

Certain content (such as the list of available movie genres) is not created or stored in the HTML pages. Modifying this content requires a basic familiarity with javascript array notation. A properly formatted javascript array of strings looks like the following:

```
var array = [
  "string 1",
  "string 2",
  "string 3"
];
```

Please note that each item in the array is followed by a comma (except the last item), the array of strings is contained within brackets - [] - and the closing bracket is followed by a semi-colon. Also, the display order of the strings in the front-end will match the order in which they appear in the .js files.

That content can be found at the following locations:

- Movie Genres: /public/components/checkout/pitch-box.js
- Contact Us Subject Line: /public/components/contact-us-form/contact-us-form.js

Other content not found in either of the above locations will more than likely be found in the .html files associated with most of the components in the folders contained by /public/components.

Please contact Justin Tulk (justintulk@gmail.com) with any additional questions.
