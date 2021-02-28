
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function is_promise(value) {
        return value && typeof value === 'object' && typeof value.then === 'function';
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function action_destroyer(action_result) {
        return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function to_number(value) {
        return value === '' ? null : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    function handle_promise(promise, info) {
        const token = info.token = {};
        function update(type, index, key, value) {
            if (info.token !== token)
                return;
            info.resolved = value;
            let child_ctx = info.ctx;
            if (key !== undefined) {
                child_ctx = child_ctx.slice();
                child_ctx[key] = value;
            }
            const block = type && (info.current = type)(child_ctx);
            let needs_flush = false;
            if (info.block) {
                if (info.blocks) {
                    info.blocks.forEach((block, i) => {
                        if (i !== index && block) {
                            group_outros();
                            transition_out(block, 1, 1, () => {
                                if (info.blocks[i] === block) {
                                    info.blocks[i] = null;
                                }
                            });
                            check_outros();
                        }
                    });
                }
                else {
                    info.block.d(1);
                }
                block.c();
                transition_in(block, 1);
                block.m(info.mount(), info.anchor);
                needs_flush = true;
            }
            info.block = block;
            if (info.blocks)
                info.blocks[index] = block;
            if (needs_flush) {
                flush();
            }
        }
        if (is_promise(promise)) {
            const current_component = get_current_component();
            promise.then(value => {
                set_current_component(current_component);
                update(info.then, 1, info.value, value);
                set_current_component(null);
            }, error => {
                set_current_component(current_component);
                update(info.catch, 2, info.error, error);
                set_current_component(null);
                if (!info.hasCatch) {
                    throw error;
                }
            });
            // if we previously had a then/catch block, destroy it
            if (info.current !== info.pending) {
                update(info.pending, 0);
                return true;
            }
        }
        else {
            if (info.current !== info.then) {
                update(info.then, 1, info.value, promise);
                return true;
            }
            info.resolved = promise;
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function destroy_block(block, lookup) {
        block.d(1);
        lookup.delete(block.key);
    }
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(child_ctx, dirty);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error('Cannot have duplicate keys in a keyed each');
            }
            keys.add(key);
        }
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.32.1' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const loc = window.location;
    const URL$1 = `${loc.protocol}//${loc.hostname}/api`;
    const headers = { "Content-Type": "application/json" };
    const httpReq = (endPoint, method, body) => {
        const opts = {
            method: method,
            headers: headers,
        };
        if (body) {
            opts["body"] = JSON.stringify(body);
        }
        const results = fetch(URL$1 + endPoint, opts);
        return results;
    };
    const get = (endPoint) => {
        return httpReq(endPoint, "GET");
    };
    const post = (endPoint, body) => {
        return httpReq(endPoint, "POST", body);
    };
    const patch = (endPoint, body) => {
        return httpReq(endPoint, "PATCH", body);
    };

    const getAllEntries = async () => {
        const response = await get("/entry");
        const json = await response.json();
        if (response.status !== 200) {
            throw new Error(json.message);
        }
        return json;
    };
    const getDefaultEntries = async () => {
        const response = await get("/default");
        const json = await response.json();
        if (response.status !== 200) {
            throw new Error(json.message);
        }
        return json;
    };
    const getSpecificEntries = async (attributes) => {
        // Add the attributes as GET params
        let endPoint = "/entry/specific/?";
        for (const attribute in attributes) {
            if (attribute === "date") {
                const date = attributes[attribute];
                endPoint += `year=${date.getFullYear()}&month=${date.getMonth() + 1}&`;
            }
            else {
                endPoint += `${attribute}=${attributes[attribute]}&`;
            }
        }
        const response = await get(endPoint);
        const json = await response.json();
        if (response.status !== 200) {
            throw new Error(json.message);
        }
        return json;
    };
    const newEntry = async (newEntry) => {
        // the entries object has to be an array for the API
        let body;
        if (Array.isArray(newEntry))
            body = { entries: newEntry };
        else
            body = { entries: [newEntry] };
        const result = await post("/entry/new", body);
        const json = await result.json();
        if (result.status !== 201) {
            throw new Error(json.message);
        }
        return json;
    };
    const updateEntry = async (entry) => {
        const result = await patch(`/entry/update/${entry.id}`, { entry: entry });
        const json = await result.json();
        if (result.status !== 200) {
            throw new Error(json.message);
        }
        return json;
    };
    /**
     * Sort an array of entries from biggest to smallest values and get a total
     * This sorts [-200, 500, -500, 2000] => [2000, 500, -500, 200]
     * Used in displaying a Category and editing
     *
     * @param entries An an array of unsorted entries
     */
    const sortEntries = (entries) => {
        /*
        Filter out positive from negative values, sort biggest-lowest
        Lön 		20000 	(biggest)
        Försäljning 100 	(lowest)
        Hyra		-5000 	(biggest)
        Viaplay		-109 	(lowest)
        ...
        */
        let total = 0;
        const negative = [], positive = [];
        // Filter out positive values into positive, negative into negative and find the total O(n)
        // Sort the arrays later O(n^2) if len < 10, otherwise O(n log(n))
        entries.forEach((entry) => {
            total += entry.amount;
            if (entry.amount > 0) {
                positive.push(entry);
            }
            else {
                negative.push(entry);
            }
        });
        negative.sort((a, b) => a.amount - b.amount);
        positive.sort((a, b) => b.amount - a.amount);
        const sortedEntries = [...positive, ...negative];
        return { sortedEntries, total };
    };
    var entry = { getAllEntries, getSpecificEntries, newEntry, getDefaultEntries, updateEntry };

    /* src/components/read/ViewCategory.svelte generated by Svelte v3.32.1 */
    const file = "src/components/read/ViewCategory.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    // (26:0) {:else}
    function create_else_block(ctx) {
    	let p0;
    	let t1;
    	let p1;
    	let t2;
    	let t3;

    	const block = {
    		c: function create() {
    			p0 = element("p");
    			p0.textContent = "No data?";
    			t1 = space();
    			p1 = element("p");
    			t2 = text("category = ");
    			t3 = text(/*category*/ ctx[1]);
    			add_location(p0, file, 26, 1, 594);
    			add_location(p1, file, 27, 1, 611);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, p1, anchor);
    			append_dev(p1, t2);
    			append_dev(p1, t3);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*category*/ 2) set_data_dev(t3, /*category*/ ctx[1]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(p1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(26:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (8:0) {#if entries !== undefined}
    function create_if_block(ctx) {
    	let h3;
    	let t0;
    	let t1;
    	let table;
    	let tr0;
    	let th0;
    	let t3;
    	let th1;
    	let t5;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let t6;
    	let tr1;
    	let td0;
    	let t8;
    	let td1;
    	let each_value = /*sortedEntries*/ ctx[2];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*entry*/ ctx[4].id;
    	validate_each_keys(ctx, each_value, get_each_context, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			h3 = element("h3");
    			t0 = text(/*category*/ ctx[1]);
    			t1 = space();
    			table = element("table");
    			tr0 = element("tr");
    			th0 = element("th");
    			th0.textContent = "Beskrivning";
    			t3 = space();
    			th1 = element("th");
    			th1.textContent = "Belopp";
    			t5 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t6 = space();
    			tr1 = element("tr");
    			td0 = element("td");
    			td0.textContent = "Totalt";
    			t8 = space();
    			td1 = element("td");

    			td1.textContent = `${/*total*/ ctx[3] < 0
			? /*total*/ ctx[3]
			: "+" + /*total*/ ctx[3]}`;

    			attr_dev(h3, "class", "entries-header");
    			add_location(h3, file, 8, 1, 211);
    			add_location(th0, file, 11, 3, 273);
    			attr_dev(th1, "class", "right");
    			add_location(th1, file, 12, 3, 297);
    			attr_dev(tr0, "class", "svelte-3mphah");
    			add_location(tr0, file, 10, 2, 265);
    			add_location(td0, file, 21, 3, 491);
    			attr_dev(td1, "class", "right");
    			add_location(td1, file, 22, 3, 510);
    			attr_dev(tr1, "class", "svelte-3mphah");
    			add_location(tr1, file, 20, 2, 483);
    			attr_dev(table, "class", "svelte-3mphah");
    			add_location(table, file, 9, 1, 255);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h3, anchor);
    			append_dev(h3, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, table, anchor);
    			append_dev(table, tr0);
    			append_dev(tr0, th0);
    			append_dev(tr0, t3);
    			append_dev(tr0, th1);
    			append_dev(table, t5);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(table, null);
    			}

    			append_dev(table, t6);
    			append_dev(table, tr1);
    			append_dev(tr1, td0);
    			append_dev(tr1, t8);
    			append_dev(tr1, td1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*category*/ 2) set_data_dev(t0, /*category*/ ctx[1]);

    			if (dirty & /*sortedEntries*/ 4) {
    				each_value = /*sortedEntries*/ ctx[2];
    				validate_each_argument(each_value);
    				validate_each_keys(ctx, each_value, get_each_context, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, table, destroy_block, create_each_block, t6, get_each_context);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h3);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(table);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(8:0) {#if entries !== undefined}",
    		ctx
    	});

    	return block;
    }

    // (15:2) {#each sortedEntries as entry (entry.id)}
    function create_each_block(key_1, ctx) {
    	let tr;
    	let td0;
    	let t0_value = /*entry*/ ctx[4].description + "";
    	let t0;
    	let t1;
    	let td1;
    	let t2_value = /*entry*/ ctx[4].amount + "";
    	let t2;

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			t0 = text(t0_value);
    			t1 = space();
    			td1 = element("td");
    			t2 = text(t2_value);
    			add_location(td0, file, 16, 4, 391);
    			attr_dev(td1, "class", "right");
    			add_location(td1, file, 17, 4, 424);
    			attr_dev(tr, "class", "svelte-3mphah");
    			add_location(tr, file, 15, 3, 382);
    			this.first = tr;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(td0, t0);
    			append_dev(tr, t1);
    			append_dev(tr, td1);
    			append_dev(td1, t2);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(15:2) {#each sortedEntries as entry (entry.id)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*entries*/ ctx[0] !== undefined) return create_if_block;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ViewCategory", slots, []);
    	
    	let { entries } = $$props;
    	let { category } = $$props;
    	const { sortedEntries, total } = sortEntries(entries);
    	const writable_props = ["entries", "category"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ViewCategory> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("entries" in $$props) $$invalidate(0, entries = $$props.entries);
    		if ("category" in $$props) $$invalidate(1, category = $$props.category);
    	};

    	$$self.$capture_state = () => ({
    		sortEntries,
    		entries,
    		category,
    		sortedEntries,
    		total
    	});

    	$$self.$inject_state = $$props => {
    		if ("entries" in $$props) $$invalidate(0, entries = $$props.entries);
    		if ("category" in $$props) $$invalidate(1, category = $$props.category);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [entries, category, sortedEntries, total];
    }

    class ViewCategory extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { entries: 0, category: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ViewCategory",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*entries*/ ctx[0] === undefined && !("entries" in props)) {
    			console.warn("<ViewCategory> was created without expected prop 'entries'");
    		}

    		if (/*category*/ ctx[1] === undefined && !("category" in props)) {
    			console.warn("<ViewCategory> was created without expected prop 'category'");
    		}
    	}

    	get entries() {
    		throw new Error("<ViewCategory>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set entries(value) {
    		throw new Error("<ViewCategory>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get category() {
    		throw new Error("<ViewCategory>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set category(value) {
    		throw new Error("<ViewCategory>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/edit/InPlaceEdit.svelte generated by Svelte v3.32.1 */
    const file$1 = "src/components/edit/InPlaceEdit.svelte";

    // (42:0) {:else}
    function create_else_block$1(ctx) {
    	let td;
    	let t;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			td = element("td");
    			t = text(/*value*/ ctx[0]);
    			add_location(td, file$1, 42, 1, 589);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, td, anchor);
    			append_dev(td, t);

    			if (!mounted) {
    				dispose = listen_dev(td, "click", /*edit*/ ctx[3], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*value*/ 1) set_data_dev(t, /*value*/ ctx[0]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(td);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(42:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (40:0) {#if editing}
    function create_if_block$1(ctx) {
    	let input;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			input = element("input");
    			input.required = /*required*/ ctx[1];
    			attr_dev(input, "class", "svelte-1lhsa3f");
    			add_location(input, file$1, 40, 1, 521);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*value*/ ctx[0]);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[6]),
    					listen_dev(input, "blur", /*submit*/ ctx[4], false, false, false),
    					action_destroyer(focus.call(null, input))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*required*/ 2) {
    				prop_dev(input, "required", /*required*/ ctx[1]);
    			}

    			if (dirty & /*value*/ 1 && input.value !== /*value*/ ctx[0]) {
    				set_input_value(input, /*value*/ ctx[0]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(40:0) {#if editing}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*editing*/ ctx[2]) return create_if_block$1;
    		return create_else_block$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function focus(element) {
    	element.focus();
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("InPlaceEdit", slots, []);
    	let { value } = $$props, { required = true } = $$props, { onSubmit } = $$props;
    	let editing = false, original;

    	onMount(() => {
    		original = value;
    	});

    	function edit() {
    		$$invalidate(2, editing = true);
    	}

    	function submit() {
    		if (value !== original) {
    			onSubmit(value);
    		}

    		$$invalidate(2, editing = false);
    	}

    	function keydown(event) {
    		if (event.key == "Escape") {
    			event.preventDefault();
    			$$invalidate(0, value = original);
    			$$invalidate(2, editing = false);
    		}
    	}

    	const writable_props = ["value", "required", "onSubmit"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<InPlaceEdit> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		value = this.value;
    		$$invalidate(0, value);
    	}

    	$$self.$$set = $$props => {
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    		if ("required" in $$props) $$invalidate(1, required = $$props.required);
    		if ("onSubmit" in $$props) $$invalidate(5, onSubmit = $$props.onSubmit);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		value,
    		required,
    		onSubmit,
    		editing,
    		original,
    		edit,
    		submit,
    		keydown,
    		focus
    	});

    	$$self.$inject_state = $$props => {
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    		if ("required" in $$props) $$invalidate(1, required = $$props.required);
    		if ("onSubmit" in $$props) $$invalidate(5, onSubmit = $$props.onSubmit);
    		if ("editing" in $$props) $$invalidate(2, editing = $$props.editing);
    		if ("original" in $$props) original = $$props.original;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [value, required, editing, edit, submit, onSubmit, input_input_handler];
    }

    class InPlaceEdit extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { value: 0, required: 1, onSubmit: 5 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "InPlaceEdit",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*value*/ ctx[0] === undefined && !("value" in props)) {
    			console.warn("<InPlaceEdit> was created without expected prop 'value'");
    		}

    		if (/*onSubmit*/ ctx[5] === undefined && !("onSubmit" in props)) {
    			console.warn("<InPlaceEdit> was created without expected prop 'onSubmit'");
    		}
    	}

    	get value() {
    		throw new Error("<InPlaceEdit>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<InPlaceEdit>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get required() {
    		throw new Error("<InPlaceEdit>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set required(value) {
    		throw new Error("<InPlaceEdit>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onSubmit() {
    		throw new Error("<InPlaceEdit>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onSubmit(value) {
    		throw new Error("<InPlaceEdit>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function noop$1() { }
    function run$1(fn) {
        return fn();
    }
    function blank_object$1() {
        return Object.create(null);
    }
    function run_all$1(fns) {
        fns.forEach(run$1);
    }
    function is_function$1(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal$1(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }

    function append$1(target, node) {
        target.appendChild(node);
    }
    function insert$1(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach$1(node) {
        node.parentNode.removeChild(node);
    }
    function element$1(name) {
        return document.createElement(name);
    }
    function text$1(data) {
        return document.createTextNode(data);
    }
    function attr$1(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children$1(element) {
        return Array.from(element.childNodes);
    }
    function set_data(text, data) {
        data = '' + data;
        if (text.data !== data)
            text.data = data;
    }

    let current_component$1;
    function set_current_component$1(component) {
        current_component$1 = component;
    }

    const dirty_components$1 = [];
    const binding_callbacks$1 = [];
    const render_callbacks$1 = [];
    const flush_callbacks$1 = [];
    const resolved_promise$1 = Promise.resolve();
    let update_scheduled$1 = false;
    function schedule_update$1() {
        if (!update_scheduled$1) {
            update_scheduled$1 = true;
            resolved_promise$1.then(flush$1);
        }
    }
    function add_render_callback$1(fn) {
        render_callbacks$1.push(fn);
    }
    let flushing$1 = false;
    const seen_callbacks$1 = new Set();
    function flush$1() {
        if (flushing$1)
            return;
        flushing$1 = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components$1.length; i += 1) {
                const component = dirty_components$1[i];
                set_current_component$1(component);
                update$1(component.$$);
            }
            dirty_components$1.length = 0;
            while (binding_callbacks$1.length)
                binding_callbacks$1.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks$1.length; i += 1) {
                const callback = render_callbacks$1[i];
                if (!seen_callbacks$1.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks$1.add(callback);
                    callback();
                }
            }
            render_callbacks$1.length = 0;
        } while (dirty_components$1.length);
        while (flush_callbacks$1.length) {
            flush_callbacks$1.pop()();
        }
        update_scheduled$1 = false;
        flushing$1 = false;
        seen_callbacks$1.clear();
    }
    function update$1($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all$1($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback$1);
        }
    }
    const outroing$1 = new Set();
    function transition_in$1(block, local) {
        if (block && block.i) {
            outroing$1.delete(block);
            block.i(local);
        }
    }
    function mount_component$1(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback$1(() => {
            const new_on_destroy = on_mount.map(run$1).filter(is_function$1);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all$1(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback$1);
    }
    function destroy_component$1(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all$1($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty$1(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components$1.push(component);
            schedule_update$1();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init$1(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component$1;
        set_current_component$1(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop$1,
            not_equal,
            bound: blank_object$1(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object$1(),
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty$1(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all$1($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children$1(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach$1);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in$1(component.$$.fragment);
            mount_component$1(component, options.target, options.anchor);
            flush$1();
        }
        set_current_component$1(parent_component);
    }
    class SvelteComponent$1 {
        $destroy() {
            destroy_component$1(this, 1);
            this.$destroy = noop$1;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    /* src/toast.svelte generated by Svelte v3.20.1 */

    function add_css() {
    	var style = element$1("style");
    	style.id = "svelte-3qemlt-style";
    	style.textContent = ".toast-container.svelte-3qemlt{position:fixed;z-index:999}.top.svelte-3qemlt{top:15px}.bottom.svelte-3qemlt{bottom:15px}.left.svelte-3qemlt{left:15px}.right.svelte-3qemlt{right:15px}.center.svelte-3qemlt{left:50%;transform:translateX(-50%);-webkit-transform:translateX(-50%)}.toast.svelte-3qemlt{height:38px;line-height:38px;padding:0 20px;box-shadow:0 1px 3px rgba(0, 0, 0, .12), 0 1px 2px rgba(0, 0, 0, .24);color:#FFF;-webkit-transition:opacity 0.2s, -webkit-transform 0.2s;transition:opacity 0.2s, transform 0.2s, -webkit-transform 0.2s;-webkit-transform:translateY(35px);transform:translateY(35px);opacity:0;max-width:200px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.info.svelte-3qemlt{background-color:#0091EA}.success.svelte-3qemlt{background-color:#4CAF50}.error.svelte-3qemlt{background-color:#F44336}.default.svelte-3qemlt{background-color:#353535}.anim.svelte-3qemlt{opacity:1;-webkit-transform:translateY(0);transform:translateY(0)}";
    	append$1(document.head, style);
    }

    function create_fragment$2(ctx) {
    	let div1;
    	let div0;
    	let t;
    	let div0_class_value;
    	let div1_class_value;

    	return {
    		c() {
    			div1 = element$1("div");
    			div0 = element$1("div");
    			t = text$1(/*msg*/ ctx[0]);
    			attr$1(div0, "class", div0_class_value = "toast " + /*type*/ ctx[1] + " svelte-3qemlt");
    			attr$1(div1, "class", div1_class_value = "toast-container " + /*_position*/ ctx[2] + " svelte-3qemlt");
    		},
    		m(target, anchor) {
    			insert$1(target, div1, anchor);
    			append$1(div1, div0);
    			append$1(div0, t);
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*msg*/ 1) set_data(t, /*msg*/ ctx[0]);

    			if (dirty & /*type*/ 2 && div0_class_value !== (div0_class_value = "toast " + /*type*/ ctx[1] + " svelte-3qemlt")) {
    				attr$1(div0, "class", div0_class_value);
    			}

    			if (dirty & /*_position*/ 4 && div1_class_value !== (div1_class_value = "toast-container " + /*_position*/ ctx[2] + " svelte-3qemlt")) {
    				attr$1(div1, "class", div1_class_value);
    			}
    		},
    		i: noop$1,
    		o: noop$1,
    		d(detaching) {
    			if (detaching) detach$1(div1);
    		}
    	};
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { msg = "" } = $$props;
    	let { type = "" } = $$props;
    	let { position = "bottom-center" } = $$props;

    	$$self.$set = $$props => {
    		if ("msg" in $$props) $$invalidate(0, msg = $$props.msg);
    		if ("type" in $$props) $$invalidate(1, type = $$props.type);
    		if ("position" in $$props) $$invalidate(3, position = $$props.position);
    	};

    	let _position;

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*position*/ 8) {
    			 $$invalidate(2, _position = position.split("-").join(" "));
    		}
    	};

    	return [msg, type, _position, position];
    }

    class Toast extends SvelteComponent$1 {
    	constructor(options) {
    		super();
    		if (!document.getElementById("svelte-3qemlt-style")) add_css();
    		init$1(this, options, instance$2, create_fragment$2, safe_not_equal$1, { msg: 0, type: 1, position: 3 });
    	}
    }

    class Toast$1 {
      constructor(opts) {
        this.opts = Object.assign({
          position: 'bottom-center',
          duration: 2000
        }, opts);
      }

      show(msg) {
        var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        this._show(msg, opts, 'default');
      }

      info(msg) {
        var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        this._show(msg, opts, 'info');
      }

      success(msg) {
        var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        this._show(msg, opts, 'success');
      }

      error(msg) {
        var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        this._show(msg, opts, 'error');
      }

      _show(msg, opts, type) {
        var _opts = Object.assign({}, this.opts, opts);

        var t = new Toast({
          target: document.querySelector('body'),
          props: {
            msg,
            type,
            position: _opts.position
          }
        });
        setTimeout(() => {
          t.$set({
            type: type + ' ' + 'anim'
          });
        }, 0);
        setTimeout(() => {
          t.$destroy();
        }, _opts.duration);
      }

    }

    /* src/components/edit/EditCategory.svelte generated by Svelte v3.32.1 */

    const { console: console_1 } = globals;
    const file$2 = "src/components/edit/EditCategory.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[11] = list[i];
    	return child_ctx;
    }

    // (75:0) {:else}
    function create_else_block$2(ctx) {
    	let p0;
    	let t1;
    	let p1;
    	let t2;
    	let t3;

    	const block = {
    		c: function create() {
    			p0 = element("p");
    			p0.textContent = "No data?";
    			t1 = space();
    			p1 = element("p");
    			t2 = text("category = ");
    			t3 = text(/*category*/ ctx[1]);
    			add_location(p0, file$2, 75, 1, 1762);
    			add_location(p1, file$2, 76, 1, 1779);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, p1, anchor);
    			append_dev(p1, t2);
    			append_dev(p1, t3);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*category*/ 2) set_data_dev(t3, /*category*/ ctx[1]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(p1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(75:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (50:0) {#if entries !== undefined}
    function create_if_block$2(ctx) {
    	let h3;
    	let t0;
    	let t1;
    	let table;
    	let tr0;
    	let th0;
    	let t3;
    	let th1;
    	let t5;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let t6;
    	let tr1;
    	let td0;
    	let t8;
    	let td1;
    	let t10;
    	let button;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value = /*sortedEntries*/ ctx[2];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*entry*/ ctx[11].id;
    	validate_each_keys(ctx, each_value, get_each_context$1, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$1(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$1(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			h3 = element("h3");
    			t0 = text(/*category*/ ctx[1]);
    			t1 = space();
    			table = element("table");
    			tr0 = element("tr");
    			th0 = element("th");
    			th0.textContent = "Beskrivning";
    			t3 = space();
    			th1 = element("th");
    			th1.textContent = "Belopp";
    			t5 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t6 = space();
    			tr1 = element("tr");
    			td0 = element("td");
    			td0.textContent = "Totalt";
    			t8 = space();
    			td1 = element("td");

    			td1.textContent = `${/*total*/ ctx[3] <= -1
			? /*total*/ ctx[3]
			: "+" + /*total*/ ctx[3]}`;

    			t10 = space();
    			button = element("button");
    			button.textContent = "Uppdatera";
    			attr_dev(h3, "class", "entries-header");
    			add_location(h3, file$2, 50, 1, 1172);
    			add_location(th0, file$2, 53, 3, 1234);
    			attr_dev(th1, "class", "right");
    			add_location(th1, file$2, 54, 3, 1258);
    			attr_dev(tr0, "class", "svelte-3mphah");
    			add_location(tr0, file$2, 52, 2, 1226);
    			add_location(td0, file$2, 69, 3, 1603);
    			attr_dev(td1, "class", "right");
    			add_location(td1, file$2, 70, 3, 1622);
    			attr_dev(tr1, "class", "svelte-3mphah");
    			add_location(tr1, file$2, 68, 2, 1595);
    			attr_dev(table, "class", "svelte-3mphah");
    			add_location(table, file$2, 51, 1, 1216);
    			add_location(button, file$2, 73, 1, 1700);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h3, anchor);
    			append_dev(h3, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, table, anchor);
    			append_dev(table, tr0);
    			append_dev(tr0, th0);
    			append_dev(tr0, t3);
    			append_dev(tr0, th1);
    			append_dev(table, t5);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(table, null);
    			}

    			append_dev(table, t6);
    			append_dev(table, tr1);
    			append_dev(tr1, td0);
    			append_dev(tr1, t8);
    			append_dev(tr1, td1);
    			insert_dev(target, t10, anchor);
    			insert_dev(target, button, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[8], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty & /*category*/ 2) set_data_dev(t0, /*category*/ ctx[1]);

    			if (dirty & /*sortedEntries, entryChanged*/ 20) {
    				each_value = /*sortedEntries*/ ctx[2];
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context$1, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, table, outro_and_destroy_block, create_each_block$1, t6, get_each_context$1);
    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h3);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(table);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			if (detaching) detach_dev(t10);
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(50:0) {#if entries !== undefined}",
    		ctx
    	});

    	return block;
    }

    // (57:2) {#each sortedEntries as entry (entry.id)}
    function create_each_block$1(key_1, ctx) {
    	let tr;
    	let inplaceedit0;
    	let t;
    	let inplaceedit1;
    	let current;

    	function func(...args) {
    		return /*func*/ ctx[6](/*entry*/ ctx[11], ...args);
    	}

    	inplaceedit0 = new InPlaceEdit({
    			props: {
    				value: /*entry*/ ctx[11].description,
    				onSubmit: func
    			},
    			$$inline: true
    		});

    	function func_1(...args) {
    		return /*func_1*/ ctx[7](/*entry*/ ctx[11], ...args);
    	}

    	inplaceedit1 = new InPlaceEdit({
    			props: {
    				value: /*entry*/ ctx[11].amount,
    				onSubmit: func_1
    			},
    			$$inline: true
    		});

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			tr = element("tr");
    			create_component(inplaceedit0.$$.fragment);
    			t = space();
    			create_component(inplaceedit1.$$.fragment);
    			attr_dev(tr, "class", "svelte-3mphah");
    			add_location(tr, file$2, 57, 3, 1343);
    			this.first = tr;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			mount_component(inplaceedit0, tr, null);
    			append_dev(tr, t);
    			mount_component(inplaceedit1, tr, null);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(inplaceedit0.$$.fragment, local);
    			transition_in(inplaceedit1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(inplaceedit0.$$.fragment, local);
    			transition_out(inplaceedit1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			destroy_component(inplaceedit0);
    			destroy_component(inplaceedit1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(57:2) {#each sortedEntries as entry (entry.id)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$2, create_else_block$2];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*entries*/ ctx[0] !== undefined) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("EditCategory", slots, []);
    	const toast = new Toast$1();
    	let { entries } = $$props;
    	let { category } = $$props;
    	let { sortedEntries, total } = sortEntries(entries);
    	let editedEntries = [];

    	const entryChanged = (entry, description, newValue) => {
    		console.log("entryChanged called");

    		if (description) {
    			entry.description = newValue;
    		} else {
    			entry.amount = newValue;
    		}

    		// if the entry has already been modified, change that instance
    		let index = editedEntries.findIndex(e => e.id == entry.id);

    		if (index > 0) {
    			editedEntries[index] = entry;
    		} else {
    			editedEntries.push(entry);
    		}
    	};

    	const update = async () => {
    		let success = true;

    		for (const editedEntry of editedEntries) {
    			try {
    				await entry.updateEntry(editedEntry);
    			} catch(err) {
    				toast.error(`Kunde inte uppdatera: ${editedEntry.description}`);
    				success = false;
    			}
    		}

    		if (success) {
    			toast.success(`Uppdaterade ${editedEntries.length} rader.`);
    		}
    	};

    	const writable_props = ["entries", "category"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<EditCategory> was created with unknown prop '${key}'`);
    	});

    	const func = (entry, value) => entryChanged(entry, true, value);
    	const func_1 = (entry, value) => entryChanged(entry, false, value);
    	const click_handler = () => update();

    	$$self.$$set = $$props => {
    		if ("entries" in $$props) $$invalidate(0, entries = $$props.entries);
    		if ("category" in $$props) $$invalidate(1, category = $$props.category);
    	};

    	$$self.$capture_state = () => ({
    		sortEntries,
    		InPlaceEdit,
    		entry,
    		Toast: Toast$1,
    		toast,
    		entries,
    		category,
    		sortedEntries,
    		total,
    		editedEntries,
    		entryChanged,
    		update
    	});

    	$$self.$inject_state = $$props => {
    		if ("entries" in $$props) $$invalidate(0, entries = $$props.entries);
    		if ("category" in $$props) $$invalidate(1, category = $$props.category);
    		if ("sortedEntries" in $$props) $$invalidate(2, sortedEntries = $$props.sortedEntries);
    		if ("total" in $$props) $$invalidate(3, total = $$props.total);
    		if ("editedEntries" in $$props) editedEntries = $$props.editedEntries;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		entries,
    		category,
    		sortedEntries,
    		total,
    		entryChanged,
    		update,
    		func,
    		func_1,
    		click_handler
    	];
    }

    class EditCategory extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { entries: 0, category: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "EditCategory",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*entries*/ ctx[0] === undefined && !("entries" in props)) {
    			console_1.warn("<EditCategory> was created without expected prop 'entries'");
    		}

    		if (/*category*/ ctx[1] === undefined && !("category" in props)) {
    			console_1.warn("<EditCategory> was created without expected prop 'category'");
    		}
    	}

    	get entries() {
    		throw new Error("<EditCategory>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set entries(value) {
    		throw new Error("<EditCategory>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get category() {
    		throw new Error("<EditCategory>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set category(value) {
    		throw new Error("<EditCategory>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Budget.svelte generated by Svelte v3.32.1 */
    const file$3 = "src/components/Budget.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	return child_ctx;
    }

    // (27:0) {#each data.categories as category}
    function create_each_block$2(ctx) {
    	let div;
    	let switch_instance;
    	let t;
    	let current;
    	var switch_value = /*component*/ ctx[2];

    	function switch_props(ctx) {
    		return {
    			props: {
    				entries: /*seperated*/ ctx[1][/*category*/ ctx[6]],
    				category: /*category*/ ctx[6]
    			},
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props(ctx));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			t = space();
    			attr_dev(div, "class", "category svelte-ayxflb");
    			add_location(div, file$3, 27, 1, 888);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (switch_instance) {
    				mount_component(switch_instance, div, null);
    			}

    			append_dev(div, t);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = {};
    			if (dirty & /*seperated, data*/ 3) switch_instance_changes.entries = /*seperated*/ ctx[1][/*category*/ ctx[6]];
    			if (dirty & /*data*/ 1) switch_instance_changes.category = /*category*/ ctx[6];

    			if (switch_value !== (switch_value = /*component*/ ctx[2])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, div, t);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (switch_instance) destroy_component(switch_instance);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(27:0) {#each data.categories as category}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value = /*data*/ ctx[0].categories;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*component, seperated, data*/ 7) {
    				each_value = /*data*/ ctx[0].categories;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Budget", slots, []);
    	
    	let { readOnly } = $$props;
    	let component = readOnly === true ? ViewCategory : EditCategory;
    	let { data } = $$props;
    	let seperated = [];
    	gemensammaFirst();
    	separateCategories();

    	function gemensammaFirst() {
    		const gemensamma = data.categories.indexOf("Gemensamma");

    		if (gemensamma > 0) {
    			let temporary = data.categories[0];
    			$$invalidate(0, data.categories[0] = data.categories[gemensamma], data);
    			$$invalidate(0, data.categories[gemensamma] = temporary, data);
    		}
    	}

    	function separateCategories() {
    		data.categories.forEach(category => {
    			$$invalidate(1, seperated[category] = data.result.filter(entry => entry.Category.name === category), seperated);
    		});

    		return seperated;
    	}

    	const writable_props = ["readOnly", "data"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Budget> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("readOnly" in $$props) $$invalidate(3, readOnly = $$props.readOnly);
    		if ("data" in $$props) $$invalidate(0, data = $$props.data);
    	};

    	$$self.$capture_state = () => ({
    		ViewCategory,
    		EditCategory,
    		readOnly,
    		component,
    		data,
    		seperated,
    		gemensammaFirst,
    		separateCategories
    	});

    	$$self.$inject_state = $$props => {
    		if ("readOnly" in $$props) $$invalidate(3, readOnly = $$props.readOnly);
    		if ("component" in $$props) $$invalidate(2, component = $$props.component);
    		if ("data" in $$props) $$invalidate(0, data = $$props.data);
    		if ("seperated" in $$props) $$invalidate(1, seperated = $$props.seperated);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [data, seperated, component, readOnly];
    }

    class Budget extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { readOnly: 3, data: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Budget",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*readOnly*/ ctx[3] === undefined && !("readOnly" in props)) {
    			console.warn("<Budget> was created without expected prop 'readOnly'");
    		}

    		if (/*data*/ ctx[0] === undefined && !("data" in props)) {
    			console.warn("<Budget> was created without expected prop 'data'");
    		}
    	}

    	get readOnly() {
    		throw new Error("<Budget>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set readOnly(value) {
    		throw new Error("<Budget>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get data() {
    		throw new Error("<Budget>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set data(value) {
    		throw new Error("<Budget>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/SelectBudget.svelte generated by Svelte v3.32.1 */
    const file$4 = "src/components/SelectBudget.svelte";

    // (1:0) <script lang="ts">import entry from '../controllers/entry'; import Budget from './Budget.svelte'; export let readOnly; let dateString = new Date().toISOString().slice(0, 10); let data; $: {     data = entry.getSpecificEntries({ date: new Date(dateString) }
    function create_catch_block(ctx) {
    	const block = {
    		c: noop,
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block.name,
    		type: "catch",
    		source: "(1:0) <script lang=\\\"ts\\\">import entry from '../controllers/entry'; import Budget from './Budget.svelte'; export let readOnly; let dateString = new Date().toISOString().slice(0, 10); let data; $: {     data = entry.getSpecificEntries({ date: new Date(dateString) }",
    		ctx
    	});

    	return block;
    }

    // (14:1) {:then data}
    function create_then_block(ctx) {
    	let div;
    	let h2;
    	let t0;
    	let input;
    	let t1;
    	let budget;
    	let current;
    	let mounted;
    	let dispose;

    	budget = new Budget({
    			props: {
    				data: /*data*/ ctx[2],
    				readOnly: /*readOnly*/ ctx[0]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			h2 = element("h2");
    			t0 = text("Budget ");
    			input = element("input");
    			t1 = space();
    			create_component(budget.$$.fragment);
    			attr_dev(input, "id", "datepicker");
    			attr_dev(input, "type", "date");
    			attr_dev(input, "class", "svelte-1m3r5e7");
    			add_location(input, file$4, 15, 14, 392);
    			add_location(h2, file$4, 15, 3, 381);
    			attr_dev(div, "class", "budget");
    			add_location(div, file$4, 14, 2, 357);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h2);
    			append_dev(h2, t0);
    			append_dev(h2, input);
    			set_input_value(input, /*dateString*/ ctx[1]);
    			append_dev(div, t1);
    			mount_component(budget, div, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(input, "input", /*input_input_handler*/ ctx[3]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*dateString*/ 2) {
    				set_input_value(input, /*dateString*/ ctx[1]);
    			}

    			const budget_changes = {};
    			if (dirty & /*data*/ 4) budget_changes.data = /*data*/ ctx[2];
    			if (dirty & /*readOnly*/ 1) budget_changes.readOnly = /*readOnly*/ ctx[0];
    			budget.$set(budget_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(budget.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(budget.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(budget);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block.name,
    		type: "then",
    		source: "(14:1) {:then data}",
    		ctx
    	});

    	return block;
    }

    // (12:14)    <p>Hämtar budgetar</p>  {:then data}
    function create_pending_block(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Hämtar budgetar";
    			add_location(p, file$4, 12, 2, 318);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block.name,
    		type: "pending",
    		source: "(12:14)    <p>Hämtar budgetar</p>  {:then data}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let div;
    	let promise;
    	let current;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: false,
    		pending: create_pending_block,
    		then: create_then_block,
    		catch: create_catch_block,
    		value: 2,
    		blocks: [,,,]
    	};

    	handle_promise(promise = /*data*/ ctx[2], info);

    	const block = {
    		c: function create() {
    			div = element("div");
    			info.block.c();
    			attr_dev(div, "class", "flex-container svelte-1m3r5e7");
    			add_location(div, file$4, 10, 0, 272);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			info.block.m(div, info.anchor = null);
    			info.mount = () => div;
    			info.anchor = null;
    			current = true;
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    			info.ctx = ctx;

    			if (dirty & /*data*/ 4 && promise !== (promise = /*data*/ ctx[2]) && handle_promise(promise, info)) ; else {
    				const child_ctx = ctx.slice();
    				child_ctx[2] = info.resolved;
    				info.block.p(child_ctx, dirty);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(info.block);
    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < 3; i += 1) {
    				const block = info.blocks[i];
    				transition_out(block);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			info.block.d();
    			info.token = null;
    			info = null;
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("SelectBudget", slots, []);
    	let { readOnly } = $$props;
    	let dateString = new Date().toISOString().slice(0, 10);
    	let data;
    	const writable_props = ["readOnly"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SelectBudget> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		dateString = this.value;
    		$$invalidate(1, dateString);
    	}

    	$$self.$$set = $$props => {
    		if ("readOnly" in $$props) $$invalidate(0, readOnly = $$props.readOnly);
    	};

    	$$self.$capture_state = () => ({
    		entry,
    		Budget,
    		readOnly,
    		dateString,
    		data
    	});

    	$$self.$inject_state = $$props => {
    		if ("readOnly" in $$props) $$invalidate(0, readOnly = $$props.readOnly);
    		if ("dateString" in $$props) $$invalidate(1, dateString = $$props.dateString);
    		if ("data" in $$props) $$invalidate(2, data = $$props.data);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*dateString*/ 2) {
    			{
    				$$invalidate(2, data = entry.getSpecificEntries({ date: new Date(dateString) }));
    			}
    		}
    	};

    	return [readOnly, dateString, data, input_input_handler];
    }

    class SelectBudget extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { readOnly: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SelectBudget",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*readOnly*/ ctx[0] === undefined && !("readOnly" in props)) {
    			console.warn("<SelectBudget> was created without expected prop 'readOnly'");
    		}
    	}

    	get readOnly() {
    		throw new Error("<SelectBudget>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set readOnly(value) {
    		throw new Error("<SelectBudget>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/edit/EditBudget.svelte generated by Svelte v3.32.1 */

    function create_fragment$6(ctx) {
    	let selectbudget;
    	let current;

    	selectbudget = new SelectBudget({
    			props: { readOnly: "false" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(selectbudget.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(selectbudget, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(selectbudget.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(selectbudget.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(selectbudget, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("EditBudget", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<EditBudget> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ SelectBudget });
    	return [];
    }

    class EditBudget extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "EditBudget",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src/components/read/ViewBudget.svelte generated by Svelte v3.32.1 */

    function create_fragment$7(ctx) {
    	let selectbudget;
    	let current;

    	selectbudget = new SelectBudget({
    			props: { readOnly: "true" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(selectbudget.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(selectbudget, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(selectbudget.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(selectbudget.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(selectbudget, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ViewBudget", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ViewBudget> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ SelectBudget });
    	return [];
    }

    class ViewBudget extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ViewBudget",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const gemensamTotal = writable(0);

    /* eslint-disable @typescript-eslint/explicit-module-boundary-types */
    // Taken from
    // https://svelte.dev/repl/0ace7a508bd843b798ae599940a91783?version=3.16.7
    function clickOutside(node) {
    	const handleClick = event => {
    		if (node && !node.contains(event.target) && !event.defaultPrevented) {
    			node.dispatchEvent(
    				new CustomEvent("click_outside", node)
    			);
    		}
    	};

    	document.addEventListener("click", handleClick, true);

    	return {
    		destroy() {
    			document.removeEventListener("click", handleClick, true);
    		}
    	};
    }

    /* src/components/create/NewCategory.svelte generated by Svelte v3.32.1 */
    const file$5 = "src/components/create/NewCategory.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[12] = list[i];
    	child_ctx[13] = list;
    	child_ctx[14] = i;
    	return child_ctx;
    }

    // (82:1) {#each entries as entry}
    function create_each_block$3(ctx) {
    	let div;
    	let input0;
    	let t;
    	let input1;
    	let mounted;
    	let dispose;

    	function input0_input_handler() {
    		/*input0_input_handler*/ ctx[4].call(input0, /*each_value*/ ctx[13], /*entry_index*/ ctx[14]);
    	}

    	function input1_input_handler() {
    		/*input1_input_handler*/ ctx[5].call(input1, /*each_value*/ ctx[13], /*entry_index*/ ctx[14]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			input0 = element("input");
    			t = space();
    			input1 = element("input");
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "placeholder", "Beskrivning");
    			attr_dev(input0, "class", "description svelte-1n6yju0");
    			add_location(input0, file$5, 83, 3, 2107);
    			attr_dev(input1, "type", "number");
    			attr_dev(input1, "placeholder", "Belopp");
    			attr_dev(input1, "class", "amount svelte-1n6yju0");
    			add_location(input1, file$5, 89, 3, 2228);
    			attr_dev(div, "class", "entry-container svelte-1n6yju0");
    			add_location(div, file$5, 82, 2, 2074);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, input0);
    			set_input_value(input0, /*entry*/ ctx[12].description);
    			append_dev(div, t);
    			append_dev(div, input1);
    			set_input_value(input1, /*entry*/ ctx[12].amount);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", input0_input_handler),
    					listen_dev(input1, "input", input1_input_handler)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*entries*/ 1 && input0.value !== /*entry*/ ctx[12].description) {
    				set_input_value(input0, /*entry*/ ctx[12].description);
    			}

    			if (dirty & /*entries*/ 1 && to_number(input1.value) !== /*entry*/ ctx[12].amount) {
    				set_input_value(input1, /*entry*/ ctx[12].amount);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(82:1) {#each entries as entry}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let h4;
    	let t0;
    	let t1;
    	let form;
    	let t2;
    	let div;
    	let input0;
    	let t3;
    	let input1;
    	let mounted;
    	let dispose;
    	let each_value = /*entries*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			h4 = element("h4");
    			t0 = text(/*category*/ ctx[1]);
    			t1 = space();
    			form = element("form");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			div = element("div");
    			input0 = element("input");
    			t3 = space();
    			input1 = element("input");
    			add_location(h4, file$5, 79, 0, 1976);
    			input0.disabled = true;
    			attr_dev(input0, "type", "text");
    			input0.value = "Totalt";
    			attr_dev(input0, "class", "description svelte-1n6yju0");
    			add_location(input0, file$5, 93, 2, 2365);
    			input1.disabled = true;
    			attr_dev(input1, "type", "number");
    			attr_dev(input1, "class", "amount svelte-1n6yju0");
    			add_location(input1, file$5, 94, 2, 2433);
    			attr_dev(div, "class", "entry-container svelte-1n6yju0");
    			add_location(div, file$5, 92, 1, 2333);
    			add_location(form, file$5, 80, 0, 1996);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h4, anchor);
    			append_dev(h4, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, form, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(form, null);
    			}

    			append_dev(form, t2);
    			append_dev(form, div);
    			append_dev(div, input0);
    			append_dev(div, t3);
    			append_dev(div, input1);
    			set_input_value(input1, /*total*/ ctx[2]);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input1, "input", /*input1_input_handler_1*/ ctx[6]),
    					action_destroyer(clickOutside.call(null, form)),
    					listen_dev(form, "click_outside", /*update*/ ctx[3], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*category*/ 2) set_data_dev(t0, /*category*/ ctx[1]);

    			if (dirty & /*entries*/ 1) {
    				each_value = /*entries*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(form, t2);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*total*/ 4 && to_number(input1.value) !== /*total*/ ctx[2]) {
    				set_input_value(input1, /*total*/ ctx[2]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h4);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(form);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("NewCategory", slots, []);
    	let { entries } = $$props;
    	let { category } = $$props;
    	let total = 0;

    	// special value to balance out if one person should pay more for the common costs
    	// "half of gemsamma even outer"
    	let HOG_evenOuter = 0;

    	// some default entries can have a special first row with description
    	// "HALF_OF_GEMENSAMMA" where the value should be the half of gemensamma's total
    	// subscribe to the total and update the amount
    	if (entries[0].description === "HALF_OF_GEMENSAMMA") {
    		let entry = entries[0];
    		HOG_evenOuter = entry.amount;
    		let description = "Halva gemensamma";
    		if (HOG_evenOuter > 0) description += ` (+${HOG_evenOuter})`; else if (HOG_evenOuter < 0) description += ` (${HOG_evenOuter})`;
    		entry.description = description;

    		gemensamTotal.subscribe(value => {
    			entry.amount = value / 2 - HOG_evenOuter;
    		});
    	}

    	const isEmptyEntry = entry => {
    		return isEmptyString(entry.description) && isEmptyString(entry.amount);
    	};

    	const isEmptyString = str => {
    		return str == undefined || str.length == 0;
    	};

    	// Remove any empty rows and update the total
    	// Sort the entries by amount lowest - highest
    	// Run when clicking outside the form and onMount()
    	const update = () => {
    		removeEmptyRows();
    		let { entries, total } = sortEntries(entries);

    		if (category === "Gemensamma") {
    			gemensamTotal.set(total);
    		}
    	};

    	const removeEmptyRows = () => {
    		$$invalidate(0, entries = entries.filter(entry => !isEmptyEntry(entry)));
    	};

    	const newRow = () => {
    		let newEntry = {
    			Category: entries[0].Category,
    			description: "",
    			amount: "",
    			date: new Date()
    		};

    		$$invalidate(0, entries = [...entries, newEntry]);
    	};

    	onMount(() => {
    		update();
    	});

    	const writable_props = ["entries", "category"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<NewCategory> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler(each_value, entry_index) {
    		each_value[entry_index].description = this.value;
    		$$invalidate(0, entries);
    	}

    	function input1_input_handler(each_value, entry_index) {
    		each_value[entry_index].amount = to_number(this.value);
    		$$invalidate(0, entries);
    	}

    	function input1_input_handler_1() {
    		total = to_number(this.value);
    		$$invalidate(2, total);
    	}

    	$$self.$$set = $$props => {
    		if ("entries" in $$props) $$invalidate(0, entries = $$props.entries);
    		if ("category" in $$props) $$invalidate(1, category = $$props.category);
    	};

    	$$self.$capture_state = () => ({
    		gemensamTotal,
    		entry,
    		sortEntries,
    		clickOutside,
    		onMount,
    		entries,
    		category,
    		total,
    		HOG_evenOuter,
    		isEmptyEntry,
    		isEmptyString,
    		update,
    		removeEmptyRows,
    		newRow
    	});

    	$$self.$inject_state = $$props => {
    		if ("entries" in $$props) $$invalidate(0, entries = $$props.entries);
    		if ("category" in $$props) $$invalidate(1, category = $$props.category);
    		if ("total" in $$props) $$invalidate(2, total = $$props.total);
    		if ("HOG_evenOuter" in $$props) HOG_evenOuter = $$props.HOG_evenOuter;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*entries*/ 1) {
    			{
    				let len = entries.length;
    				entries[len - 1];

    				if (!isEmptyEntry) {
    					newRow();
    				}
    			}
    		}
    	};

    	return [
    		entries,
    		category,
    		total,
    		update,
    		input0_input_handler,
    		input1_input_handler,
    		input1_input_handler_1
    	];
    }

    class NewCategory extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { entries: 0, category: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NewCategory",
    			options,
    			id: create_fragment$8.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*entries*/ ctx[0] === undefined && !("entries" in props)) {
    			console.warn("<NewCategory> was created without expected prop 'entries'");
    		}

    		if (/*category*/ ctx[1] === undefined && !("category" in props)) {
    			console.warn("<NewCategory> was created without expected prop 'category'");
    		}
    	}

    	get entries() {
    		throw new Error("<NewCategory>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set entries(value) {
    		throw new Error("<NewCategory>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get category() {
    		throw new Error("<NewCategory>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set category(value) {
    		throw new Error("<NewCategory>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function createCommonjsModule(fn) {
      var module = { exports: {} };
    	return fn(module, module.exports), module.exports;
    }

    var page = createCommonjsModule(function (module, exports) {
    (function (global, factory) {
    	module.exports = factory() ;
    }(commonjsGlobal, (function () {
    var isarray = Array.isArray || function (arr) {
      return Object.prototype.toString.call(arr) == '[object Array]';
    };

    /**
     * Expose `pathToRegexp`.
     */
    var pathToRegexp_1 = pathToRegexp;
    var parse_1 = parse;
    var compile_1 = compile;
    var tokensToFunction_1 = tokensToFunction;
    var tokensToRegExp_1 = tokensToRegExp;

    /**
     * The main path matching regexp utility.
     *
     * @type {RegExp}
     */
    var PATH_REGEXP = new RegExp([
      // Match escaped characters that would otherwise appear in future matches.
      // This allows the user to escape special characters that won't transform.
      '(\\\\.)',
      // Match Express-style parameters and un-named parameters with a prefix
      // and optional suffixes. Matches appear as:
      //
      // "/:test(\\d+)?" => ["/", "test", "\d+", undefined, "?", undefined]
      // "/route(\\d+)"  => [undefined, undefined, undefined, "\d+", undefined, undefined]
      // "/*"            => ["/", undefined, undefined, undefined, undefined, "*"]
      '([\\/.])?(?:(?:\\:(\\w+)(?:\\(((?:\\\\.|[^()])+)\\))?|\\(((?:\\\\.|[^()])+)\\))([+*?])?|(\\*))'
    ].join('|'), 'g');

    /**
     * Parse a string for the raw tokens.
     *
     * @param  {String} str
     * @return {Array}
     */
    function parse (str) {
      var tokens = [];
      var key = 0;
      var index = 0;
      var path = '';
      var res;

      while ((res = PATH_REGEXP.exec(str)) != null) {
        var m = res[0];
        var escaped = res[1];
        var offset = res.index;
        path += str.slice(index, offset);
        index = offset + m.length;

        // Ignore already escaped sequences.
        if (escaped) {
          path += escaped[1];
          continue
        }

        // Push the current path onto the tokens.
        if (path) {
          tokens.push(path);
          path = '';
        }

        var prefix = res[2];
        var name = res[3];
        var capture = res[4];
        var group = res[5];
        var suffix = res[6];
        var asterisk = res[7];

        var repeat = suffix === '+' || suffix === '*';
        var optional = suffix === '?' || suffix === '*';
        var delimiter = prefix || '/';
        var pattern = capture || group || (asterisk ? '.*' : '[^' + delimiter + ']+?');

        tokens.push({
          name: name || key++,
          prefix: prefix || '',
          delimiter: delimiter,
          optional: optional,
          repeat: repeat,
          pattern: escapeGroup(pattern)
        });
      }

      // Match any characters still remaining.
      if (index < str.length) {
        path += str.substr(index);
      }

      // If the path exists, push it onto the end.
      if (path) {
        tokens.push(path);
      }

      return tokens
    }

    /**
     * Compile a string to a template function for the path.
     *
     * @param  {String}   str
     * @return {Function}
     */
    function compile (str) {
      return tokensToFunction(parse(str))
    }

    /**
     * Expose a method for transforming tokens into the path function.
     */
    function tokensToFunction (tokens) {
      // Compile all the tokens into regexps.
      var matches = new Array(tokens.length);

      // Compile all the patterns before compilation.
      for (var i = 0; i < tokens.length; i++) {
        if (typeof tokens[i] === 'object') {
          matches[i] = new RegExp('^' + tokens[i].pattern + '$');
        }
      }

      return function (obj) {
        var path = '';
        var data = obj || {};

        for (var i = 0; i < tokens.length; i++) {
          var token = tokens[i];

          if (typeof token === 'string') {
            path += token;

            continue
          }

          var value = data[token.name];
          var segment;

          if (value == null) {
            if (token.optional) {
              continue
            } else {
              throw new TypeError('Expected "' + token.name + '" to be defined')
            }
          }

          if (isarray(value)) {
            if (!token.repeat) {
              throw new TypeError('Expected "' + token.name + '" to not repeat, but received "' + value + '"')
            }

            if (value.length === 0) {
              if (token.optional) {
                continue
              } else {
                throw new TypeError('Expected "' + token.name + '" to not be empty')
              }
            }

            for (var j = 0; j < value.length; j++) {
              segment = encodeURIComponent(value[j]);

              if (!matches[i].test(segment)) {
                throw new TypeError('Expected all "' + token.name + '" to match "' + token.pattern + '", but received "' + segment + '"')
              }

              path += (j === 0 ? token.prefix : token.delimiter) + segment;
            }

            continue
          }

          segment = encodeURIComponent(value);

          if (!matches[i].test(segment)) {
            throw new TypeError('Expected "' + token.name + '" to match "' + token.pattern + '", but received "' + segment + '"')
          }

          path += token.prefix + segment;
        }

        return path
      }
    }

    /**
     * Escape a regular expression string.
     *
     * @param  {String} str
     * @return {String}
     */
    function escapeString (str) {
      return str.replace(/([.+*?=^!:${}()[\]|\/])/g, '\\$1')
    }

    /**
     * Escape the capturing group by escaping special characters and meaning.
     *
     * @param  {String} group
     * @return {String}
     */
    function escapeGroup (group) {
      return group.replace(/([=!:$\/()])/g, '\\$1')
    }

    /**
     * Attach the keys as a property of the regexp.
     *
     * @param  {RegExp} re
     * @param  {Array}  keys
     * @return {RegExp}
     */
    function attachKeys (re, keys) {
      re.keys = keys;
      return re
    }

    /**
     * Get the flags for a regexp from the options.
     *
     * @param  {Object} options
     * @return {String}
     */
    function flags (options) {
      return options.sensitive ? '' : 'i'
    }

    /**
     * Pull out keys from a regexp.
     *
     * @param  {RegExp} path
     * @param  {Array}  keys
     * @return {RegExp}
     */
    function regexpToRegexp (path, keys) {
      // Use a negative lookahead to match only capturing groups.
      var groups = path.source.match(/\((?!\?)/g);

      if (groups) {
        for (var i = 0; i < groups.length; i++) {
          keys.push({
            name: i,
            prefix: null,
            delimiter: null,
            optional: false,
            repeat: false,
            pattern: null
          });
        }
      }

      return attachKeys(path, keys)
    }

    /**
     * Transform an array into a regexp.
     *
     * @param  {Array}  path
     * @param  {Array}  keys
     * @param  {Object} options
     * @return {RegExp}
     */
    function arrayToRegexp (path, keys, options) {
      var parts = [];

      for (var i = 0; i < path.length; i++) {
        parts.push(pathToRegexp(path[i], keys, options).source);
      }

      var regexp = new RegExp('(?:' + parts.join('|') + ')', flags(options));

      return attachKeys(regexp, keys)
    }

    /**
     * Create a path regexp from string input.
     *
     * @param  {String} path
     * @param  {Array}  keys
     * @param  {Object} options
     * @return {RegExp}
     */
    function stringToRegexp (path, keys, options) {
      var tokens = parse(path);
      var re = tokensToRegExp(tokens, options);

      // Attach keys back to the regexp.
      for (var i = 0; i < tokens.length; i++) {
        if (typeof tokens[i] !== 'string') {
          keys.push(tokens[i]);
        }
      }

      return attachKeys(re, keys)
    }

    /**
     * Expose a function for taking tokens and returning a RegExp.
     *
     * @param  {Array}  tokens
     * @param  {Array}  keys
     * @param  {Object} options
     * @return {RegExp}
     */
    function tokensToRegExp (tokens, options) {
      options = options || {};

      var strict = options.strict;
      var end = options.end !== false;
      var route = '';
      var lastToken = tokens[tokens.length - 1];
      var endsWithSlash = typeof lastToken === 'string' && /\/$/.test(lastToken);

      // Iterate over the tokens and create our regexp string.
      for (var i = 0; i < tokens.length; i++) {
        var token = tokens[i];

        if (typeof token === 'string') {
          route += escapeString(token);
        } else {
          var prefix = escapeString(token.prefix);
          var capture = token.pattern;

          if (token.repeat) {
            capture += '(?:' + prefix + capture + ')*';
          }

          if (token.optional) {
            if (prefix) {
              capture = '(?:' + prefix + '(' + capture + '))?';
            } else {
              capture = '(' + capture + ')?';
            }
          } else {
            capture = prefix + '(' + capture + ')';
          }

          route += capture;
        }
      }

      // In non-strict mode we allow a slash at the end of match. If the path to
      // match already ends with a slash, we remove it for consistency. The slash
      // is valid at the end of a path match, not in the middle. This is important
      // in non-ending mode, where "/test/" shouldn't match "/test//route".
      if (!strict) {
        route = (endsWithSlash ? route.slice(0, -2) : route) + '(?:\\/(?=$))?';
      }

      if (end) {
        route += '$';
      } else {
        // In non-ending mode, we need the capturing groups to match as much as
        // possible by using a positive lookahead to the end or next path segment.
        route += strict && endsWithSlash ? '' : '(?=\\/|$)';
      }

      return new RegExp('^' + route, flags(options))
    }

    /**
     * Normalize the given path string, returning a regular expression.
     *
     * An empty array can be passed in for the keys, which will hold the
     * placeholder key descriptions. For example, using `/user/:id`, `keys` will
     * contain `[{ name: 'id', delimiter: '/', optional: false, repeat: false }]`.
     *
     * @param  {(String|RegExp|Array)} path
     * @param  {Array}                 [keys]
     * @param  {Object}                [options]
     * @return {RegExp}
     */
    function pathToRegexp (path, keys, options) {
      keys = keys || [];

      if (!isarray(keys)) {
        options = keys;
        keys = [];
      } else if (!options) {
        options = {};
      }

      if (path instanceof RegExp) {
        return regexpToRegexp(path, keys)
      }

      if (isarray(path)) {
        return arrayToRegexp(path, keys, options)
      }

      return stringToRegexp(path, keys, options)
    }

    pathToRegexp_1.parse = parse_1;
    pathToRegexp_1.compile = compile_1;
    pathToRegexp_1.tokensToFunction = tokensToFunction_1;
    pathToRegexp_1.tokensToRegExp = tokensToRegExp_1;

    /**
       * Module dependencies.
       */

      

      /**
       * Short-cuts for global-object checks
       */

      var hasDocument = ('undefined' !== typeof document);
      var hasWindow = ('undefined' !== typeof window);
      var hasHistory = ('undefined' !== typeof history);
      var hasProcess = typeof process !== 'undefined';

      /**
       * Detect click event
       */
      var clickEvent = hasDocument && document.ontouchstart ? 'touchstart' : 'click';

      /**
       * To work properly with the URL
       * history.location generated polyfill in https://github.com/devote/HTML5-History-API
       */

      var isLocation = hasWindow && !!(window.history.location || window.location);

      /**
       * The page instance
       * @api private
       */
      function Page() {
        // public things
        this.callbacks = [];
        this.exits = [];
        this.current = '';
        this.len = 0;

        // private things
        this._decodeURLComponents = true;
        this._base = '';
        this._strict = false;
        this._running = false;
        this._hashbang = false;

        // bound functions
        this.clickHandler = this.clickHandler.bind(this);
        this._onpopstate = this._onpopstate.bind(this);
      }

      /**
       * Configure the instance of page. This can be called multiple times.
       *
       * @param {Object} options
       * @api public
       */

      Page.prototype.configure = function(options) {
        var opts = options || {};

        this._window = opts.window || (hasWindow && window);
        this._decodeURLComponents = opts.decodeURLComponents !== false;
        this._popstate = opts.popstate !== false && hasWindow;
        this._click = opts.click !== false && hasDocument;
        this._hashbang = !!opts.hashbang;

        var _window = this._window;
        if(this._popstate) {
          _window.addEventListener('popstate', this._onpopstate, false);
        } else if(hasWindow) {
          _window.removeEventListener('popstate', this._onpopstate, false);
        }

        if (this._click) {
          _window.document.addEventListener(clickEvent, this.clickHandler, false);
        } else if(hasDocument) {
          _window.document.removeEventListener(clickEvent, this.clickHandler, false);
        }

        if(this._hashbang && hasWindow && !hasHistory) {
          _window.addEventListener('hashchange', this._onpopstate, false);
        } else if(hasWindow) {
          _window.removeEventListener('hashchange', this._onpopstate, false);
        }
      };

      /**
       * Get or set basepath to `path`.
       *
       * @param {string} path
       * @api public
       */

      Page.prototype.base = function(path) {
        if (0 === arguments.length) return this._base;
        this._base = path;
      };

      /**
       * Gets the `base`, which depends on whether we are using History or
       * hashbang routing.

       * @api private
       */
      Page.prototype._getBase = function() {
        var base = this._base;
        if(!!base) return base;
        var loc = hasWindow && this._window && this._window.location;

        if(hasWindow && this._hashbang && loc && loc.protocol === 'file:') {
          base = loc.pathname;
        }

        return base;
      };

      /**
       * Get or set strict path matching to `enable`
       *
       * @param {boolean} enable
       * @api public
       */

      Page.prototype.strict = function(enable) {
        if (0 === arguments.length) return this._strict;
        this._strict = enable;
      };


      /**
       * Bind with the given `options`.
       *
       * Options:
       *
       *    - `click` bind to click events [true]
       *    - `popstate` bind to popstate [true]
       *    - `dispatch` perform initial dispatch [true]
       *
       * @param {Object} options
       * @api public
       */

      Page.prototype.start = function(options) {
        var opts = options || {};
        this.configure(opts);

        if (false === opts.dispatch) return;
        this._running = true;

        var url;
        if(isLocation) {
          var window = this._window;
          var loc = window.location;

          if(this._hashbang && ~loc.hash.indexOf('#!')) {
            url = loc.hash.substr(2) + loc.search;
          } else if (this._hashbang) {
            url = loc.search + loc.hash;
          } else {
            url = loc.pathname + loc.search + loc.hash;
          }
        }

        this.replace(url, null, true, opts.dispatch);
      };

      /**
       * Unbind click and popstate event handlers.
       *
       * @api public
       */

      Page.prototype.stop = function() {
        if (!this._running) return;
        this.current = '';
        this.len = 0;
        this._running = false;

        var window = this._window;
        this._click && window.document.removeEventListener(clickEvent, this.clickHandler, false);
        hasWindow && window.removeEventListener('popstate', this._onpopstate, false);
        hasWindow && window.removeEventListener('hashchange', this._onpopstate, false);
      };

      /**
       * Show `path` with optional `state` object.
       *
       * @param {string} path
       * @param {Object=} state
       * @param {boolean=} dispatch
       * @param {boolean=} push
       * @return {!Context}
       * @api public
       */

      Page.prototype.show = function(path, state, dispatch, push) {
        var ctx = new Context(path, state, this),
          prev = this.prevContext;
        this.prevContext = ctx;
        this.current = ctx.path;
        if (false !== dispatch) this.dispatch(ctx, prev);
        if (false !== ctx.handled && false !== push) ctx.pushState();
        return ctx;
      };

      /**
       * Goes back in the history
       * Back should always let the current route push state and then go back.
       *
       * @param {string} path - fallback path to go back if no more history exists, if undefined defaults to page.base
       * @param {Object=} state
       * @api public
       */

      Page.prototype.back = function(path, state) {
        var page = this;
        if (this.len > 0) {
          var window = this._window;
          // this may need more testing to see if all browsers
          // wait for the next tick to go back in history
          hasHistory && window.history.back();
          this.len--;
        } else if (path) {
          setTimeout(function() {
            page.show(path, state);
          });
        } else {
          setTimeout(function() {
            page.show(page._getBase(), state);
          });
        }
      };

      /**
       * Register route to redirect from one path to other
       * or just redirect to another route
       *
       * @param {string} from - if param 'to' is undefined redirects to 'from'
       * @param {string=} to
       * @api public
       */
      Page.prototype.redirect = function(from, to) {
        var inst = this;

        // Define route from a path to another
        if ('string' === typeof from && 'string' === typeof to) {
          page.call(this, from, function(e) {
            setTimeout(function() {
              inst.replace(/** @type {!string} */ (to));
            }, 0);
          });
        }

        // Wait for the push state and replace it with another
        if ('string' === typeof from && 'undefined' === typeof to) {
          setTimeout(function() {
            inst.replace(from);
          }, 0);
        }
      };

      /**
       * Replace `path` with optional `state` object.
       *
       * @param {string} path
       * @param {Object=} state
       * @param {boolean=} init
       * @param {boolean=} dispatch
       * @return {!Context}
       * @api public
       */


      Page.prototype.replace = function(path, state, init, dispatch) {
        var ctx = new Context(path, state, this),
          prev = this.prevContext;
        this.prevContext = ctx;
        this.current = ctx.path;
        ctx.init = init;
        ctx.save(); // save before dispatching, which may redirect
        if (false !== dispatch) this.dispatch(ctx, prev);
        return ctx;
      };

      /**
       * Dispatch the given `ctx`.
       *
       * @param {Context} ctx
       * @api private
       */

      Page.prototype.dispatch = function(ctx, prev) {
        var i = 0, j = 0, page = this;

        function nextExit() {
          var fn = page.exits[j++];
          if (!fn) return nextEnter();
          fn(prev, nextExit);
        }

        function nextEnter() {
          var fn = page.callbacks[i++];

          if (ctx.path !== page.current) {
            ctx.handled = false;
            return;
          }
          if (!fn) return unhandled.call(page, ctx);
          fn(ctx, nextEnter);
        }

        if (prev) {
          nextExit();
        } else {
          nextEnter();
        }
      };

      /**
       * Register an exit route on `path` with
       * callback `fn()`, which will be called
       * on the previous context when a new
       * page is visited.
       */
      Page.prototype.exit = function(path, fn) {
        if (typeof path === 'function') {
          return this.exit('*', path);
        }

        var route = new Route(path, null, this);
        for (var i = 1; i < arguments.length; ++i) {
          this.exits.push(route.middleware(arguments[i]));
        }
      };

      /**
       * Handle "click" events.
       */

      /* jshint +W054 */
      Page.prototype.clickHandler = function(e) {
        if (1 !== this._which(e)) return;

        if (e.metaKey || e.ctrlKey || e.shiftKey) return;
        if (e.defaultPrevented) return;

        // ensure link
        // use shadow dom when available if not, fall back to composedPath()
        // for browsers that only have shady
        var el = e.target;
        var eventPath = e.path || (e.composedPath ? e.composedPath() : null);

        if(eventPath) {
          for (var i = 0; i < eventPath.length; i++) {
            if (!eventPath[i].nodeName) continue;
            if (eventPath[i].nodeName.toUpperCase() !== 'A') continue;
            if (!eventPath[i].href) continue;

            el = eventPath[i];
            break;
          }
        }

        // continue ensure link
        // el.nodeName for svg links are 'a' instead of 'A'
        while (el && 'A' !== el.nodeName.toUpperCase()) el = el.parentNode;
        if (!el || 'A' !== el.nodeName.toUpperCase()) return;

        // check if link is inside an svg
        // in this case, both href and target are always inside an object
        var svg = (typeof el.href === 'object') && el.href.constructor.name === 'SVGAnimatedString';

        // Ignore if tag has
        // 1. "download" attribute
        // 2. rel="external" attribute
        if (el.hasAttribute('download') || el.getAttribute('rel') === 'external') return;

        // ensure non-hash for the same path
        var link = el.getAttribute('href');
        if(!this._hashbang && this._samePath(el) && (el.hash || '#' === link)) return;

        // Check for mailto: in the href
        if (link && link.indexOf('mailto:') > -1) return;

        // check target
        // svg target is an object and its desired value is in .baseVal property
        if (svg ? el.target.baseVal : el.target) return;

        // x-origin
        // note: svg links that are not relative don't call click events (and skip page.js)
        // consequently, all svg links tested inside page.js are relative and in the same origin
        if (!svg && !this.sameOrigin(el.href)) return;

        // rebuild path
        // There aren't .pathname and .search properties in svg links, so we use href
        // Also, svg href is an object and its desired value is in .baseVal property
        var path = svg ? el.href.baseVal : (el.pathname + el.search + (el.hash || ''));

        path = path[0] !== '/' ? '/' + path : path;

        // strip leading "/[drive letter]:" on NW.js on Windows
        if (hasProcess && path.match(/^\/[a-zA-Z]:\//)) {
          path = path.replace(/^\/[a-zA-Z]:\//, '/');
        }

        // same page
        var orig = path;
        var pageBase = this._getBase();

        if (path.indexOf(pageBase) === 0) {
          path = path.substr(pageBase.length);
        }

        if (this._hashbang) path = path.replace('#!', '');

        if (pageBase && orig === path && (!isLocation || this._window.location.protocol !== 'file:')) {
          return;
        }

        e.preventDefault();
        this.show(orig);
      };

      /**
       * Handle "populate" events.
       * @api private
       */

      Page.prototype._onpopstate = (function () {
        var loaded = false;
        if ( ! hasWindow ) {
          return function () {};
        }
        if (hasDocument && document.readyState === 'complete') {
          loaded = true;
        } else {
          window.addEventListener('load', function() {
            setTimeout(function() {
              loaded = true;
            }, 0);
          });
        }
        return function onpopstate(e) {
          if (!loaded) return;
          var page = this;
          if (e.state) {
            var path = e.state.path;
            page.replace(path, e.state);
          } else if (isLocation) {
            var loc = page._window.location;
            page.show(loc.pathname + loc.search + loc.hash, undefined, undefined, false);
          }
        };
      })();

      /**
       * Event button.
       */
      Page.prototype._which = function(e) {
        e = e || (hasWindow && this._window.event);
        return null == e.which ? e.button : e.which;
      };

      /**
       * Convert to a URL object
       * @api private
       */
      Page.prototype._toURL = function(href) {
        var window = this._window;
        if(typeof URL === 'function' && isLocation) {
          return new URL(href, window.location.toString());
        } else if (hasDocument) {
          var anc = window.document.createElement('a');
          anc.href = href;
          return anc;
        }
      };

      /**
       * Check if `href` is the same origin.
       * @param {string} href
       * @api public
       */
      Page.prototype.sameOrigin = function(href) {
        if(!href || !isLocation) return false;

        var url = this._toURL(href);
        var window = this._window;

        var loc = window.location;

        /*
           When the port is the default http port 80 for http, or 443 for
           https, internet explorer 11 returns an empty string for loc.port,
           so we need to compare loc.port with an empty string if url.port
           is the default port 80 or 443.
           Also the comparition with `port` is changed from `===` to `==` because
           `port` can be a string sometimes. This only applies to ie11.
        */
        return loc.protocol === url.protocol &&
          loc.hostname === url.hostname &&
          (loc.port === url.port || loc.port === '' && (url.port == 80 || url.port == 443)); // jshint ignore:line
      };

      /**
       * @api private
       */
      Page.prototype._samePath = function(url) {
        if(!isLocation) return false;
        var window = this._window;
        var loc = window.location;
        return url.pathname === loc.pathname &&
          url.search === loc.search;
      };

      /**
       * Remove URL encoding from the given `str`.
       * Accommodates whitespace in both x-www-form-urlencoded
       * and regular percent-encoded form.
       *
       * @param {string} val - URL component to decode
       * @api private
       */
      Page.prototype._decodeURLEncodedURIComponent = function(val) {
        if (typeof val !== 'string') { return val; }
        return this._decodeURLComponents ? decodeURIComponent(val.replace(/\+/g, ' ')) : val;
      };

      /**
       * Create a new `page` instance and function
       */
      function createPage() {
        var pageInstance = new Page();

        function pageFn(/* args */) {
          return page.apply(pageInstance, arguments);
        }

        // Copy all of the things over. In 2.0 maybe we use setPrototypeOf
        pageFn.callbacks = pageInstance.callbacks;
        pageFn.exits = pageInstance.exits;
        pageFn.base = pageInstance.base.bind(pageInstance);
        pageFn.strict = pageInstance.strict.bind(pageInstance);
        pageFn.start = pageInstance.start.bind(pageInstance);
        pageFn.stop = pageInstance.stop.bind(pageInstance);
        pageFn.show = pageInstance.show.bind(pageInstance);
        pageFn.back = pageInstance.back.bind(pageInstance);
        pageFn.redirect = pageInstance.redirect.bind(pageInstance);
        pageFn.replace = pageInstance.replace.bind(pageInstance);
        pageFn.dispatch = pageInstance.dispatch.bind(pageInstance);
        pageFn.exit = pageInstance.exit.bind(pageInstance);
        pageFn.configure = pageInstance.configure.bind(pageInstance);
        pageFn.sameOrigin = pageInstance.sameOrigin.bind(pageInstance);
        pageFn.clickHandler = pageInstance.clickHandler.bind(pageInstance);

        pageFn.create = createPage;

        Object.defineProperty(pageFn, 'len', {
          get: function(){
            return pageInstance.len;
          },
          set: function(val) {
            pageInstance.len = val;
          }
        });

        Object.defineProperty(pageFn, 'current', {
          get: function(){
            return pageInstance.current;
          },
          set: function(val) {
            pageInstance.current = val;
          }
        });

        // In 2.0 these can be named exports
        pageFn.Context = Context;
        pageFn.Route = Route;

        return pageFn;
      }

      /**
       * Register `path` with callback `fn()`,
       * or route `path`, or redirection,
       * or `page.start()`.
       *
       *   page(fn);
       *   page('*', fn);
       *   page('/user/:id', load, user);
       *   page('/user/' + user.id, { some: 'thing' });
       *   page('/user/' + user.id);
       *   page('/from', '/to')
       *   page();
       *
       * @param {string|!Function|!Object} path
       * @param {Function=} fn
       * @api public
       */

      function page(path, fn) {
        // <callback>
        if ('function' === typeof path) {
          return page.call(this, '*', path);
        }

        // route <path> to <callback ...>
        if ('function' === typeof fn) {
          var route = new Route(/** @type {string} */ (path), null, this);
          for (var i = 1; i < arguments.length; ++i) {
            this.callbacks.push(route.middleware(arguments[i]));
          }
          // show <path> with [state]
        } else if ('string' === typeof path) {
          this['string' === typeof fn ? 'redirect' : 'show'](path, fn);
          // start [options]
        } else {
          this.start(path);
        }
      }

      /**
       * Unhandled `ctx`. When it's not the initial
       * popstate then redirect. If you wish to handle
       * 404s on your own use `page('*', callback)`.
       *
       * @param {Context} ctx
       * @api private
       */
      function unhandled(ctx) {
        if (ctx.handled) return;
        var current;
        var page = this;
        var window = page._window;

        if (page._hashbang) {
          current = isLocation && this._getBase() + window.location.hash.replace('#!', '');
        } else {
          current = isLocation && window.location.pathname + window.location.search;
        }

        if (current === ctx.canonicalPath) return;
        page.stop();
        ctx.handled = false;
        isLocation && (window.location.href = ctx.canonicalPath);
      }

      /**
       * Escapes RegExp characters in the given string.
       *
       * @param {string} s
       * @api private
       */
      function escapeRegExp(s) {
        return s.replace(/([.+*?=^!:${}()[\]|/\\])/g, '\\$1');
      }

      /**
       * Initialize a new "request" `Context`
       * with the given `path` and optional initial `state`.
       *
       * @constructor
       * @param {string} path
       * @param {Object=} state
       * @api public
       */

      function Context(path, state, pageInstance) {
        var _page = this.page = pageInstance || page;
        var window = _page._window;
        var hashbang = _page._hashbang;

        var pageBase = _page._getBase();
        if ('/' === path[0] && 0 !== path.indexOf(pageBase)) path = pageBase + (hashbang ? '#!' : '') + path;
        var i = path.indexOf('?');

        this.canonicalPath = path;
        var re = new RegExp('^' + escapeRegExp(pageBase));
        this.path = path.replace(re, '') || '/';
        if (hashbang) this.path = this.path.replace('#!', '') || '/';

        this.title = (hasDocument && window.document.title);
        this.state = state || {};
        this.state.path = path;
        this.querystring = ~i ? _page._decodeURLEncodedURIComponent(path.slice(i + 1)) : '';
        this.pathname = _page._decodeURLEncodedURIComponent(~i ? path.slice(0, i) : path);
        this.params = {};

        // fragment
        this.hash = '';
        if (!hashbang) {
          if (!~this.path.indexOf('#')) return;
          var parts = this.path.split('#');
          this.path = this.pathname = parts[0];
          this.hash = _page._decodeURLEncodedURIComponent(parts[1]) || '';
          this.querystring = this.querystring.split('#')[0];
        }
      }

      /**
       * Push state.
       *
       * @api private
       */

      Context.prototype.pushState = function() {
        var page = this.page;
        var window = page._window;
        var hashbang = page._hashbang;

        page.len++;
        if (hasHistory) {
            window.history.pushState(this.state, this.title,
              hashbang && this.path !== '/' ? '#!' + this.path : this.canonicalPath);
        }
      };

      /**
       * Save the context state.
       *
       * @api public
       */

      Context.prototype.save = function() {
        var page = this.page;
        if (hasHistory) {
            page._window.history.replaceState(this.state, this.title,
              page._hashbang && this.path !== '/' ? '#!' + this.path : this.canonicalPath);
        }
      };

      /**
       * Initialize `Route` with the given HTTP `path`,
       * and an array of `callbacks` and `options`.
       *
       * Options:
       *
       *   - `sensitive`    enable case-sensitive routes
       *   - `strict`       enable strict matching for trailing slashes
       *
       * @constructor
       * @param {string} path
       * @param {Object=} options
       * @api private
       */

      function Route(path, options, page) {
        var _page = this.page = page || globalPage;
        var opts = options || {};
        opts.strict = opts.strict || _page._strict;
        this.path = (path === '*') ? '(.*)' : path;
        this.method = 'GET';
        this.regexp = pathToRegexp_1(this.path, this.keys = [], opts);
      }

      /**
       * Return route middleware with
       * the given callback `fn()`.
       *
       * @param {Function} fn
       * @return {Function}
       * @api public
       */

      Route.prototype.middleware = function(fn) {
        var self = this;
        return function(ctx, next) {
          if (self.match(ctx.path, ctx.params)) {
            ctx.routePath = self.path;
            return fn(ctx, next);
          }
          next();
        };
      };

      /**
       * Check if this route matches `path`, if so
       * populate `params`.
       *
       * @param {string} path
       * @param {Object} params
       * @return {boolean}
       * @api private
       */

      Route.prototype.match = function(path, params) {
        var keys = this.keys,
          qsIndex = path.indexOf('?'),
          pathname = ~qsIndex ? path.slice(0, qsIndex) : path,
          m = this.regexp.exec(decodeURIComponent(pathname));

        if (!m) return false;

        delete params[0];

        for (var i = 1, len = m.length; i < len; ++i) {
          var key = keys[i - 1];
          var val = this.page._decodeURLEncodedURIComponent(m[i]);
          if (val !== undefined || !(hasOwnProperty.call(params, key.name))) {
            params[key.name] = val;
          }
        }

        return true;
      };


      /**
       * Module exports.
       */

      var globalPage = createPage();
      var page_js = globalPage;
      var default_1 = globalPage;

    page_js.default = default_1;

    return page_js;

    })));
    });

    /* src/components/create/NewBudget.svelte generated by Svelte v3.32.1 */

    const { console: console_1$1 } = globals;
    const file$6 = "src/components/create/NewBudget.svelte";

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i];
    	child_ctx[8] = list;
    	child_ctx[9] = i;
    	return child_ctx;
    }

    // (59:1) {:else}
    function create_else_block$3(ctx) {
    	let div0;
    	let t0;
    	let div1;
    	let label;
    	let p;
    	let t2;
    	let input;
    	let t3;
    	let br;
    	let t4;
    	let button;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value = /*data*/ ctx[2].categories;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t0 = space();
    			div1 = element("div");
    			label = element("label");
    			p = element("p");
    			p.textContent = "Vilken månad gäller budgeten?";
    			t2 = space();
    			input = element("input");
    			t3 = space();
    			br = element("br");
    			t4 = space();
    			button = element("button");
    			button.textContent = "Skicka";
    			attr_dev(div0, "class", "budget-container svelte-zudtch");
    			add_location(div0, file$6, 59, 2, 1569);
    			add_location(p, file$6, 69, 4, 1801);
    			attr_dev(input, "class", "input-date svelte-zudtch");
    			attr_dev(input, "type", "date");
    			add_location(input, file$6, 70, 4, 1842);
    			add_location(label, file$6, 68, 3, 1789);
    			add_location(br, file$6, 73, 3, 1943);
    			attr_dev(button, "class", "btn waves-effect waves-light indigo");
    			add_location(button, file$6, 74, 3, 1953);
    			attr_dev(div1, "class", "center");
    			add_location(div1, file$6, 67, 2, 1765);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			insert_dev(target, t0, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, label);
    			append_dev(label, p);
    			append_dev(label, t2);
    			append_dev(label, input);
    			set_input_value(input, /*dateString*/ ctx[0]);
    			append_dev(div1, t3);
    			append_dev(div1, br);
    			append_dev(div1, t4);
    			append_dev(div1, button);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[5]),
    					listen_dev(button, "click", /*submit*/ ctx[3], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*data, seperated*/ 6) {
    				each_value = /*data*/ ctx[2].categories;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$4(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$4(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div0, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (dirty & /*dateString*/ 1) {
    				set_input_value(input, /*dateString*/ ctx[0]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$3.name,
    		type: "else",
    		source: "(59:1) {:else}",
    		ctx
    	});

    	return block;
    }

    // (57:1) {#if data === undefined}
    function create_if_block$3(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Hämtar standard raderna...";
    			add_location(p, file$6, 57, 2, 1524);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(57:1) {#if data === undefined}",
    		ctx
    	});

    	return block;
    }

    // (61:3) {#each data.categories as category}
    function create_each_block$4(ctx) {
    	let div;
    	let newcategory;
    	let updating_entries;
    	let t;
    	let current;

    	function newcategory_entries_binding(value) {
    		/*newcategory_entries_binding*/ ctx[4].call(null, value, /*category*/ ctx[7]);
    	}

    	let newcategory_props = { category: /*category*/ ctx[7] };

    	if (/*seperated*/ ctx[1][/*category*/ ctx[7]] !== void 0) {
    		newcategory_props.entries = /*seperated*/ ctx[1][/*category*/ ctx[7]];
    	}

    	newcategory = new NewCategory({ props: newcategory_props, $$inline: true });
    	binding_callbacks.push(() => bind(newcategory, "entries", newcategory_entries_binding));

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(newcategory.$$.fragment);
    			t = space();
    			attr_dev(div, "class", "budget svelte-zudtch");
    			add_location(div, file$6, 61, 4, 1643);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(newcategory, div, null);
    			append_dev(div, t);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const newcategory_changes = {};
    			if (dirty & /*data*/ 4) newcategory_changes.category = /*category*/ ctx[7];

    			if (!updating_entries && dirty & /*seperated, data*/ 6) {
    				updating_entries = true;
    				newcategory_changes.entries = /*seperated*/ ctx[1][/*category*/ ctx[7]];
    				add_flush_callback(() => updating_entries = false);
    			}

    			newcategory.$set(newcategory_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(newcategory.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(newcategory.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(newcategory);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$4.name,
    		type: "each",
    		source: "(61:3) {#each data.categories as category}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let div;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	const if_block_creators = [create_if_block$3, create_else_block$3];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*data*/ ctx[2] === undefined) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if_block.c();
    			attr_dev(div, "id", "new-budget-wrapper");
    			attr_dev(div, "class", "svelte-zudtch");
    			add_location(div, file$6, 55, 0, 1466);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if_blocks[current_block_type_index].m(div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(div, null);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_blocks[current_block_type_index].d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("NewBudget", slots, []);
    	const toast = new Toast$1();
    	let dateString = new Date().toISOString().slice(0, 10);
    	let seperated = [];
    	let data;

    	entry.getDefaultEntries().then(resp => {
    		// Make sure that data.categories[0] is "Gemensamma"
    		const gemensamma = resp.categories.indexOf("Gemensamma");

    		if (gemensamma > 0) {
    			let temporary = resp.categories[0];
    			resp.categories[0] = resp.categories[gemensamma];
    			resp.categories[gemensamma] = temporary;
    		}

    		// Separate the entries into its categories
    		resp.categories.forEach(category => {
    			$$invalidate(1, seperated[category] = resp.result.filter(entry => entry.Category.name === category), seperated);
    		});

    		$$invalidate(2, data = resp);
    	});

    	async function submit() {
    		// combine all the categories into one array
    		let combined = [];

    		data.categories.forEach(category => {
    			combined = [...combined, ...seperated[category]];
    		});

    		// remove any empty entries
    		combined = combined.filter(entry => entry.value !== "" && entry.description !== "");

    		// set the date of all the entries
    		combined.forEach(entry => {
    			entry.date = new Date(dateString);
    		});

    		try {
    			console.dir(combined);
    			await entry.newEntry(combined);
    			toast.success("Budget sparad!");
    			page("/");
    		} catch(err) {
    			toast.error("Något gick fel.");
    			console.error(err.message);
    		}
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<NewBudget> was created with unknown prop '${key}'`);
    	});

    	function newcategory_entries_binding(value, category) {
    		seperated[category] = value;
    		$$invalidate(1, seperated);
    	}

    	function input_input_handler() {
    		dateString = this.value;
    		$$invalidate(0, dateString);
    	}

    	$$self.$capture_state = () => ({
    		entry,
    		NewCategory,
    		Toast: Toast$1,
    		page,
    		toast,
    		dateString,
    		seperated,
    		data,
    		submit
    	});

    	$$self.$inject_state = $$props => {
    		if ("dateString" in $$props) $$invalidate(0, dateString = $$props.dateString);
    		if ("seperated" in $$props) $$invalidate(1, seperated = $$props.seperated);
    		if ("data" in $$props) $$invalidate(2, data = $$props.data);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		dateString,
    		seperated,
    		data,
    		submit,
    		newcategory_entries_binding,
    		input_input_handler
    	];
    }

    class NewBudget extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NewBudget",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    /* src/components/Navigator.svelte generated by Svelte v3.32.1 */

    const file$7 = "src/components/Navigator.svelte";

    function create_fragment$a(ctx) {
    	let nav;
    	let div;
    	let ul;
    	let li0;
    	let a0;
    	let t1;
    	let li1;
    	let a1;
    	let t3;
    	let li2;
    	let a2;

    	const block = {
    		c: function create() {
    			nav = element("nav");
    			div = element("div");
    			ul = element("ul");
    			li0 = element("li");
    			a0 = element("a");
    			a0.textContent = "Hem";
    			t1 = space();
    			li1 = element("li");
    			a1 = element("a");
    			a1.textContent = "Ny budget";
    			t3 = space();
    			li2 = element("li");
    			a2 = element("a");
    			a2.textContent = "Ändra budget";
    			attr_dev(a0, "href", "/");
    			attr_dev(a0, "class", "svelte-1u6n4gp");
    			add_location(a0, file$7, 3, 7, 100);
    			add_location(li0, file$7, 3, 3, 96);
    			attr_dev(a1, "href", "/new");
    			attr_dev(a1, "class", "svelte-1u6n4gp");
    			add_location(a1, file$7, 4, 7, 132);
    			add_location(li1, file$7, 4, 3, 128);
    			attr_dev(a2, "href", "/edit");
    			attr_dev(a2, "class", "svelte-1u6n4gp");
    			add_location(a2, file$7, 5, 7, 173);
    			add_location(li2, file$7, 5, 3, 169);
    			attr_dev(ul, "id", "nav-mobile");
    			attr_dev(ul, "class", "left");
    			add_location(ul, file$7, 2, 2, 59);
    			attr_dev(div, "class", "nav-wrapper");
    			add_location(div, file$7, 1, 1, 31);
    			attr_dev(nav, "class", "indigo darken-3");
    			add_location(nav, file$7, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, nav, anchor);
    			append_dev(nav, div);
    			append_dev(div, ul);
    			append_dev(ul, li0);
    			append_dev(li0, a0);
    			append_dev(ul, t1);
    			append_dev(ul, li1);
    			append_dev(li1, a1);
    			append_dev(ul, t3);
    			append_dev(ul, li2);
    			append_dev(li2, a2);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(nav);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Navigator", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Navigator> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Navigator extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Navigator",
    			options,
    			id: create_fragment$a.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.32.1 */
    const file$8 = "src/App.svelte";

    function create_fragment$b(ctx) {
    	let t0;
    	let link;
    	let t1;
    	let navigator;
    	let t2;
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	navigator = new Navigator({ $$inline: true });
    	var switch_value = /*page*/ ctx[0];

    	function switch_props(ctx) {
    		return { $$inline: true };
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		c: function create() {
    			t0 = space();
    			link = element("link");
    			t1 = space();
    			create_component(navigator.$$.fragment);
    			t2 = space();
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    			document.title = "Budget planeraren 2000";
    			attr_dev(link, "rel", "stylesheet");
    			attr_dev(link, "href", "/build/base.css");
    			add_location(link, file$8, 22, 0, 552);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, link, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(navigator, target, anchor);
    			insert_dev(target, t2, anchor);

    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (switch_value !== (switch_value = /*page*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(navigator.$$.fragment, local);
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(navigator.$$.fragment, local);
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(link);
    			if (detaching) detach_dev(t1);
    			destroy_component(navigator, detaching);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	let page$1 = ViewBudget;

    	page("/", () => {
    		$$invalidate(0, page$1 = ViewBudget);
    	});

    	page("/new", () => {
    		$$invalidate(0, page$1 = NewBudget);
    	});

    	page("/edit", () => {
    		$$invalidate(0, page$1 = EditBudget);
    	});

    	page.start();
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		EditBudget,
    		ViewBudget,
    		NewBudget,
    		Navigator,
    		router: page,
    		page: page$1
    	});

    	$$self.$inject_state = $$props => {
    		if ("page" in $$props) $$invalidate(0, page$1 = $$props.page);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [page$1];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$b.name
    		});
    	}
    }

    const app = new App({
        target: document.body,
        props: {}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
