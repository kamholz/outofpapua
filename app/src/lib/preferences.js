export const defaultPreferences = {
  baseMap: 'cartodb-positron',
  hideGlossLang: false,
  listPageSize: 50,
  tablePageSize: 100,
};

export const maxZoom = 13;

export const pageMax = 2000;

export const pageSizeValues = {
  listPageSize: [50, 100, 200, 500],
  tablePageSize: [100, 500, 1000, 2000],
};

export const schema = {
  type: 'object',
  properties: {
    baseMap: {
      description: 'last used base map',
      type: 'string',
      enum: ['cartodb-positron', 'esri-gray-canvas', 'esri-shaded-relief'],
    },
    hideGlossLang: {
      description: 'whether to hide showing the gloss language in the interface',
      type: 'boolean',
    },
    listPageSize: {
      description: 'how many records to show in list view',
      type: 'integer',
      enum: pageSizeValues.listPageSize,
    },
    mapView: {
      description: 'saved map view',
      type: 'object',
      properties: {
        latLng: {
          type: 'array',
          items: { type: 'number' },
          minItems: 2,
          maxItems: 2,
        },
        zoom: {
          type: 'integer',
          minimum: 1,
          maximum: 13,
        },
      },
      required: ['latLng', 'zoom'],
      additionalProperties: false,
    },
    tablePageSize: {
      description: 'how many records to show in table view',
      type: 'integer',
      enum: pageSizeValues.tablePageSize,
    },
  },
  additionalProperties: false,
};
