--
-- PostgreSQL database dump
--

\restrict b1oK5ktbWFySMtmqzEMf14JvKQpnCg0BRx4WDLtZha6iJN5hiBSFGGuyLG55Xm4

-- Dumped from database version 17.6 (Ubuntu 17.6-1.pgdg24.04+1)
-- Dumped by pg_dump version 17.6 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: pgcrypto; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA pgcrypto;


--
-- Name: pgtrgm; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA pgtrgm;


--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

-- *not* creating schema, since initdb creates it


--
-- Name: pg_trgm; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA pgtrgm;


--
-- Name: EXTENSION pg_trgm; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_trgm IS 'text similarity measurement and index searching based on trigrams';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA pgcrypto;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: entry_origin; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.entry_origin AS ENUM (
    'borrowed',
    'inherited',
    'mixed'
);


--
-- Name: js_var; Type: DOMAIN; Schema: public; Owner: -
--

CREATE DOMAIN public.js_var AS text
	CONSTRAINT js_var_check CHECK ((VALUE ~ '^[a-zA-Z0-9_]+$'::text));


--
-- Name: reflex_origin; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.reflex_origin AS ENUM (
    'borrowed',
    'inherited'
);


--
-- Name: usr_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.usr_role AS ENUM (
    'admin',
    'editor',
    'contributor',
    'viewer'
);


--
-- Name: array_reverse(anyarray); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.array_reverse(anyarray) RETURNS anyarray
    LANGUAGE sql IMMUTABLE STRICT PARALLEL SAFE
    AS $_$
SELECT ARRAY(
    SELECT $1[i]
    FROM generate_subscripts($1,1) AS s(i)
    ORDER BY i DESC
);
$_$;


--
-- Name: created_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.created_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
  DECLARE
    current_usr_id integer;
  BEGIN
    current_usr_id := current_setting('outofpapua.usr_id', true)::integer;
    IF current_usr_id
    THEN
      NEW.created_at := now();
      NEW.created_at_usr_id := current_usr_id;
    END IF;
    RETURN NEW;
  END;
$$;


--
-- Name: dedupe_entries(integer[]); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.dedupe_entries(ids integer[]) RETURNS SETOF integer
    LANGUAGE plpgsql
    AS $$
  DECLARE
    id integer;
    unlinked integer[];
  BEGIN
    IF cardinality(ids) < 2 THEN
      RETURN;
    END IF;
    SELECT array_agg(s.id ORDER BY s.id) INTO unlinked
    FROM (
      SELECT unnest(ids) AS id
    ) s
    WHERE NOT EXISTS (SELECT FROM set_member WHERE set_member.entry_id = s.id);
    IF cardinality(unlinked) = cardinality(ids) THEN
      unlinked := unlinked[2:];
    END IF;
    IF cardinality(unlinked) = 0 THEN
      RETURN;
    END IF;
    DELETE FROM sense WHERE sense.entry_id = ANY(unlinked);
    DELETE FROM entry WHERE entry.id = ANY(unlinked);
    FOREACH id IN ARRAY unlinked LOOP
      RETURN NEXT id;
    END LOOP;
  END;
$$;


