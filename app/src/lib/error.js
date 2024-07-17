export const errorStrings = {
  editableEntry: 'entry does not exist or is not from editable source',
  insufficientSearch: 'insufficient search parameters',
  missing: 'missing required parameters',
  noUpdatable: 'no updatable parameters provided',
  originLang: 'only borrowed items can have an origin language indicated',
};

export function jsonError(error, query) {
  const body = { error };
  if (query) {
    body.query = query;
  }
  return new Response(JSON.stringify(body), {
    status: 400,
    headers: {
      'content-type': 'application/json',
    },
  });
}
