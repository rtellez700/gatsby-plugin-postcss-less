const ExtractTextPlugin = require(`extract-text-webpack-plugin`);
const { cssModulesConfig } = require(`gatsby-1-config-css-modules`);
const path = require(`path`);

exports.modifyWebpackConfig = ({ config, stage }, options) => {
  const lessFiles = /\.less$/;
  const lessModulesFiles = /\.module\.less$/;

  // Pass in plugins regardless of stage.
  // If none specified, fallback to Gatsby default postcss plugins.
  if (options.postCssPlugins) {
    config.merge(current => {
      current.postcss = options.postCssPlugins;
      return current;
    });
  }

  let themeJson = ``;

  if (typeof options.theme === "string" && options.theme !== ``) {
    try {
      const themeFile = require(path.resolve(options.theme));
    } catch (error) {
      throw new Error(
        `Couldn't conver js to json object at path: '${
          options.theme
        }'\n${error}`
      );
    }
  } else if (typeof options.theme === `object`) {
    try {
      themeJson = JSON.stringify(options.theme);
    } catch (error) {
      throw new Error(
        `Couldn't convert javascript object to json object.\n${error}`
      );
    }
  }

  let lessLoaderDev = ``;
  let lessLoaderProd = ``;

  if (themeJson) {
    lessLoaderDev = `less?{"sourceMap":true,"modifyVars":${themeJson}}`;
    lessLoaderProd = `less?{"modifyVars":${themeJson}}`;
  } else {
    lessLoaderDev = `less?{"sourceMap":true}`;
    lessLoaderProd = `less`;
  }

  switch (stage) {
    case `develop`: {
      config.loader(`less`, {
        test: lessFiles,
        exclude: lessModulesFiles,
        loaders: [`style`, `css`, `postcss`, lessLoaderDev]
      });

      config.loader(`lessModules`, {
        test: lessModulesFiles,
        loaders: [`style`, cssModulesConfig(stage), `postcss`, lessLoaderDev]
      });
      return config;
    }
    case `build-css`: {
      config.loader(`less`, {
        test: lessFiles,
        exclude: lessModulesFiles,
        loader: ExtractTextPlugin.extract([
          `css?minimize`,
          `postcss`,
          lessLoaderProd
        ])
      });

      config.loader(`lessModules`, {
        test: lessModulesFiles,
        loader: ExtractTextPlugin.extract(`style`, [
          cssModulesConfig(stage),
          `postcss`,
          lessLoaderProd
        ])
      });
      return config;
    }
    case `develop-html`:
    case `build-html`: {
      config.loader(`less`, {
        test: lessFiles,
        exclude: lessModulesFiles,
        loader: `null`
      });

      config.loader(`lessModules`, {
        test: lessModulesFiles,
        loader: ExtractTextPlugin.extract(`style`, [
          cssModulesConfig(stage),
          `postcss`,
          lessLoaderProd
        ])
      });
      return config;
    }
    case `build-javascript`: {
      config.loader(`less`, {
        test: lessFiles,
        exclude: lessModulesFiles,
        loader: `null`
      });

      config.loader(`lessModules`, {
        test: lessModulesFiles,
        loader: ExtractTextPlugin.extract(`style`, [
          cssModulesConfig(stage),
          lessLoaderProd
        ])
      });
      return config;
    }
    default: {
      return config;
    }
  }
};