--
-- Name: degr(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.degr(txt text) RETURNS text
    LANGUAGE plpgsql IMMUTABLE PARALLEL SAFE
    AS $_$
  BEGIN
    txt := lower(normalize(txt, NFD));
    txt := regexp_replace(txt, 'b[\u0331\u0332]', 'v', 'g');
    txt := regexp_replace(txt, 'p[\u0331\u0332]', 'f', 'g');
    txt := regexp_replace(txt, '[-=ˈˌ\u0300-\u036f\u1ab0-\u1aff\u1dc0-\u1dff\u20d0-\u20ff]', '', 'g');
    txt := regexp_replace(txt, 'β', 'v', 'g');
    txt := regexp_replace(txt, 'ɛ', 'e', 'g');
    txt := regexp_replace(txt, 'ɸ', 'f', 'g');
    txt := regexp_replace(txt, 'ɡ', 'g', 'g');
    txt := regexp_replace(txt, 'ʲ', 'j', 'g');
    txt := regexp_replace(txt, 'ᵐ', 'm', 'g');
    txt := regexp_replace(txt, 'ⁿ', 'n', 'g');
    txt := regexp_replace(txt, '[ᵑŋ]', 'ng', 'g');
    txt := regexp_replace(txt, 'ɔ', 'o', 'g');
    txt := regexp_replace(txt, 'ʷ', 'w', 'g');
    --txt := regexp_replace(txt, '^([^()]+), .+$', '\1');
    txt := regexp_replace(txt, '[()]', '', 'g');
    txt := regexp_replace(txt, ',? (?:k\.o\.|s\.[jm]\.|etc\.|dll\.|spp?\.)$', '');
    RETURN normalize(txt);
  END;
$_$;


--
-- Name: degr_fuzzy(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.degr_fuzzy(txt text) RETURNS text
    LANGUAGE plpgsql IMMUTABLE PARALLEL SAFE
    AS $_$
  BEGIN
    txt := lower(normalize(txt, NFD));
    txt := regexp_replace(txt, 'b[\u0331\u0332]', 'v', 'g');
    txt := regexp_replace(txt, 'p[\u0331\u0332]', 'f', 'g');
    txt := regexp_replace(txt, '[-=ˈˌ\u0300-\u036f\u1ab0-\u1aff\u1dc0-\u1dff\u20d0-\u20ff]', '', 'g');
    txt := regexp_replace(txt, 'β', 'v', 'g');
    txt := regexp_replace(txt, 'ɛ', 'e', 'g');
    txt := regexp_replace(txt, 'ɸ', 'f', 'g');
    txt := regexp_replace(txt, 'ɡ', 'g', 'g');
    txt := regexp_replace(txt, 'ʲ', 'j', 'g');
    txt := regexp_replace(txt, 'ᵐ', 'm', 'g');
    txt := regexp_replace(txt, 'ⁿ', 'n', 'g');
    txt := regexp_replace(txt, '[ᵑŋ]', 'ng', 'g');
    txt := regexp_replace(txt, 'ɔ', 'o', 'g');
    txt := regexp_replace(txt, 'ʷ', 'w', 'g');
    --begin fuzzy
    txt := regexp_replace(txt, '\([^()]+\)', '', 'g');
    txt := regexp_replace(txt, '\[[^[\]]+\]', '', 'g');
    txt := regexp_replace(txt, '[()[\]]', '', 'g');
    txt := regexp_replace(txt, '^\s+|\s+$', '', 'g');
    --end fuzzy
    txt := regexp_replace(txt, ',? (?:k\.o\.|s\.[jm]\.|etc\.|dll\.|spp?\.)$', '');
    RETURN normalize(txt);
  END;
$_$;


--
-- Name: degr_regex(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.degr_regex(txt text) RETURNS text
    LANGUAGE plpgsql IMMUTABLE PARALLEL SAFE
    AS $_$
  BEGIN
    txt := normalize(txt, NFD);
    txt := regexp_replace(txt, 'b[\u0331\u0332]', 'v', 'g');
    txt := regexp_replace(txt, 'p[\u0331\u0332]', 'f', 'g');
    txt := regexp_replace(txt, '[=ˈˌ\u0300-\u036f\u1ab0-\u1aff\u1dc0-\u1dff\u20d0-\u20ff]', '', 'g');
    --txt := regexp_replace(txt, '^-|-$', '', 'g');
    txt := regexp_replace(txt, 'β', 'v', 'g');
    txt := regexp_replace(txt, 'ɛ', 'e', 'g');
    txt := regexp_replace(txt, 'ɸ', 'f', 'g');
    txt := regexp_replace(txt, 'ɡ', 'g', 'g');
    txt := regexp_replace(txt, 'ʲ', 'j', 'g');
    txt := regexp_replace(txt, 'ᵐ', 'm', 'g');
    txt := regexp_replace(txt, 'ⁿ', 'n', 'g');
    txt := regexp_replace(txt, '[ᵑŋ]', 'ng', 'g');
    txt := regexp_replace(txt, 'ɔ', 'o', 'g');
    txt := regexp_replace(txt, 'ʷ', 'w', 'g');
    --txt := regexp_replace(txt, '\\[()]', '', 'g');
    RETURN normalize(txt);
  END;
$_$;


--
-- Name: delete_ipa_conversion_lib(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.delete_ipa_conversion_lib() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
  BEGIN
    IF EXISTS (SELECT FROM ipa_conversion_rule WHERE OLD.name = ANY(lib)) THEN
      RAISE EXCEPTION 'lib "%" is still referenced from rules', OLD.name;
    END IF;
    RETURN OLD;
  END;
$$;


--
-- Name: delete_ipa_conversion_rule(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.delete_ipa_conversion_rule() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
  BEGIN
    IF EXISTS (SELECT FROM ipa_conversion_rule WHERE OLD.name = ANY(chain_before) OR OLD.name = ANY(chain_after)) THEN
      RAISE EXCEPTION 'rule "%" is still referenced from other rules', OLD.name;
    END IF;
    RETURN OLD;
  END;
$$;


--
-- Name: delete_orphaned_entry(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.delete_orphaned_entry() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
  BEGIN
    IF (
      SELECT source.editable
      FROM entry
      JOIN source ON source.id = entry.source_id
      WHERE entry.id = OLD.entry_id
    ) AND NOT EXISTS (
      SELECT
      FROM set_member
      WHERE entry_id = OLD.entry_id
    )
    THEN
      DELETE FROM sense WHERE entry_id = OLD.entry_id;
      DELETE FROM entry WHERE id = OLD.entry_id;
    END IF;
    RETURN NULL;
  END;
$$;


--
-- Name: delete_orphaned_record(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.delete_orphaned_record() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
  BEGIN
    IF NOT EXISTS (SELECT FROM entry WHERE entry.record_id = OLD.record_id)
    THEN
      DELETE FROM record WHERE id = OLD.record_id;
    END IF;
    RETURN NULL;
  END;
$$;


--
-- Name: delete_orphaned_set(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.delete_orphaned_set() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
  BEGIN
    IF NOT EXISTS (SELECT FROM set_member WHERE set_member.set_id = OLD.set_id)
    THEN
      DELETE FROM set WHERE id = OLD.set_id;
    END IF;
    RETURN NULL;
  END;
$$;


--
-- Name: delete_orphaned_set_group(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.delete_orphaned_set_group() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
  BEGIN
    IF OLD.set_group_id IS NOT NULL AND NOT EXISTS (
      SELECT FROM set WHERE set.set_group_id = OLD.set_group_id HAVING count(*) > 1
    )
    THEN
      DELETE FROM set_group WHERE id = OLD.set_group_id;
    END IF;
    RETURN NULL;
  END;
$$;


--
-- Name: delete_source_entries(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.delete_source_entries(source_arg integer) RETURNS void
    LANGUAGE sql
    AS $$
delete from sense 
using entry
where sense.entry_id = entry.id and entry.source_id = source_arg;

set constraints entry_record_id_fkey deferred;
delete from entry where source_id = source_arg;
$$;


--
-- Name: entry_log_details(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.entry_log_details(entry_id_arg integer) RETURNS jsonb
    LANGUAGE sql STABLE PARALLEL SAFE
    AS $$
  SELECT jsonb_build_object(
    'entry_id', entry_id_arg,
    'entry_headword', entry.headword, 
    'entry_senses', entry.senses,
    'entry_source_id', source.id,
    'entry_source_reference', source.reference, 
    'entry_language_id', language.id,
    'entry_language_name', language.name
  )
  FROM entry
  JOIN source ON source.id = entry.source_id
  JOIN language ON language.id = source.language_id
  WHERE entry.id = entry_id_arg
$$;


--
-- Name: entry_log_update(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.entry_log_update() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
  DECLARE
    current_usr_id integer;
    set_id_var integer;
  BEGIN
    IF (OLD.origin IS DISTINCT FROM NEW.origin OR OLD.origin_language_id IS DISTINCT FROM NEW.origin_language_id)
      AND EXISTS (SELECT FROM set_member sm WHERE sm.entry_id = NEW.id)
    THEN
      current_usr_id := get_current_usr_id();
      FOR set_id_var IN SELECT set_id FROM set_member sm WHERE sm.entry_id = NEW.id
      LOOP
        IF OLD.origin IS DISTINCT FROM NEW.origin THEN
          INSERT INTO set_log (set_id, usr_id, event, details)
          VALUES (set_id_var, current_usr_id, 'entry_origin', entry_log_details(NEW.id) || jsonb_build_object('text', NEW.origin));
        END IF;
        IF OLD.origin_language_id IS DISTINCT FROM NEW.origin_language_id THEN
          INSERT INTO set_log (set_id, usr_id, event, details)
          VALUES (set_id_var, current_usr_id, 'entry_origin_language_id', entry_log_details(NEW.id) || language_log_details(NEW.origin_language_id));
        END IF;
      END LOOP;
    END IF;
    IF (OLD.headword IS DISTINCT FROM NEW.headword OR OLD.senses::text IS DISTINCT FROM NEW.senses::text)
      AND (SELECT source.editable FROM source WHERE source.id = NEW.source_id)
    THEN
      current_usr_id := get_current_usr_id();
      FOR set_id_var IN SELECT set_id FROM set_member sm WHERE sm.entry_id = NEW.id
      LOOP
        INSERT INTO set_log (set_id, usr_id, event, details)
        VALUES (set_id_var, current_usr_id, 'entry_updated', entry_log_details(NEW.id));
      END LOOP;
    END IF;
    RETURN NULL;
  END;
$$;


--
-- Name: extract_ph(jsonb); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.extract_ph(record_data jsonb) RETURNS TABLE(headword text, headword_ph text)
    LANGUAGE sql IMMUTABLE PARALLEL SAFE
    AS $$
  SELECT DISTINCT ON (b.value) b.value AS headword, b.lead_value AS headword_ph
  FROM (
    SELECT a.*, lead(a.marker) OVER () AS lead_marker, lead(a.value) OVER () AS lead_value
    FROM (
      SELECT marker, value FROM unnest_record(record_data) 
      WHERE unnest_record.marker IN ('lx','se','ph')
      ORDER BY seq
    ) a
  ) b
  WHERE b.marker IN ('lx', 'se') AND b.lead_marker = 'ph';
$$;


--
-- Name: extract_va(jsonb); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.extract_va(record_data jsonb) RETURNS TABLE(headword text, headword_va text)
    LANGUAGE plpgsql IMMUTABLE PARALLEL SAFE
    AS $$
DECLARE
  row record;
BEGIN
  FOR row IN
    SELECT marker, value FROM unnest_record(record_data)
    WHERE marker IN ('lx','se','va')
    ORDER BY seq
  LOOP
    IF row.marker = 'lx' OR row.marker = 'se' THEN
      headword := row.value;
    ELSIF headword IS NOT NULL THEN
      headword_va := row.value;
      RETURN NEXT;
    END IF;
  END LOOP;
END;
$$;


--
-- Name: fill_multi_set(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fill_multi_set() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
  BEGIN
    NEW.multi_set := (SELECT multi_set FROM entry WHERE entry.id = NEW.entry_id);
    RETURN NEW;
  END;
$$;


--
-- Name: get_current_usr_id(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_current_usr_id() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  SELECT nullif(current_setting('outofpapua.usr_id', true), '')::integer;
$$;


--
-- Name: handle_orphaned_multi_set(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_orphaned_multi_set() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
  BEGIN
    IF NOT EXISTS (SELECT FROM set_member WHERE set_member.entry_id = OLD.entry_id)
    THEN
      UPDATE entry SET multi_set = false WHERE entry.id = OLD.entry_id;
    END IF;
    RETURN NULL;
  END;
$$;


--
-- Name: ipa_conversion_rule_to_javascript(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.ipa_conversion_rule_to_javascript(name text) RETURNS text
    LANGUAGE sql STABLE
    AS $$SELECT '(x, ctx = {}) => (' || trim(trailing ';' from ipa_conversion_rule_to_javascript_chain(name)) || ')(x.normalize("NFD"), ctx).normalize();';$$;


--
-- Name: ipa_conversion_rule_to_javascript_chain(text, text[]); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.ipa_conversion_rule_to_javascript_chain(namearg text, exclude text[] DEFAULT NULL::text[]) RETURNS text
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
  code text;
  chain text[];
  item text;
  replacement jsonb;
  rule ipa_conversion_rule%rowtype;
BEGIN
  SELECT * INTO rule FROM ipa_conversion_rule WHERE name = namearg;
  code := '(x) => {';

  IF rule.chain_after IS NOT NULL THEN
    chain := array_reverse(rule.chain_after);
    FOREACH item IN ARRAY rule.chain_after LOOP
      IF exclude IS NULL OR item != all(exclude) THEN
        code := code || 'const ' || item || ' = ' || ipa_conversion_rule_to_javascript_chain(item);
      END IF;
    END LOOP;
  END IF;

  IF rule.replacements IS NOT NULL THEN
    code := code || 'const _replace = (x) => x';
    FOR replacement IN SELECT jsonb_array_elements_text(rule.replacements) LOOP
      code := code || '.replace(/' || (replacement->>0) || '/gu, "' || (replacement->>1) || '")';
    END LOOP;
    code := code || ';';
    chain := chain || '_replace'::text;
  END IF;

  IF rule.function IS NOT NULL THEN
    IF rule.lib IS NOT NULL THEN
      FOREACH item IN ARRAY rule.lib LOOP
        code := code || 'const ' || item || ' = ' || (SELECT icl.code FROM ipa_conversion_lib icl WHERE name = item) || ';';
      END LOOP;
    END IF;
    code := code || 'const _func = ' || rule.function || ';';
    chain := chain || '_func'::text;
  END IF;

  IF rule.chain_before IS NOT NULL THEN
    chain := chain || array_reverse(rule.chain_before);
    FOREACH item IN ARRAY rule.chain_before LOOP
      IF exclude IS NULL OR item != all(exclude) THEN
        code := code || 'const ' || item || ' = ' || ipa_conversion_rule_to_javascript_chain(item);
      END IF;
    END LOOP;
  END IF;

  IF exclude IS NOT NULL THEN
    FOREACH item IN ARRAY exclude LOOP
      chain := array_remove(chain, item);
    END LOOP;
  END IF;

  code := code || 'return ' || array_to_string(chain, '(') || '(' || (CASE WHEN rule.lowercase THEN 'x.toLowerCase()' ELSE 'x' END) || repeat(')', cardinality(chain)) || ';};';

  RETURN code;
END;
$$;


--
-- Name: jsonb_array_to_string(jsonb, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.jsonb_array_to_string(arg jsonb, sep text) RETURNS text
    LANGUAGE sql IMMUTABLE PARALLEL SAFE
    AS $$
  SELECT array_to_string(ARRAY(SELECT jsonb_array_elements_text(arg)), sep)
$$;


--
-- Name: language_dialects_trigger(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.language_dialects_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
  BEGIN
    PERFORM repopulate_language_dialects();
    RETURN NULL;
  END;
$$;


--
-- Name: language_log_details(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.language_log_details(language_id_arg integer) RETURNS jsonb
    LANGUAGE sql STABLE PARALLEL SAFE
    AS $$
  SELECT jsonb_build_object(
    'language_id', language_id_arg,
    'language_name', language.name
  )
  FROM language
  WHERE language.id = language_id_arg
$$;


--
-- Name: language_parent_id_check(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.language_parent_id_check() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF NEW.parent_id IS NOT NULL AND EXISTS (
    WITH RECURSIVE SUBGROUP(id) AS (
      SELECT id FROM LANGUAGE WHERE id = NEW.id
      UNION ALL
      SELECT language.id FROM subgroup JOIN language ON language.parent_id = subgroup.id
    )
    SELECT id FROM subgroup WHERE id = NEW.parent_id
  ) THEN
    RAISE EXCEPTION 'tried to set parent language to descendant or self' USING CONSTRAINT = 'language_parent_id_check';
  END IF;
  RETURN NULL;
END;
$$;


--
-- Name: language_tree_dialects_trigger(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.language_tree_dialects_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
  BEGIN
    PERFORM repopulate_language_tree();
    PERFORM repopulate_language_dialects();
    RETURN NULL;
  END;
$$;


--
-- Name: language_tree_trigger(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.language_tree_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
  BEGIN
    PERFORM repopulate_language_tree();
    RETURN NULL;
  END;
$$;


--
-- Name: log_row(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.log_row() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
  DECLARE
    current_usr_id integer;
  BEGIN
    current_usr_id := get_current_usr_id();
    IF TG_OP = 'INSERT'
    THEN INSERT INTO log (
        usr_id, relname, operation, new_val
      ) VALUES (
        current_usr_id, TG_RELNAME, TG_OP, row_to_json(NEW)
      );
      RETURN NEW;
    ELSIF TG_OP = 'UPDATE'
    THEN
      INSERT INTO log (
        usr_id, relname, operation, old_val, new_val
      )
      VALUES (
        current_usr_id, TG_RELNAME, TG_OP, row_to_json(OLD), row_to_json(NEW)
      );
      RETURN NEW;
    ELSIF TG_OP = 'DELETE'
    THEN
      INSERT INTO log (
        usr_id, relname, operation, old_val
      )
      VALUES (
        current_usr_id, TG_RELNAME, TG_OP, row_to_json(OLD)
      );
      RETURN OLD;
    END IF;
  END;
$$;


--
-- Name: modified_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.modified_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
  DECLARE
    current_usr_id integer;
  BEGIN
    current_usr_id := current_setting('outofpapua.usr_id', true)::integer;
    IF current_usr_id
    THEN
      NEW.modified_at := now();
      NEW.modified_at_usr_id := current_usr_id;
    END IF;
    RETURN NEW;
  END;
$$;


--
-- Name: other_sets(integer, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.other_sets(entry_id_arg integer, set_id_arg integer) RETURNS json[]
    LANGUAGE sql STABLE
    AS $$
  SELECT nullif(array(
    SELECT json_build_object(
      'id', set.id,
      'name', coalesce(sna.name_auto->>'txt', set.id::text)
    )
    FROM set
    JOIN set_name_auto sna ON sna.id = set.id
    WHERE set.id != set_id_arg AND EXISTS (
      SELECT FROM set_member sm WHERE sm.set_id = set.id AND sm.entry_id = entry_id_arg
    )
    ORDER BY sna.name_auto->>'txt', lpad(set.id::text, 10, '0')
  ), '{}')
$$;


--
-- Name: populate_set_details_cached_for_set(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.populate_set_details_cached_for_set(set_id_arg integer) RETURNS void
    LANGUAGE sql
    AS $$
  INSERT INTO set_details_cached (id, author_name, name_auto, members)
  SELECT id, author_name, name_auto, members
  FROM set_details
  WHERE id = set_id_arg;

  INSERT INTO set_details_public_cached (id, author_name, name_auto, members)
  SELECT id, author_name, name_auto, members
  FROM set_details_public
  WHERE id = set_id_arg;
$$;


--
-- Name: reflex_check(text, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.reflex_check(reflex text, headword text) RETURNS boolean
    LANGUAGE plpgsql IMMUTABLE
    AS $_$
DECLARE
  match text[];
  segment text;
  depth smallint;
  empty boolean;
BEGIN
  match := regexp_match(reflex, '^([^|]*)\|([^|]+)\|([^|]*)$');
  IF 
    -- doesn't have reflex demarcated with |
    match IS NULL OR
    -- doesn't match headword
    NOT regexp_replace(reflex, '\||<<|>>', '', 'g') = headword OR
    -- has infix marked outside of reflex
    match[1] ~ '<<|>>' OR match[3] ~ '<<|>>'
  THEN
    RETURN FALSE;
  END IF;
  IF match[2] ~ '<<|>>' THEN
    IF match[2] ~ '<{3,}|>{3,}' THEN
      RETURN FALSE;
    END IF;
    depth := 0;
    FOR segment IN SELECT regexp_split_to_table(match[2], '(?=<<|>>)|(?<=<<|>>)')
    LOOP
      IF segment = '<<' THEN
        IF depth = 1 THEN
          RETURN FALSE;
        END IF;
        depth := depth + 1;
        empty := TRUE;
      ELSIF segment = '>>' THEN
        IF depth = 0 OR empty THEN
          RETURN FALSE;
        END IF;
        depth := depth - 1;
      ELSIF depth = 1 THEN
        empty := FALSE;
      END IF;
    END LOOP;
    IF depth != 0 THEN
      RETURN FALSE;
    END IF;
  END IF;
  RETURN TRUE;
END;
$_$;


--
-- Name: repopulate_degr(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.repopulate_degr() RETURNS void
    LANGUAGE sql
    AS $$
  UPDATE entry SET headword_degr = degr(headword), headword_ipa_degr = degr(headword_ipa);
  UPDATE sense_gloss SET txt_degr = degr(txt), txt_degr_fuzzy = degr_fuzzy(txt);
$$;


--
-- Name: repopulate_language_dialects(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.repopulate_language_dialects() RETURNS void
    LANGUAGE sql
    AS $$
  UPDATE language SET dialects = ld.dialects
    FROM language_dialects ld
    WHERE language.id = ld.id AND language.flag_language_list
  ;
$$;


--
-- Name: repopulate_language_tree(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.repopulate_language_tree() RETURNS void
    LANGUAGE sql
    AS $$
  UPDATE language SET ancestor_id = la.ancestor_id, ancestors = la.ancestors
    FROM language_ancestors la 
    WHERE language.id = la.id AND language.flag_language_list
  ;
  UPDATE language SET descendants = ld.descendants
    FROM language_descendants ld
    WHERE language.id = ld.id AND EXISTS (SELECT FROM protolanguage WHERE protolanguage.id = language.id)
  ;
$$;


--
-- Name: repopulate_record_marker(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.repopulate_record_marker() RETURNS void
    LANGUAGE sql
    AS $$
  TRUNCATE record_row;

  INSERT INTO record_row (id, marker, value)
  SELECT id, marker, value
  FROM record_row_view;
$$;


--
-- Name: repopulate_set_details_cached(); Type: PROCEDURE; Schema: public; Owner: -
--

CREATE PROCEDURE public.repopulate_set_details_cached()
    LANGUAGE plpgsql
    AS $$
BEGIN
  COMMIT;
  SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;

  LOCK TABLE set_details_cached;
  LOCK TABLE set_details_public_cached;

  TRUNCATE set_details_cached;
  TRUNCATE set_details_public_cached;

  INSERT INTO set_details_cached (id, author_name, name_auto, members)
  SELECT id, author_name, name_auto, members FROM set_details;

  INSERT INTO set_details_public_cached (id, author_name, name_auto, members)
  SELECT id, author_name, name_auto, members FROM set_details_public;

  COMMIT;
END;
$$;


--
-- Name: repopulate_set_details_cached_for_entry(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.repopulate_set_details_cached_for_entry(entry_id_arg integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
  set_id_var integer;
BEGIN
  FOR set_id_var IN
    SELECT set_id
    FROM set_member
    WHERE entry_id = entry_id_arg
  LOOP
    PERFORM repopulate_set_details_cached_for_set(set_id_var);
  END LOOP;
END;
$$;


--
-- Name: repopulate_set_details_cached_for_set(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.repopulate_set_details_cached_for_set(set_id_arg integer) RETURNS void
    LANGUAGE sql
    AS $$
  UPDATE set_details_cached sdc
  SET author_name = sd.author_name, name_auto = sd.name_auto, members = sd.members
  FROM set_details sd
  WHERE sdc.id = set_id_arg AND sd.id = sdc.id;

  UPDATE set_details_public_cached sdc
  SET author_name = sd.author_name, name_auto = sd.name_auto, members = sd.members
  FROM set_details_public sd
  WHERE sdc.id = set_id_arg AND sd.id = sdc.id;
$$;


--
-- Name: repopulate_set_details_cached_for_source(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.repopulate_set_details_cached_for_source(source_id_arg integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
  set_id_var integer;
BEGIN
  FOR set_id_var IN
    SELECT DISTINCT sm.set_id
    FROM set_member sm
    JOIN entry ON entry.id = sm.entry_id
    WHERE entry.source_id = source_id_arg
  LOOP
    PERFORM repopulate_set_details_cached_for_set(set_id_var);
  END LOOP;
END;
$$;


--
-- Name: resequence_sense_gloss(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.resequence_sense_gloss() RETURNS void
    LANGUAGE plpgsql
    AS $$
  BEGIN
    SET CONSTRAINTS sense_gloss_sense_id_seq_key DEFERRED;
    WITH bad_ids AS (
      SELECT sense_id FROM sense_gloss 
      GROUP BY sense_id
      HAVING max(seq) > count(*)
    )
    UPDATE sense_gloss sg SET seq = sg2.new_seq
    FROM (
      SELECT sense_id, language_id, txt, seq, row_number() OVER (PARTITION BY sense_id) as new_seq
      FROM sense_gloss
      ORDER BY seq
    ) sg2
    WHERE sg.sense_id IN (SELECT sense_id FROM bad_ids) AND sg.sense_id = sg2.sense_id AND sg.language_id = sg2.language_id AND sg.txt = sg2.txt AND sg.seq = sg2.seq;
  END;
$$;


--
-- Name: sense_auto_seq(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.sense_auto_seq() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
  BEGIN
    SELECT coalesce(max(seq) + 1, 1)
      INTO NEW.seq
      FROM sense
      WHERE sense.entry_id = NEW.entry_id; 
    RETURN NEW;
  END;
$$;


--
-- Name: set_group_log_details(integer, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_group_log_details(set_group_id_arg integer, set_id_arg integer) RETURNS jsonb
    LANGUAGE sql STABLE PARALLEL SAFE
    AS $$
  SELECT jsonb_build_object('sets', (
    SELECT jsonb_agg(
      jsonb_build_object('id', set.id, 'name', sna.name_auto->>'txt')
      ORDER BY sna.name_auto->>'txt', lpad(set.id::text, 10, '0')
    ) 
    FROM set
    JOIN set_name_auto sna ON sna.id = set.id
    WHERE set.set_group_id = set_group_id_arg AND set.id != set_id_arg
  ))
$$;


--
-- Name: set_log(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_log(set_id_arg integer) RETURNS TABLE(usr_id integer, usr_fullname text, event text, details jsonb, transaction_timestamp timestamp with time zone)
    LANGUAGE plpgsql
    AS $$
  BEGIN
    FOR usr_id, usr_fullname, event, details, transaction_timestamp IN
      SELECT sl.usr_id, usr.fullname AS usr_fullname, sl.event, sl.details, sl.transaction_timestamp
      FROM set_log sl
      LEFT JOIN usr ON usr.id = sl.usr_id
      WHERE sl.set_id = set_id_arg
      ORDER BY sl.transaction_timestamp, sl.statement_timestamp, sl.event
    LOOP
      IF details ? 'entry_id' THEN
        IF event != 'entry_created' AND EXISTS (SELECT FROM entry WHERE id = (details->>'entry_id')::integer) THEN
          details := details || (
            SELECT jsonb_build_object(
              'entry_headword', entry.headword, 
              'entry_senses', entry.senses, 
              'entry_source_reference', source.reference, 
              'entry_language_name', language.name
            )
            FROM entry
            JOIN source ON source.id = entry.source_id
            JOIN language ON language.id = source.language_id
            WHERE entry.id = (details->>'entry_id')::integer
          );
        ELSE
          details := details || (coalesce(
            (
              SELECT jsonb_build_object('entry_source_reference', source.reference) 
              FROM source
              WHERE source.id = (details->>'entry_source_id')::integer
            ),
            '{}'::jsonb
          ));
          details := details || (coalesce(
            (
              SELECT jsonb_build_object('entry_language_name', language.name) 
              FROM language
              WHERE language.id = (details->>'entry_language_id')::integer
            ),
            '{}'::jsonb
          ));
        END IF;
      END IF;
      IF details ? 'language_id' AND EXISTS (SELECT FROM language WHERE id = (details->>'language_id')::integer) THEN
        details := details || (
          SELECT jsonb_build_object('language_name', name)
          FROM language
          WHERE id = (details->>'language_id')::integer
        );
      END IF;
      IF details ? 'sets' THEN
        details := details || (
          SELECT jsonb_build_object('sets', jsonb_agg(
            jsonb_build_object(
              'id', set_info->'id',
              'name', coalesce(sna.name_auto->>'txt', sna.id::text, set_info->>'txt', set_info->>'id')
            )
            ORDER BY sna.name->>'txt', lpad(set.id::text, 10, '0'), set_info->>'txt', lpad(set_info->>'id', 10, '0')
          ))
          FROM jsonb_array_elements(details->'sets') set_info
          LEFT JOIN set_name_auto sna ON sna.id = (set_info->>'id')::integer
        );
      END IF;
      RETURN NEXT;
    END LOOP;
  END;
$$;


--
-- Name: set_log_insert(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_log_insert() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
  DECLARE
    current_usr_id integer;
  BEGIN
    current_usr_id := get_current_usr_id();
    INSERT INTO set_log (set_id, usr_id, event)
    VALUES (NEW.id, current_usr_id, 'set_created');
    RETURN NULL;
  END;
$$;


--
-- Name: set_log_update(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_log_update() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
  DECLARE
    current_usr_id integer;
  BEGIN
    current_usr_id := get_current_usr_id();
    IF OLD.note IS DISTINCT FROM NEW.note THEN
      INSERT INTO set_log (set_id, usr_id, event, details)
      VALUES (NEW.id, current_usr_id, 'set_note', jsonb_build_object('text', NEW.note));
    END IF;
    IF OLD.name IS DISTINCT FROM NEW.name THEN
      INSERT INTO set_log (set_id, usr_id, event, details)
      VALUES (NEW.id, current_usr_id, 'set_name', jsonb_build_object('text', NEW.name));
    END IF;
    IF OLD.name_entry_id IS DISTINCT FROM NEW.name_entry_id THEN
      INSERT INTO set_log (set_id, usr_id, event, details)
      VALUES (NEW.id, current_usr_id, 'set_name_entry_id', entry_log_details(NEW.name_entry_id));
    END IF;
    IF OLD.set_group_id IS DISTINCT FROM NEW.set_group_id THEN
      INSERT INTO set_log (set_id, usr_id, event, details)
      VALUES (NEW.id, current_usr_id, 'set_set_group_id', set_group_log_details(NEW.set_group_id, NEW.id));
    END IF;
    RETURN NULL;
  END;
$$;


--
-- Name: set_member_log_delete(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_member_log_delete() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
  DECLARE
    current_usr_id integer;
  BEGIN
    IF EXISTS (SELECT FROM set WHERE id = OLD.set_id) THEN
      current_usr_id := get_current_usr_id();
      IF (SELECT source.editable FROM entry JOIN source ON source.id = entry.source_id WHERE entry.id = OLD.entry_id)
      THEN
        INSERT INTO set_log (set_id, usr_id, event, details)
        VALUES (OLD.set_id, current_usr_id, 'entry_deleted', entry_log_details(OLD.entry_id));
      ELSE
        INSERT INTO set_log (set_id, usr_id, event, details)
        VALUES (OLD.set_id, current_usr_id, 'set_member_deleted', entry_log_details(OLD.entry_id));
      END IF;
    END IF;
    RETURN OLD;
  END;
$$;


--
-- Name: set_member_log_insert(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_member_log_insert() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
  DECLARE
    current_usr_id integer;
  BEGIN
    current_usr_id := get_current_usr_id();
    IF (SELECT source.editable FROM entry JOIN source ON source.id = entry.source_id WHERE entry.id = NEW.entry_id)
    THEN
      INSERT INTO set_log (set_id, usr_id, event, details)
      VALUES (NEW.set_id, current_usr_id, 'entry_created', entry_log_details(NEW.entry_id));
    ELSE
      INSERT INTO set_log (set_id, usr_id, event, details)
      VALUES (NEW.set_id, current_usr_id, 'set_member_created', entry_log_details(NEW.entry_id));
    END IF;
    RETURN NULL;
  END;
$$;


--
-- Name: set_member_log_update(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_member_log_update() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
  DECLARE
    current_usr_id integer;
  BEGIN
    current_usr_id := get_current_usr_id();
    IF OLD.note IS DISTINCT FROM NEW.note THEN
      INSERT INTO set_log (set_id, usr_id, event, details)
      VALUES (NEW.set_id, current_usr_id, 'set_member_note', entry_log_details(NEW.entry_id) || jsonb_build_object('text', NEW.note));
    END IF;
    IF OLD.reflex IS DISTINCT FROM NEW.reflex THEN
      INSERT INTO set_log (set_id, usr_id, event, details)
      VALUES (NEW.set_id, current_usr_id, 'set_member_reflex', entry_log_details(NEW.entry_id) || jsonb_build_object('text', NEW.reflex));
    END IF;
    IF OLD.reflex_origin IS DISTINCT FROM NEW.reflex_origin THEN
      INSERT INTO set_log (set_id, usr_id, event, details)
      VALUES (NEW.set_id, current_usr_id, 'set_member_reflex_origin', entry_log_details(NEW.entry_id) || jsonb_build_object('text', NEW.reflex_origin));
    END IF;
    IF OLD.reflex_origin_language_id IS DISTINCT FROM NEW.reflex_origin_language_id THEN
      INSERT INTO set_log (set_id, usr_id, event, details)
      VALUES (NEW.set_id, current_usr_id, 'set_member_reflex_origin_language_id', entry_log_details(NEW.entry_id) || language_log_details(NEW.reflex_origin_language_id));
    END IF;
    RETURN NULL;
  END;
$$;


--
-- Name: set_member_reflex_check(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_member_reflex_check() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF NEW.reflex IS NOT NULL AND NOT reflex_check(NEW.reflex, (SELECT headword from entry where id = NEW.entry_id))
  THEN
    RAISE EXCEPTION 'invalid reflex format: does not match headword or has incorrect infix syntax' USING CONSTRAINT = 'set_member_reflex_check';
  END IF;
  RETURN NULL;
END;
$$;


--
-- Name: split_entry_senses(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.split_entry_senses(entry_id_arg integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
  DECLARE
    sense_id_var integer;
    entry_id_var integer;
    entry_row entry%rowtype;
  BEGIN
    SELECT * into entry_row FROM entry WHERE id = entry_id_arg;
    IF entry_row IS NULL THEN
      RAISE 'entry does not exist';
    END IF;
    FOR sense_id_var IN 
      SELECT id FROM sense
      WHERE entry_id = entry_id_arg AND seq > 1
      ORDER BY seq
    LOOP
      INSERT INTO entry (source_id, headword, headword_ipa, headword_ph, record_id)
        VALUES (entry_row.source_id, entry_row.headword, entry_row.headword_ipa, entry_row.headword_ph, entry_row.record_id)
        RETURNING id INTO entry_id_var;
      UPDATE sense SET entry_id = entry_id_var WHERE id = sense_id_var;
      UPDATE entry SET senses = es.senses
        FROM entry_senses es
        WHERE es.id = entry.id AND entry.id = entry_id_var;
    END LOOP;
    UPDATE entry SET senses = es.senses
      FROM entry_senses es
      WHERE es.id = entry.id AND entry.id = entry_id_arg;
  END;
$$;


--
-- Name: to_bool_text(anyelement); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.to_bool_text(arg anyelement) RETURNS text
    LANGUAGE sql IMMUTABLE PARALLEL SAFE
    AS $$
  SELECT CASE WHEN arg IS NULL THEN '0' ELSE '1' END;
$$;


--
-- Name: unnest_record(jsonb); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.unnest_record(record_data jsonb) RETURNS TABLE(marker text, value text, seq integer)
    LANGUAGE sql IMMUTABLE PARALLEL SAFE
    AS $$
  SELECT line->>0 as marker, line->>1 as value, row_number() over () as seq
  FROM jsonb_array_elements(record_data) AS line
$$;


--
-- Name: update_entry_senses(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_entry_senses() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
  BEGIN
    UPDATE entry SET senses = es.senses
      FROM entry_senses es
      WHERE entry.id = NEW.entry_id AND es.id = entry.id;
    RETURN NULL;
  END;
$$;


--
-- Name: update_headword_degr(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_headword_degr() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
  BEGIN
    NEW.headword_degr = degr(NEW.headword);
    RETURN NEW;
  END;
$$;


--
-- Name: update_headword_ipa_degr(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_headword_ipa_degr() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
  BEGIN
    NEW.headword_ipa_degr = degr(NEW.headword_ipa);
    RETURN NEW;
  END;
$$;


--
-- Name: update_ipa_conversion_lib_name(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_ipa_conversion_lib_name() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
  BEGIN
    UPDATE ipa_conversion_rule SET lib = array_replace(lib, OLD.name, NEW.name) WHERE OLD.name = any(lib);
    RETURN NEW;
  END;
$$;


--
-- Name: update_ipa_conversion_rule_name(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_ipa_conversion_rule_name() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
  BEGIN
    UPDATE ipa_conversion_rule SET chain_before = array_replace(chain_before, OLD.name, NEW.name) WHERE OLD.name = any(chain_before);
    UPDATE ipa_conversion_rule SET chain_after = array_replace(chain_after, OLD.name, NEW.name) WHERE OLD.name = any(chain_after);
    RETURN NEW;
  END;
$$;


--
-- Name: update_record_row(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_record_row() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
  BEGIN
    DELETE FROM record_row WHERE id = NEW.id;
    INSERT INTO record_row (id, marker, value)
    SELECT id, marker, value
    FROM record_row_view
    WHERE id = NEW.id;
    RETURN NEW;
  END;
$$;


--
-- Name: update_replacements(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_replacements() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
  BEGIN
    NEW.replacements := (
      select jsonb_agg(jsonb_build_array(normalize(r->>0, NFD), normalize(r->>1, NFD)))
      from (
        select jsonb_array_elements(NEW.replacements) as r
      ) s
    );
    RETURN NEW;
  END;
$$;


--
-- Name: update_sense_glosses(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_sense_glosses() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
  BEGIN
    IF TG_OP = 'DELETE' THEN
      UPDATE sense SET glosses = sg.glosses
        FROM sense_glosses sg
        WHERE sense.id = OLD.sense_id AND sg.id = sense.id;
    ELSE
      UPDATE sense SET glosses = sg.glosses
        FROM sense_glosses sg
        WHERE sense.id = NEW.sense_id AND sg.id = sense.id;
      IF TG_OP = 'UPDATE' AND OLD.sense_id != NEW.sense_id THEN
        UPDATE sense SET glosses = sg.glosses
          FROM sense_glosses sg
          WHERE sense.id = OLD.sense_id AND sg.id = sense.id;
      END IF;
    END IF;
    RETURN NULL;
  END;
$$;


--
-- Name: update_txt_degr(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_txt_degr() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
  BEGIN
    NEW.txt_degr = degr(NEW.txt);
    RETURN NEW;
  END;
$$;


--
-- Name: update_txt_degr_fuzzy(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_txt_degr_fuzzy() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
  BEGIN
    NEW.txt_degr_fuzzy = degr_fuzzy(NEW.txt);
    RETURN NEW;
  END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: entry; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.entry (
    id integer NOT NULL,
    source_id integer NOT NULL,
    headword text NOT NULL,
    headword_ipa text,
    root text,
    record_id integer,
    origin public.entry_origin,
    origin_language_id integer,
    headword_degr text NOT NULL,
    headword_ipa_degr text,
    headword_ph text,
    multi_set boolean DEFAULT false NOT NULL,
    senses json DEFAULT '[]'::json NOT NULL,
    CONSTRAINT headword_check CHECK ((headword !~ '\||<<|>>'::text)),
    CONSTRAINT normalized_check CHECK ((is_normalized(headword) AND is_normalized(headword_degr) AND is_normalized(headword_ipa) AND is_normalized(headword_ipa_degr) AND is_normalized(headword_ph) AND is_normalized(root)))
);


--
-- Name: language; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.language (
    id integer NOT NULL,
    name text NOT NULL,
    iso6393 text,
    glottocode text,
    location point,
    parent_id integer,
    note text,
    flag_language_list boolean DEFAULT true NOT NULL,
    flag_borrowed_from boolean DEFAULT false NOT NULL,
    flag_gloss_language boolean DEFAULT false NOT NULL,
    dialect_parent_id integer,
    ancestor_id integer,
    descendants integer[],
    dialects integer[],
    region text,
    ancestors integer[],
    CONSTRAINT language_glottocode_check CHECK ((glottocode ~ '^[a-z0-9]{4}[0-9]{4}$'::text)),
    CONSTRAINT language_iso6393_check CHECK ((iso6393 ~ '^[a-z]{3}$'::text)),
    CONSTRAINT language_name_check CHECK (is_normalized(name))
);


--
-- Name: protolanguage; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.protolanguage (
    id integer NOT NULL,
    prefer_set_name boolean DEFAULT false NOT NULL
);


--
-- Name: source; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.source (
    id integer NOT NULL,
    reference_full text,
    note text,
    language_id integer NOT NULL,
    reference text NOT NULL,
    editable boolean DEFAULT false NOT NULL,
    public boolean DEFAULT true NOT NULL,
    ipa_conversion_rule text,
    use_ph_for_ipa boolean DEFAULT false NOT NULL,
    formatting jsonb,
    ingestion_time timestamp with time zone
);


--
-- Name: entry_details; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.entry_details AS
 SELECT entry.id,
    origin_language.name AS origin_language_name,
    json_build_object('id', source.id, 'reference', source.reference, 'editable', source.editable, 'ipa_conversion_rule', source.ipa_conversion_rule) AS source,
    json_build_object('id', language.id, 'name', language.name, 'location', language.location, 'is_proto', (protolanguage.id IS NOT NULL), 'ancestor_id', language.ancestor_id, 'ancestor_name', ancestor_language.name) AS language
   FROM (((((public.entry
     JOIN public.source ON ((source.id = entry.source_id)))
     JOIN public.language ON ((language.id = source.language_id)))
     LEFT JOIN public.protolanguage ON ((protolanguage.id = language.id)))
     LEFT JOIN public.language origin_language ON ((origin_language.id = entry.origin_language_id)))
     LEFT JOIN public.language ancestor_language ON ((ancestor_language.id = language.ancestor_id)));


--
-- Name: entry_details_public; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.entry_details_public AS
 SELECT entry.id,
    origin_language.name AS origin_language_name,
    json_build_object('id', source.id, 'reference', source.reference, 'editable', source.editable, 'ipa_conversion_rule', source.ipa_conversion_rule) AS source,
    json_build_object('id', language.id, 'name', language.name, 'location', language.location, 'is_proto', (protolanguage.id IS NOT NULL), 'ancestor_id', language.ancestor_id, 'ancestor_name', ancestor_language.name) AS language
   FROM (((((public.entry
     JOIN public.source ON ((source.id = entry.source_id)))
     JOIN public.language ON ((language.id = source.language_id)))
     LEFT JOIN public.protolanguage ON ((protolanguage.id = language.id)))
     LEFT JOIN public.language origin_language ON ((origin_language.id = entry.origin_language_id)))
     LEFT JOIN public.language ancestor_language ON ((ancestor_language.id = language.ancestor_id)))
  WHERE source.public;


--
-- Name: entry_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.entry_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: entry_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.entry_id_seq OWNED BY public.entry.id;


--
-- Name: record; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.record (
    id integer NOT NULL,
    data jsonb,
    page_num text
);


--
-- Name: entry_ph; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.entry_ph AS
 SELECT entry.id,
    ph.headword_ph
   FROM (public.entry
     JOIN LATERAL ( SELECT extract_ph.headword_ph
           FROM public.record,
            LATERAL public.extract_ph(record.data) extract_ph(headword, headword_ph)
          WHERE (record.id = entry.record_id)) ph ON (true));


--
-- Name: sense; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sense (
    id integer NOT NULL,
    entry_id integer NOT NULL,
    seq smallint NOT NULL,
    pos text,
    glosses json DEFAULT '[]'::json NOT NULL,
    CONSTRAINT sense_pos_check CHECK (is_normalized(pos))
);


--
-- Name: entry_senses; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.entry_senses AS
 SELECT entry.id,
    COALESCE(json_agg(json_build_object('id', sense.id, 'pos', sense.pos, 'glosses', sense.glosses) ORDER BY sense.seq) FILTER (WHERE (sense.id IS NOT NULL)), '[]'::json) AS senses
   FROM (public.entry
     LEFT JOIN public.sense ON ((sense.entry_id = entry.id)))
  GROUP BY entry.id;


--
-- Name: entry_serialized; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.entry_serialized AS
SELECT
    NULL::integer AS id,
    NULL::text AS headword,
    NULL::text AS root,
    NULL::integer AS record_id,
    NULL::jsonb AS record,
    NULL::integer AS source_id,
    NULL::json AS sense,
    NULL::text AS checksum;


--
-- Name: ipa_conversion_lib; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ipa_conversion_lib (
    name text NOT NULL,
    code text,
    CONSTRAINT ipa_conversion_lib_name_check CHECK ((name ~ '^[a-zA-Z][a-zA-Z0-9_]*$'::text))
);


--
-- Name: ipa_conversion_rule; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ipa_conversion_rule (
    name text NOT NULL,
    replacements jsonb,
    function text,
    lowercase boolean DEFAULT true NOT NULL,
    chain_after text[],
    lib text[],
    chain_before text[],
    suprasegmental boolean DEFAULT false NOT NULL,
    CONSTRAINT ipa_conversion_rule_check CHECK (((name <> ALL (chain_before)) AND (name <> ALL (chain_after)))),
    CONSTRAINT ipa_conversion_rule_name_check CHECK ((name ~ '^[a-zA-Z][a-zA-Z0-9_]*$'::text))
);


--
-- Name: iso6391; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.iso6391 (
    iso6391 text NOT NULL,
    iso6393 text NOT NULL,
    CONSTRAINT iso6391_iso6391_check CHECK ((iso6391 ~ '^[a-z]{2}$'::text)),
    CONSTRAINT iso6391_iso6393_check CHECK ((iso6393 ~ '^[a-z]{3}$'::text))
);


--
-- Name: language_ancestors; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.language_ancestors AS
 SELECT language.id,
    ancestor.id AS ancestor_id,
    ancestor.parent_ids AS ancestors
   FROM (public.language
     LEFT JOIN LATERAL ( WITH RECURSIVE ancestor(id, parent_id, parent_ids) AS (
                 SELECT language2.id,
                    language2.parent_id,
                        CASE
                            WHEN (language2.parent_id IS NULL) THEN NULL::integer[]
                            ELSE ARRAY[language2.parent_id]
                        END AS "array"
                   FROM public.language language2
                  WHERE (language2.id = language.id)
                UNION ALL
                 SELECT language2.id,
                    language2.parent_id,
                        CASE
                            WHEN (language2.parent_id IS NULL) THEN ancestor_2.parent_ids
                            ELSE (ancestor_2.parent_ids || language2.parent_id)
                        END AS "case"
                   FROM (ancestor ancestor_2
                     JOIN public.language language2 ON ((language2.id = ancestor_2.parent_id)))
                )
         SELECT ancestor_1.id,
            ancestor_1.parent_ids
           FROM (ancestor ancestor_1
             JOIN public.language language_1 ON ((language_1.id = ancestor_1.id)))
          WHERE (ancestor_1.parent_id IS NULL)) ancestor ON (true));


--
-- Name: language_borrowed_from; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.language_borrowed_from (
    language_id integer NOT NULL,
    view text NOT NULL
);


--
-- Name: language_descendants; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.language_descendants AS
 SELECT id,
    descendants
   FROM ( SELECT language.id,
            array_agg(b.id ORDER BY b.path) FILTER (WHERE (b.id <> language.id)) AS descendants
           FROM (public.language
             LEFT JOIN LATERAL ( WITH RECURSIVE descendant(id, path) AS (
                         SELECT language2.id,
                            '{{"",""}}'::text[] AS text
                           FROM public.language language2
                          WHERE (language2.id = language.id)
                        UNION ALL
                         SELECT language2.id,
                            (descendant_1.path || ARRAY[public.to_bool_text(protolanguage.id), lower(language2.name)])
                           FROM ((descendant descendant_1
                             JOIN public.language language2 ON (((language2.parent_id = descendant_1.id) AND language2.flag_language_list)))
                             LEFT JOIN public.protolanguage ON ((protolanguage.id = language2.id)))
                        )
                 SELECT descendant.id,
                    descendant.path
                   FROM descendant) b ON (true))
          GROUP BY language.id) a;


--
-- Name: language_dialects; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.language_dialects AS
 SELECT id,
    dialects
   FROM ( SELECT language.id,
            array_agg(b.id) FILTER (WHERE (b.id <> language.id)) AS dialects
           FROM (public.language
             LEFT JOIN LATERAL ( WITH RECURSIVE dialect(id) AS (
                         SELECT language2.id
                           FROM public.language language2
                          WHERE (language2.id = language.id)
                        UNION ALL
                         SELECT language2.id
                           FROM (dialect dialect_1
                             JOIN public.language language2 ON ((language2.dialect_parent_id = dialect_1.id)))
                        )
                 SELECT dialect.id
                   FROM dialect) b ON (true))
          GROUP BY language.id) a;


--
-- Name: language_gloss; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.language_gloss (
    language_id integer NOT NULL,
    view text NOT NULL
);


--
-- Name: language_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.language_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: language_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.language_id_seq OWNED BY public.language.id;


--
-- Name: language_list; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.language_list (
    language_id integer NOT NULL,
    view text NOT NULL
);


--
-- Name: record_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.record_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: record_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.record_id_seq OWNED BY public.record.id;


--
-- Name: record_row; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.record_row (
    id integer NOT NULL,
    marker text,
    value text
);


--
-- Name: record_row_view; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.record_row_view AS
 SELECT id,
    lower(("row" ->> 0)) AS marker,
    ("row" ->> 1) AS value
   FROM ( SELECT record_1.id,
            jsonb_array_elements(record_1.data) AS "row"
           FROM public.record record_1) record;


--
-- Name: record_source; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.record_source AS
 SELECT record.id,
    s.source_id
   FROM (public.record
     LEFT JOIN LATERAL ( SELECT entry.source_id
           FROM public.entry
          WHERE (entry.record_id = record.id)
         LIMIT 1) s ON (true));


--
-- Name: region; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.region (
    name text NOT NULL
);


--
-- Name: saved_map_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.saved_map_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: saved_map; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.saved_map (
    id integer DEFAULT nextval('public.saved_map_id_seq'::regclass) NOT NULL,
    name text NOT NULL,
    data json NOT NULL,
    usr_id integer NOT NULL
);


--
-- Name: sense_definition; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sense_definition (
    sense_id integer NOT NULL,
    language_id integer NOT NULL,
    txt text NOT NULL,
    seq smallint NOT NULL,
    CONSTRAINT sense_definition_txt_check CHECK (is_normalized(txt))
);


--
-- Name: sense_definitions_by_language; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.sense_definitions_by_language AS
 SELECT sense_id,
    language_id,
    json_agg(txt ORDER BY seq) AS txt
   FROM public.sense_definition
  GROUP BY sense_id, language_id;


--
-- Name: sense_example; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sense_example (
    id integer NOT NULL,
    sense_id integer NOT NULL,
    txt text NOT NULL,
    seq smallint NOT NULL,
    CONSTRAINT sense_example_txt_check CHECK (is_normalized(txt))
);


--
-- Name: sense_example_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.sense_example_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: sense_example_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.sense_example_id_seq OWNED BY public.sense_example.id;


--
-- Name: sense_example_translation; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sense_example_translation (
    sense_example_id integer NOT NULL,
    language_id integer NOT NULL,
    txt text NOT NULL,
    CONSTRAINT sense_example_translation_txt_check CHECK (is_normalized(txt))
);


--
-- Name: sense_example_serialized; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.sense_example_serialized AS
 SELECT sense_example.id,
    sense_example.sense_id,
    (to_jsonb(sense_example.txt) || set.translation) AS example,
    sense_example.seq
   FROM (public.sense_example
     LEFT JOIN LATERAL ( SELECT jsonb_agg(json_build_array(sense_example_translation.txt, language.iso6393)) AS translation
           FROM (public.sense_example_translation
             JOIN public.language ON ((language.id = sense_example_translation.language_id)))
          WHERE (sense_example_translation.sense_example_id = sense_example.id)) set ON (true));


--
-- Name: sense_gloss; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sense_gloss (
    sense_id integer NOT NULL,
    language_id integer NOT NULL,
    txt text NOT NULL,
    seq smallint NOT NULL,
    txt_degr text NOT NULL,
    txt_degr_fuzzy text,
    CONSTRAINT sense_gloss_txt_check CHECK (is_normalized(txt))
);


--
-- Name: sense_glosses_by_language; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.sense_glosses_by_language AS
 SELECT sense_id,
    language_id,
    json_agg(txt ORDER BY seq) AS txt
   FROM public.sense_gloss
  GROUP BY sense_id, language_id;


--
-- Name: sense_glosses; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.sense_glosses AS
 SELECT sense.id,
    COALESCE(json_agg(json_build_object('language_id', sgl.language_id, 'language_code', language.iso6393, 'txt', sgl.txt) ORDER BY (language.iso6393 <> 'eng'::text), language.iso6393) FILTER (WHERE (sgl.sense_id IS NOT NULL)), '[]'::json) AS glosses
   FROM ((public.sense
     LEFT JOIN public.sense_glosses_by_language sgl ON ((sgl.sense_id = sense.id)))
     LEFT JOIN public.language ON ((language.id = sgl.language_id)))
  GROUP BY sense.id;


--
-- Name: sense_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.sense_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: sense_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.sense_id_seq OWNED BY public.sense.id;


--
-- Name: sense_serialized; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.sense_serialized AS
 SELECT sense.id,
    sense.entry_id,
    sense.seq,
    sense.pos,
    sg.gloss,
    sd.definition,
    se.example
   FROM (((public.sense
     LEFT JOIN LATERAL ( SELECT json_agg(json_build_array(sense_gloss.txt, language.iso6393) ORDER BY sense_gloss.seq) AS gloss
           FROM (public.sense_gloss
             JOIN public.language ON ((language.id = sense_gloss.language_id)))
          WHERE (sense_gloss.sense_id = sense.id)) sg ON (true))
     LEFT JOIN LATERAL ( SELECT json_agg(json_build_array(sense_definition.txt, language.iso6393) ORDER BY sense_definition.seq) AS definition
           FROM (public.sense_definition
             JOIN public.language ON ((language.id = sense_definition.language_id)))
          WHERE (sense_definition.sense_id = sense.id)) sd ON (true))
     LEFT JOIN LATERAL ( SELECT json_agg(se_1.example) AS example
           FROM public.sense_example_serialized se_1
          WHERE (se_1.sense_id = sense.id)) se ON (true));


--
-- Name: set; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.set (
    id integer NOT NULL,
    note text,
    name text,
    name_entry_id integer,
    author_id integer NOT NULL,
    set_group_id integer,
    CONSTRAINT set_check CHECK (((name IS NULL) OR (name_entry_id IS NULL)))
);


--
-- Name: set_member; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.set_member (
    entry_id integer NOT NULL,
    set_id integer NOT NULL,
    reflex text,
    note text,
    multi_set boolean NOT NULL,
    reflex_origin public.reflex_origin,
    reflex_origin_language_id integer,
    CONSTRAINT set_member_reflex_check CHECK ((reflex ~ '^[^|]*\|[^|]+\|[^|]*$'::text))
);


--
-- Name: set_name_auto; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.set_name_auto AS
 SELECT id,
        CASE
            WHEN (name IS NOT NULL) THEN json_build_object('txt', name)
            WHEN (name_entry_id IS NOT NULL) THEN ( SELECT json_build_object('txt', ((language.name || ' '::text) || entry.headword), 'entry_id', entry.id) AS json_build_object
               FROM ((public.entry
                 JOIN public.source ON ((source.id = entry.source_id)))
                 JOIN public.language ON ((language.id = source.language_id)))
              WHERE (entry.id = set.name_entry_id))
            ELSE ( SELECT json_build_object('txt', ((language.name || ' '::text) || entry.headword), 'entry_id', entry.id) AS json_build_object
               FROM ((((public.set_member
                 JOIN public.entry ON ((entry.id = set_member.entry_id)))
                 JOIN public.source ON ((source.id = entry.source_id)))
                 JOIN public.language ON ((language.id = source.language_id)))
                 JOIN public.protolanguage ON ((protolanguage.id = language.id)))
              WHERE (set_member.set_id = set.id)
              ORDER BY (NOT protolanguage.prefer_set_name), (lower(language.name))
             LIMIT 1)
        END AS name_auto
   FROM public.set;


--
-- Name: set_member_details; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.set_member_details AS
 SELECT set_member.set_id,
    set_member.entry_id,
    json_build_object('id', entry.id, 'headword', entry.headword, 'headword_ipa', entry.headword_ipa, 'root', entry.root, 'origin', entry.origin, 'origin_language_id', entry.origin_language_id, 'origin_language_name', ed.origin_language_name, 'record_id', entry.record_id, 'senses', entry.senses) AS entry,
    ed.source,
    ed.language,
        CASE
            WHEN (set_member.multi_set IS FALSE) THEN NULL::json
            ELSE ( SELECT json_agg(json_build_object('id', set.id, 'name', COALESCE((sna.name_auto ->> 'txt'::text), (set.id)::text)) ORDER BY (sna.name_auto ->> 'txt'::text), (lpad((set.id)::text, 10, '0'::text))) AS json_agg
               FROM (public.set
                 JOIN public.set_name_auto sna ON ((sna.id = set.id)))
              WHERE ((set.id <> set_member.set_id) AND (EXISTS ( SELECT
                       FROM public.set_member sm
                      WHERE ((sm.set_id = set.id) AND (sm.entry_id = set_member.entry_id))))))
        END AS other_sets
   FROM ((public.set_member
     JOIN public.entry ON ((entry.id = set_member.entry_id)))
     JOIN public.entry_details ed ON ((ed.id = set_member.entry_id)));


--
-- Name: usr; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.usr (
    id integer NOT NULL,
    username text NOT NULL,
    fullname text NOT NULL,
    password text NOT NULL,
    admin boolean DEFAULT false NOT NULL,
    preferences jsonb,
    role public.usr_role DEFAULT 'viewer'::public.usr_role NOT NULL,
    CONSTRAINT usr_fullname_check CHECK (is_normalized(fullname)),
    CONSTRAINT usr_username_check CHECK ((username ~ '^\S+@\S+$'::text))
);


--
-- Name: set_details; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.set_details AS
 SELECT set.id,
    usr.fullname AS author_name,
    ( SELECT sna.name_auto
           FROM public.set_name_auto sna
          WHERE (sna.id = set.id)) AS name_auto,
    COALESCE(json_agg(json_build_object('multi_set', set_member.multi_set, 'note', set_member.note, 'other_sets', smd.other_sets, 'reflex', set_member.reflex, 'reflex_origin', set_member.reflex_origin, 'reflex_origin_language_id', set_member.reflex_origin_language_id, 'entry', smd.entry, 'language', smd.language, 'source', smd.source) ORDER BY (((smd.language ->> 'is_proto'::text) = 'false'::text) AND ((smd.language ->> 'id'::text) = (smd.language ->> 'ancestor_id'::text))), (lower((smd.language ->> 'ancestor_name'::text))), (array_position(ancestor_language.descendants, ((smd.language ->> 'id'::text))::integer)) NULLS FIRST, (lower((smd.language ->> 'name'::text))), (lower((smd.entry ->> 'headword'::text))), ((smd.entry ->> 'id'::text))::integer) FILTER (WHERE (set_member.set_id IS NOT NULL)), '[]'::json) AS members
   FROM ((((public.set
     JOIN public.set_member ON ((set_member.set_id = set.id)))
     JOIN public.set_member_details smd ON (((smd.set_id = set.id) AND (smd.entry_id = set_member.entry_id))))
     JOIN public.usr ON ((usr.id = set.author_id)))
     JOIN public.language ancestor_language ON ((ancestor_language.id = ((smd.language ->> 'ancestor_id'::text))::integer)))
  GROUP BY set.id, usr.fullname;


--
-- Name: set_details_cached; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.set_details_cached (
    id integer NOT NULL,
    author_name text,
    name_auto json,
    members jsonb
);


--
-- Name: set_name_auto_public; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.set_name_auto_public AS
 SELECT id,
        CASE
            WHEN (name IS NOT NULL) THEN json_build_object('txt', name)
            WHEN ((name_entry_id IS NOT NULL) AND ( SELECT source.public
               FROM (public.entry
                 JOIN public.source ON ((source.id = entry.source_id)))
              WHERE (entry.id = set.name_entry_id))) THEN ( SELECT json_build_object('txt', ((language.name || ' '::text) || entry.headword), 'entry_id', entry.id) AS json_build_object
               FROM ((public.entry
                 JOIN public.source ON ((source.id = entry.source_id)))
                 JOIN public.language ON ((language.id = source.language_id)))
              WHERE (entry.id = set.name_entry_id))
            ELSE ( SELECT json_build_object('txt', ((language.name || ' '::text) || entry.headword), 'entry_id', entry.id) AS json_build_object
               FROM ((((public.set_member
                 JOIN public.entry ON ((entry.id = set_member.entry_id)))
                 JOIN public.source ON ((source.id = entry.source_id)))
                 JOIN public.language ON ((language.id = source.language_id)))
                 JOIN public.protolanguage ON ((protolanguage.id = language.id)))
              WHERE (set_member.set_id = set.id)
              ORDER BY (NOT protolanguage.prefer_set_name), (lower(language.name))
             LIMIT 1)
        END AS name_auto
   FROM public.set;


--
-- Name: set_member_details_public; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.set_member_details_public AS
 SELECT set_member.set_id,
    set_member.entry_id,
    json_build_object('id', entry.id, 'headword', entry.headword, 'headword_ipa', entry.headword_ipa, 'root', entry.root, 'origin', entry.origin, 'origin_language_id', entry.origin_language_id, 'origin_language_name', ed.origin_language_name, 'record_id', entry.record_id, 'senses', entry.senses) AS entry,
    ed.source,
    ed.language,
        CASE
            WHEN (set_member.multi_set IS FALSE) THEN NULL::json
            ELSE ( SELECT json_agg(json_build_object('id', set.id, 'name', COALESCE((sna.name_auto ->> 'txt'::text), (set.id)::text)) ORDER BY (sna.name_auto ->> 'txt'::text), (lpad((set.id)::text, 10, '0'::text))) AS json_agg
               FROM (public.set
                 JOIN public.set_name_auto_public sna ON ((sna.id = set.id)))
              WHERE ((set.id <> set_member.set_id) AND (EXISTS ( SELECT
                       FROM public.set_member sm
                      WHERE ((sm.set_id = set.id) AND (sm.entry_id = set_member.entry_id))))))
        END AS other_sets
   FROM ((public.set_member
     JOIN public.entry ON ((entry.id = set_member.entry_id)))
     JOIN public.entry_details_public ed ON ((ed.id = set_member.entry_id)));


--
-- Name: set_details_public; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.set_details_public AS
 SELECT set.id,
    usr.fullname AS author_name,
    ( SELECT sna.name_auto
           FROM public.set_name_auto_public sna
          WHERE (sna.id = set.id)) AS name_auto,
    COALESCE(json_agg(json_build_object('multi_set', set_member.multi_set, 'note', set_member.note, 'other_sets', smd.other_sets, 'reflex', set_member.reflex, 'reflex_origin', set_member.reflex_origin, 'reflex_origin_language_id', set_member.reflex_origin_language_id, 'entry', smd.entry, 'language', smd.language, 'source', smd.source) ORDER BY (((smd.language ->> 'is_proto'::text) = 'false'::text) AND ((smd.language ->> 'id'::text) = (smd.language ->> 'ancestor_id'::text))), (lower((smd.language ->> 'ancestor_name'::text))), (array_position(ancestor_language.descendants, ((smd.language ->> 'id'::text))::integer)) NULLS FIRST, (lower((smd.language ->> 'name'::text))), (lower((smd.entry ->> 'headword'::text))), ((smd.entry ->> 'id'::text))::integer) FILTER (WHERE (set_member.set_id IS NOT NULL)), '[]'::json) AS members
   FROM ((((public.set
     JOIN public.set_member ON ((set_member.set_id = set.id)))
     JOIN public.set_member_details_public smd ON (((smd.set_id = set.id) AND (smd.entry_id = set_member.entry_id))))
     JOIN public.usr ON ((usr.id = set.author_id)))
     JOIN public.language ancestor_language ON ((ancestor_language.id = ((smd.language ->> 'ancestor_id'::text))::integer)))
  GROUP BY set.id, usr.fullname;


--
-- Name: set_details_public_cached; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.set_details_public_cached (
    id integer NOT NULL,
    author_name text,
    name_auto json,
    members jsonb
);


--
-- Name: set_group; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.set_group (
    id integer NOT NULL
);


--
-- Name: set_group_details; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.set_group_details AS
 SELECT id,
        CASE
            WHEN (set_group_id IS NULL) THEN NULL::json
            ELSE ( SELECT json_agg(json_build_object('id', sd.id, 'name', COALESCE((sd.name_auto ->> 'txt'::text), (sd.id)::text)) ORDER BY (sd.name_auto ->> 'txt'::text), (lpad((sd.id)::text, 10, '0'::text))) AS json_agg
               FROM (public.set set2
                 JOIN public.set_details_cached sd ON ((sd.id = set2.id)))
              WHERE ((set2.set_group_id = set.set_group_id) AND (set2.id <> set.id)))
        END AS set_group
   FROM public.set;


--
-- Name: set_group_details_public; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.set_group_details_public AS
 SELECT set.id,
    json_agg(json_build_object('id', sd.id, 'name', COALESCE((sd.name_auto ->> 'txt'::text), (sd.id)::text)) ORDER BY (sd.name_auto ->> 'txt'::text), (lpad((sd.id)::text, 10, '0'::text))) AS set_group
   FROM ((public.set
     JOIN public.set set2 ON (((set2.set_group_id = set.set_group_id) AND (set2.id <> set.id))))
     JOIN public.set_details_public_cached sd ON ((sd.id = set2.id)))
  GROUP BY set.id;


--
-- Name: set_group_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.set_group_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: set_group_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.set_group_id_seq OWNED BY public.set_group.id;


--
-- Name: set_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.set_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: set_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.set_id_seq OWNED BY public.set.id;


--
-- Name: set_log; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.set_log (
    set_id integer NOT NULL,
    usr_id integer,
    event text NOT NULL,
    details jsonb,
    transaction_timestamp timestamp with time zone DEFAULT now() NOT NULL,
    statement_timestamp timestamp with time zone DEFAULT statement_timestamp() NOT NULL
);


--
-- Name: source_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.source_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: source_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.source_id_seq OWNED BY public.source.id;


--
-- Name: usr_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.usr_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: usr_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.usr_id_seq OWNED BY public.usr.id;


--
-- Name: view; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.view (
    code text NOT NULL,
    name text NOT NULL
);


--
-- Name: entry id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entry ALTER COLUMN id SET DEFAULT nextval('public.entry_id_seq'::regclass);


--
-- Name: language id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.language ALTER COLUMN id SET DEFAULT nextval('public.language_id_seq'::regclass);


--
-- Name: record id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.record ALTER COLUMN id SET DEFAULT nextval('public.record_id_seq'::regclass);


--
-- Name: sense id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sense ALTER COLUMN id SET DEFAULT nextval('public.sense_id_seq'::regclass);


--
-- Name: sense_example id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sense_example ALTER COLUMN id SET DEFAULT nextval('public.sense_example_id_seq'::regclass);


--
-- Name: set id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.set ALTER COLUMN id SET DEFAULT nextval('public.set_id_seq'::regclass);


--
-- Name: set_group id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.set_group ALTER COLUMN id SET DEFAULT nextval('public.set_group_id_seq'::regclass);


--
-- Name: source id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.source ALTER COLUMN id SET DEFAULT nextval('public.source_id_seq'::regclass);


--
-- Name: usr id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usr ALTER COLUMN id SET DEFAULT nextval('public.usr_id_seq'::regclass);


--
-- Name: entry entry_id_multi_set_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entry
    ADD CONSTRAINT entry_id_multi_set_key UNIQUE (id, multi_set);


--
-- Name: entry entry_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entry
    ADD CONSTRAINT entry_pkey PRIMARY KEY (id);


--
-- Name: ipa_conversion_lib ipa_conversion_lib_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ipa_conversion_lib
    ADD CONSTRAINT ipa_conversion_lib_pkey PRIMARY KEY (name);


--
-- Name: ipa_conversion_rule ipa_conversion_rule_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ipa_conversion_rule
    ADD CONSTRAINT ipa_conversion_rule_pkey PRIMARY KEY (name);


--
-- Name: iso6391 iso6391_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.iso6391
    ADD CONSTRAINT iso6391_pkey PRIMARY KEY (iso6391, iso6393);


--
-- Name: language_borrowed_from language_borrowed_from_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.language_borrowed_from
    ADD CONSTRAINT language_borrowed_from_pkey PRIMARY KEY (language_id, view);


--
-- Name: language_gloss language_gloss_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.language_gloss
    ADD CONSTRAINT language_gloss_pkey PRIMARY KEY (language_id, view);


--
-- Name: language language_glottocode_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.language
    ADD CONSTRAINT language_glottocode_key UNIQUE (glottocode);


--
-- Name: language language_iso6393_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.language
    ADD CONSTRAINT language_iso6393_key UNIQUE (iso6393);


--
-- Name: language_list language_list_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.language_list
    ADD CONSTRAINT language_list_pkey PRIMARY KEY (language_id, view);


--
-- Name: language language_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.language
    ADD CONSTRAINT language_pkey PRIMARY KEY (id);


--
-- Name: region language_region_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.region
    ADD CONSTRAINT language_region_pkey PRIMARY KEY (name);


--
-- Name: protolanguage protolanguage_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.protolanguage
    ADD CONSTRAINT protolanguage_pkey PRIMARY KEY (id);


--
-- Name: record record_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.record
    ADD CONSTRAINT record_pkey PRIMARY KEY (id);


--
-- Name: saved_map saved_map_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.saved_map
    ADD CONSTRAINT saved_map_pkey PRIMARY KEY (id);


--
-- Name: sense_definition sense_definition_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sense_definition
    ADD CONSTRAINT sense_definition_pkey PRIMARY KEY (sense_id, language_id, txt);


--
-- Name: sense_definition sense_definition_sense_id_seq_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sense_definition
    ADD CONSTRAINT sense_definition_sense_id_seq_key UNIQUE (sense_id, seq) DEFERRABLE;


--
-- Name: sense sense_entry_id_seq_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sense
    ADD CONSTRAINT sense_entry_id_seq_key UNIQUE (entry_id, seq) DEFERRABLE;


--
-- Name: sense_example sense_example_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sense_example
    ADD CONSTRAINT sense_example_pkey PRIMARY KEY (id);


--
-- Name: sense_example sense_example_sense_id_seq_txt_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sense_example
    ADD CONSTRAINT sense_example_sense_id_seq_txt_key UNIQUE (sense_id, seq, txt) DEFERRABLE;


--
-- Name: sense_example_translation sense_example_translation_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sense_example_translation
    ADD CONSTRAINT sense_example_translation_pkey PRIMARY KEY (sense_example_id, language_id, txt);


--
-- Name: sense_gloss sense_gloss_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sense_gloss
    ADD CONSTRAINT sense_gloss_pkey PRIMARY KEY (sense_id, language_id, txt);


--
-- Name: sense_gloss sense_gloss_sense_id_seq_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sense_gloss
    ADD CONSTRAINT sense_gloss_sense_id_seq_key UNIQUE (sense_id, seq) DEFERRABLE;


--
-- Name: sense sense_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sense
    ADD CONSTRAINT sense_pkey PRIMARY KEY (id);


--
-- Name: set_details_cached set_details_cached_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.set_details_cached
    ADD CONSTRAINT set_details_cached_pkey PRIMARY KEY (id);


--
-- Name: set_details_public_cached set_details_public_cached_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.set_details_public_cached
    ADD CONSTRAINT set_details_public_cached_pkey PRIMARY KEY (id);


--
-- Name: set_group set_group_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.set_group
    ADD CONSTRAINT set_group_pkey PRIMARY KEY (id);


--
-- Name: set_member set_member_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.set_member
    ADD CONSTRAINT set_member_pkey PRIMARY KEY (entry_id, set_id);


--
-- Name: set set_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.set
    ADD CONSTRAINT set_name_key UNIQUE (name);


--
-- Name: set set_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.set
    ADD CONSTRAINT set_pkey PRIMARY KEY (id);


--
-- Name: source source_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.source
    ADD CONSTRAINT source_pkey PRIMARY KEY (id);


--
-- Name: usr usr_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usr
    ADD CONSTRAINT usr_name_key UNIQUE (fullname);


--
-- Name: usr usr_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usr
    ADD CONSTRAINT usr_pkey PRIMARY KEY (id);


--
-- Name: usr usr_username_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usr
    ADD CONSTRAINT usr_username_key UNIQUE (username);


--
-- Name: view view_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.view
    ADD CONSTRAINT view_pkey PRIMARY KEY (code);


--
-- Name: entry_headword_degr_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX entry_headword_degr_idx ON public.entry USING btree (headword_degr);


--
-- Name: entry_headword_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX entry_headword_idx ON public.entry USING btree (headword);


--
-- Name: entry_headword_ipa_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX entry_headword_ipa_idx ON public.entry USING btree (headword_ipa);


--
-- Name: entry_headword_ipa_trgm_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX entry_headword_ipa_trgm_idx ON public.entry USING gin (headword_ipa pgtrgm.gin_trgm_ops);


--
-- Name: entry_headword_trgm_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX entry_headword_trgm_idx ON public.entry USING gin (headword pgtrgm.gin_trgm_ops);


--
-- Name: entry_origin_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX entry_origin_idx ON public.entry USING btree (origin);


--
-- Name: entry_origin_language_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX entry_origin_language_id_idx ON public.entry USING btree (origin_language_id);


--
-- Name: entry_record_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX entry_record_id_idx ON public.entry USING btree (record_id);


--
-- Name: entry_source_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX entry_source_id_idx ON public.entry USING btree (source_id);


--
-- Name: headword_ipa_degr_trgm_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX headword_ipa_degr_trgm_idx ON public.entry USING gin (headword_ipa_degr pgtrgm.gin_trgm_ops);


--
-- Name: iso6391_iso6393_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX iso6391_iso6393_idx ON public.iso6391 USING btree (iso6393);


--
-- Name: language_ancestor_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX language_ancestor_id_idx ON public.language USING btree (ancestor_id);


--
-- Name: language_borrowed_from_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX language_borrowed_from_idx ON public.language USING btree (id) WHERE (flag_borrowed_from OR flag_language_list);


--
-- Name: language_borrowed_from_view_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX language_borrowed_from_view_idx ON public.language_borrowed_from USING btree (view);


--
-- Name: language_dialect_parent_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX language_dialect_parent_id_idx ON public.language USING btree (dialect_parent_id);


--
-- Name: language_gloss_view_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX language_gloss_view_idx ON public.language_gloss USING btree (view);


--
-- Name: language_id_flag_gloss_language_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX language_id_flag_gloss_language_idx ON public.language USING btree (id) WHERE flag_gloss_language;


--
-- Name: language_id_flag_language_list_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX language_id_flag_language_list_idx ON public.language USING btree (id) WHERE flag_language_list;


--
-- Name: language_id_region_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX language_id_region_idx ON public.language USING btree (id, region);


--
-- Name: language_list_view_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX language_list_view_idx ON public.language_list USING btree (view);


--
-- Name: language_name_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX language_name_idx ON public.language USING btree (lower(name));


--
-- Name: language_parent_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX language_parent_id_idx ON public.language USING btree (parent_id);


--
-- Name: language_region_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX language_region_idx ON public.language USING btree (region);


--
-- Name: record_row_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX record_row_id_idx ON public.record_row USING btree (id);


--
-- Name: record_row_marker_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX record_row_marker_idx ON public.record_row USING btree (marker);


--
-- Name: record_row_value_trgm_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX record_row_value_trgm_idx ON public.record_row USING gin (value pgtrgm.gin_trgm_ops);


--
-- Name: saved_map_usr_id_name_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX saved_map_usr_id_name_idx ON public.saved_map USING btree (usr_id, name);


--
-- Name: sense_definition_language_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX sense_definition_language_id_idx ON public.sense_definition USING btree (language_id);


--
-- Name: sense_definition_txt_trgm_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX sense_definition_txt_trgm_idx ON public.sense_definition USING gin (txt pgtrgm.gin_trgm_ops);


--
-- Name: sense_example_translation_language_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX sense_example_translation_language_id_idx ON public.sense_example_translation USING btree (language_id);


--
-- Name: sense_gloss_language_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX sense_gloss_language_id_idx ON public.sense_gloss USING btree (language_id);


--
-- Name: sense_gloss_txt_degr_fuzzy_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX sense_gloss_txt_degr_fuzzy_idx ON public.sense_gloss USING btree (txt_degr_fuzzy);


--
-- Name: sense_gloss_txt_degr_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX sense_gloss_txt_degr_idx ON public.sense_gloss USING btree (txt_degr);


--
-- Name: sense_gloss_txt_en_trgm_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX sense_gloss_txt_en_trgm_idx ON public.sense_gloss USING gin (txt COLLATE "en_US" pgtrgm.gin_trgm_ops);


--
-- Name: sense_gloss_txt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX sense_gloss_txt_idx ON public.sense_gloss USING btree (txt);


--
-- Name: sense_gloss_txt_trgm_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX sense_gloss_txt_trgm_idx ON public.sense_gloss USING gin (txt pgtrgm.gin_trgm_ops);


--
-- Name: set_author_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX set_author_id_idx ON public.set USING btree (author_id);


--
-- Name: set_details_cached_name_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX set_details_cached_name_idx ON public.set_details_cached USING btree (((name_auto ->> 'txt'::text)), lpad((id)::text, 10, '0'::text));


--
-- Name: set_details_cached_name_trgm_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX set_details_cached_name_trgm_idx ON public.set_details_cached USING gin (((name_auto ->> 'txt'::text)) pgtrgm.gin_trgm_ops);


--
-- Name: set_details_public_cached_name_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX set_details_public_cached_name_idx ON public.set_details_public_cached USING btree (((name_auto ->> 'txt'::text)), lpad((id)::text, 10, '0'::text));


--
-- Name: set_details_public_cached_name_trgm_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX set_details_public_cached_name_trgm_idx ON public.set_details_public_cached USING gin (((name_auto ->> 'txt'::text)) pgtrgm.gin_trgm_ops);


--
-- Name: set_log_set_id_transaction_timestamp_statement_timestamp_ev_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX set_log_set_id_transaction_timestamp_statement_timestamp_ev_idx ON public.set_log USING btree (set_id, transaction_timestamp, statement_timestamp, event);


--
-- Name: set_member_entry_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX set_member_entry_id_idx ON public.set_member USING btree (entry_id) WHERE (NOT multi_set);


--
-- Name: set_member_entry_id_multi_set_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX set_member_entry_id_multi_set_idx ON public.set_member USING btree (entry_id, multi_set);


--
-- Name: set_member_note_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX set_member_note_idx ON public.set_member USING gin (note pgtrgm.gin_trgm_ops);


--
-- Name: set_member_reflex_origin_language_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX set_member_reflex_origin_language_id_idx ON public.set_member USING btree (reflex_origin_language_id);


--
-- Name: set_member_set_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX set_member_set_id_idx ON public.set_member USING btree (set_id);


--
-- Name: set_name_entry_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX set_name_entry_id_idx ON public.set USING btree (name_entry_id);


--
-- Name: set_note_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX set_note_idx ON public.set USING gin (note pgtrgm.gin_trgm_ops);


--
-- Name: set_set_group_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX set_set_group_id_idx ON public.set USING btree (set_group_id);


--
-- Name: source_id_editable_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX source_id_editable_idx ON public.source USING btree (id) WHERE editable;


--
-- Name: source_id_public_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX source_id_public_idx ON public.source USING btree (id) WHERE public;


--
-- Name: source_ipa_conversion_rule_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX source_ipa_conversion_rule_idx ON public.source USING btree (ipa_conversion_rule);


--
-- Name: source_language_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX source_language_id_idx ON public.source USING btree (language_id);


--
-- Name: source_reference_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX source_reference_idx ON public.source USING btree (reference);


--
-- Name: source_reference_unique_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX source_reference_unique_idx ON public.source USING btree (lower(reference));


--
-- Name: entry_serialized _RETURN; Type: RULE; Schema: public; Owner: -
--

CREATE OR REPLACE VIEW public.entry_serialized AS
 SELECT entry.id,
    entry.headword,
    entry.root,
    entry.record_id,
    record.data AS record,
    entry.source_id,
    json_agg(json_build_object('id', sense.id, 'seq', sense.seq, 'pos', sense.pos, 'gloss', sense.gloss, 'definition', sense.definition, 'example', sense.example) ORDER BY sense.seq) AS sense,
    encode(pgcrypto.digest((json_build_array(entry.headword, entry.root, json_agg(json_build_array(sense.pos, sense.gloss, sense.definition, sense.example) ORDER BY sense.seq)))::text, 'sha1'::text), 'hex'::text) AS checksum
   FROM ((public.entry
     LEFT JOIN public.record ON ((record.id = entry.record_id)))
     LEFT JOIN public.sense_serialized sense ON ((sense.entry_id = entry.id)))
  GROUP BY entry.id, record.data, record.page_num;


--
-- Name: ipa_conversion_lib delete; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER delete BEFORE DELETE ON public.ipa_conversion_lib FOR EACH ROW EXECUTE FUNCTION public.delete_ipa_conversion_lib();


--
-- Name: ipa_conversion_rule delete; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER delete BEFORE DELETE ON public.ipa_conversion_rule FOR EACH ROW EXECUTE FUNCTION public.delete_ipa_conversion_rule();


--
-- Name: set_member delete_orphaned_entry; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER delete_orphaned_entry AFTER DELETE ON public.set_member FOR EACH ROW EXECUTE FUNCTION public.delete_orphaned_entry();


--
-- Name: entry delete_orphaned_record; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER delete_orphaned_record AFTER DELETE ON public.entry FOR EACH ROW WHEN ((old.record_id IS NOT NULL)) EXECUTE FUNCTION public.delete_orphaned_record();


--
-- Name: set_member delete_orphaned_set; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER delete_orphaned_set AFTER DELETE OR UPDATE OF set_id ON public.set_member FOR EACH ROW EXECUTE FUNCTION public.delete_orphaned_set();


--
-- Name: set delete_orphaned_set_group; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER delete_orphaned_set_group AFTER DELETE OR UPDATE OF set_group_id ON public.set FOR EACH ROW WHEN ((old.set_group_id IS NOT NULL)) EXECUTE FUNCTION public.delete_orphaned_set_group();


--
-- Name: entry entry_log_update; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER entry_log_update AFTER UPDATE ON public.entry FOR EACH ROW EXECUTE FUNCTION public.entry_log_update();


--
-- Name: set_member fill_multi_set; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER fill_multi_set BEFORE INSERT ON public.set_member FOR EACH ROW WHEN ((new.entry_id IS NOT NULL)) EXECUTE FUNCTION public.fill_multi_set();


--
-- Name: language language_dialects; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER language_dialects AFTER INSERT OR DELETE OR UPDATE OF dialect_parent_id ON public.language FOR EACH STATEMENT EXECUTE FUNCTION public.language_dialects_trigger();


--
-- Name: language language_tree; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER language_tree AFTER INSERT OR DELETE OR UPDATE OF parent_id ON public.language FOR EACH STATEMENT EXECUTE FUNCTION public.language_tree_trigger();


--
-- Name: language language_tree_dialects; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER language_tree_dialects AFTER UPDATE OF flag_language_list ON public.language FOR EACH STATEMENT EXECUTE FUNCTION public.language_tree_dialects_trigger();


--
-- Name: language parent_id; Type: TRIGGER; Schema: public; Owner: -
--

CREATE CONSTRAINT TRIGGER parent_id AFTER INSERT OR UPDATE OF parent_id ON public.language NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION public.language_parent_id_check();


--
-- Name: set_member reflex_check; Type: TRIGGER; Schema: public; Owner: -
--

CREATE CONSTRAINT TRIGGER reflex_check AFTER INSERT OR UPDATE OF reflex ON public.set_member NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION public.set_member_reflex_check();


--
-- Name: sense sense_auto_seq; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER sense_auto_seq BEFORE INSERT ON public.sense FOR EACH ROW WHEN ((new.seq IS NULL)) EXECUTE FUNCTION public.sense_auto_seq();


--
-- Name: set set_log_insert; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_log_insert AFTER INSERT ON public.set FOR EACH ROW EXECUTE FUNCTION public.set_log_insert();


--
-- Name: set set_log_update; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_log_update AFTER UPDATE ON public.set FOR EACH ROW EXECUTE FUNCTION public.set_log_update();


--
-- Name: set_member set_member_log_delete; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_member_log_delete BEFORE DELETE ON public.set_member FOR EACH ROW EXECUTE FUNCTION public.set_member_log_delete();


--
-- Name: set_member set_member_log_insert; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_member_log_insert AFTER INSERT ON public.set_member FOR EACH ROW EXECUTE FUNCTION public.set_member_log_insert();


--
-- Name: set_member set_member_log_update; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_member_log_update AFTER UPDATE ON public.set_member FOR EACH ROW EXECUTE FUNCTION public.set_member_log_update();


--
-- Name: sense update_entry_senses; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_entry_senses AFTER UPDATE OF glosses ON public.sense FOR EACH ROW EXECUTE FUNCTION public.update_entry_senses();


--
-- Name: entry update_headword_degr; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_headword_degr BEFORE INSERT OR UPDATE OF headword ON public.entry FOR EACH ROW EXECUTE FUNCTION public.update_headword_degr();


--
-- Name: entry update_headword_ipa_degr; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_headword_ipa_degr BEFORE INSERT OR UPDATE OF headword_ipa ON public.entry FOR EACH ROW EXECUTE FUNCTION public.update_headword_ipa_degr();


--
-- Name: set_member update_multi_set; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_multi_set AFTER DELETE ON public.set_member FOR EACH ROW WHEN (old.multi_set) EXECUTE FUNCTION public.handle_orphaned_multi_set();


--
-- Name: ipa_conversion_lib update_name; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_name BEFORE UPDATE OF name ON public.ipa_conversion_lib FOR EACH ROW EXECUTE FUNCTION public.update_ipa_conversion_lib_name();


--
-- Name: ipa_conversion_rule update_name; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_name BEFORE UPDATE OF name ON public.ipa_conversion_rule FOR EACH ROW EXECUTE FUNCTION public.update_ipa_conversion_rule_name();


--
-- Name: record update_record_row; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_record_row AFTER INSERT OR UPDATE OF data ON public.record FOR EACH ROW EXECUTE FUNCTION public.update_record_row();


--
-- Name: ipa_conversion_rule update_replacements; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_replacements BEFORE INSERT OR UPDATE OF replacements ON public.ipa_conversion_rule FOR EACH ROW WHEN ((new.replacements IS NOT NULL)) EXECUTE FUNCTION public.update_replacements();


--
-- Name: sense_gloss update_sense_glosses; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_sense_glosses AFTER INSERT OR DELETE OR UPDATE ON public.sense_gloss FOR EACH ROW EXECUTE FUNCTION public.update_sense_glosses();


--
-- Name: sense_gloss update_txt_degr; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_txt_degr BEFORE INSERT OR UPDATE OF txt ON public.sense_gloss FOR EACH ROW EXECUTE FUNCTION public.update_txt_degr();


--
-- Name: sense_gloss update_txt_degr_fuzzy; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_txt_degr_fuzzy BEFORE INSERT OR UPDATE OF txt ON public.sense_gloss FOR EACH ROW EXECUTE FUNCTION public.update_txt_degr_fuzzy();


--
-- Name: entry entry_origin_language_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entry
    ADD CONSTRAINT entry_origin_language_id_fkey FOREIGN KEY (origin_language_id) REFERENCES public.language(id);


--
-- Name: entry entry_record_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entry
    ADD CONSTRAINT entry_record_id_fkey FOREIGN KEY (record_id) REFERENCES public.record(id) DEFERRABLE;


--
-- Name: entry entry_source_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entry
    ADD CONSTRAINT entry_source_id_fkey FOREIGN KEY (source_id) REFERENCES public.source(id);


--
-- Name: language language_ancestor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.language
    ADD CONSTRAINT language_ancestor_id_fkey FOREIGN KEY (ancestor_id) REFERENCES public.language(id);


--
-- Name: language_borrowed_from language_borrowed_from_language_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.language_borrowed_from
    ADD CONSTRAINT language_borrowed_from_language_id_fkey FOREIGN KEY (language_id) REFERENCES public.language(id) ON DELETE CASCADE;


--
-- Name: language_borrowed_from language_borrowed_from_view_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.language_borrowed_from
    ADD CONSTRAINT language_borrowed_from_view_fkey FOREIGN KEY (view) REFERENCES public.view(code) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: language language_dialect_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.language
    ADD CONSTRAINT language_dialect_parent_id_fkey FOREIGN KEY (dialect_parent_id) REFERENCES public.language(id);


--
-- Name: language_gloss language_gloss_language_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.language_gloss
    ADD CONSTRAINT language_gloss_language_id_fkey FOREIGN KEY (language_id) REFERENCES public.language(id) ON DELETE CASCADE;


--
-- Name: language_gloss language_gloss_view_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.language_gloss
    ADD CONSTRAINT language_gloss_view_fkey FOREIGN KEY (view) REFERENCES public.view(code) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: language_list language_list_language_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.language_list
    ADD CONSTRAINT language_list_language_id_fkey FOREIGN KEY (language_id) REFERENCES public.language(id) ON DELETE CASCADE;


--
-- Name: language_list language_list_view_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.language_list
    ADD CONSTRAINT language_list_view_fkey FOREIGN KEY (view) REFERENCES public.view(code) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: language language_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.language
    ADD CONSTRAINT language_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.protolanguage(id) ON DELETE SET NULL;


--
-- Name: language language_region_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.language
    ADD CONSTRAINT language_region_fkey FOREIGN KEY (region) REFERENCES public.region(name) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: protolanguage protolanguage_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.protolanguage
    ADD CONSTRAINT protolanguage_id_fkey FOREIGN KEY (id) REFERENCES public.language(id) ON DELETE CASCADE;


--
-- Name: record_row record_row_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.record_row
    ADD CONSTRAINT record_row_id_fkey FOREIGN KEY (id) REFERENCES public.record(id) ON DELETE CASCADE;


--
-- Name: saved_map saved_map_usr_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.saved_map
    ADD CONSTRAINT saved_map_usr_id_fkey FOREIGN KEY (usr_id) REFERENCES public.usr(id);


--
-- Name: sense_definition sense_definition_language_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sense_definition
    ADD CONSTRAINT sense_definition_language_id_fkey FOREIGN KEY (language_id) REFERENCES public.language(id);


--
-- Name: sense_definition sense_definition_sense_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sense_definition
    ADD CONSTRAINT sense_definition_sense_id_fkey FOREIGN KEY (sense_id) REFERENCES public.sense(id) ON DELETE CASCADE;


--
-- Name: sense sense_entry_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sense
    ADD CONSTRAINT sense_entry_id_fkey FOREIGN KEY (entry_id) REFERENCES public.entry(id);


--
-- Name: sense_example sense_example_sense_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sense_example
    ADD CONSTRAINT sense_example_sense_id_fkey FOREIGN KEY (sense_id) REFERENCES public.sense(id) ON DELETE CASCADE;


--
-- Name: sense_example_translation sense_example_translation_language_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sense_example_translation
    ADD CONSTRAINT sense_example_translation_language_id_fkey FOREIGN KEY (language_id) REFERENCES public.language(id);


--
-- Name: sense_example_translation sense_example_translation_sense_example_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sense_example_translation
    ADD CONSTRAINT sense_example_translation_sense_example_id_fkey FOREIGN KEY (sense_example_id) REFERENCES public.sense_example(id) ON DELETE CASCADE;


--
-- Name: sense_gloss sense_gloss_language_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sense_gloss
    ADD CONSTRAINT sense_gloss_language_id_fkey FOREIGN KEY (language_id) REFERENCES public.language(id);


--
-- Name: sense_gloss sense_gloss_sense_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sense_gloss
    ADD CONSTRAINT sense_gloss_sense_id_fkey FOREIGN KEY (sense_id) REFERENCES public.sense(id) ON DELETE CASCADE;


--
-- Name: set set_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.set
    ADD CONSTRAINT set_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.usr(id) ON DELETE SET NULL;


--
-- Name: set_details_cached set_details_cached_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.set_details_cached
    ADD CONSTRAINT set_details_cached_id_fkey FOREIGN KEY (id) REFERENCES public.set(id) ON DELETE CASCADE;


--
-- Name: set_details_public_cached set_details_public_cached_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.set_details_public_cached
    ADD CONSTRAINT set_details_public_cached_id_fkey FOREIGN KEY (id) REFERENCES public.set(id) ON DELETE CASCADE;


--
-- Name: set_log set_log_set_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.set_log
    ADD CONSTRAINT set_log_set_id_fkey FOREIGN KEY (set_id) REFERENCES public.set(id) ON DELETE CASCADE;


--
-- Name: set_log set_log_usr_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.set_log
    ADD CONSTRAINT set_log_usr_id_fkey FOREIGN KEY (usr_id) REFERENCES public.usr(id) ON DELETE SET NULL;


--
-- Name: set_member set_member_entry_id_multi_set_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.set_member
    ADD CONSTRAINT set_member_entry_id_multi_set_fkey FOREIGN KEY (entry_id, multi_set) REFERENCES public.entry(id, multi_set) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: set_member set_member_reflex_origin_language_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.set_member
    ADD CONSTRAINT set_member_reflex_origin_language_id_fkey FOREIGN KEY (reflex_origin_language_id) REFERENCES public.language(id);


--
-- Name: set_member set_member_set_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.set_member
    ADD CONSTRAINT set_member_set_id_fkey FOREIGN KEY (set_id) REFERENCES public.set(id) ON DELETE CASCADE;


--
-- Name: set set_name_entry_id_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.set
    ADD CONSTRAINT set_name_entry_id_id_fkey FOREIGN KEY (name_entry_id, id) REFERENCES public.set_member(entry_id, set_id) ON DELETE SET NULL;


--
-- Name: set set_set_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.set
    ADD CONSTRAINT set_set_group_id_fkey FOREIGN KEY (set_group_id) REFERENCES public.set_group(id) ON DELETE SET NULL;


--
-- Name: source source_ipa_conversion_rule_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.source
    ADD CONSTRAINT source_ipa_conversion_rule_fkey FOREIGN KEY (ipa_conversion_rule) REFERENCES public.ipa_conversion_rule(name) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: source source_language_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.source
    ADD CONSTRAINT source_language_id_fkey FOREIGN KEY (language_id) REFERENCES public.language(id);


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: -
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;
GRANT ALL ON SCHEMA public TO PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict b1oK5ktbWFySMtmqzEMf14JvKQpnCg0BRx4WDLtZha6iJN5hiBSFGGuyLG55Xm4

