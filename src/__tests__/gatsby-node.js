describe(`gatsby-plugin-postcss-less`, () => {
  jest.mock(`extract-text-webpack-plugin`, () => {
    return {
      extract(...args) {
        return { extractTextCalledWithArgs: args };
      }
    };
  });

  const { modifyWebpackConfig } = require(`../gatsby-node`);
  const cssLoader = expect.stringMatching(/^css/);
  [
    {
      stages: [`develop`],
      loaderKeys: [`less`, `lessModules`],
      loaderConfig(lessLoader) {
        return {
          loaders: expect.arrayContaining([cssLoader, `postcss`, lessLoader])
        };
      }
    },
    {
      stages: [`build-css`],
      loaderKeys: [`less`, `lessModules`],
      loaderConfig(lessLoader) {
        return {
          loader: {
            extractTextCalledWithArgs: expect.arrayContaining([
              expect.arrayContaining([cssLoader, `postcss`, lessLoader])
            ])
          }
        };
      }
    },
    {
      stages: [`develop-html`, `build-html`],
      loaderKeys: [`lessModules`],
      loaderConfig(lessLoader) {
        return {
          loader: {
            extractTextCalledWithArgs: expect.arrayContaining([
              expect.arrayContaining([cssLoader, `postcss`, lessLoader])
            ])
          }
        };
      }
    },
    {
      stages: [`build-javascript`],
      loaderKeys: [`lessModules`],
      loaderConfig(lessLoader) {
        return {
          loader: {
            extractTextCalledWithArgs: expect.arrayContaining([
              expect.arrayContaining([cssLoader, lessLoader])
            ])
          }
        };
      }
    }
  ].forEach(({ stages, loaderKeys, loaderConfig }) => {
    stages.forEach(stage => {
      describe(`stage: ${stage}`, () => {
        [
          { options: {}, lessLoader: `less?{}` },
          {
            options: { precision: 8 },
            lessLoader: `less?${JSON.stringify({ precision: 8 }).toString()}`
          },
          {
            options: { includePaths: [] },
            lessLoader: `less?${JSON.stringify({
              includePaths: []
            }).toString()}`
          },
          {
            options: { precision: 8, includePaths: [] },
            lessLoader: `less?${JSON.stringify({
              precision: 8,
              includePaths: []
            }).toString()}`
          },
          {
            options: { includePaths: [`./node_modules`, `./path`] },
            lessLoader: `less?${JSON.stringify({
              includePaths: [`./node_modules`, `./path`]
            }).toString()}`
          }
        ].forEach(({ options, lessLoader }) => {
          const stringified = JSON.stringify(options);

          it(`modifies webpack config with options ${stringified}`, () => {
            const config = { loader: jest.fn() };
            const modified = modifyWebpackConfig({ config, stage }, options);

            expect(modified).toBe(config);

            loaderKeys.forEach(loaderKey =>
              expect(config.loader).toBeCalledWith(
                loaderKey,
                expect.objectContaining(loaderConfig(lessLoader))
              )
            );
          });
        });
      });
    });
  });
});
