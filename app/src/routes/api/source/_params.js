export const allowed = new Set(['category', 'language_id', 'note', 'reference', 'reference_full']);
export const allowedAdmin = new Set([...allowed, 'formatting', 'ipa_conversion_rule', 'public', 'use_ph_for_ipa']);
export const required = new Set(['language_id', 'reference']);
export const nfc = new Set(['reference']);
