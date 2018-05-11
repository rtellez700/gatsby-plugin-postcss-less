const ExtractTextPlugin = require(`extract-text-webpack-plugin`);
const { cssModulesConfig } = require(`gatsby-1-config-css-modules`);

exports.modifyWebpackConfig = ({ config, stage }, options) => {
  // Pass in plugins regardless of stage.
  // If none specified, fallback to Gatsby default postcss plugins.
  if (options.postCssPlugins) {
    config.merge(current => {
      current.postcss = options.postCssPlugins;
      return current;
    });
  }

  const lessFiles = /\.less$/;
  const lessModulesFiles = /\.module\.s[ac]ss$/;
  const lessLoader = `less?${JSON.stringify(options)}`;

  switch (stage) {
    case `develop`: {
      config.loader(`less`, {
        test: lessFiles,
        exclude: lessModulesFiles,
        loaders: [`style`, `css`, `postcss`, lessLoader]
      });

      config.loader(`lessModules`, {
        test: lessModulesFiles,
        loaders: [`style`, cssModulesConfig(stage), `postcss`, lessLoader]
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
          lessLoader
        ])
      });

      config.loader(`lessModules`, {
        test: lessModulesFiles,
        loader: ExtractTextPlugin.extract(`style`, [
          cssModulesConfig(stage),
          `postcss`,
          lessLoader
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
          lessLoader
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
          lessLoader
        ])
      });
      return config;
    }
    default: {
      return config;
    }
  }
};
