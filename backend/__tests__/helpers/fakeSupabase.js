'use strict';

// Configurable in-memory Supabase fake. Routes use a chained query builder:
//   supabase.from(table).select(cols).eq(k,v).single()
//   supabase.from(table).insert(obj).select().single()
//   supabase.from(table).update(obj).eq(k,v).select().single()
//   supabase.from(table).delete().eq(k,v)
//   await supabase.from(table).select('id', { count: 'exact', head: true }).eq(...)
//
// The builder is thenable so `await builder` resolves the same as calling
// `.single()` or `.maybeSingle()` -- it resolves to { data, error }.

function makeBuilder(getResponse) {
  const builder = {
    _insertCalled: false,
    _updateCalled: false,
    _deleteCalled: false,
    _insertPayload: null,
    _updatePayload: null,

    select() {
      return this;
    },
    eq() {
      return this;
    },
    neq() {
      return this;
    },
    order() {
      return this;
    },
    limit() {
      return this;
    },

    insert(payload) {
      this._insertCalled = true;
      this._insertPayload = payload;
      return this;
    },

    update(payload) {
      this._updateCalled = true;
      this._updatePayload = payload;
      return this;
    },

    delete() {
      this._deleteCalled = true;
      return this;
    },

    // Terminal: resolve to the configured response
    single() {
      return Promise.resolve(getResponse());
    },
    maybeSingle() {
      return Promise.resolve(getResponse());
    },

    // Thenable so `await builder` works (for non-single calls like .delete().eq())
    then(onFulfilled, onRejected) {
      return Promise.resolve(getResponse()).then(onFulfilled, onRejected);
    },
  };
  return builder;
}

// createFakeSupabase returns a fake client and a setter for configuring per-table
// responses. Builders are recorded so tests can assert whether insert/update/delete
// was called and with what payload.
//
// Two response layers are supported:
//   setDefault(table, data) -- survives reset(); used by loadApp to set a
//     licensed user so the paywall passes unless a test explicitly overrides it.
//   setResponse(table, data) -- per-test override; cleared by reset().
function createFakeSupabase() {
  // tableResponses: { [tableName]: { data, error } }
  // Default to { data: null, error: null } for any unconfigured table.
  const responses = {};

  // tableDefaults: { [tableName]: { data, error } }
  // Survives reset(). loadApp sets users here so the paywall middleware passes
  // without every test having to configure the users table explicitly.
  const defaults = {};

  // Last builder created per table, for inspection in tests
  const lastBuilders = {};

  const client = {
    from(table) {
      const builder = makeBuilder(
        () => responses[table] || defaults[table] || { data: null, error: null }
      );
      lastBuilders[table] = builder;
      return builder;
    },
  };

  return {
    client,

    // Set what the fake returns for a given table (cleared by reset)
    setResponse(table, data, error = null) {
      responses[table] = { data, error };
    },

    // Set a fallback response that persists across reset() calls.
    // Useful for configuring the licensed-user row so every test that calls
    // reset() doesn't have to re-configure the users table.
    setDefault(table, data, error = null) {
      defaults[table] = { data, error };
    },

    // Clear all per-test responses (back to defaults or { data: null, error: null })
    reset() {
      for (const k of Object.keys(responses)) delete responses[k];
      for (const k of Object.keys(lastBuilders)) delete lastBuilders[k];
    },

    // Inspect the most recent builder for a table
    lastBuilder(table) {
      return lastBuilders[table] || null;
    },

    insertWasCalled(table) {
      return !!(lastBuilders[table] && lastBuilders[table]._insertCalled);
    },

    updateWasCalled(table) {
      return !!(lastBuilders[table] && lastBuilders[table]._updateCalled);
    },

    deleteWasCalled(table) {
      return !!(lastBuilders[table] && lastBuilders[table]._deleteCalled);
    },

    insertPayload(table) {
      return lastBuilders[table] ? lastBuilders[table]._insertPayload : null;
    },
  };
}

module.exports = { createFakeSupabase };
