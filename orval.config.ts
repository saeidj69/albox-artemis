import { defineConfig } from 'orval'

export default defineConfig({
  api: {
    input: {
      target: './src/api/config/swagger.yaml',
      filters: {
        tags: [
          'Map',
          'Auth',
          'Media',
          'Order',
          'Basket',
          'Barook',
          'Version',
          'Profile',
          'Calendar',
          'Addresses',
          'Catalogue',
          'Incentives',
          'Client State',
          'Clients Page',
          'Impersonation',
          'Wallet Management',
          'Payment Management',
        ],
      },
    },
    output: {
      target: './src/api/functions',
      schemas: './src/api/models',
      client: 'react-query',
      mode: 'tags',
      clean: true,
      mock: true,
      override: {
        mutator: {
          path: './src/api/mutator/index.ts',
          name: 'mutator',
        },
        fetch: {
          includeHttpResponseReturnType: false,
        },
        operations: {
          listBrands_Listing: {
            query: {
              useInfinite: true,
              useInfiniteQueryParam: 'cursor',
            },
          },
          searchProducts_Listing: {
            query: {
              useInfinite: true,
              useInfiniteQueryParam: 'cursor',
            },
          },
          listCustomerOrders: {
            query: {
              useInfinite: true,
              useInfiniteQueryParam: 'cursor',
            },
          },
          getPreparedPageProducts: {
            query: {
              useInfinite: true,
              useInfiniteQueryParam: 'cursor',
            },
          },
        },
      },
    },
    hooks: {
      afterAllFilesWrite: ['prettier --write', 'eslint --fix'],
    },
  },
  mapsi: {
    input: {
      target: './src/api/config/swagger-mapsi.yaml',
    },
    output: {
      target: './src/api/functions/mapsi',
      schemas: './src/api/models/mapsi',
      client: 'react-query',
      mode: 'tags',
      clean: true,
      mock: true,
      override: {
        mutator: {
          path: './src/api/mutator/mapsi.ts',
          name: 'mapsiMutator',
        },
        operations: {
          searchAddresses: {
            query: {
              useQuery: true,
            },
          },
          getSubdivision: {
            query: {
              useQuery: true,
            },
          },
          reverseGeocode: {
            query: {
              useQuery: true,
            },
          },
        },
      },
    },
    hooks: {
      afterAllFilesWrite: ['prettier --write', 'eslint --fix'],
    },
  },
  tyche: {
    input: {
      target: './src/api/config/swagger-tyche.yaml',
    },
    output: {
      target: './src/api/functions/tyche',
      schemas: './src/api/models/tyche',
      client: 'react-query',
      mode: 'tags',
      clean: true,
      mock: true,
      override: {
        mutator: {
          path: './src/api/mutator/tyche.ts',
          name: 'mutator',
        },
        fetch: {
          includeHttpResponseReturnType: false,
        },
        operations: {
          listClientPlays: {
            query: {
              useInfinite: true,
              useInfiniteQueryParam: 'cursor',
            },
          },
        },
      },
    },
    hooks: {
      afterAllFilesWrite: ['prettier --write', 'eslint --fix'],
    },
  },
})
