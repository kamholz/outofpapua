export const errorStrings = {
  editableEntry: 'entry does not exist or is not from editable source',
  insufficientSearch: 'insufficient search parameters',
  missing: 'missing required parameters',
  noUpdatable: 'no updatable parameters provided',
  originLang: 'only borrowed items can have an origin language indicated',
};

export function jsonError(error) {
  return new Response(JSON.stringify({ error }), {
    status: 400,
    headers: {
      'content-type': 'application/json',
    },
  });
}
