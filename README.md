# gatsby-plugin-postcss-less

Provides drop-in support for LESS stylesheets chained with _postcss_ plugin
support.

## Install

`npm install --save gatsby-plugin-postcss-less`

## How to use

1.  Include the plugin in your `gatsby-config.js` file.
2.  Write your stylesheets in LESS (with your desired _postcss_ featureset)
    and require/import them

```javascript
// in gatsby-config.js
plugins: [
  {
    resolve: `gatsby-plugin-postcss-less`,
    options: {
      postCssPlugins: [somePostCssPlugin()],
      precision: 8, // SASS default: 5
    },
  },
];
```