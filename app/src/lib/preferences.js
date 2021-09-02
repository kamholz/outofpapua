export const defaultPreferences = {
  hideGlossLang: false,
  tablePageSize: 100,
  listPageSize: 50,
};

export const pageMax = 2000;

export const pageSizeValues = {
  tablePageSize: [100, 500, 1000, 2000],
  listPageSize: [50, 100, 200, 500],
};

export const schema = {
  type: 'object',
  properties: {
    hideGlossLang: {
      description: 'whether to hide showing the gloss language in the interface',
      type: 'boolean',
    },
    tablePageSize: {
      description: 'how many records to show in table view',
      type: 'integer',
      enum: pageSizeValues.tablePageSize,
    },
    listPageSize: {
      description: 'how many records to show in list view',
      type: 'integer',
      enum: pageSizeValues.listPageSize,
    },
  },
  additionalProperties: false,
};
