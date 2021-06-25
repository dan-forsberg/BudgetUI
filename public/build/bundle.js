
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

    class Fetcher {
        constructor() {
            return;
        }
        static getInstance(token) {
            if (!Fetcher.instance || token !== undefined) {
                Fetcher.instance = new Fetcher();
                if (token != undefined) {
                    Fetcher.instance.configure(token);
                }
                else {
                    Fetcher.instance.configure();
                }
            }
            return Fetcher.instance;
        }
        static destroy() {
            Fetcher.instance = null;
        }
        httpReq(endPoint, method, body) {
            const opts = {
                method: method,
                headers: this.headers,
            };
            if (body) {
                opts["body"] = JSON.stringify(body);
            }
            const results = fetch(this.URL + endPoint, opts);
            return results;
        }
        get(endPoint) {
            return this.httpReq(endPoint, "GET");
        }
        post(endPoint, body) {
            return this.httpReq(endPoint, "POST", body);
        }
        /* delete is a reserved keyword */
        remove(endPoint) {
            return this.httpReq(endPoint, "DELETE");
        }
        patch(endPoint, body) {
            return this.httpReq(endPoint, "PATCH", body);
        }
        configure(token) {
            const localhost = ["0.0.0.0", "localhost", "127.0.0.1"];
            const loc = window.location;
            this.URL = `${loc.protocol}//${loc.hostname}/api`;
            let prod = true;
            if (localhost.includes(loc.hostname)) {
                this.URL = `${loc.protocol}//${loc.hostname}:8080/api`;
                prod = false;
            }
            else if (loc.hostname === "budget.dasifor.xyz") {
                prod = false;
            }
            if (prod && token != undefined) {
                this.headers = {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                };
            }
            else {
                this.headers = {
                    "Content-Type": "application/json"
                };
            }
        }
    }

    const getAllEntries = async () => {
        const fetcher = Fetcher.getInstance();
        const response = await fetcher.get("/entry");
        const json = await response.json();
        if (response.status !== 200) {
            throw new Error(json.message);
        }
        return json;
    };
    const getDefaultEntries = async () => {
        const fetcher = Fetcher.getInstance();
        const response = await fetcher.get("/default");
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
        const fetcher = Fetcher.getInstance();
        const response = await fetcher.get(endPoint);
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
        const fetcher = Fetcher.getInstance();
        const result = await fetcher.post("/entry/new", body);
        const json = await result.json();
        if (result.status !== 201) {
            throw new Error(json.message);
        }
        return json;
    };
    const updateEntry = async (entry) => {
        const fetcher = Fetcher.getInstance();
        const result = await fetcher.patch(`/entry/update/${entry.id}`, { entry: entry });
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
    			attr_dev(tr0, "class", "svelte-13a5tvb");
    			add_location(tr0, file, 10, 2, 265);
    			add_location(td0, file, 21, 3, 491);
    			attr_dev(td1, "class", "right");
    			add_location(td1, file, 22, 3, 510);
    			attr_dev(tr1, "class", "svelte-13a5tvb");
    			add_location(tr1, file, 20, 2, 483);
    			attr_dev(table, "class", "svelte-13a5tvb");
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
    			attr_dev(tr, "class", "svelte-13a5tvb");
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
    			add_location(td, file$1, 42, 1, 561);
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
    			attr_dev(input, "class", "svelte-ml8vq6");
    			add_location(input, file$1, 40, 1, 493);
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
    const file$2 = "src/components/edit/EditCategory.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[11] = list[i];
    	return child_ctx;
    }

    // (71:0) {:else}
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
    			add_location(p0, file$2, 71, 1, 1678);
    			add_location(p1, file$2, 72, 1, 1695);
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
    		source: "(71:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (48:0) {#if entries !== undefined}
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
    			add_location(h3, file$2, 48, 1, 1096);
    			add_location(th0, file$2, 51, 3, 1158);
    			attr_dev(th1, "class", "right");
    			add_location(th1, file$2, 52, 3, 1182);
    			attr_dev(tr0, "class", "svelte-13a5tvb");
    			add_location(tr0, file$2, 50, 2, 1150);
    			add_location(td0, file$2, 65, 3, 1519);
    			attr_dev(td1, "class", "right");
    			add_location(td1, file$2, 66, 3, 1538);
    			attr_dev(tr1, "class", "svelte-13a5tvb");
    			add_location(tr1, file$2, 64, 2, 1511);
    			attr_dev(table, "class", "svelte-13a5tvb");
    			add_location(table, file$2, 49, 1, 1140);
    			add_location(button, file$2, 69, 1, 1616);
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
    		source: "(48:0) {#if entries !== undefined}",
    		ctx
    	});

    	return block;
    }

    // (55:2) {#each sortedEntries as entry (entry.id)}
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
    			attr_dev(tr, "class", "svelte-13a5tvb");
    			add_location(tr, file$2, 55, 3, 1267);
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
    		source: "(55:2) {#each sortedEntries as entry (entry.id)}",
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
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<EditCategory> was created with unknown prop '${key}'`);
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
    			console.warn("<EditCategory> was created without expected prop 'entries'");
    		}

    		if (/*category*/ ctx[1] === undefined && !("category" in props)) {
    			console.warn("<EditCategory> was created without expected prop 'category'");
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
    			attr_dev(div, "class", "category svelte-13c2izy");
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

    // (1:0) <script lang="ts">import entry from "../controllers/entry"; import Budget from "./Budget.svelte"; export let readOnly; let dateString = new Date().toISOString().slice(0, 10); let data; $: {     data = entry.getSpecificEntries({ date: new Date(dateString) }
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
    		source: "(1:0) <script lang=\\\"ts\\\">import entry from \\\"../controllers/entry\\\"; import Budget from \\\"./Budget.svelte\\\"; export let readOnly; let dateString = new Date().toISOString().slice(0, 10); let data; $: {     data = entry.getSpecificEntries({ date: new Date(dateString) }",
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
    			attr_dev(input, "class", "svelte-ca9f4s");
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
    			attr_dev(div, "class", "flex-container svelte-ca9f4s");
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
    	selectbudget = new SelectBudget({ props: { readOnly }, $$inline: true });

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

    const readOnly = false;

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("EditBudget", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<EditBudget> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ SelectBudget, readOnly });
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
    	selectbudget = new SelectBudget({ props: { readOnly: readOnly$1 }, $$inline: true });

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

    const readOnly$1 = true;

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ViewBudget", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ViewBudget> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ SelectBudget, readOnly: readOnly$1 });
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

    const { console: console_1 } = globals;
    const file$5 = "src/components/create/NewCategory.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[12] = list[i];
    	child_ctx[13] = list;
    	child_ctx[14] = i;
    	return child_ctx;
    }

    // (93:1) {#each entries as entry}
    function create_each_block$3(ctx) {
    	let div;
    	let input0;
    	let input0_disabled_value;
    	let t;
    	let input1;
    	let input1_disabled_value;
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
    			input0.disabled = input0_disabled_value = /*entry*/ ctx[12].Category.continuousUpdate;
    			attr_dev(input0, "class", "description svelte-1wif1oa");
    			add_location(input0, file$5, 94, 3, 2272);
    			attr_dev(input1, "type", "number");
    			attr_dev(input1, "placeholder", "Belopp");
    			attr_dev(input1, "class", "amount svelte-1wif1oa");
    			input1.disabled = input1_disabled_value = /*entry*/ ctx[12].Category.continuousUpdate;
    			add_location(input1, file$5, 101, 3, 2438);
    			attr_dev(div, "class", "entry-container svelte-1wif1oa");
    			add_location(div, file$5, 93, 2, 2239);
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

    			if (dirty & /*entries*/ 1 && input0_disabled_value !== (input0_disabled_value = /*entry*/ ctx[12].Category.continuousUpdate)) {
    				prop_dev(input0, "disabled", input0_disabled_value);
    			}

    			if (dirty & /*entries*/ 1 && input0.value !== /*entry*/ ctx[12].description) {
    				set_input_value(input0, /*entry*/ ctx[12].description);
    			}

    			if (dirty & /*entries*/ 1 && input1_disabled_value !== (input1_disabled_value = /*entry*/ ctx[12].Category.continuousUpdate)) {
    				prop_dev(input1, "disabled", input1_disabled_value);
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
    		source: "(93:1) {#each entries as entry}",
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
    			add_location(h4, file$5, 90, 0, 2136);
    			input0.disabled = true;
    			attr_dev(input0, "type", "text");
    			input0.value = "Totalt";
    			attr_dev(input0, "class", "description svelte-1wif1oa");
    			add_location(input0, file$5, 110, 2, 2638);
    			input1.disabled = true;
    			attr_dev(input1, "type", "number");
    			attr_dev(input1, "class", "amount svelte-1wif1oa");
    			add_location(input1, file$5, 111, 2, 2706);
    			attr_dev(div, "class", "entry-container svelte-1wif1oa");
    			add_location(div, file$5, 109, 1, 2606);
    			add_location(form, file$5, 91, 0, 2156);
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
    					listen_dev(form, "click_outside", /*updateTable*/ ctx[3], false, false, false)
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
    	console.log("Entries");
    	let total = 0;

    	// special value to balance out if one person should pay more for the common costs
    	// "half of gemsamma even outer"
    	let HOG_evenOuter = 0;

    	// some default entries can have a special first row with description
    	// "HALF_OF_GEMENSAMMA" where the value should be the half of gemensamma's total
    	// subscribe to the total and update the amount
    	if (entries.length > 0 && entries[0].description === "HALF_OF_GEMENSAMMA") {
    		let entry = entries[0];
    		HOG_evenOuter = entry.amount;
    		let description = "Halva gemensamma";

    		if (HOG_evenOuter > 0) {
    			description += ` (+${HOG_evenOuter})`;
    		} else if (HOG_evenOuter < 0) {
    			description += ` (${HOG_evenOuter})`;
    		}

    		entry.description = description;

    		gemensamTotal.subscribe(totalOfGemensam => {
    			entry.amount = totalOfGemensam / 2 - HOG_evenOuter;
    		});
    	}

    	const isEmptyEntry = entry => {
    		return entry !== undefined && isEmptyString(entry.description) && isEmptyString(entry.amount);
    	};

    	const isEmptyString = str => {
    		return null === str || str === undefined || str.length === 0;
    	};

    	// Remove any empty rows and update the total
    	// Sort the entries by amount lowest - highest
    	// Run when clicking outside the form and onMount()
    	const updateTable = () => {
    		removeEmptyRows();
    		let { sortedEntries, total: updatedTotal } = sortEntries(entries);
    		$$invalidate(0, entries = sortedEntries);
    		$$invalidate(2, total = updatedTotal);

    		if (category === "Gemensamma") {
    			gemensamTotal.set(total);
    		}
    	};

    	const removeEmptyRows = () => {
    		$$invalidate(0, entries = entries.filter(entry => !isEmptyEntry(entry)));
    	};

    	const newRow = () => {
    		let newEntry = {
    			Category: category,
    			description: "",
    			amount: "",
    			date: new Date()
    		};

    		$$invalidate(0, entries = [...entries, newEntry]);
    	};

    	onMount(() => {
    		updateTable();
    	});

    	const writable_props = ["entries", "category"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<NewCategory> was created with unknown prop '${key}'`);
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
    		updateTable,
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
    				let last = entries[len - 1];

    				if (len == 0 || !isEmptyEntry(last)) {
    					newRow();
    				}
    			}
    		}
    	};

    	return [
    		entries,
    		category,
    		total,
    		updateTable,
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
    			console_1.warn("<NewCategory> was created without expected prop 'entries'");
    		}

    		if (/*category*/ ctx[1] === undefined && !("category" in props)) {
    			console_1.warn("<NewCategory> was created without expected prop 'category'");
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
    	child_ctx[8] = list[i];
    	child_ctx[9] = list;
    	child_ctx[10] = i;
    	return child_ctx;
    }

    // (60:1) {:else}
    function create_else_block$3(ctx) {
    	let div0;
    	let t0;
    	let div1;
    	let label;
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
    			label.textContent = "Vilken månad gäller budgeten?";
    			t2 = space();
    			input = element("input");
    			t3 = space();
    			br = element("br");
    			t4 = space();
    			button = element("button");
    			button.textContent = "Skicka";
    			attr_dev(div0, "class", "budget-container svelte-mz7exr");
    			add_location(div0, file$6, 60, 2, 1589);
    			attr_dev(label, "for", "date");
    			add_location(label, file$6, 69, 3, 1809);
    			attr_dev(input, "id", "date");
    			attr_dev(input, "class", "input-date svelte-mz7exr");
    			attr_dev(input, "type", "text");
    			add_location(input, file$6, 70, 3, 1868);
    			add_location(br, file$6, 71, 3, 1946);
    			attr_dev(button, "class", "btn waves-effect waves-light indigo");
    			add_location(button, file$6, 72, 3, 1956);
    			attr_dev(div1, "class", "center");
    			add_location(div1, file$6, 68, 2, 1785);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			insert_dev(target, t0, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, label);
    			append_dev(div1, t2);
    			append_dev(div1, input);
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

    			if (dirty & /*dateString*/ 1 && input.value !== /*dateString*/ ctx[0]) {
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
    		source: "(60:1) {:else}",
    		ctx
    	});

    	return block;
    }

    // (58:1) {#if data === undefined}
    function create_if_block$3(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Hämtar standard raderna...";
    			add_location(p, file$6, 58, 2, 1544);
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
    		source: "(58:1) {#if data === undefined}",
    		ctx
    	});

    	return block;
    }

    // (62:3) {#each data.categories as category}
    function create_each_block$4(ctx) {
    	let div;
    	let newcategory;
    	let updating_entries;
    	let t;
    	let current;

    	function newcategory_entries_binding(value) {
    		/*newcategory_entries_binding*/ ctx[4].call(null, value, /*category*/ ctx[8]);
    	}

    	let newcategory_props = { category: /*category*/ ctx[8] };

    	if (/*seperated*/ ctx[1][/*category*/ ctx[8]] !== void 0) {
    		newcategory_props.entries = /*seperated*/ ctx[1][/*category*/ ctx[8]];
    	}

    	newcategory = new NewCategory({ props: newcategory_props, $$inline: true });
    	binding_callbacks.push(() => bind(newcategory, "entries", newcategory_entries_binding));

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(newcategory.$$.fragment);
    			t = space();
    			attr_dev(div, "class", "budget svelte-mz7exr");
    			add_location(div, file$6, 62, 4, 1663);
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
    			if (dirty & /*data*/ 4) newcategory_changes.category = /*category*/ ctx[8];

    			if (!updating_entries && dirty & /*seperated, data*/ 6) {
    				updating_entries = true;
    				newcategory_changes.entries = /*seperated*/ ctx[1][/*category*/ ctx[8]];
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
    		source: "(62:3) {#each data.categories as category}",
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
    			attr_dev(div, "class", "svelte-mz7exr");
    			add_location(div, file$6, 56, 0, 1486);
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
    	const now = new Date();
    	let dateString = new Date(now.getFullYear(), now.getMonth() + 1, 5).toISOString().slice(0, 10);
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
    		now,
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

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation. All rights reserved.
    Licensed under the Apache License, Version 2.0 (the "License"); you may not use
    this file except in compliance with the License. You may obtain a copy of the
    License at http://www.apache.org/licenses/LICENSE-2.0

    THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
    WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
    MERCHANTABLITY OR NON-INFRINGEMENT.

    See the Apache Version 2.0 License for specific language governing permissions
    and limitations under the License.
    ***************************************************************************** */
    var e=function(t,n){return (e=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t;}||function(e,t){for(var n in t)t.hasOwnProperty(n)&&(e[n]=t[n]);})(t,n)};function t(t,n){function i(){this.constructor=t;}e(t,n),t.prototype=null===n?Object.create(n):(i.prototype=n.prototype,new i);}var n=function(){return (n=Object.assign||function(e){for(var t,n=1,i=arguments.length;n<i;n++)for(var r in t=arguments[n])Object.prototype.hasOwnProperty.call(t,r)&&(e[r]=t[r]);return e}).apply(this,arguments)};function i(e,t){var n={};for(var i in e)Object.prototype.hasOwnProperty.call(e,i)&&t.indexOf(i)<0&&(n[i]=e[i]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var r=0;for(i=Object.getOwnPropertySymbols(e);r<i.length;r++)t.indexOf(i[r])<0&&Object.prototype.propertyIsEnumerable.call(e,i[r])&&(n[i[r]]=e[i[r]]);}return n}function r(e,t,n,i){return new(n||(n=Promise))((function(r,o){function c(e){try{a(i.next(e));}catch(e){o(e);}}function s(e){try{a(i.throw(e));}catch(e){o(e);}}function a(e){e.done?r(e.value):new n((function(t){t(e.value);})).then(c,s);}a((i=i.apply(e,t||[])).next());}))}function o(e,t){var n,i,r,o,c={label:0,sent:function(){if(1&r[0])throw r[1];return r[1]},trys:[],ops:[]};return o={next:s(0),throw:s(1),return:s(2)},"function"==typeof Symbol&&(o[Symbol.iterator]=function(){return this}),o;function s(o){return function(s){return function(o){if(n)throw new TypeError("Generator is already executing.");for(;c;)try{if(n=1,i&&(r=2&o[0]?i.return:o[0]?i.throw||((r=i.return)&&r.call(i),0):i.next)&&!(r=r.call(i,o[1])).done)return r;switch(i=0,r&&(o=[2&o[0],r.value]),o[0]){case 0:case 1:r=o;break;case 4:return c.label++,{value:o[1],done:!1};case 5:c.label++,i=o[1],o=[0];continue;case 7:o=c.ops.pop(),c.trys.pop();continue;default:if(!(r=c.trys,(r=r.length>0&&r[r.length-1])||6!==o[0]&&2!==o[0])){c=0;continue}if(3===o[0]&&(!r||o[1]>r[0]&&o[1]<r[3])){c.label=o[1];break}if(6===o[0]&&c.label<r[1]){c.label=r[1],r=o;break}if(r&&c.label<r[2]){c.label=r[2],c.ops.push(o);break}r[2]&&c.ops.pop(),c.trys.pop();continue}o=t.call(e,c);}catch(e){o=[6,e],i=0;}finally{n=r=0;}if(5&o[0])throw o[1];return {value:o[0]?o[1]:void 0,done:!0}}([o,s])}}}var c="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{};function s(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}function a(e,t){return e(t={exports:{}},t.exports),t.exports}var u=function(e){return e&&e.Math==Math&&e},l=u("object"==typeof globalThis&&globalThis)||u("object"==typeof window&&window)||u("object"==typeof self&&self)||u("object"==typeof c&&c)||function(){return this}()||Function("return this")(),d=function(e){try{return !!e()}catch(e){return !0}},g=!d((function(){return 7!=Object.defineProperty({},1,{get:function(){return 7}})[1]})),f={}.propertyIsEnumerable,I=Object.getOwnPropertyDescriptor,p={f:I&&!f.call({1:2},1)?function(e){var t=I(this,e);return !!t&&t.enumerable}:f},h=function(e,t){return {enumerable:!(1&e),configurable:!(2&e),writable:!(4&e),value:t}},y={}.toString,b=function(e){return y.call(e).slice(8,-1)},m="".split,v=d((function(){return !Object("z").propertyIsEnumerable(0)}))?function(e){return "String"==b(e)?m.call(e,""):Object(e)}:Object,B=function(e){if(null==e)throw TypeError("Can't call method on "+e);return e},C=function(e){return v(B(e))},F=function(e){return "object"==typeof e?null!==e:"function"==typeof e},U=function(e,t){if(!F(e))return e;var n,i;if(t&&"function"==typeof(n=e.toString)&&!F(i=n.call(e)))return i;if("function"==typeof(n=e.valueOf)&&!F(i=n.call(e)))return i;if(!t&&"function"==typeof(n=e.toString)&&!F(i=n.call(e)))return i;throw TypeError("Can't convert object to primitive value")},S={}.hasOwnProperty,Z=function(e,t){return S.call(e,t)},V=l.document,G=F(V)&&F(V.createElement),X=function(e){return G?V.createElement(e):{}},w=!g&&!d((function(){return 7!=Object.defineProperty(X("div"),"a",{get:function(){return 7}}).a})),x=Object.getOwnPropertyDescriptor,A={f:g?x:function(e,t){if(e=C(e),t=U(t,!0),w)try{return x(e,t)}catch(e){}if(Z(e,t))return h(!p.f.call(e,t),e[t])}},R=function(e){if(!F(e))throw TypeError(String(e)+" is not an object");return e},Q=Object.defineProperty,J={f:g?Q:function(e,t,n){if(R(e),t=U(t,!0),R(n),w)try{return Q(e,t,n)}catch(e){}if("get"in n||"set"in n)throw TypeError("Accessors not supported");return "value"in n&&(e[t]=n.value),e}},W=g?function(e,t,n){return J.f(e,t,h(1,n))}:function(e,t,n){return e[t]=n,e},k=function(e,t){try{W(l,e,t);}catch(n){l[e]=t;}return t},H=l["__core-js_shared__"]||k("__core-js_shared__",{}),L=Function.toString;"function"!=typeof H.inspectSource&&(H.inspectSource=function(e){return L.call(e)});var E,T,Y,N=H.inspectSource,K=l.WeakMap,O="function"==typeof K&&/native code/.test(N(K)),z=a((function(e){(e.exports=function(e,t){return H[e]||(H[e]=void 0!==t?t:{})})("versions",[]).push({version:"3.8.0",mode:"global",copyright:"© 2020 Denis Pushkarev (zloirock.ru)"});})),j=0,_=Math.random(),D=function(e){return "Symbol("+String(void 0===e?"":e)+")_"+(++j+_).toString(36)},P=z("keys"),M=function(e){return P[e]||(P[e]=D(e))},q={},$=l.WeakMap;if(O){var ee=H.state||(H.state=new $),te=ee.get,ne=ee.has,ie=ee.set;E=function(e,t){return t.facade=e,ie.call(ee,e,t),t},T=function(e){return te.call(ee,e)||{}},Y=function(e){return ne.call(ee,e)};}else {var re=M("state");q[re]=!0,E=function(e,t){return t.facade=e,W(e,re,t),t},T=function(e){return Z(e,re)?e[re]:{}},Y=function(e){return Z(e,re)};}var oe,ce={set:E,get:T,has:Y,enforce:function(e){return Y(e)?T(e):E(e,{})},getterFor:function(e){return function(t){var n;if(!F(t)||(n=T(t)).type!==e)throw TypeError("Incompatible receiver, "+e+" required");return n}}},se=a((function(e){var t=ce.get,n=ce.enforce,i=String(String).split("String");(e.exports=function(e,t,r,o){var c,s=!!o&&!!o.unsafe,a=!!o&&!!o.enumerable,u=!!o&&!!o.noTargetGet;"function"==typeof r&&("string"!=typeof t||Z(r,"name")||W(r,"name",t),(c=n(r)).source||(c.source=i.join("string"==typeof t?t:""))),e!==l?(s?!u&&e[t]&&(a=!0):delete e[t],a?e[t]=r:W(e,t,r)):a?e[t]=r:k(t,r);})(Function.prototype,"toString",(function(){return "function"==typeof this&&t(this).source||N(this)}));})),ae=l,ue=function(e){return "function"==typeof e?e:void 0},le=function(e,t){return arguments.length<2?ue(ae[e])||ue(l[e]):ae[e]&&ae[e][t]||l[e]&&l[e][t]},de=Math.ceil,ge=Math.floor,fe=function(e){return isNaN(e=+e)?0:(e>0?ge:de)(e)},Ie=Math.min,pe=function(e){return e>0?Ie(fe(e),9007199254740991):0},he=Math.max,ye=Math.min,be=function(e){return function(t,n,i){var r,o=C(t),c=pe(o.length),s=function(e,t){var n=fe(e);return n<0?he(n+t,0):ye(n,t)}(i,c);if(e&&n!=n){for(;c>s;)if((r=o[s++])!=r)return !0}else for(;c>s;s++)if((e||s in o)&&o[s]===n)return e||s||0;return !e&&-1}},me={includes:be(!0),indexOf:be(!1)},ve=me.indexOf,Be=function(e,t){var n,i=C(e),r=0,o=[];for(n in i)!Z(q,n)&&Z(i,n)&&o.push(n);for(;t.length>r;)Z(i,n=t[r++])&&(~ve(o,n)||o.push(n));return o},Ce=["constructor","hasOwnProperty","isPrototypeOf","propertyIsEnumerable","toLocaleString","toString","valueOf"],Fe=Ce.concat("length","prototype"),Ue={f:Object.getOwnPropertyNames||function(e){return Be(e,Fe)}},Se={f:Object.getOwnPropertySymbols},Ze=le("Reflect","ownKeys")||function(e){var t=Ue.f(R(e)),n=Se.f;return n?t.concat(n(e)):t},Ve=function(e,t){for(var n=Ze(t),i=J.f,r=A.f,o=0;o<n.length;o++){var c=n[o];Z(e,c)||i(e,c,r(t,c));}},Ge=/#|\.prototype\./,Xe=function(e,t){var n=xe[we(e)];return n==Re||n!=Ae&&("function"==typeof t?d(t):!!t)},we=Xe.normalize=function(e){return String(e).replace(Ge,".").toLowerCase()},xe=Xe.data={},Ae=Xe.NATIVE="N",Re=Xe.POLYFILL="P",Qe=Xe,Je=A.f,We=function(e,t){var n,i,r,o,c,s=e.target,a=e.global,u=e.stat;if(n=a?l:u?l[s]||k(s,{}):(l[s]||{}).prototype)for(i in t){if(o=t[i],r=e.noTargetGet?(c=Je(n,i))&&c.value:n[i],!Qe(a?i:s+(u?".":"#")+i,e.forced)&&void 0!==r){if(typeof o==typeof r)continue;Ve(o,r);}(e.sham||r&&r.sham)&&W(o,"sham",!0),se(n,i,o,e);}},ke=!!Object.getOwnPropertySymbols&&!d((function(){return !String(Symbol())})),He=ke&&!Symbol.sham&&"symbol"==typeof Symbol.iterator,Le=z("wks"),Ee=l.Symbol,Te=He?Ee:Ee&&Ee.withoutSetter||D,Ye=function(e){return Z(Le,e)||(ke&&Z(Ee,e)?Le[e]=Ee[e]:Le[e]=Te("Symbol."+e)),Le[e]},Ne=Ye("match"),Ke=function(e){if(function(e){var t;return F(e)&&(void 0!==(t=e[Ne])?!!t:"RegExp"==b(e))}(e))throw TypeError("The method doesn't accept regular expressions");return e},Oe=Ye("match"),ze=function(e){var t=/./;try{"/./"[e](t);}catch(n){try{return t[Oe]=!1,"/./"[e](t)}catch(e){}}return !1},je=A.f,_e="".startsWith,De=Math.min,Pe=ze("startsWith"),Me=!(Pe||(oe=je(String.prototype,"startsWith"),!oe||oe.writable));We({target:"String",proto:!0,forced:!Me&&!Pe},{startsWith:function(e){var t=String(B(this));Ke(e);var n=pe(De(arguments.length>1?arguments[1]:void 0,t.length)),i=String(e);return _e?_e.call(t,i,n):t.slice(n,n+i.length)===i}});var qe,$e,et=function(e){if("function"!=typeof e)throw TypeError(String(e)+" is not a function");return e},tt=function(e,t,n){if(et(e),void 0===t)return e;switch(n){case 0:return function(){return e.call(t)};case 1:return function(n){return e.call(t,n)};case 2:return function(n,i){return e.call(t,n,i)};case 3:return function(n,i,r){return e.call(t,n,i,r)}}return function(){return e.apply(t,arguments)}},nt=Function.call,it=function(e,t,n){return tt(nt,l[e].prototype[t],n)},rt=(it("String","startsWith"),Array.isArray||function(e){return "Array"==b(e)}),ot=function(e){return Object(B(e))},ct=function(e,t,n){var i=U(t);i in e?J.f(e,i,h(0,n)):e[i]=n;},st=Ye("species"),at=function(e,t){var n;return rt(e)&&("function"!=typeof(n=e.constructor)||n!==Array&&!rt(n.prototype)?F(n)&&null===(n=n[st])&&(n=void 0):n=void 0),new(void 0===n?Array:n)(0===t?0:t)},ut=le("navigator","userAgent")||"",lt=l.process,dt=lt&&lt.versions,gt=dt&&dt.v8;gt?$e=(qe=gt.split("."))[0]+qe[1]:ut&&(!(qe=ut.match(/Edge\/(\d+)/))||qe[1]>=74)&&(qe=ut.match(/Chrome\/(\d+)/))&&($e=qe[1]);var ft=$e&&+$e,It=Ye("species"),pt=Ye("isConcatSpreadable"),ht=ft>=51||!d((function(){var e=[];return e[pt]=!1,e.concat()[0]!==e})),yt=function(e){return ft>=51||!d((function(){var t=[];return (t.constructor={})[It]=function(){return {foo:1}},1!==t[e](Boolean).foo}))}("concat"),bt=function(e){if(!F(e))return !1;var t=e[pt];return void 0!==t?!!t:rt(e)};We({target:"Array",proto:!0,forced:!ht||!yt},{concat:function(e){var t,n,i,r,o,c=ot(this),s=at(c,0),a=0;for(t=-1,i=arguments.length;t<i;t++)if(bt(o=-1===t?c:arguments[t])){if(a+(r=pe(o.length))>9007199254740991)throw TypeError("Maximum allowed index exceeded");for(n=0;n<r;n++,a++)n in o&&ct(s,a,o[n]);}else {if(a>=9007199254740991)throw TypeError("Maximum allowed index exceeded");ct(s,a++,o);}return s.length=a,s}});var mt={};mt[Ye("toStringTag")]="z";var vt="[object z]"===String(mt),Bt=Ye("toStringTag"),Ct="Arguments"==b(function(){return arguments}()),Ft=vt?b:function(e){var t,n,i;return void 0===e?"Undefined":null===e?"Null":"string"==typeof(n=function(e,t){try{return e[t]}catch(e){}}(t=Object(e),Bt))?n:Ct?b(t):"Object"==(i=b(t))&&"function"==typeof t.callee?"Arguments":i},Ut=vt?{}.toString:function(){return "[object "+Ft(this)+"]"};vt||se(Object.prototype,"toString",Ut,{unsafe:!0});var St,Zt=Object.keys||function(e){return Be(e,Ce)},Vt=g?Object.defineProperties:function(e,t){R(e);for(var n,i=Zt(t),r=i.length,o=0;r>o;)J.f(e,n=i[o++],t[n]);return e},Gt=le("document","documentElement"),Xt=M("IE_PROTO"),wt=function(){},xt=function(e){return "<script>"+e+"<\/script>"},At=function(){try{St=document.domain&&new ActiveXObject("htmlfile");}catch(e){}var e,t;At=St?function(e){e.write(xt("")),e.close();var t=e.parentWindow.Object;return e=null,t}(St):((t=X("iframe")).style.display="none",Gt.appendChild(t),t.src=String("javascript:"),(e=t.contentWindow.document).open(),e.write(xt("document.F=Object")),e.close(),e.F);for(var n=Ce.length;n--;)delete At.prototype[Ce[n]];return At()};q[Xt]=!0;var Rt=Object.create||function(e,t){var n;return null!==e?(wt.prototype=R(e),n=new wt,wt.prototype=null,n[Xt]=e):n=At(),void 0===t?n:Vt(n,t)},Qt=Ue.f,Jt={}.toString,Wt="object"==typeof window&&window&&Object.getOwnPropertyNames?Object.getOwnPropertyNames(window):[],kt={f:function(e){return Wt&&"[object Window]"==Jt.call(e)?function(e){try{return Qt(e)}catch(e){return Wt.slice()}}(e):Qt(C(e))}},Ht={f:Ye},Lt=J.f,Et=function(e){var t=ae.Symbol||(ae.Symbol={});Z(t,e)||Lt(t,e,{value:Ht.f(e)});},Tt=J.f,Yt=Ye("toStringTag"),Nt=function(e,t,n){e&&!Z(e=n?e:e.prototype,Yt)&&Tt(e,Yt,{configurable:!0,value:t});},Kt=[].push,Ot=function(e){var t=1==e,n=2==e,i=3==e,r=4==e,o=6==e,c=7==e,s=5==e||o;return function(a,u,l,d){for(var g,f,I=ot(a),p=v(I),h=tt(u,l,3),y=pe(p.length),b=0,m=d||at,B=t?m(a,y):n||c?m(a,0):void 0;y>b;b++)if((s||b in p)&&(f=h(g=p[b],b,I),e))if(t)B[b]=f;else if(f)switch(e){case 3:return !0;case 5:return g;case 6:return b;case 2:Kt.call(B,g);}else switch(e){case 4:return !1;case 7:Kt.call(B,g);}return o?-1:i||r?r:B}},zt={forEach:Ot(0),map:Ot(1),filter:Ot(2),some:Ot(3),every:Ot(4),find:Ot(5),findIndex:Ot(6),filterOut:Ot(7)}.forEach,jt=M("hidden"),_t=Ye("toPrimitive"),Dt=ce.set,Pt=ce.getterFor("Symbol"),Mt=Object.prototype,qt=l.Symbol,$t=le("JSON","stringify"),en=A.f,tn=J.f,nn=kt.f,rn=p.f,on=z("symbols"),cn=z("op-symbols"),sn=z("string-to-symbol-registry"),an=z("symbol-to-string-registry"),un=z("wks"),ln=l.QObject,dn=!ln||!ln.prototype||!ln.prototype.findChild,gn=g&&d((function(){return 7!=Rt(tn({},"a",{get:function(){return tn(this,"a",{value:7}).a}})).a}))?function(e,t,n){var i=en(Mt,t);i&&delete Mt[t],tn(e,t,n),i&&e!==Mt&&tn(Mt,t,i);}:tn,fn=function(e,t){var n=on[e]=Rt(qt.prototype);return Dt(n,{type:"Symbol",tag:e,description:t}),g||(n.description=t),n},In=He?function(e){return "symbol"==typeof e}:function(e){return Object(e)instanceof qt},pn=function(e,t,n){e===Mt&&pn(cn,t,n),R(e);var i=U(t,!0);return R(n),Z(on,i)?(n.enumerable?(Z(e,jt)&&e[jt][i]&&(e[jt][i]=!1),n=Rt(n,{enumerable:h(0,!1)})):(Z(e,jt)||tn(e,jt,h(1,{})),e[jt][i]=!0),gn(e,i,n)):tn(e,i,n)},hn=function(e,t){R(e);var n=C(t),i=Zt(n).concat(vn(n));return zt(i,(function(t){g&&!yn.call(n,t)||pn(e,t,n[t]);})),e},yn=function(e){var t=U(e,!0),n=rn.call(this,t);return !(this===Mt&&Z(on,t)&&!Z(cn,t))&&(!(n||!Z(this,t)||!Z(on,t)||Z(this,jt)&&this[jt][t])||n)},bn=function(e,t){var n=C(e),i=U(t,!0);if(n!==Mt||!Z(on,i)||Z(cn,i)){var r=en(n,i);return !r||!Z(on,i)||Z(n,jt)&&n[jt][i]||(r.enumerable=!0),r}},mn=function(e){var t=nn(C(e)),n=[];return zt(t,(function(e){Z(on,e)||Z(q,e)||n.push(e);})),n},vn=function(e){var t=e===Mt,n=nn(t?cn:C(e)),i=[];return zt(n,(function(e){!Z(on,e)||t&&!Z(Mt,e)||i.push(on[e]);})),i};if(ke||(se((qt=function(){if(this instanceof qt)throw TypeError("Symbol is not a constructor");var e=arguments.length&&void 0!==arguments[0]?String(arguments[0]):void 0,t=D(e),n=function(e){this===Mt&&n.call(cn,e),Z(this,jt)&&Z(this[jt],t)&&(this[jt][t]=!1),gn(this,t,h(1,e));};return g&&dn&&gn(Mt,t,{configurable:!0,set:n}),fn(t,e)}).prototype,"toString",(function(){return Pt(this).tag})),se(qt,"withoutSetter",(function(e){return fn(D(e),e)})),p.f=yn,J.f=pn,A.f=bn,Ue.f=kt.f=mn,Se.f=vn,Ht.f=function(e){return fn(Ye(e),e)},g&&(tn(qt.prototype,"description",{configurable:!0,get:function(){return Pt(this).description}}),se(Mt,"propertyIsEnumerable",yn,{unsafe:!0}))),We({global:!0,wrap:!0,forced:!ke,sham:!ke},{Symbol:qt}),zt(Zt(un),(function(e){Et(e);})),We({target:"Symbol",stat:!0,forced:!ke},{for:function(e){var t=String(e);if(Z(sn,t))return sn[t];var n=qt(t);return sn[t]=n,an[n]=t,n},keyFor:function(e){if(!In(e))throw TypeError(e+" is not a symbol");if(Z(an,e))return an[e]},useSetter:function(){dn=!0;},useSimple:function(){dn=!1;}}),We({target:"Object",stat:!0,forced:!ke,sham:!g},{create:function(e,t){return void 0===t?Rt(e):hn(Rt(e),t)},defineProperty:pn,defineProperties:hn,getOwnPropertyDescriptor:bn}),We({target:"Object",stat:!0,forced:!ke},{getOwnPropertyNames:mn,getOwnPropertySymbols:vn}),We({target:"Object",stat:!0,forced:d((function(){Se.f(1);}))},{getOwnPropertySymbols:function(e){return Se.f(ot(e))}}),$t){var Bn=!ke||d((function(){var e=qt();return "[null]"!=$t([e])||"{}"!=$t({a:e})||"{}"!=$t(Object(e))}));We({target:"JSON",stat:!0,forced:Bn},{stringify:function(e,t,n){for(var i,r=[e],o=1;arguments.length>o;)r.push(arguments[o++]);if(i=t,(F(t)||void 0!==e)&&!In(e))return rt(t)||(t=function(e,t){if("function"==typeof i&&(t=i.call(this,e,t)),!In(t))return t}),r[1]=t,$t.apply(null,r)}});}qt.prototype[_t]||W(qt.prototype,_t,qt.prototype.valueOf),Nt(qt,"Symbol"),q[jt]=!0,Et("asyncIterator");var Cn=J.f,Fn=l.Symbol;if(g&&"function"==typeof Fn&&(!("description"in Fn.prototype)||void 0!==Fn().description)){var Un={},Sn=function(){var e=arguments.length<1||void 0===arguments[0]?void 0:String(arguments[0]),t=this instanceof Sn?new Fn(e):void 0===e?Fn():Fn(e);return ""===e&&(Un[t]=!0),t};Ve(Sn,Fn);var Zn=Sn.prototype=Fn.prototype;Zn.constructor=Sn;var Vn=Zn.toString,Gn="Symbol(test)"==String(Fn("test")),Xn=/^Symbol\((.*)\)[^)]+$/;Cn(Zn,"description",{configurable:!0,get:function(){var e=F(this)?this.valueOf():this,t=Vn.call(e);if(Z(Un,e))return "";var n=Gn?t.slice(7,-1):t.replace(Xn,"$1");return ""===n?void 0:n}}),We({global:!0,forced:!0},{Symbol:Sn});}Et("hasInstance"),Et("isConcatSpreadable"),Et("iterator"),Et("match"),Et("matchAll"),Et("replace"),Et("search"),Et("species"),Et("split"),Et("toPrimitive"),Et("toStringTag"),Et("unscopables"),Nt(l.JSON,"JSON",!0),Nt(Math,"Math",!0),We({global:!0},{Reflect:{}}),Nt(l.Reflect,"Reflect",!0);ae.Symbol;var wn,xn,An,Rn=function(e){return function(t,n){var i,r,o=String(B(t)),c=fe(n),s=o.length;return c<0||c>=s?e?"":void 0:(i=o.charCodeAt(c))<55296||i>56319||c+1===s||(r=o.charCodeAt(c+1))<56320||r>57343?e?o.charAt(c):i:e?o.slice(c,c+2):r-56320+(i-55296<<10)+65536}},Qn={codeAt:Rn(!1),charAt:Rn(!0)},Jn=!d((function(){function e(){}return e.prototype.constructor=null,Object.getPrototypeOf(new e)!==e.prototype})),Wn=M("IE_PROTO"),kn=Object.prototype,Hn=Jn?Object.getPrototypeOf:function(e){return e=ot(e),Z(e,Wn)?e[Wn]:"function"==typeof e.constructor&&e instanceof e.constructor?e.constructor.prototype:e instanceof Object?kn:null},Ln=Ye("iterator"),En=!1;[].keys&&("next"in(An=[].keys())?(xn=Hn(Hn(An)))!==Object.prototype&&(wn=xn):En=!0),null==wn&&(wn={}),Z(wn,Ln)||W(wn,Ln,(function(){return this}));var Tn={IteratorPrototype:wn,BUGGY_SAFARI_ITERATORS:En},Yn={},Nn=Tn.IteratorPrototype,Kn=function(){return this},On=Object.setPrototypeOf||("__proto__"in{}?function(){var e,t=!1,n={};try{(e=Object.getOwnPropertyDescriptor(Object.prototype,"__proto__").set).call(n,[]),t=n instanceof Array;}catch(e){}return function(n,i){return R(n),function(e){if(!F(e)&&null!==e)throw TypeError("Can't set "+String(e)+" as a prototype")}(i),t?e.call(n,i):n.__proto__=i,n}}():void 0),zn=Tn.IteratorPrototype,jn=Tn.BUGGY_SAFARI_ITERATORS,_n=Ye("iterator"),Dn=function(){return this},Pn=function(e,t,n,i,r,o,c){!function(e,t,n){var i=t+" Iterator";e.prototype=Rt(Nn,{next:h(1,n)}),Nt(e,i,!1),Yn[i]=Kn;}(n,t,i);var s,a,u,l=function(e){if(e===r&&p)return p;if(!jn&&e in f)return f[e];switch(e){case"keys":case"values":case"entries":return function(){return new n(this,e)}}return function(){return new n(this)}},d=t+" Iterator",g=!1,f=e.prototype,I=f[_n]||f["@@iterator"]||r&&f[r],p=!jn&&I||l(r),y="Array"==t&&f.entries||I;if(y&&(s=Hn(y.call(new e)),zn!==Object.prototype&&s.next&&(Hn(s)!==zn&&(On?On(s,zn):"function"!=typeof s[_n]&&W(s,_n,Dn)),Nt(s,d,!0))),"values"==r&&I&&"values"!==I.name&&(g=!0,p=function(){return I.call(this)}),f[_n]!==p&&W(f,_n,p),Yn[t]=p,r)if(a={values:l("values"),keys:o?p:l("keys"),entries:l("entries")},c)for(u in a)(jn||g||!(u in f))&&se(f,u,a[u]);else We({target:t,proto:!0,forced:jn||g},a);return a},Mn=Qn.charAt,qn=ce.set,$n=ce.getterFor("String Iterator");Pn(String,"String",(function(e){qn(this,{type:"String Iterator",string:String(e),index:0});}),(function(){var e,t=$n(this),n=t.string,i=t.index;return i>=n.length?{value:void 0,done:!0}:(e=Mn(n,i),t.index+=e.length,{value:e,done:!1})}));var ei=function(e){var t=e.return;if(void 0!==t)return R(t.call(e)).value},ti=function(e,t,n,i){try{return i?t(R(n)[0],n[1]):t(n)}catch(t){throw ei(e),t}},ni=Ye("iterator"),ii=Array.prototype,ri=function(e){return void 0!==e&&(Yn.Array===e||ii[ni]===e)},oi=Ye("iterator"),ci=function(e){if(null!=e)return e[oi]||e["@@iterator"]||Yn[Ft(e)]},si=Ye("iterator"),ai=!1;try{var ui=0,li={next:function(){return {done:!!ui++}},return:function(){ai=!0;}};li[si]=function(){return this},Array.from(li,(function(){throw 2}));}catch(e){}var di=function(e,t){if(!t&&!ai)return !1;var n=!1;try{var i={};i[si]=function(){return {next:function(){return {done:n=!0}}}},e(i);}catch(e){}return n},gi=!di((function(e){Array.from(e);}));We({target:"Array",stat:!0,forced:gi},{from:function(e){var t,n,i,r,o,c,s=ot(e),a="function"==typeof this?this:Array,u=arguments.length,l=u>1?arguments[1]:void 0,d=void 0!==l,g=ci(s),f=0;if(d&&(l=tt(l,u>2?arguments[2]:void 0,2)),null==g||a==Array&&ri(g))for(n=new a(t=pe(s.length));t>f;f++)c=d?l(s[f],f):s[f],ct(n,f,c);else for(o=(r=g.call(s)).next,n=new a;!(i=o.call(r)).done;f++)c=d?ti(r,l,[i.value,f],!0):i.value,ct(n,f,c);return n.length=f,n}});ae.Array.from;var fi,Ii="undefined"!=typeof ArrayBuffer&&"undefined"!=typeof DataView,pi=J.f,hi=l.Int8Array,yi=hi&&hi.prototype,bi=l.Uint8ClampedArray,mi=bi&&bi.prototype,vi=hi&&Hn(hi),Bi=yi&&Hn(yi),Ci=Object.prototype,Fi=Ci.isPrototypeOf,Ui=Ye("toStringTag"),Si=D("TYPED_ARRAY_TAG"),Zi=Ii&&!!On&&"Opera"!==Ft(l.opera),Vi={Int8Array:1,Uint8Array:1,Uint8ClampedArray:1,Int16Array:2,Uint16Array:2,Int32Array:4,Uint32Array:4,Float32Array:4,Float64Array:8},Gi=function(e){return F(e)&&Z(Vi,Ft(e))};for(fi in Vi)l[fi]||(Zi=!1);if((!Zi||"function"!=typeof vi||vi===Function.prototype)&&(vi=function(){throw TypeError("Incorrect invocation")},Zi))for(fi in Vi)l[fi]&&On(l[fi],vi);if((!Zi||!Bi||Bi===Ci)&&(Bi=vi.prototype,Zi))for(fi in Vi)l[fi]&&On(l[fi].prototype,Bi);if(Zi&&Hn(mi)!==Bi&&On(mi,Bi),g&&!Z(Bi,Ui))for(fi in pi(Bi,Ui,{get:function(){return F(this)?this[Si]:void 0}}),Vi)l[fi]&&W(l[fi],Si,fi);var Xi=function(e){if(Gi(e))return e;throw TypeError("Target is not a typed array")},wi=function(e){if(On){if(Fi.call(vi,e))return e}else for(var t in Vi)if(Z(Vi,fi)){var n=l[t];if(n&&(e===n||Fi.call(n,e)))return e}throw TypeError("Target is not a typed array constructor")},xi=function(e,t,n){if(g){if(n)for(var i in Vi){var r=l[i];r&&Z(r.prototype,e)&&delete r.prototype[e];}Bi[e]&&!n||se(Bi,e,n?t:Zi&&yi[e]||t);}},Ai=Ye("species"),Ri=Xi,Qi=wi,Ji=[].slice;xi("slice",(function(e,t){for(var n=Ji.call(Ri(this),e,t),i=function(e,t){var n,i=R(e).constructor;return void 0===i||null==(n=R(i)[Ai])?t:et(n)}(this,this.constructor),r=0,o=n.length,c=new(Qi(i))(o);o>r;)c[r]=n[r++];return c}),d((function(){new Int8Array(1).slice();})));var Wi=Ye("unscopables"),ki=Array.prototype;null==ki[Wi]&&J.f(ki,Wi,{configurable:!0,value:Rt(null)});var Hi=function(e){ki[Wi][e]=!0;},Li=Object.defineProperty,Ei={},Ti=function(e){throw e},Yi=me.includes,Ni=function(e,t){if(Z(Ei,e))return Ei[e];t||(t={});var n=[][e],i=!!Z(t,"ACCESSORS")&&t.ACCESSORS,r=Z(t,0)?t[0]:Ti,o=Z(t,1)?t[1]:void 0;return Ei[e]=!!n&&!d((function(){if(i&&!g)return !0;var e={length:-1};i?Li(e,1,{enumerable:!0,get:Ti}):e[1]=1,n.call(e,r,o);}))}("indexOf",{ACCESSORS:!0,1:0});We({target:"Array",proto:!0,forced:!Ni},{includes:function(e){return Yi(this,e,arguments.length>1?arguments[1]:void 0)}}),Hi("includes");it("Array","includes");We({target:"String",proto:!0,forced:!ze("includes")},{includes:function(e){return !!~String(B(this)).indexOf(Ke(e),arguments.length>1?arguments[1]:void 0)}});it("String","includes");var Ki=!d((function(){return Object.isExtensible(Object.preventExtensions({}))})),Oi=a((function(e){var t=J.f,n=D("meta"),i=0,r=Object.isExtensible||function(){return !0},o=function(e){t(e,n,{value:{objectID:"O"+ ++i,weakData:{}}});},c=e.exports={REQUIRED:!1,fastKey:function(e,t){if(!F(e))return "symbol"==typeof e?e:("string"==typeof e?"S":"P")+e;if(!Z(e,n)){if(!r(e))return "F";if(!t)return "E";o(e);}return e[n].objectID},getWeakData:function(e,t){if(!Z(e,n)){if(!r(e))return !0;if(!t)return !1;o(e);}return e[n].weakData},onFreeze:function(e){return Ki&&c.REQUIRED&&r(e)&&!Z(e,n)&&o(e),e}};q[n]=!0;})),zi=(Oi.REQUIRED,Oi.fastKey,Oi.getWeakData,Oi.onFreeze,function(e,t){this.stopped=e,this.result=t;}),ji=function(e,t,n){var i,r,o,c,s,a,u,l=n&&n.that,d=!(!n||!n.AS_ENTRIES),g=!(!n||!n.IS_ITERATOR),f=!(!n||!n.INTERRUPTED),I=tt(t,l,1+d+f),p=function(e){return i&&ei(i),new zi(!0,e)},h=function(e){return d?(R(e),f?I(e[0],e[1],p):I(e[0],e[1])):f?I(e,p):I(e)};if(g)i=e;else {if("function"!=typeof(r=ci(e)))throw TypeError("Target is not iterable");if(ri(r)){for(o=0,c=pe(e.length);c>o;o++)if((s=h(e[o]))&&s instanceof zi)return s;return new zi(!1)}i=r.call(e);}for(a=i.next;!(u=a.call(i)).done;){try{s=h(u.value);}catch(e){throw ei(i),e}if("object"==typeof s&&s&&s instanceof zi)return s}return new zi(!1)},_i=function(e,t,n){if(!(e instanceof t))throw TypeError("Incorrect "+(n?n+" ":"")+"invocation");return e},Di=function(e,t,n){for(var i in t)se(e,i,t[i],n);return e},Pi=Ye("species"),Mi=J.f,qi=Oi.fastKey,$i=ce.set,er=ce.getterFor,tr=(function(e,t,n){var i=-1!==e.indexOf("Map"),r=-1!==e.indexOf("Weak"),o=i?"set":"add",c=l[e],s=c&&c.prototype,a=c,u={},g=function(e){var t=s[e];se(s,e,"add"==e?function(e){return t.call(this,0===e?0:e),this}:"delete"==e?function(e){return !(r&&!F(e))&&t.call(this,0===e?0:e)}:"get"==e?function(e){return r&&!F(e)?void 0:t.call(this,0===e?0:e)}:"has"==e?function(e){return !(r&&!F(e))&&t.call(this,0===e?0:e)}:function(e,n){return t.call(this,0===e?0:e,n),this});};if(Qe(e,"function"!=typeof c||!(r||s.forEach&&!d((function(){(new c).entries().next();})))))a=n.getConstructor(t,e,i,o),Oi.REQUIRED=!0;else if(Qe(e,!0)){var f=new a,I=f[o](r?{}:-0,1)!=f,p=d((function(){f.has(1);})),h=di((function(e){new c(e);})),y=!r&&d((function(){for(var e=new c,t=5;t--;)e[o](t,t);return !e.has(-0)}));h||((a=t((function(t,n){_i(t,a,e);var r=function(e,t,n){var i,r;return On&&"function"==typeof(i=t.constructor)&&i!==n&&F(r=i.prototype)&&r!==n.prototype&&On(e,r),e}(new c,t,a);return null!=n&&ji(n,r[o],{that:r,AS_ENTRIES:i}),r}))).prototype=s,s.constructor=a),(p||y)&&(g("delete"),g("has"),i&&g("get")),(y||I)&&g(o),r&&s.clear&&delete s.clear;}u[e]=a,We({global:!0,forced:a!=c},u),Nt(a,e),r||n.setStrong(a,e,i);}("Set",(function(e){return function(){return e(this,arguments.length?arguments[0]:void 0)}}),{getConstructor:function(e,t,n,i){var r=e((function(e,o){_i(e,r,t),$i(e,{type:t,index:Rt(null),first:void 0,last:void 0,size:0}),g||(e.size=0),null!=o&&ji(o,e[i],{that:e,AS_ENTRIES:n});})),o=er(t),c=function(e,t,n){var i,r,c=o(e),a=s(e,t);return a?a.value=n:(c.last=a={index:r=qi(t,!0),key:t,value:n,previous:i=c.last,next:void 0,removed:!1},c.first||(c.first=a),i&&(i.next=a),g?c.size++:e.size++,"F"!==r&&(c.index[r]=a)),e},s=function(e,t){var n,i=o(e),r=qi(t);if("F"!==r)return i.index[r];for(n=i.first;n;n=n.next)if(n.key==t)return n};return Di(r.prototype,{clear:function(){for(var e=o(this),t=e.index,n=e.first;n;)n.removed=!0,n.previous&&(n.previous=n.previous.next=void 0),delete t[n.index],n=n.next;e.first=e.last=void 0,g?e.size=0:this.size=0;},delete:function(e){var t=this,n=o(t),i=s(t,e);if(i){var r=i.next,c=i.previous;delete n.index[i.index],i.removed=!0,c&&(c.next=r),r&&(r.previous=c),n.first==i&&(n.first=r),n.last==i&&(n.last=c),g?n.size--:t.size--;}return !!i},forEach:function(e){for(var t,n=o(this),i=tt(e,arguments.length>1?arguments[1]:void 0,3);t=t?t.next:n.first;)for(i(t.value,t.key,this);t&&t.removed;)t=t.previous;},has:function(e){return !!s(this,e)}}),Di(r.prototype,n?{get:function(e){var t=s(this,e);return t&&t.value},set:function(e,t){return c(this,0===e?0:e,t)}}:{add:function(e){return c(this,e=0===e?0:e,e)}}),g&&Mi(r.prototype,"size",{get:function(){return o(this).size}}),r},setStrong:function(e,t,n){var i=t+" Iterator",r=er(t),o=er(i);Pn(e,t,(function(e,t){$i(this,{type:i,target:e,state:r(e),kind:t,last:void 0});}),(function(){for(var e=o(this),t=e.kind,n=e.last;n&&n.removed;)n=n.previous;return e.target&&(e.last=n=n?n.next:e.state.first)?"keys"==t?{value:n.key,done:!1}:"values"==t?{value:n.value,done:!1}:{value:[n.key,n.value],done:!1}:(e.target=void 0,{value:void 0,done:!0})}),n?"entries":"values",!n,!0),function(e){var t=le(e),n=J.f;g&&t&&!t[Pi]&&n(t,Pi,{configurable:!0,get:function(){return this}});}(t);}}),{CSSRuleList:0,CSSStyleDeclaration:0,CSSValueList:0,ClientRectList:0,DOMRectList:0,DOMStringList:0,DOMTokenList:1,DataTransferItemList:0,FileList:0,HTMLAllCollection:0,HTMLCollection:0,HTMLFormElement:0,HTMLSelectElement:0,MediaList:0,MimeTypeArray:0,NamedNodeMap:0,NodeList:1,PaintRequestList:0,Plugin:0,PluginArray:0,SVGLengthList:0,SVGNumberList:0,SVGPathSegList:0,SVGPointList:0,SVGStringList:0,SVGTransformList:0,SourceBufferList:0,StyleSheetList:0,TextTrackCueList:0,TextTrackList:0,TouchList:0}),nr=ce.set,ir=ce.getterFor("Array Iterator"),rr=Pn(Array,"Array",(function(e,t){nr(this,{type:"Array Iterator",target:C(e),index:0,kind:t});}),(function(){var e=ir(this),t=e.target,n=e.kind,i=e.index++;return !t||i>=t.length?(e.target=void 0,{value:void 0,done:!0}):"keys"==n?{value:i,done:!1}:"values"==n?{value:t[i],done:!1}:{value:[i,t[i]],done:!1}}),"values");Yn.Arguments=Yn.Array,Hi("keys"),Hi("values"),Hi("entries");var or=Ye("iterator"),cr=Ye("toStringTag"),sr=rr.values;for(var ar in tr){var ur=l[ar],lr=ur&&ur.prototype;if(lr){if(lr[or]!==sr)try{W(lr,or,sr);}catch(e){lr[or]=sr;}if(lr[cr]||W(lr,cr,ar),tr[ar])for(var dr in rr)if(lr[dr]!==rr[dr])try{W(lr,dr,rr[dr]);}catch(e){lr[dr]=rr[dr];}}}ae.Set;function gr(e){var t=this.constructor;return this.then((function(n){return t.resolve(e()).then((function(){return n}))}),(function(n){return t.resolve(e()).then((function(){return t.reject(n)}))}))}function fr(e){return new this((function(t,n){if(!e||void 0===e.length)return n(new TypeError(typeof e+" "+e+" is not iterable(cannot read property Symbol(Symbol.iterator))"));var i=Array.prototype.slice.call(e);if(0===i.length)return t([]);var r=i.length;function o(e,n){if(n&&("object"==typeof n||"function"==typeof n)){var c=n.then;if("function"==typeof c)return void c.call(n,(function(t){o(e,t);}),(function(n){i[e]={status:"rejected",reason:n},0==--r&&t(i);}))}i[e]={status:"fulfilled",value:n},0==--r&&t(i);}for(var c=0;c<i.length;c++)o(c,i[c]);}))}var Ir=setTimeout;function pr(e){return Boolean(e&&void 0!==e.length)}function hr(){}function yr(e){if(!(this instanceof yr))throw new TypeError("Promises must be constructed via new");if("function"!=typeof e)throw new TypeError("not a function");this._state=0,this._handled=!1,this._value=void 0,this._deferreds=[],Fr(e,this);}function br(e,t){for(;3===e._state;)e=e._value;0!==e._state?(e._handled=!0,yr._immediateFn((function(){var n=1===e._state?t.onFulfilled:t.onRejected;if(null!==n){var i;try{i=n(e._value);}catch(e){return void vr(t.promise,e)}mr(t.promise,i);}else (1===e._state?mr:vr)(t.promise,e._value);}))):e._deferreds.push(t);}function mr(e,t){try{if(t===e)throw new TypeError("A promise cannot be resolved with itself.");if(t&&("object"==typeof t||"function"==typeof t)){var n=t.then;if(t instanceof yr)return e._state=3,e._value=t,void Br(e);if("function"==typeof n)return void Fr((i=n,r=t,function(){i.apply(r,arguments);}),e)}e._state=1,e._value=t,Br(e);}catch(t){vr(e,t);}var i,r;}function vr(e,t){e._state=2,e._value=t,Br(e);}function Br(e){2===e._state&&0===e._deferreds.length&&yr._immediateFn((function(){e._handled||yr._unhandledRejectionFn(e._value);}));for(var t=0,n=e._deferreds.length;t<n;t++)br(e,e._deferreds[t]);e._deferreds=null;}function Cr(e,t,n){this.onFulfilled="function"==typeof e?e:null,this.onRejected="function"==typeof t?t:null,this.promise=n;}function Fr(e,t){var n=!1;try{e((function(e){n||(n=!0,mr(t,e));}),(function(e){n||(n=!0,vr(t,e));}));}catch(e){if(n)return;n=!0,vr(t,e);}}yr.prototype.catch=function(e){return this.then(null,e)},yr.prototype.then=function(e,t){var n=new this.constructor(hr);return br(this,new Cr(e,t,n)),n},yr.prototype.finally=gr,yr.all=function(e){return new yr((function(t,n){if(!pr(e))return n(new TypeError("Promise.all accepts an array"));var i=Array.prototype.slice.call(e);if(0===i.length)return t([]);var r=i.length;function o(e,c){try{if(c&&("object"==typeof c||"function"==typeof c)){var s=c.then;if("function"==typeof s)return void s.call(c,(function(t){o(e,t);}),n)}i[e]=c,0==--r&&t(i);}catch(e){n(e);}}for(var c=0;c<i.length;c++)o(c,i[c]);}))},yr.allSettled=fr,yr.resolve=function(e){return e&&"object"==typeof e&&e.constructor===yr?e:new yr((function(t){t(e);}))},yr.reject=function(e){return new yr((function(t,n){n(e);}))},yr.race=function(e){return new yr((function(t,n){if(!pr(e))return n(new TypeError("Promise.race accepts an array"));for(var i=0,r=e.length;i<r;i++)yr.resolve(e[i]).then(t,n);}))},yr._immediateFn="function"==typeof setImmediate&&function(e){setImmediate(e);}||function(e){Ir(e,0);},yr._unhandledRejectionFn=function(e){"undefined"!=typeof console&&console&&console.warn("Possible Unhandled Promise Rejection:",e);};var Ur=function(){if("undefined"!=typeof self)return self;if("undefined"!=typeof window)return window;if("undefined"!=typeof global)return global;throw new Error("unable to locate global object")}();"function"!=typeof Ur.Promise?Ur.Promise=yr:Ur.Promise.prototype.finally?Ur.Promise.allSettled||(Ur.Promise.allSettled=fr):Ur.Promise.prototype.finally=gr,function(e){function t(){}function n(e,t){if(e=void 0===e?"utf-8":e,t=void 0===t?{fatal:!1}:t,-1===r.indexOf(e.toLowerCase()))throw new RangeError("Failed to construct 'TextDecoder': The encoding label provided ('"+e+"') is invalid.");if(t.fatal)throw Error("Failed to construct 'TextDecoder': the 'fatal' option is unsupported.")}function i(e){for(var t=0,n=Math.min(65536,e.length+1),i=new Uint16Array(n),r=[],o=0;;){var c=t<e.length;if(!c||o>=n-1){if(r.push(String.fromCharCode.apply(null,i.subarray(0,o))),!c)return r.join("");e=e.subarray(t),o=t=0;}if(0==(128&(c=e[t++])))i[o++]=c;else if(192==(224&c)){var s=63&e[t++];i[o++]=(31&c)<<6|s;}else if(224==(240&c)){s=63&e[t++];var a=63&e[t++];i[o++]=(31&c)<<12|s<<6|a;}else if(240==(248&c)){65535<(c=(7&c)<<18|(s=63&e[t++])<<12|(a=63&e[t++])<<6|63&e[t++])&&(c-=65536,i[o++]=c>>>10&1023|55296,c=56320|1023&c),i[o++]=c;}}}if(e.TextEncoder&&e.TextDecoder)return !1;var r=["utf-8","utf8","unicode-1-1-utf-8"];Object.defineProperty(t.prototype,"encoding",{value:"utf-8"}),t.prototype.encode=function(e,t){if((t=void 0===t?{stream:!1}:t).stream)throw Error("Failed to encode: the 'stream' option is unsupported.");t=0;for(var n=e.length,i=0,r=Math.max(32,n+(n>>>1)+7),o=new Uint8Array(r>>>3<<3);t<n;){var c=e.charCodeAt(t++);if(55296<=c&&56319>=c){if(t<n){var s=e.charCodeAt(t);56320==(64512&s)&&(++t,c=((1023&c)<<10)+(1023&s)+65536);}if(55296<=c&&56319>=c)continue}if(i+4>o.length&&(r+=8,r=(r*=1+t/e.length*2)>>>3<<3,(s=new Uint8Array(r)).set(o),o=s),0==(4294967168&c))o[i++]=c;else {if(0==(4294965248&c))o[i++]=c>>>6&31|192;else if(0==(4294901760&c))o[i++]=c>>>12&15|224,o[i++]=c>>>6&63|128;else {if(0!=(4292870144&c))continue;o[i++]=c>>>18&7|240,o[i++]=c>>>12&63|128,o[i++]=c>>>6&63|128;}o[i++]=63&c|128;}}return o.slice?o.slice(0,i):o.subarray(0,i)},Object.defineProperty(n.prototype,"encoding",{value:"utf-8"}),Object.defineProperty(n.prototype,"fatal",{value:!1}),Object.defineProperty(n.prototype,"ignoreBOM",{value:!1});var o=i;"function"==typeof Buffer&&Buffer.from?o=function(e){return Buffer.from(e.buffer,e.byteOffset,e.byteLength).toString("utf-8")}:"function"==typeof Blob&&"function"==typeof URL&&"function"==typeof URL.createObjectURL&&(o=function(e){var t=URL.createObjectURL(new Blob([e],{type:"text/plain;charset=UTF-8"}));try{var n=new XMLHttpRequest;return n.open("GET",t,!1),n.send(),n.responseText}catch(t){return i(e)}finally{URL.revokeObjectURL(t);}}),n.prototype.decode=function(e,t){if((t=void 0===t?{stream:!1}:t).stream)throw Error("Failed to decode: the 'stream' option is unsupported.");return e=e instanceof Uint8Array?e:e.buffer instanceof ArrayBuffer?new Uint8Array(e.buffer):new Uint8Array(e),o(e)},e.TextEncoder=t,e.TextDecoder=n;}("undefined"!=typeof window?window:c),function(){function e(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function t(e,t){for(var n=0;n<t.length;n++){var i=t[n];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(e,i.key,i);}}function n(e,n,i){return n&&t(e.prototype,n),i&&t(e,i),e}function i(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&o(e,t);}function r(e){return (r=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}function o(e,t){return (o=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,t)}function s(){if("undefined"==typeof Reflect||!Reflect.construct)return !1;if(Reflect.construct.sham)return !1;if("function"==typeof Proxy)return !0;try{return Date.prototype.toString.call(Reflect.construct(Date,[],(function(){}))),!0}catch(e){return !1}}function a(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}function u(e,t){return !t||"object"!=typeof t&&"function"!=typeof t?a(e):t}function l(e){var t=s();return function(){var n,i=r(e);if(t){var o=r(this).constructor;n=Reflect.construct(i,arguments,o);}else n=i.apply(this,arguments);return u(this,n)}}function d(e,t){for(;!Object.prototype.hasOwnProperty.call(e,t)&&null!==(e=r(e)););return e}function g(e,t,n){return (g="undefined"!=typeof Reflect&&Reflect.get?Reflect.get:function(e,t,n){var i=d(e,t);if(i){var r=Object.getOwnPropertyDescriptor(i,t);return r.get?r.get.call(n):r.value}})(e,t,n||e)}var f=function(){function t(){e(this,t),Object.defineProperty(this,"listeners",{value:{},writable:!0,configurable:!0});}return n(t,[{key:"addEventListener",value:function(e,t){e in this.listeners||(this.listeners[e]=[]),this.listeners[e].push(t);}},{key:"removeEventListener",value:function(e,t){if(e in this.listeners)for(var n=this.listeners[e],i=0,r=n.length;i<r;i++)if(n[i]===t)return void n.splice(i,1)}},{key:"dispatchEvent",value:function(e){var t=this;if(e.type in this.listeners){for(var n=function(n){setTimeout((function(){return n.call(t,e)}));},i=this.listeners[e.type],r=0,o=i.length;r<o;r++)n(i[r]);return !e.defaultPrevented}}}]),t}(),I=function(t){i(c,t);var o=l(c);function c(){var t;return e(this,c),(t=o.call(this)).listeners||f.call(a(t)),Object.defineProperty(a(t),"aborted",{value:!1,writable:!0,configurable:!0}),Object.defineProperty(a(t),"onabort",{value:null,writable:!0,configurable:!0}),t}return n(c,[{key:"toString",value:function(){return "[object AbortSignal]"}},{key:"dispatchEvent",value:function(e){"abort"===e.type&&(this.aborted=!0,"function"==typeof this.onabort&&this.onabort.call(this,e)),g(r(c.prototype),"dispatchEvent",this).call(this,e);}}]),c}(f),p=function(){function t(){e(this,t),Object.defineProperty(this,"signal",{value:new I,writable:!0,configurable:!0});}return n(t,[{key:"abort",value:function(){var e;try{e=new Event("abort");}catch(t){"undefined"!=typeof document?document.createEvent?(e=document.createEvent("Event")).initEvent("abort",!1,!1):(e=document.createEventObject()).type="abort":e={type:"abort",bubbles:!1,cancelable:!1};}this.signal.dispatchEvent(e);}},{key:"toString",value:function(){return "[object AbortController]"}}]),t}();function h(e){return e.__FORCE_INSTALL_ABORTCONTROLLER_POLYFILL?(console.log("__FORCE_INSTALL_ABORTCONTROLLER_POLYFILL=true is set, will force install polyfill"),!0):"function"==typeof e.Request&&!e.Request.prototype.hasOwnProperty("signal")||!e.AbortController}"undefined"!=typeof Symbol&&Symbol.toStringTag&&(p.prototype[Symbol.toStringTag]="AbortController",I.prototype[Symbol.toStringTag]="AbortSignal"),function(e){h(e)&&(e.AbortController=p,e.AbortSignal=I);}("undefined"!=typeof self?self:c);}();var Sr=a((function(e,t){Object.defineProperty(t,"__esModule",{value:!0});var n=function(){function e(){var e=this;this.locked=new Map,this.addToLocked=function(t,n){var i=e.locked.get(t);void 0===i?void 0===n?e.locked.set(t,[]):e.locked.set(t,[n]):void 0!==n&&(i.unshift(n),e.locked.set(t,i));},this.isLocked=function(t){return e.locked.has(t)},this.lock=function(t){return new Promise((function(n,i){e.isLocked(t)?e.addToLocked(t,n):(e.addToLocked(t),n());}))},this.unlock=function(t){var n=e.locked.get(t);if(void 0!==n&&0!==n.length){var i=n.pop();e.locked.set(t,n),void 0!==i&&setTimeout(i,0);}else e.locked.delete(t);};}return e.getInstance=function(){return void 0===e.instance&&(e.instance=new e),e.instance},e}();t.default=function(){return n.getInstance()};}));s(Sr);var Zr=s(a((function(e,t){var n=c&&c.__awaiter||function(e,t,n,i){return new(n||(n=Promise))((function(r,o){function c(e){try{a(i.next(e));}catch(e){o(e);}}function s(e){try{a(i.throw(e));}catch(e){o(e);}}function a(e){e.done?r(e.value):new n((function(t){t(e.value);})).then(c,s);}a((i=i.apply(e,t||[])).next());}))},i=c&&c.__generator||function(e,t){var n,i,r,o,c={label:0,sent:function(){if(1&r[0])throw r[1];return r[1]},trys:[],ops:[]};return o={next:s(0),throw:s(1),return:s(2)},"function"==typeof Symbol&&(o[Symbol.iterator]=function(){return this}),o;function s(o){return function(s){return function(o){if(n)throw new TypeError("Generator is already executing.");for(;c;)try{if(n=1,i&&(r=2&o[0]?i.return:o[0]?i.throw||((r=i.return)&&r.call(i),0):i.next)&&!(r=r.call(i,o[1])).done)return r;switch(i=0,r&&(o=[2&o[0],r.value]),o[0]){case 0:case 1:r=o;break;case 4:return c.label++,{value:o[1],done:!1};case 5:c.label++,i=o[1],o=[0];continue;case 7:o=c.ops.pop(),c.trys.pop();continue;default:if(!(r=c.trys,(r=r.length>0&&r[r.length-1])||6!==o[0]&&2!==o[0])){c=0;continue}if(3===o[0]&&(!r||o[1]>r[0]&&o[1]<r[3])){c.label=o[1];break}if(6===o[0]&&c.label<r[1]){c.label=r[1],r=o;break}if(r&&c.label<r[2]){c.label=r[2],c.ops.push(o);break}r[2]&&c.ops.pop(),c.trys.pop();continue}o=t.call(e,c);}catch(e){o=[6,e],i=0;}finally{n=r=0;}if(5&o[0])throw o[1];return {value:o[0]?o[1]:void 0,done:!0}}([o,s])}}};Object.defineProperty(t,"__esModule",{value:!0});var r="browser-tabs-lock-key";function o(e){return new Promise((function(t){return setTimeout(t,e)}))}function s(e){for(var t="0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz",n="",i=0;i<e;i++){n+=t[Math.floor(Math.random()*t.length)];}return n}var a=function(){function e(){this.acquiredIatSet=new Set,this.id=Date.now().toString()+s(15),this.acquireLock=this.acquireLock.bind(this),this.releaseLock=this.releaseLock.bind(this),this.releaseLock__private__=this.releaseLock__private__.bind(this),this.waitForSomethingToChange=this.waitForSomethingToChange.bind(this),this.refreshLockWhileAcquired=this.refreshLockWhileAcquired.bind(this),void 0===e.waiters&&(e.waiters=[]);}return e.prototype.acquireLock=function(t,c){return void 0===c&&(c=5e3),n(this,void 0,void 0,(function(){var n,a,u,l,d,g;return i(this,(function(i){switch(i.label){case 0:n=Date.now()+s(4),a=Date.now()+c,u=r+"-"+t,l=window.localStorage,i.label=1;case 1:return Date.now()<a?[4,o(30)]:[3,8];case 2:return i.sent(),null!==l.getItem(u)?[3,5]:(d=this.id+"-"+t+"-"+n,[4,o(Math.floor(25*Math.random()))]);case 3:return i.sent(),l.setItem(u,JSON.stringify({id:this.id,iat:n,timeoutKey:d,timeAcquired:Date.now(),timeRefreshed:Date.now()})),[4,o(30)];case 4:return i.sent(),null!==(g=l.getItem(u))&&(g=JSON.parse(g)).id===this.id&&g.iat===n?(this.acquiredIatSet.add(n),this.refreshLockWhileAcquired(u,n),[2,!0]):[3,7];case 5:return e.lockCorrector(),[4,this.waitForSomethingToChange(a)];case 6:i.sent(),i.label=7;case 7:return n=Date.now()+s(4),[3,1];case 8:return [2,!1]}}))}))},e.prototype.refreshLockWhileAcquired=function(e,t){return n(this,void 0,void 0,(function(){var r=this;return i(this,(function(o){return setTimeout((function(){return n(r,void 0,void 0,(function(){var n,r;return i(this,(function(i){switch(i.label){case 0:return [4,Sr.default().lock(t)];case 1:return i.sent(),this.acquiredIatSet.has(t)?(n=window.localStorage,null===(r=n.getItem(e))?(Sr.default().unlock(t),[2]):((r=JSON.parse(r)).timeRefreshed=Date.now(),n.setItem(e,JSON.stringify(r)),Sr.default().unlock(t),this.refreshLockWhileAcquired(e,t),[2])):(Sr.default().unlock(t),[2])}}))}))}),1e3),[2]}))}))},e.prototype.waitForSomethingToChange=function(t){return n(this,void 0,void 0,(function(){return i(this,(function(n){switch(n.label){case 0:return [4,new Promise((function(n){var i=!1,r=Date.now(),o=!1;function c(){if(o||(window.removeEventListener("storage",c),e.removeFromWaiting(c),clearTimeout(s),o=!0),!i){i=!0;var t=50-(Date.now()-r);t>0?setTimeout(n,t):n();}}window.addEventListener("storage",c),e.addToWaiting(c);var s=setTimeout(c,Math.max(0,t-Date.now()));}))];case 1:return n.sent(),[2]}}))}))},e.addToWaiting=function(t){this.removeFromWaiting(t),void 0!==e.waiters&&e.waiters.push(t);},e.removeFromWaiting=function(t){void 0!==e.waiters&&(e.waiters=e.waiters.filter((function(e){return e!==t})));},e.notifyWaiters=function(){void 0!==e.waiters&&e.waiters.slice().forEach((function(e){return e()}));},e.prototype.releaseLock=function(e){return n(this,void 0,void 0,(function(){return i(this,(function(t){switch(t.label){case 0:return [4,this.releaseLock__private__(e)];case 1:return [2,t.sent()]}}))}))},e.prototype.releaseLock__private__=function(t){return n(this,void 0,void 0,(function(){var n,o,c;return i(this,(function(i){switch(i.label){case 0:return n=window.localStorage,o=r+"-"+t,null===(c=n.getItem(o))?[2]:(c=JSON.parse(c)).id!==this.id?[3,2]:[4,Sr.default().lock(c.iat)];case 1:i.sent(),this.acquiredIatSet.delete(c.iat),n.removeItem(o),Sr.default().unlock(c.iat),e.notifyWaiters(),i.label=2;case 2:return [2]}}))}))},e.lockCorrector=function(){for(var t=Date.now()-5e3,n=window.localStorage,i=Object.keys(n),o=!1,c=0;c<i.length;c++){var s=i[c];if(s.includes(r)){var a=n.getItem(s);null!==a&&(void 0===(a=JSON.parse(a)).timeRefreshed&&a.timeAcquired<t||void 0!==a.timeRefreshed&&a.timeRefreshed<t)&&(n.removeItem(s),o=!0);}}o&&e.notifyWaiters();},e.waiters=void 0,e}();t.default=a;}))),Vr={timeoutInSeconds:60},Gr=["login_required","consent_required","interaction_required","account_selection_required","access_denied"],Xr={name:"auth0-spa-js",version:"1.13.6"},wr=function(e){function n(t,i){var r=e.call(this,i)||this;return r.error=t,r.error_description=i,Object.setPrototypeOf(r,n.prototype),r}return t(n,e),n.fromPayload=function(e){return new n(e.error,e.error_description)},n}(Error),xr=function(e){function n(t,i,r,o){void 0===o&&(o=null);var c=e.call(this,t,i)||this;return c.state=r,c.appState=o,Object.setPrototypeOf(c,n.prototype),c}return t(n,e),n}(wr),Ar=function(e){function n(){var t=e.call(this,"timeout","Timeout")||this;return Object.setPrototypeOf(t,n.prototype),t}return t(n,e),n}(wr),Rr=function(e){function n(t){var i=e.call(this)||this;return i.popup=t,Object.setPrototypeOf(i,n.prototype),i}return t(n,e),n}(Ar),Qr=function(e,t,n){return void 0===n&&(n=60),new Promise((function(i,r){var o=window.document.createElement("iframe");o.setAttribute("width","0"),o.setAttribute("height","0"),o.style.display="none";var c,s=function(){window.document.body.contains(o)&&(window.document.body.removeChild(o),window.removeEventListener("message",c,!1));},a=setTimeout((function(){r(new Ar),s();}),1e3*n);c=function(e){if(e.origin==t&&e.data&&"authorization_response"===e.data.type){var n=e.source;n&&n.close(),e.data.response.error?r(wr.fromPayload(e.data.response)):i(e.data.response),clearTimeout(a),window.removeEventListener("message",c,!1),setTimeout(s,2e3);}},window.addEventListener("message",c,!1),window.document.body.appendChild(o),o.setAttribute("src",e);}))},Jr=function(e,t){var n,i,r,o=t.popup;if(o?o.location.href=e:(n=e,i=window.screenX+(window.innerWidth-400)/2,r=window.screenY+(window.innerHeight-600)/2,o=window.open(n,"auth0:authorize:popup","left="+i+",top="+r+",width=400,height=600,resizable,scrollbars=yes,status=1")),!o)throw new Error("Could not open popup");return new Promise((function(e,n){var i,r=setTimeout((function(){n(new Rr(o)),window.removeEventListener("message",i,!1);}),1e3*(t.timeoutInSeconds||60));i=function(t){if(t.data&&"authorization_response"===t.data.type){if(clearTimeout(r),window.removeEventListener("message",i,!1),o.close(),t.data.response.error)return n(wr.fromPayload(t.data.response));e(t.data.response);}},window.addEventListener("message",i);}))},Wr=function(){return window.crypto||window.msCrypto},kr=function(){var e=Wr();return e.subtle||e.webkitSubtle},Hr=function(){var e="0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_~.",t="";return Array.from(Wr().getRandomValues(new Uint8Array(43))).forEach((function(n){return t+=e[n%e.length]})),t},Lr=function(e){return btoa(e)},Er=function(e){return Object.keys(e).filter((function(t){return void 0!==e[t]})).map((function(t){return encodeURIComponent(t)+"="+encodeURIComponent(e[t])})).join("&")},Tr=function(e){return r(void 0,void 0,void 0,(function(){var t;return o(this,(function(n){switch(n.label){case 0:return t=kr().digest({name:"SHA-256"},(new TextEncoder).encode(e)),window.msCrypto?[2,new Promise((function(e,n){t.oncomplete=function(t){e(t.target.result);},t.onerror=function(e){n(e.error);},t.onabort=function(){n("The digest operation was aborted");};}))]:[4,t];case 1:return [2,n.sent()]}}))}))},Yr=function(e){return function(e){return decodeURIComponent(atob(e).split("").map((function(e){return "%"+("00"+e.charCodeAt(0).toString(16)).slice(-2)})).join(""))}(e.replace(/_/g,"/").replace(/-/g,"+"))},Nr=function(e){var t=new Uint8Array(e);return function(e){var t={"+":"-","/":"_","=":""};return e.replace(/[+/=]/g,(function(e){return t[e]}))}(window.btoa(String.fromCharCode.apply(String,Array.from(t))))};var Kr=function(e,t){return r(void 0,void 0,void 0,(function(){var n,i;return o(this,(function(r){switch(r.label){case 0:return [4,(o=e,c=t,c=c||{},new Promise((function(e,t){var n=new XMLHttpRequest,i=[],r=[],s={},a=function(){return {ok:2==(n.status/100|0),statusText:n.statusText,status:n.status,url:n.responseURL,text:function(){return Promise.resolve(n.responseText)},json:function(){return Promise.resolve(n.responseText).then(JSON.parse)},blob:function(){return Promise.resolve(new Blob([n.response]))},clone:a,headers:{keys:function(){return i},entries:function(){return r},get:function(e){return s[e.toLowerCase()]},has:function(e){return e.toLowerCase()in s}}}};for(var u in n.open(c.method||"get",o,!0),n.onload=function(){n.getAllResponseHeaders().replace(/^(.*?):[^\S\n]*([\s\S]*?)$/gm,(function(e,t,n){i.push(t=t.toLowerCase()),r.push([t,n]),s[t]=s[t]?s[t]+","+n:n;})),e(a());},n.onerror=t,n.withCredentials="include"==c.credentials,c.headers)n.setRequestHeader(u,c.headers[u]);n.send(c.body||null);})))];case 1:return n=r.sent(),i={ok:n.ok},[4,n.json()];case 2:return [2,(i.json=r.sent(),i)]}var o,c;}))}))},Or=function(e,t,n){return r(void 0,void 0,void 0,(function(){var i,r;return o(this,(function(o){return i=new AbortController,t.signal=i.signal,[2,Promise.race([Kr(e,t),new Promise((function(e,t){r=setTimeout((function(){i.abort(),t(new Error("Timeout when executing 'fetch'"));}),n);}))]).finally((function(){clearTimeout(r);}))]}))}))},zr=function(e,t,n,i,c,s){return r(void 0,void 0,void 0,(function(){return o(this,(function(r){return [2,(o={auth:{audience:t,scope:n},timeout:c,fetchUrl:e,fetchOptions:i},a=s,new Promise((function(e,t){var n=new MessageChannel;n.port1.onmessage=function(n){n.data.error?t(new Error(n.data.error)):e(n.data);},a.postMessage(o,[n.port2]);})))];var o,a;}))}))},jr=function(e,t,n,i,c,s){return void 0===s&&(s=1e4),r(void 0,void 0,void 0,(function(){return o(this,(function(r){return c?[2,zr(e,t,n,i,s,c)]:[2,Or(e,i,s)]}))}))};function _r(e,t,n,c,s,a){return r(this,void 0,void 0,(function(){var r,u,l,d,g,f,I,p;return o(this,(function(o){switch(o.label){case 0:r=null,l=0,o.label=1;case 1:if(!(l<3))return [3,6];o.label=2;case 2:return o.trys.push([2,4,,5]),[4,jr(e,n,c,s,a,t)];case 3:return u=o.sent(),r=null,[3,6];case 4:return d=o.sent(),r=d,[3,5];case 5:return l++,[3,1];case 6:if(r)throw r.message=r.message||"Failed to fetch",r;if(g=u.json,f=g.error,I=g.error_description,p=i(g,["error","error_description"]),!u.ok)throw new wr(f||"request_error",I||"HTTP error. Unable to fetch "+e);return [2,p]}}))}))}var Dr=function(e){return Array.from(new Set(e))},Pr=function(){for(var e=[],t=0;t<arguments.length;t++)e[t]=arguments[t];return Dr(e.join(" ").trim().split(/\s+/)).join(" ")};function Mr(e,t){var n=e.baseUrl,c=e.timeout,s=e.audience,a=e.scope,u=e.auth0Client,l=i(e,["baseUrl","timeout","audience","scope","auth0Client"]);return r(this,void 0,void 0,(function(){var e,i;return o(this,(function(r){switch(r.label){case 0:return [4,_r(n+"/oauth/token",c,s||"default",a,{method:"POST",body:JSON.stringify(l),headers:{"Content-type":"application/json","Auth0-Client":btoa(JSON.stringify(u||Xr))}},t)];case 1:return e=r.sent(),(i=function(e,t){void 0===e&&(e=""),void 0===t&&(t="");var n=e.split(/\s+/),i=t.split(/\s+/);return n.filter((function(e){return !i.includes(e)})).join(" ")}(a,e.scope)).length&&console.warn("The requested scopes ("+a+") are different from the scopes of the retrieved token ("+e.scope+"). This could mean that your access token may not include all the scopes that you expect. It is advised to resolve this by either:\n  \n  - Removing `"+i+"` from the scope when requesting a new token.\n  - Ensuring `"+i+"` is returned as part of the requested token's scopes."),[2,e]}}))}))}var qr=function(){function e(e,t){void 0===t&&(t=$r),this.prefix=t,this.client_id=e.client_id,this.scope=e.scope,this.audience=e.audience;}return e.prototype.toKey=function(){return this.prefix+"::"+this.client_id+"::"+this.audience+"::"+this.scope},e.fromKey=function(t){var n=t.split("::"),i=n[0],r=n[1],o=n[2];return new e({client_id:r,scope:n[3],audience:o},i)},e}(),$r="@@auth0spajs@@",eo=function(e){var t=Math.floor(Date.now()/1e3)+e.expires_in;return {body:e,expiresAt:Math.min(t,e.decodedToken.claims.exp)}},to=function(e,t){var n=e.client_id,i=e.audience,r=e.scope;return t.filter((function(e){var t=qr.fromKey(e),o=t.prefix,c=t.client_id,s=t.audience,a=t.scope,u=a&&a.split(" "),l=a&&r.split(" ").reduce((function(e,t){return e&&u.includes(t)}),!0);return o===$r&&c===n&&s===i&&l}))[0]},no=function(){function e(){}return e.prototype.save=function(e){var t=new qr({client_id:e.client_id,scope:e.scope,audience:e.audience}),n=eo(e);window.localStorage.setItem(t.toKey(),JSON.stringify(n));},e.prototype.get=function(e,t){void 0===t&&(t=0);var n=this.readJson(e),i=Math.floor(Date.now()/1e3);if(n){if(!(n.expiresAt-t<i))return n.body;if(n.body.refresh_token){var r=this.stripData(n);return this.writeJson(e.toKey(),r),r.body}localStorage.removeItem(e.toKey());}},e.prototype.clear=function(){for(var e=localStorage.length-1;e>=0;e--)localStorage.key(e).startsWith($r)&&localStorage.removeItem(localStorage.key(e));},e.prototype.readJson=function(e){var t,n=to(e,Object.keys(window.localStorage)),i=n&&window.localStorage.getItem(n);if(i&&(t=JSON.parse(i)))return t},e.prototype.writeJson=function(e,t){localStorage.setItem(e,JSON.stringify(t));},e.prototype.stripData=function(e){return {body:{refresh_token:e.body.refresh_token},expiresAt:e.expiresAt}},e}(),io=function(){this.enclosedCache=function(){var e={};return {save:function(t){var n=new qr({client_id:t.client_id,scope:t.scope,audience:t.audience}),i=eo(t);e[n.toKey()]=i;},get:function(t,n){void 0===n&&(n=0);var i=to(t,Object.keys(e)),r=e[i],o=Math.floor(Date.now()/1e3);if(r)return r.expiresAt-n<o?r.body.refresh_token?(r.body={refresh_token:r.body.refresh_token},r.body):void delete e[t.toKey()]:r.body},clear:function(){e={};}}}();},ro=function(){function e(e){this.storage=e,this.transaction=this.storage.get("a0.spajs.txs");}return e.prototype.create=function(e){this.transaction=e,this.storage.save("a0.spajs.txs",e,{daysUntilExpire:1});},e.prototype.get=function(){return this.transaction},e.prototype.remove=function(){delete this.transaction,this.storage.remove("a0.spajs.txs");},e}(),oo=function(e){return "number"==typeof e},co=["iss","aud","exp","nbf","iat","jti","azp","nonce","auth_time","at_hash","c_hash","acr","amr","sub_jwk","cnf","sip_from_tag","sip_date","sip_callid","sip_cseq_num","sip_via_branch","orig","dest","mky","events","toe","txn","rph","sid","vot","vtm"],so=function(e){if(!e.id_token)throw new Error("ID token is required but missing");var t=function(e){var t=e.split("."),n=t[0],i=t[1],r=t[2];if(3!==t.length||!n||!i||!r)throw new Error("ID token could not be decoded");var o=JSON.parse(Yr(i)),c={__raw:e},s={};return Object.keys(o).forEach((function(e){c[e]=o[e],co.includes(e)||(s[e]=o[e]);})),{encoded:{header:n,payload:i,signature:r},header:JSON.parse(Yr(n)),claims:c,user:s}}(e.id_token);if(!t.claims.iss)throw new Error("Issuer (iss) claim must be a string present in the ID token");if(t.claims.iss!==e.iss)throw new Error('Issuer (iss) claim mismatch in the ID token; expected "'+e.iss+'", found "'+t.claims.iss+'"');if(!t.user.sub)throw new Error("Subject (sub) claim must be a string present in the ID token");if("RS256"!==t.header.alg)throw new Error('Signature algorithm of "'+t.header.alg+'" is not supported. Expected the ID token to be signed with "RS256".');if(!t.claims.aud||"string"!=typeof t.claims.aud&&!Array.isArray(t.claims.aud))throw new Error("Audience (aud) claim must be a string or array of strings present in the ID token");if(Array.isArray(t.claims.aud)){if(!t.claims.aud.includes(e.aud))throw new Error('Audience (aud) claim mismatch in the ID token; expected "'+e.aud+'" but was not one of "'+t.claims.aud.join(", ")+'"');if(t.claims.aud.length>1){if(!t.claims.azp)throw new Error("Authorized Party (azp) claim must be a string present in the ID token when Audience (aud) claim has multiple values");if(t.claims.azp!==e.aud)throw new Error('Authorized Party (azp) claim mismatch in the ID token; expected "'+e.aud+'", found "'+t.claims.azp+'"')}}else if(t.claims.aud!==e.aud)throw new Error('Audience (aud) claim mismatch in the ID token; expected "'+e.aud+'" but found "'+t.claims.aud+'"');if(e.nonce){if(!t.claims.nonce)throw new Error("Nonce (nonce) claim must be a string present in the ID token");if(t.claims.nonce!==e.nonce)throw new Error('Nonce (nonce) claim mismatch in the ID token; expected "'+e.nonce+'", found "'+t.claims.nonce+'"')}if(e.max_age&&!oo(t.claims.auth_time))throw new Error("Authentication Time (auth_time) claim must be a number present in the ID token when Max Age (max_age) is specified");if(!oo(t.claims.exp))throw new Error("Expiration Time (exp) claim must be a number present in the ID token");if(!oo(t.claims.iat))throw new Error("Issued At (iat) claim must be a number present in the ID token");var n=e.leeway||60,i=new Date(Date.now()),r=new Date(0),o=new Date(0),c=new Date(0);if(c.setUTCSeconds(parseInt(t.claims.auth_time)+e.max_age+n),r.setUTCSeconds(t.claims.exp+n),o.setUTCSeconds(t.claims.nbf-n),i>r)throw new Error("Expiration Time (exp) claim error in the ID token; current time ("+i+") is after expiration time ("+r+")");if(oo(t.claims.nbf)&&i<o)throw new Error("Not Before time (nbf) claim in the ID token indicates that this token can't be used just yet. Currrent time ("+i+") is before "+o);if(oo(t.claims.auth_time)&&i>c)throw new Error("Authentication Time (auth_time) claim in the ID token indicates that too much time has passed since the last end-user authentication. Currrent time ("+i+") is after last auth at "+c);if(e.organizationId){if(!t.claims.org_id)throw new Error("Organization ID (org_id) claim must be a string present in the ID token");if(e.organizationId!==t.claims.org_id)throw new Error('Organization ID (org_id) claim mismatch in the ID token; expected "'+e.organizationId+'", found "'+t.claims.org_id+'"')}return t},ao=a((function(e,t){var n=c&&c.__assign||function(){return (n=Object.assign||function(e){for(var t,n=1,i=arguments.length;n<i;n++)for(var r in t=arguments[n])Object.prototype.hasOwnProperty.call(t,r)&&(e[r]=t[r]);return e}).apply(this,arguments)};function i(e,t){if(!t)return "";var n="; "+e;return !0===t?n:n+"="+t}function r(e,t,n){return encodeURIComponent(e).replace(/%(23|24|26|2B|5E|60|7C)/g,decodeURIComponent).replace(/\(/g,"%28").replace(/\)/g,"%29")+"="+encodeURIComponent(t).replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g,decodeURIComponent)+function(e){if("number"==typeof e.expires){var t=new Date;t.setMilliseconds(t.getMilliseconds()+864e5*e.expires),e.expires=t;}return i("Expires",e.expires?e.expires.toUTCString():"")+i("Domain",e.domain)+i("Path",e.path)+i("Secure",e.secure)+i("SameSite",e.sameSite)}(n)}function o(e){for(var t={},n=e?e.split("; "):[],i=/(%[\dA-F]{2})+/gi,r=0;r<n.length;r++){var o=n[r].split("="),c=o.slice(1).join("=");'"'===c.charAt(0)&&(c=c.slice(1,-1));try{t[o[0].replace(i,decodeURIComponent)]=c.replace(i,decodeURIComponent);}catch(e){}}return t}function s(){return o(document.cookie)}function a(e,t,i){document.cookie=r(e,t,n({path:"/"},i));}t.__esModule=!0,t.encode=r,t.parse=o,t.getAll=s,t.get=function(e){return s()[e]},t.set=a,t.remove=function(e,t){a(e,"",n(n({},t),{expires:-1}));};}));s(ao);ao.encode,ao.parse,ao.getAll;var uo=ao.get,lo=ao.set,go=ao.remove,fo={get:function(e){var t=uo(e);if(void 0!==t)return JSON.parse(t)},save:function(e,t,n){var i={};"https:"===window.location.protocol&&(i={secure:!0,sameSite:"none"}),i.expires=n.daysUntilExpire,lo(e,JSON.stringify(t),i);},remove:function(e){go(e);}},Io={get:function(e){var t=fo.get(e);return t||fo.get("_legacy_"+e)},save:function(e,t,n){var i={};"https:"===window.location.protocol&&(i={secure:!0}),i.expires=n.daysUntilExpire,lo("_legacy_"+e,JSON.stringify(t),i),fo.save(e,t,n);},remove:function(e){fo.remove(e),fo.remove("_legacy_"+e);}},po={get:function(e){if("undefined"!=typeof sessionStorage){var t=sessionStorage.getItem(e);if(void 0!==t)return JSON.parse(t)}},save:function(e,t){sessionStorage.setItem(e,JSON.stringify(t));},remove:function(e){sessionStorage.removeItem(e);}};function ho(e,t,n){var i=void 0===t?null:t,r=function(e,t){var n=atob(e);if(t){for(var i=new Uint8Array(n.length),r=0,o=n.length;r<o;++r)i[r]=n.charCodeAt(r);return String.fromCharCode.apply(null,new Uint16Array(i.buffer))}return n}(e,void 0!==n&&n),o=r.indexOf("\n",10)+1,c=r.substring(o)+(i?"//# sourceMappingURL="+i:""),s=new Blob([c],{type:"application/javascript"});return URL.createObjectURL(s)}var yo,bo,mo,vo,Bo=(yo="Lyogcm9sbHVwLXBsdWdpbi13ZWItd29ya2VyLWxvYWRlciAqLwohZnVuY3Rpb24oKXsidXNlIHN0cmljdCI7Ci8qISAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKgogICAgQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uIEFsbCByaWdodHMgcmVzZXJ2ZWQuCiAgICBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgIkxpY2Vuc2UiKTsgeW91IG1heSBub3QgdXNlCiAgICB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS4gWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZQogICAgTGljZW5zZSBhdCBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjAKCiAgICBUSElTIENPREUgSVMgUFJPVklERUQgT04gQU4gKkFTIElTKiBCQVNJUywgV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZCiAgICBLSU5ELCBFSVRIRVIgRVhQUkVTUyBPUiBJTVBMSUVELCBJTkNMVURJTkcgV0lUSE9VVCBMSU1JVEFUSU9OIEFOWSBJTVBMSUVECiAgICBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgVElUTEUsIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLAogICAgTUVSQ0hBTlRBQkxJVFkgT1IgTk9OLUlORlJJTkdFTUVOVC4KCiAgICBTZWUgdGhlIEFwYWNoZSBWZXJzaW9uIDIuMCBMaWNlbnNlIGZvciBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMKICAgIGFuZCBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS4KICAgICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqICovdmFyIGU9ZnVuY3Rpb24oKXtyZXR1cm4oZT1PYmplY3QuYXNzaWdufHxmdW5jdGlvbihlKXtmb3IodmFyIHQscj0xLG49YXJndW1lbnRzLmxlbmd0aDtyPG47cisrKWZvcih2YXIgbyBpbiB0PWFyZ3VtZW50c1tyXSlPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwodCxvKSYmKGVbb109dFtvXSk7cmV0dXJuIGV9KS5hcHBseSh0aGlzLGFyZ3VtZW50cyl9O2Z1bmN0aW9uIHQoZSx0KXt2YXIgcixuLG8scyxhPXtsYWJlbDowLHNlbnQ6ZnVuY3Rpb24oKXtpZigxJm9bMF0pdGhyb3cgb1sxXTtyZXR1cm4gb1sxXX0sdHJ5czpbXSxvcHM6W119O3JldHVybiBzPXtuZXh0OmkoMCksdGhyb3c6aSgxKSxyZXR1cm46aSgyKX0sImZ1bmN0aW9uIj09dHlwZW9mIFN5bWJvbCYmKHNbU3ltYm9sLml0ZXJhdG9yXT1mdW5jdGlvbigpe3JldHVybiB0aGlzfSkscztmdW5jdGlvbiBpKHMpe3JldHVybiBmdW5jdGlvbihpKXtyZXR1cm4gZnVuY3Rpb24ocyl7aWYocil0aHJvdyBuZXcgVHlwZUVycm9yKCJHZW5lcmF0b3IgaXMgYWxyZWFkeSBleGVjdXRpbmcuIik7Zm9yKDthOyl0cnl7aWYocj0xLG4mJihvPTImc1swXT9uLnJldHVybjpzWzBdP24udGhyb3d8fCgobz1uLnJldHVybikmJm8uY2FsbChuKSwwKTpuLm5leHQpJiYhKG89by5jYWxsKG4sc1sxXSkpLmRvbmUpcmV0dXJuIG87c3dpdGNoKG49MCxvJiYocz1bMiZzWzBdLG8udmFsdWVdKSxzWzBdKXtjYXNlIDA6Y2FzZSAxOm89czticmVhaztjYXNlIDQ6cmV0dXJuIGEubGFiZWwrKyx7dmFsdWU6c1sxXSxkb25lOiExfTtjYXNlIDU6YS5sYWJlbCsrLG49c1sxXSxzPVswXTtjb250aW51ZTtjYXNlIDc6cz1hLm9wcy5wb3AoKSxhLnRyeXMucG9wKCk7Y29udGludWU7ZGVmYXVsdDppZighKG89YS50cnlzLChvPW8ubGVuZ3RoPjAmJm9bby5sZW5ndGgtMV0pfHw2IT09c1swXSYmMiE9PXNbMF0pKXthPTA7Y29udGludWV9aWYoMz09PXNbMF0mJighb3x8c1sxXT5vWzBdJiZzWzFdPG9bM10pKXthLmxhYmVsPXNbMV07YnJlYWt9aWYoNj09PXNbMF0mJmEubGFiZWw8b1sxXSl7YS5sYWJlbD1vWzFdLG89czticmVha31pZihvJiZhLmxhYmVsPG9bMl0pe2EubGFiZWw9b1syXSxhLm9wcy5wdXNoKHMpO2JyZWFrfW9bMl0mJmEub3BzLnBvcCgpLGEudHJ5cy5wb3AoKTtjb250aW51ZX1zPXQuY2FsbChlLGEpfWNhdGNoKGUpe3M9WzYsZV0sbj0wfWZpbmFsbHl7cj1vPTB9aWYoNSZzWzBdKXRocm93IHNbMV07cmV0dXJue3ZhbHVlOnNbMF0/c1sxXTp2b2lkIDAsZG9uZTohMH19KFtzLGldKX19fXZhciByPXt9LG49ZnVuY3Rpb24oZSx0KXtyZXR1cm4gZSsifCIrdH07YWRkRXZlbnRMaXN0ZW5lcigibWVzc2FnZSIsKGZ1bmN0aW9uKG8pe3ZhciBzLGEsaSx1LGM9by5kYXRhLGw9Yy50aW1lb3V0LGY9Yy5hdXRoLGg9Yy5mZXRjaFVybCxwPWMuZmV0Y2hPcHRpb25zLGI9by5wb3J0c1swXTtyZXR1cm4gcz12b2lkIDAsYT12b2lkIDAsdT1mdW5jdGlvbigpe3ZhciBvLHMsYSxpLHUsYyx5LGQsdix3O3JldHVybiB0KHRoaXMsKGZ1bmN0aW9uKHQpe3N3aXRjaCh0LmxhYmVsKXtjYXNlIDA6YT0ocz1mfHx7fSkuYXVkaWVuY2UsaT1zLnNjb3BlLHQubGFiZWw9MTtjYXNlIDE6aWYodC50cnlzLnB1c2goWzEsNywsOF0pLCEodT1KU09OLnBhcnNlKHAuYm9keSkpLnJlZnJlc2hfdG9rZW4mJiJyZWZyZXNoX3Rva2VuIj09PXUuZ3JhbnRfdHlwZSl7aWYoIShjPWZ1bmN0aW9uKGUsdCl7cmV0dXJuIHJbbihlLHQpXX0oYSxpKSkpdGhyb3cgbmV3IEVycm9yKCJUaGUgd2ViIHdvcmtlciBpcyBtaXNzaW5nIHRoZSByZWZyZXNoIHRva2VuIik7cC5ib2R5PUpTT04uc3RyaW5naWZ5KGUoZSh7fSx1KSx7cmVmcmVzaF90b2tlbjpjfSkpfXk9dm9pZCAwLCJmdW5jdGlvbiI9PXR5cGVvZiBBYm9ydENvbnRyb2xsZXImJih5PW5ldyBBYm9ydENvbnRyb2xsZXIscC5zaWduYWw9eS5zaWduYWwpLGQ9dm9pZCAwLHQubGFiZWw9MjtjYXNlIDI6cmV0dXJuIHQudHJ5cy5wdXNoKFsyLDQsLDVdKSxbNCxQcm9taXNlLnJhY2UoWyhnPWwsbmV3IFByb21pc2UoKGZ1bmN0aW9uKGUpe3JldHVybiBzZXRUaW1lb3V0KGUsZyl9KSkpLGZldGNoKGgsZSh7fSxwKSldKV07Y2FzZSAzOnJldHVybiBkPXQuc2VudCgpLFszLDVdO2Nhc2UgNDpyZXR1cm4gdj10LnNlbnQoKSxiLnBvc3RNZXNzYWdlKHtlcnJvcjp2Lm1lc3NhZ2V9KSxbMl07Y2FzZSA1OnJldHVybiBkP1s0LGQuanNvbigpXTooeSYmeS5hYm9ydCgpLGIucG9zdE1lc3NhZ2Uoe2Vycm9yOiJUaW1lb3V0IHdoZW4gZXhlY3V0aW5nICdmZXRjaCcifSksWzJdKTtjYXNlIDY6cmV0dXJuKG89dC5zZW50KCkpLnJlZnJlc2hfdG9rZW4/KGZ1bmN0aW9uKGUsdCxvKXtyW24odCxvKV09ZX0oby5yZWZyZXNoX3Rva2VuLGEsaSksZGVsZXRlIG8ucmVmcmVzaF90b2tlbik6ZnVuY3Rpb24oZSx0KXtkZWxldGUgcltuKGUsdCldfShhLGkpLGIucG9zdE1lc3NhZ2Uoe29rOmQub2ssanNvbjpvfSksWzMsOF07Y2FzZSA3OnJldHVybiB3PXQuc2VudCgpLGIucG9zdE1lc3NhZ2Uoe29rOiExLGpzb246e2Vycm9yX2Rlc2NyaXB0aW9uOncubWVzc2FnZX19KSxbMyw4XTtjYXNlIDg6cmV0dXJuWzJdfXZhciBnfSkpfSxuZXcoKGk9dm9pZCAwKXx8KGk9UHJvbWlzZSkpKChmdW5jdGlvbihlLHQpe2Z1bmN0aW9uIHIoZSl7dHJ5e28odS5uZXh0KGUpKX1jYXRjaChlKXt0KGUpfX1mdW5jdGlvbiBuKGUpe3RyeXtvKHUudGhyb3coZSkpfWNhdGNoKGUpe3QoZSl9fWZ1bmN0aW9uIG8odCl7dC5kb25lP2UodC52YWx1ZSk6bmV3IGkoKGZ1bmN0aW9uKGUpe2UodC52YWx1ZSl9KSkudGhlbihyLG4pfW8oKHU9dS5hcHBseShzLGF8fFtdKSkubmV4dCgpKX0pKX0pKX0oKTsKCg==",bo="data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9rZW4ud29ya2VyLmpzIiwic291cmNlcyI6WyJ3b3JrZXI6Ly93ZWItd29ya2VyL25vZGVfbW9kdWxlcy90c2xpYi90c2xpYi5lczYuanMiLCJ3b3JrZXI6Ly93ZWItd29ya2VyL3NyYy9jb25zdGFudHMudHMiLCJ3b3JrZXI6Ly93ZWItd29ya2VyL3NyYy93b3JrZXIvdG9rZW4ud29ya2VyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qISAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG5Db3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cclxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTsgeW91IG1heSBub3QgdXNlXHJcbnRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlXHJcbkxpY2Vuc2UgYXQgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXHJcblxyXG5USElTIENPREUgSVMgUFJPVklERUQgT04gQU4gKkFTIElTKiBCQVNJUywgV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZXHJcbktJTkQsIEVJVEhFUiBFWFBSRVNTIE9SIElNUExJRUQsIElOQ0xVRElORyBXSVRIT1VUIExJTUlUQVRJT04gQU5ZIElNUExJRURcclxuV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIFRJVExFLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSxcclxuTUVSQ0hBTlRBQkxJVFkgT1IgTk9OLUlORlJJTkdFTUVOVC5cclxuXHJcblNlZSB0aGUgQXBhY2hlIFZlcnNpb24gMi4wIExpY2Vuc2UgZm9yIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9uc1xyXG5hbmQgbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXHJcbioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqICovXHJcbi8qIGdsb2JhbCBSZWZsZWN0LCBQcm9taXNlICovXHJcblxyXG52YXIgZXh0ZW5kU3RhdGljcyA9IGZ1bmN0aW9uKGQsIGIpIHtcclxuICAgIGV4dGVuZFN0YXRpY3MgPSBPYmplY3Quc2V0UHJvdG90eXBlT2YgfHxcclxuICAgICAgICAoeyBfX3Byb3RvX186IFtdIH0gaW5zdGFuY2VvZiBBcnJheSAmJiBmdW5jdGlvbiAoZCwgYikgeyBkLl9fcHJvdG9fXyA9IGI7IH0pIHx8XHJcbiAgICAgICAgZnVuY3Rpb24gKGQsIGIpIHsgZm9yICh2YXIgcCBpbiBiKSBpZiAoYi5oYXNPd25Qcm9wZXJ0eShwKSkgZFtwXSA9IGJbcF07IH07XHJcbiAgICByZXR1cm4gZXh0ZW5kU3RhdGljcyhkLCBiKTtcclxufTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2V4dGVuZHMoZCwgYikge1xyXG4gICAgZXh0ZW5kU3RhdGljcyhkLCBiKTtcclxuICAgIGZ1bmN0aW9uIF9fKCkgeyB0aGlzLmNvbnN0cnVjdG9yID0gZDsgfVxyXG4gICAgZC5wcm90b3R5cGUgPSBiID09PSBudWxsID8gT2JqZWN0LmNyZWF0ZShiKSA6IChfXy5wcm90b3R5cGUgPSBiLnByb3RvdHlwZSwgbmV3IF9fKCkpO1xyXG59XHJcblxyXG5leHBvcnQgdmFyIF9fYXNzaWduID0gZnVuY3Rpb24oKSB7XHJcbiAgICBfX2Fzc2lnbiA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24gX19hc3NpZ24odCkge1xyXG4gICAgICAgIGZvciAodmFyIHMsIGkgPSAxLCBuID0gYXJndW1lbnRzLmxlbmd0aDsgaSA8IG47IGkrKykge1xyXG4gICAgICAgICAgICBzID0gYXJndW1lbnRzW2ldO1xyXG4gICAgICAgICAgICBmb3IgKHZhciBwIGluIHMpIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwocywgcCkpIHRbcF0gPSBzW3BdO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdDtcclxuICAgIH1cclxuICAgIHJldHVybiBfX2Fzc2lnbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19yZXN0KHMsIGUpIHtcclxuICAgIHZhciB0ID0ge307XHJcbiAgICBmb3IgKHZhciBwIGluIHMpIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwocywgcCkgJiYgZS5pbmRleE9mKHApIDwgMClcclxuICAgICAgICB0W3BdID0gc1twXTtcclxuICAgIGlmIChzICE9IG51bGwgJiYgdHlwZW9mIE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMgPT09IFwiZnVuY3Rpb25cIilcclxuICAgICAgICBmb3IgKHZhciBpID0gMCwgcCA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMocyk7IGkgPCBwLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGlmIChlLmluZGV4T2YocFtpXSkgPCAwICYmIE9iamVjdC5wcm90b3R5cGUucHJvcGVydHlJc0VudW1lcmFibGUuY2FsbChzLCBwW2ldKSlcclxuICAgICAgICAgICAgICAgIHRbcFtpXV0gPSBzW3BbaV1dO1xyXG4gICAgICAgIH1cclxuICAgIHJldHVybiB0O1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19kZWNvcmF0ZShkZWNvcmF0b3JzLCB0YXJnZXQsIGtleSwgZGVzYykge1xyXG4gICAgdmFyIGMgPSBhcmd1bWVudHMubGVuZ3RoLCByID0gYyA8IDMgPyB0YXJnZXQgOiBkZXNjID09PSBudWxsID8gZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodGFyZ2V0LCBrZXkpIDogZGVzYywgZDtcclxuICAgIGlmICh0eXBlb2YgUmVmbGVjdCA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgUmVmbGVjdC5kZWNvcmF0ZSA9PT0gXCJmdW5jdGlvblwiKSByID0gUmVmbGVjdC5kZWNvcmF0ZShkZWNvcmF0b3JzLCB0YXJnZXQsIGtleSwgZGVzYyk7XHJcbiAgICBlbHNlIGZvciAodmFyIGkgPSBkZWNvcmF0b3JzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSBpZiAoZCA9IGRlY29yYXRvcnNbaV0pIHIgPSAoYyA8IDMgPyBkKHIpIDogYyA+IDMgPyBkKHRhcmdldCwga2V5LCByKSA6IGQodGFyZ2V0LCBrZXkpKSB8fCByO1xyXG4gICAgcmV0dXJuIGMgPiAzICYmIHIgJiYgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwga2V5LCByKSwgcjtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fcGFyYW0ocGFyYW1JbmRleCwgZGVjb3JhdG9yKSB7XHJcbiAgICByZXR1cm4gZnVuY3Rpb24gKHRhcmdldCwga2V5KSB7IGRlY29yYXRvcih0YXJnZXQsIGtleSwgcGFyYW1JbmRleCk7IH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fbWV0YWRhdGEobWV0YWRhdGFLZXksIG1ldGFkYXRhVmFsdWUpIHtcclxuICAgIGlmICh0eXBlb2YgUmVmbGVjdCA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgUmVmbGVjdC5tZXRhZGF0YSA9PT0gXCJmdW5jdGlvblwiKSByZXR1cm4gUmVmbGVjdC5tZXRhZGF0YShtZXRhZGF0YUtleSwgbWV0YWRhdGFWYWx1ZSk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2F3YWl0ZXIodGhpc0FyZywgX2FyZ3VtZW50cywgUCwgZ2VuZXJhdG9yKSB7XHJcbiAgICByZXR1cm4gbmV3IChQIHx8IChQID0gUHJvbWlzZSkpKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcclxuICAgICAgICBmdW5jdGlvbiBmdWxmaWxsZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3IubmV4dCh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XHJcbiAgICAgICAgZnVuY3Rpb24gcmVqZWN0ZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3JbXCJ0aHJvd1wiXSh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XHJcbiAgICAgICAgZnVuY3Rpb24gc3RlcChyZXN1bHQpIHsgcmVzdWx0LmRvbmUgPyByZXNvbHZlKHJlc3VsdC52YWx1ZSkgOiBuZXcgUChmdW5jdGlvbiAocmVzb2x2ZSkgeyByZXNvbHZlKHJlc3VsdC52YWx1ZSk7IH0pLnRoZW4oZnVsZmlsbGVkLCByZWplY3RlZCk7IH1cclxuICAgICAgICBzdGVwKChnZW5lcmF0b3IgPSBnZW5lcmF0b3IuYXBwbHkodGhpc0FyZywgX2FyZ3VtZW50cyB8fCBbXSkpLm5leHQoKSk7XHJcbiAgICB9KTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fZ2VuZXJhdG9yKHRoaXNBcmcsIGJvZHkpIHtcclxuICAgIHZhciBfID0geyBsYWJlbDogMCwgc2VudDogZnVuY3Rpb24oKSB7IGlmICh0WzBdICYgMSkgdGhyb3cgdFsxXTsgcmV0dXJuIHRbMV07IH0sIHRyeXM6IFtdLCBvcHM6IFtdIH0sIGYsIHksIHQsIGc7XHJcbiAgICByZXR1cm4gZyA9IHsgbmV4dDogdmVyYigwKSwgXCJ0aHJvd1wiOiB2ZXJiKDEpLCBcInJldHVyblwiOiB2ZXJiKDIpIH0sIHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiAoZ1tTeW1ib2wuaXRlcmF0b3JdID0gZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzOyB9KSwgZztcclxuICAgIGZ1bmN0aW9uIHZlcmIobikgeyByZXR1cm4gZnVuY3Rpb24gKHYpIHsgcmV0dXJuIHN0ZXAoW24sIHZdKTsgfTsgfVxyXG4gICAgZnVuY3Rpb24gc3RlcChvcCkge1xyXG4gICAgICAgIGlmIChmKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiR2VuZXJhdG9yIGlzIGFscmVhZHkgZXhlY3V0aW5nLlwiKTtcclxuICAgICAgICB3aGlsZSAoXykgdHJ5IHtcclxuICAgICAgICAgICAgaWYgKGYgPSAxLCB5ICYmICh0ID0gb3BbMF0gJiAyID8geVtcInJldHVyblwiXSA6IG9wWzBdID8geVtcInRocm93XCJdIHx8ICgodCA9IHlbXCJyZXR1cm5cIl0pICYmIHQuY2FsbCh5KSwgMCkgOiB5Lm5leHQpICYmICEodCA9IHQuY2FsbCh5LCBvcFsxXSkpLmRvbmUpIHJldHVybiB0O1xyXG4gICAgICAgICAgICBpZiAoeSA9IDAsIHQpIG9wID0gW29wWzBdICYgMiwgdC52YWx1ZV07XHJcbiAgICAgICAgICAgIHN3aXRjaCAob3BbMF0pIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgMDogY2FzZSAxOiB0ID0gb3A7IGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSA0OiBfLmxhYmVsKys7IHJldHVybiB7IHZhbHVlOiBvcFsxXSwgZG9uZTogZmFsc2UgfTtcclxuICAgICAgICAgICAgICAgIGNhc2UgNTogXy5sYWJlbCsrOyB5ID0gb3BbMV07IG9wID0gWzBdOyBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIGNhc2UgNzogb3AgPSBfLm9wcy5wb3AoKTsgXy50cnlzLnBvcCgpOyBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCEodCA9IF8udHJ5cywgdCA9IHQubGVuZ3RoID4gMCAmJiB0W3QubGVuZ3RoIC0gMV0pICYmIChvcFswXSA9PT0gNiB8fCBvcFswXSA9PT0gMikpIHsgXyA9IDA7IGNvbnRpbnVlOyB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9wWzBdID09PSAzICYmICghdCB8fCAob3BbMV0gPiB0WzBdICYmIG9wWzFdIDwgdFszXSkpKSB7IF8ubGFiZWwgPSBvcFsxXTsgYnJlYWs7IH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAob3BbMF0gPT09IDYgJiYgXy5sYWJlbCA8IHRbMV0pIHsgXy5sYWJlbCA9IHRbMV07IHQgPSBvcDsgYnJlYWs7IH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAodCAmJiBfLmxhYmVsIDwgdFsyXSkgeyBfLmxhYmVsID0gdFsyXTsgXy5vcHMucHVzaChvcCk7IGJyZWFrOyB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRbMl0pIF8ub3BzLnBvcCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIF8udHJ5cy5wb3AoKTsgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgb3AgPSBib2R5LmNhbGwodGhpc0FyZywgXyk7XHJcbiAgICAgICAgfSBjYXRjaCAoZSkgeyBvcCA9IFs2LCBlXTsgeSA9IDA7IH0gZmluYWxseSB7IGYgPSB0ID0gMDsgfVxyXG4gICAgICAgIGlmIChvcFswXSAmIDUpIHRocm93IG9wWzFdOyByZXR1cm4geyB2YWx1ZTogb3BbMF0gPyBvcFsxXSA6IHZvaWQgMCwgZG9uZTogdHJ1ZSB9O1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19leHBvcnRTdGFyKG0sIGV4cG9ydHMpIHtcclxuICAgIGZvciAodmFyIHAgaW4gbSkgaWYgKCFleHBvcnRzLmhhc093blByb3BlcnR5KHApKSBleHBvcnRzW3BdID0gbVtwXTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fdmFsdWVzKG8pIHtcclxuICAgIHZhciBtID0gdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIG9bU3ltYm9sLml0ZXJhdG9yXSwgaSA9IDA7XHJcbiAgICBpZiAobSkgcmV0dXJuIG0uY2FsbChvKTtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgbmV4dDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBpZiAobyAmJiBpID49IG8ubGVuZ3RoKSBvID0gdm9pZCAwO1xyXG4gICAgICAgICAgICByZXR1cm4geyB2YWx1ZTogbyAmJiBvW2krK10sIGRvbmU6ICFvIH07XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fcmVhZChvLCBuKSB7XHJcbiAgICB2YXIgbSA9IHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiBvW1N5bWJvbC5pdGVyYXRvcl07XHJcbiAgICBpZiAoIW0pIHJldHVybiBvO1xyXG4gICAgdmFyIGkgPSBtLmNhbGwobyksIHIsIGFyID0gW10sIGU7XHJcbiAgICB0cnkge1xyXG4gICAgICAgIHdoaWxlICgobiA9PT0gdm9pZCAwIHx8IG4tLSA+IDApICYmICEociA9IGkubmV4dCgpKS5kb25lKSBhci5wdXNoKHIudmFsdWUpO1xyXG4gICAgfVxyXG4gICAgY2F0Y2ggKGVycm9yKSB7IGUgPSB7IGVycm9yOiBlcnJvciB9OyB9XHJcbiAgICBmaW5hbGx5IHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBpZiAociAmJiAhci5kb25lICYmIChtID0gaVtcInJldHVyblwiXSkpIG0uY2FsbChpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZmluYWxseSB7IGlmIChlKSB0aHJvdyBlLmVycm9yOyB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gYXI7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX3NwcmVhZCgpIHtcclxuICAgIGZvciAodmFyIGFyID0gW10sIGkgPSAwOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKVxyXG4gICAgICAgIGFyID0gYXIuY29uY2F0KF9fcmVhZChhcmd1bWVudHNbaV0pKTtcclxuICAgIHJldHVybiBhcjtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fc3ByZWFkQXJyYXlzKCkge1xyXG4gICAgZm9yICh2YXIgcyA9IDAsIGkgPSAwLCBpbCA9IGFyZ3VtZW50cy5sZW5ndGg7IGkgPCBpbDsgaSsrKSBzICs9IGFyZ3VtZW50c1tpXS5sZW5ndGg7XHJcbiAgICBmb3IgKHZhciByID0gQXJyYXkocyksIGsgPSAwLCBpID0gMDsgaSA8IGlsOyBpKyspXHJcbiAgICAgICAgZm9yICh2YXIgYSA9IGFyZ3VtZW50c1tpXSwgaiA9IDAsIGpsID0gYS5sZW5ndGg7IGogPCBqbDsgaisrLCBrKyspXHJcbiAgICAgICAgICAgIHJba10gPSBhW2pdO1xyXG4gICAgcmV0dXJuIHI7XHJcbn07XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19hd2FpdCh2KSB7XHJcbiAgICByZXR1cm4gdGhpcyBpbnN0YW5jZW9mIF9fYXdhaXQgPyAodGhpcy52ID0gdiwgdGhpcykgOiBuZXcgX19hd2FpdCh2KTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fYXN5bmNHZW5lcmF0b3IodGhpc0FyZywgX2FyZ3VtZW50cywgZ2VuZXJhdG9yKSB7XHJcbiAgICBpZiAoIVN5bWJvbC5hc3luY0l0ZXJhdG9yKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiU3ltYm9sLmFzeW5jSXRlcmF0b3IgaXMgbm90IGRlZmluZWQuXCIpO1xyXG4gICAgdmFyIGcgPSBnZW5lcmF0b3IuYXBwbHkodGhpc0FyZywgX2FyZ3VtZW50cyB8fCBbXSksIGksIHEgPSBbXTtcclxuICAgIHJldHVybiBpID0ge30sIHZlcmIoXCJuZXh0XCIpLCB2ZXJiKFwidGhyb3dcIiksIHZlcmIoXCJyZXR1cm5cIiksIGlbU3ltYm9sLmFzeW5jSXRlcmF0b3JdID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpczsgfSwgaTtcclxuICAgIGZ1bmN0aW9uIHZlcmIobikgeyBpZiAoZ1tuXSkgaVtuXSA9IGZ1bmN0aW9uICh2KSB7IHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAoYSwgYikgeyBxLnB1c2goW24sIHYsIGEsIGJdKSA+IDEgfHwgcmVzdW1lKG4sIHYpOyB9KTsgfTsgfVxyXG4gICAgZnVuY3Rpb24gcmVzdW1lKG4sIHYpIHsgdHJ5IHsgc3RlcChnW25dKHYpKTsgfSBjYXRjaCAoZSkgeyBzZXR0bGUocVswXVszXSwgZSk7IH0gfVxyXG4gICAgZnVuY3Rpb24gc3RlcChyKSB7IHIudmFsdWUgaW5zdGFuY2VvZiBfX2F3YWl0ID8gUHJvbWlzZS5yZXNvbHZlKHIudmFsdWUudikudGhlbihmdWxmaWxsLCByZWplY3QpIDogc2V0dGxlKHFbMF1bMl0sIHIpOyB9XHJcbiAgICBmdW5jdGlvbiBmdWxmaWxsKHZhbHVlKSB7IHJlc3VtZShcIm5leHRcIiwgdmFsdWUpOyB9XHJcbiAgICBmdW5jdGlvbiByZWplY3QodmFsdWUpIHsgcmVzdW1lKFwidGhyb3dcIiwgdmFsdWUpOyB9XHJcbiAgICBmdW5jdGlvbiBzZXR0bGUoZiwgdikgeyBpZiAoZih2KSwgcS5zaGlmdCgpLCBxLmxlbmd0aCkgcmVzdW1lKHFbMF1bMF0sIHFbMF1bMV0pOyB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2FzeW5jRGVsZWdhdG9yKG8pIHtcclxuICAgIHZhciBpLCBwO1xyXG4gICAgcmV0dXJuIGkgPSB7fSwgdmVyYihcIm5leHRcIiksIHZlcmIoXCJ0aHJvd1wiLCBmdW5jdGlvbiAoZSkgeyB0aHJvdyBlOyB9KSwgdmVyYihcInJldHVyblwiKSwgaVtTeW1ib2wuaXRlcmF0b3JdID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpczsgfSwgaTtcclxuICAgIGZ1bmN0aW9uIHZlcmIobiwgZikgeyBpW25dID0gb1tuXSA/IGZ1bmN0aW9uICh2KSB7IHJldHVybiAocCA9ICFwKSA/IHsgdmFsdWU6IF9fYXdhaXQob1tuXSh2KSksIGRvbmU6IG4gPT09IFwicmV0dXJuXCIgfSA6IGYgPyBmKHYpIDogdjsgfSA6IGY7IH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fYXN5bmNWYWx1ZXMobykge1xyXG4gICAgaWYgKCFTeW1ib2wuYXN5bmNJdGVyYXRvcikgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN5bWJvbC5hc3luY0l0ZXJhdG9yIGlzIG5vdCBkZWZpbmVkLlwiKTtcclxuICAgIHZhciBtID0gb1tTeW1ib2wuYXN5bmNJdGVyYXRvcl0sIGk7XHJcbiAgICByZXR1cm4gbSA/IG0uY2FsbChvKSA6IChvID0gdHlwZW9mIF9fdmFsdWVzID09PSBcImZ1bmN0aW9uXCIgPyBfX3ZhbHVlcyhvKSA6IG9bU3ltYm9sLml0ZXJhdG9yXSgpLCBpID0ge30sIHZlcmIoXCJuZXh0XCIpLCB2ZXJiKFwidGhyb3dcIiksIHZlcmIoXCJyZXR1cm5cIiksIGlbU3ltYm9sLmFzeW5jSXRlcmF0b3JdID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpczsgfSwgaSk7XHJcbiAgICBmdW5jdGlvbiB2ZXJiKG4pIHsgaVtuXSA9IG9bbl0gJiYgZnVuY3Rpb24gKHYpIHsgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHsgdiA9IG9bbl0odiksIHNldHRsZShyZXNvbHZlLCByZWplY3QsIHYuZG9uZSwgdi52YWx1ZSk7IH0pOyB9OyB9XHJcbiAgICBmdW5jdGlvbiBzZXR0bGUocmVzb2x2ZSwgcmVqZWN0LCBkLCB2KSB7IFByb21pc2UucmVzb2x2ZSh2KS50aGVuKGZ1bmN0aW9uKHYpIHsgcmVzb2x2ZSh7IHZhbHVlOiB2LCBkb25lOiBkIH0pOyB9LCByZWplY3QpOyB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX21ha2VUZW1wbGF0ZU9iamVjdChjb29rZWQsIHJhdykge1xyXG4gICAgaWYgKE9iamVjdC5kZWZpbmVQcm9wZXJ0eSkgeyBPYmplY3QuZGVmaW5lUHJvcGVydHkoY29va2VkLCBcInJhd1wiLCB7IHZhbHVlOiByYXcgfSk7IH0gZWxzZSB7IGNvb2tlZC5yYXcgPSByYXc7IH1cclxuICAgIHJldHVybiBjb29rZWQ7XHJcbn07XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19pbXBvcnRTdGFyKG1vZCkge1xyXG4gICAgaWYgKG1vZCAmJiBtb2QuX19lc01vZHVsZSkgcmV0dXJuIG1vZDtcclxuICAgIHZhciByZXN1bHQgPSB7fTtcclxuICAgIGlmIChtb2QgIT0gbnVsbCkgZm9yICh2YXIgayBpbiBtb2QpIGlmIChPYmplY3QuaGFzT3duUHJvcGVydHkuY2FsbChtb2QsIGspKSByZXN1bHRba10gPSBtb2Rba107XHJcbiAgICByZXN1bHQuZGVmYXVsdCA9IG1vZDtcclxuICAgIHJldHVybiByZXN1bHQ7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2ltcG9ydERlZmF1bHQobW9kKSB7XHJcbiAgICByZXR1cm4gKG1vZCAmJiBtb2QuX19lc01vZHVsZSkgPyBtb2QgOiB7IGRlZmF1bHQ6IG1vZCB9O1xyXG59XHJcbiIsImltcG9ydCB7IFBvcHVwQ29uZmlnT3B0aW9ucyB9IGZyb20gJy4vZ2xvYmFsJztcbmltcG9ydCB2ZXJzaW9uIGZyb20gJy4vdmVyc2lvbic7XG5cbi8qKlxuICogQGlnbm9yZVxuICovXG5leHBvcnQgY29uc3QgREVGQVVMVF9BVVRIT1JJWkVfVElNRU9VVF9JTl9TRUNPTkRTID0gNjA7XG5cbi8qKlxuICogQGlnbm9yZVxuICovXG5leHBvcnQgY29uc3QgREVGQVVMVF9QT1BVUF9DT05GSUdfT1BUSU9OUzogUG9wdXBDb25maWdPcHRpb25zID0ge1xuICB0aW1lb3V0SW5TZWNvbmRzOiBERUZBVUxUX0FVVEhPUklaRV9USU1FT1VUX0lOX1NFQ09ORFNcbn07XG5cbi8qKlxuICogQGlnbm9yZVxuICovXG5leHBvcnQgY29uc3QgREVGQVVMVF9TSUxFTlRfVE9LRU5fUkVUUllfQ09VTlQgPSAzO1xuXG4vKipcbiAqIEBpZ25vcmVcbiAqL1xuZXhwb3J0IGNvbnN0IENMRUFOVVBfSUZSQU1FX1RJTUVPVVRfSU5fU0VDT05EUyA9IDI7XG5cbi8qKlxuICogQGlnbm9yZVxuICovXG5leHBvcnQgY29uc3QgREVGQVVMVF9GRVRDSF9USU1FT1VUX01TID0gMTAwMDA7XG5cbmV4cG9ydCBjb25zdCBDQUNIRV9MT0NBVElPTl9NRU1PUlkgPSAnbWVtb3J5JztcbmV4cG9ydCBjb25zdCBDQUNIRV9MT0NBVElPTl9MT0NBTF9TVE9SQUdFID0gJ2xvY2Fsc3RvcmFnZSc7XG5cbi8qKlxuICogQGlnbm9yZVxuICovXG5leHBvcnQgY29uc3QgTUlTU0lOR19SRUZSRVNIX1RPS0VOX0VSUk9SX01FU1NBR0UgPVxuICAnVGhlIHdlYiB3b3JrZXIgaXMgbWlzc2luZyB0aGUgcmVmcmVzaCB0b2tlbic7XG5cbi8qKlxuICogQGlnbm9yZVxuICovXG5leHBvcnQgY29uc3QgSU5WQUxJRF9SRUZSRVNIX1RPS0VOX0VSUk9SX01FU1NBR0UgPSAnaW52YWxpZCByZWZyZXNoIHRva2VuJztcblxuLyoqXG4gKiBAaWdub3JlXG4gKi9cbmV4cG9ydCBjb25zdCBERUZBVUxUX1NDT1BFID0gJ29wZW5pZCBwcm9maWxlIGVtYWlsJztcblxuLyoqXG4gKiBBIGxpc3Qgb2YgZXJyb3JzIHRoYXQgY2FuIGJlIGlzc3VlZCBieSB0aGUgYXV0aG9yaXphdGlvbiBzZXJ2ZXIgd2hpY2ggdGhlXG4gKiB1c2VyIGNhbiByZWNvdmVyIGZyb20gYnkgc2lnbmluZyBpbiBpbnRlcmFjdGl2ZWx5LlxuICogaHR0cHM6Ly9vcGVuaWQubmV0L3NwZWNzL29wZW5pZC1jb25uZWN0LWNvcmUtMV8wLmh0bWwjQXV0aEVycm9yXG4gKiBAaWdub3JlXG4gKi9cbmV4cG9ydCBjb25zdCBSRUNPVkVSQUJMRV9FUlJPUlMgPSBbXG4gICdsb2dpbl9yZXF1aXJlZCcsXG4gICdjb25zZW50X3JlcXVpcmVkJyxcbiAgJ2ludGVyYWN0aW9uX3JlcXVpcmVkJyxcbiAgJ2FjY291bnRfc2VsZWN0aW9uX3JlcXVpcmVkJyxcbiAgLy8gU3RyaWN0bHkgc3BlYWtpbmcgdGhlIHVzZXIgY2FuJ3QgcmVjb3ZlciBmcm9tIGBhY2Nlc3NfZGVuaWVkYCAtIGJ1dCB0aGV5XG4gIC8vIGNhbiBnZXQgbW9yZSBpbmZvcm1hdGlvbiBhYm91dCB0aGVpciBhY2Nlc3MgYmVpbmcgZGVuaWVkIGJ5IGxvZ2dpbmcgaW5cbiAgLy8gaW50ZXJhY3RpdmVseS5cbiAgJ2FjY2Vzc19kZW5pZWQnXG5dO1xuXG4vKipcbiAqIEBpZ25vcmVcbiAqL1xuZXhwb3J0IGNvbnN0IERFRkFVTFRfU0VTU0lPTl9DSEVDS19FWFBJUllfREFZUyA9IDE7XG5cbi8qKlxuICogQGlnbm9yZVxuICovXG5leHBvcnQgY29uc3QgREVGQVVMVF9BVVRIMF9DTElFTlQgPSB7XG4gIG5hbWU6ICdhdXRoMC1zcGEtanMnLFxuICB2ZXJzaW9uOiB2ZXJzaW9uXG59O1xuIiwiaW1wb3J0IHsgTUlTU0lOR19SRUZSRVNIX1RPS0VOX0VSUk9SX01FU1NBR0UgfSBmcm9tICcuLi9jb25zdGFudHMnO1xuaW1wb3J0IHsgV29ya2VyUmVmcmVzaFRva2VuTWVzc2FnZSB9IGZyb20gJy4vd29ya2VyLnR5cGVzJztcblxubGV0IHJlZnJlc2hUb2tlbnM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7fTtcblxuY29uc3QgY2FjaGVLZXkgPSAoYXVkaWVuY2U6IHN0cmluZywgc2NvcGU6IHN0cmluZykgPT4gYCR7YXVkaWVuY2V9fCR7c2NvcGV9YDtcblxuY29uc3QgZ2V0UmVmcmVzaFRva2VuID0gKGF1ZGllbmNlOiBzdHJpbmcsIHNjb3BlOiBzdHJpbmcpID0+XG4gIHJlZnJlc2hUb2tlbnNbY2FjaGVLZXkoYXVkaWVuY2UsIHNjb3BlKV07XG5cbmNvbnN0IHNldFJlZnJlc2hUb2tlbiA9IChcbiAgcmVmcmVzaFRva2VuOiBzdHJpbmcsXG4gIGF1ZGllbmNlOiBzdHJpbmcsXG4gIHNjb3BlOiBzdHJpbmdcbikgPT4gKHJlZnJlc2hUb2tlbnNbY2FjaGVLZXkoYXVkaWVuY2UsIHNjb3BlKV0gPSByZWZyZXNoVG9rZW4pO1xuXG5jb25zdCBkZWxldGVSZWZyZXNoVG9rZW4gPSAoYXVkaWVuY2U6IHN0cmluZywgc2NvcGU6IHN0cmluZykgPT5cbiAgZGVsZXRlIHJlZnJlc2hUb2tlbnNbY2FjaGVLZXkoYXVkaWVuY2UsIHNjb3BlKV07XG5cbmNvbnN0IHdhaXQgPSAodGltZTogbnVtYmVyKSA9PlxuICBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHNldFRpbWVvdXQocmVzb2x2ZSwgdGltZSkpO1xuXG5jb25zdCBtZXNzYWdlSGFuZGxlciA9IGFzeW5jICh7XG4gIGRhdGE6IHsgdGltZW91dCwgYXV0aCwgZmV0Y2hVcmwsIGZldGNoT3B0aW9ucyB9LFxuICBwb3J0czogW3BvcnRdXG59OiBNZXNzYWdlRXZlbnQ8V29ya2VyUmVmcmVzaFRva2VuTWVzc2FnZT4pID0+IHtcbiAgbGV0IGpzb246IHtcbiAgICByZWZyZXNoX3Rva2VuPzogc3RyaW5nO1xuICB9O1xuXG4gIGNvbnN0IHsgYXVkaWVuY2UsIHNjb3BlIH0gPSBhdXRoIHx8IHt9O1xuXG4gIHRyeSB7XG4gICAgY29uc3QgYm9keSA9IEpTT04ucGFyc2UoZmV0Y2hPcHRpb25zLmJvZHkpO1xuXG4gICAgaWYgKCFib2R5LnJlZnJlc2hfdG9rZW4gJiYgYm9keS5ncmFudF90eXBlID09PSAncmVmcmVzaF90b2tlbicpIHtcbiAgICAgIGNvbnN0IHJlZnJlc2hUb2tlbiA9IGdldFJlZnJlc2hUb2tlbihhdWRpZW5jZSwgc2NvcGUpO1xuXG4gICAgICBpZiAoIXJlZnJlc2hUb2tlbikge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoTUlTU0lOR19SRUZSRVNIX1RPS0VOX0VSUk9SX01FU1NBR0UpO1xuICAgICAgfVxuXG4gICAgICBmZXRjaE9wdGlvbnMuYm9keSA9IEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgLi4uYm9keSxcbiAgICAgICAgcmVmcmVzaF90b2tlbjogcmVmcmVzaFRva2VuXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBsZXQgYWJvcnRDb250cm9sbGVyOiBBYm9ydENvbnRyb2xsZXI7XG5cbiAgICBpZiAodHlwZW9mIEFib3J0Q29udHJvbGxlciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgYWJvcnRDb250cm9sbGVyID0gbmV3IEFib3J0Q29udHJvbGxlcigpO1xuICAgICAgZmV0Y2hPcHRpb25zLnNpZ25hbCA9IGFib3J0Q29udHJvbGxlci5zaWduYWw7XG4gICAgfVxuXG4gICAgbGV0IHJlc3BvbnNlOiBhbnk7XG5cbiAgICB0cnkge1xuICAgICAgcmVzcG9uc2UgPSBhd2FpdCBQcm9taXNlLnJhY2UoW1xuICAgICAgICB3YWl0KHRpbWVvdXQpLFxuICAgICAgICBmZXRjaChmZXRjaFVybCwgeyAuLi5mZXRjaE9wdGlvbnMgfSlcbiAgICAgIF0pO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAvLyBmZXRjaCBlcnJvciwgcmVqZWN0IGBzZW5kTWVzc2FnZWAgdXNpbmcgYGVycm9yYCBrZXkgc28gdGhhdCB3ZSByZXRyeS5cbiAgICAgIHBvcnQucG9zdE1lc3NhZ2Uoe1xuICAgICAgICBlcnJvcjogZXJyb3IubWVzc2FnZVxuICAgICAgfSk7XG5cbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoIXJlc3BvbnNlKSB7XG4gICAgICAvLyBJZiB0aGUgcmVxdWVzdCB0aW1lcyBvdXQsIGFib3J0IGl0IGFuZCBsZXQgYHN3aXRjaEZldGNoYCByYWlzZSB0aGUgZXJyb3IuXG4gICAgICBpZiAoYWJvcnRDb250cm9sbGVyKSBhYm9ydENvbnRyb2xsZXIuYWJvcnQoKTtcblxuICAgICAgcG9ydC5wb3N0TWVzc2FnZSh7XG4gICAgICAgIGVycm9yOiBcIlRpbWVvdXQgd2hlbiBleGVjdXRpbmcgJ2ZldGNoJ1wiXG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGpzb24gPSBhd2FpdCByZXNwb25zZS5qc29uKCk7XG5cbiAgICBpZiAoanNvbi5yZWZyZXNoX3Rva2VuKSB7XG4gICAgICBzZXRSZWZyZXNoVG9rZW4oanNvbi5yZWZyZXNoX3Rva2VuLCBhdWRpZW5jZSwgc2NvcGUpO1xuICAgICAgZGVsZXRlIGpzb24ucmVmcmVzaF90b2tlbjtcbiAgICB9IGVsc2Uge1xuICAgICAgZGVsZXRlUmVmcmVzaFRva2VuKGF1ZGllbmNlLCBzY29wZSk7XG4gICAgfVxuXG4gICAgcG9ydC5wb3N0TWVzc2FnZSh7XG4gICAgICBvazogcmVzcG9uc2Uub2ssXG4gICAgICBqc29uXG4gICAgfSk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgcG9ydC5wb3N0TWVzc2FnZSh7XG4gICAgICBvazogZmFsc2UsXG4gICAgICBqc29uOiB7XG4gICAgICAgIGVycm9yX2Rlc2NyaXB0aW9uOiBlcnJvci5tZXNzYWdlXG4gICAgICB9XG4gICAgfSk7XG4gIH1cbn07XG5cbi8vIERvbid0IHJ1biBgYWRkRXZlbnRMaXN0ZW5lcmAgaW4gb3VyIHRlc3RzICh0aGlzIGlzIHJlcGxhY2VkIGluIHJvbGx1cClcbi8qIGlzdGFuYnVsIGlnbm9yZSBlbHNlICAqL1xuaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSAndGVzdCcpIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSB7IG1lc3NhZ2VIYW5kbGVyIH07XG59IGVsc2Uge1xuICAvLyBAdHMtaWdub3JlXG4gIGFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBtZXNzYWdlSGFuZGxlcik7XG59XG4iXSwibmFtZXMiOlsiX19hc3NpZ24iLCJPYmplY3QiLCJhc3NpZ24iLCJ0IiwicyIsImkiLCJuIiwiYXJndW1lbnRzIiwibGVuZ3RoIiwicCIsInByb3RvdHlwZSIsImhhc093blByb3BlcnR5IiwiY2FsbCIsImFwcGx5IiwidGhpcyIsIl9fZ2VuZXJhdG9yIiwidGhpc0FyZyIsImJvZHkiLCJmIiwieSIsImciLCJfIiwibGFiZWwiLCJzZW50IiwidHJ5cyIsIm9wcyIsIm5leHQiLCJ2ZXJiIiwidGhyb3ciLCJyZXR1cm4iLCJTeW1ib2wiLCJpdGVyYXRvciIsInYiLCJvcCIsIlR5cGVFcnJvciIsImRvbmUiLCJ2YWx1ZSIsInBvcCIsInB1c2giLCJlIiwic3RlcCIsInJlZnJlc2hUb2tlbnMiLCJjYWNoZUtleSIsImF1ZGllbmNlIiwic2NvcGUiLCJhZGRFdmVudExpc3RlbmVyIiwiX2EiLCJfYXJndW1lbnRzIiwiUCIsImdlbmVyYXRvciIsIl9iIiwidGltZW91dCIsImF1dGgiLCJmZXRjaFVybCIsImZldGNoT3B0aW9ucyIsInBvcnQiLCJfYyIsIkpTT04iLCJwYXJzZSIsInJlZnJlc2hfdG9rZW4iLCJncmFudF90eXBlIiwicmVmcmVzaFRva2VuIiwiZ2V0UmVmcmVzaFRva2VuIiwiRXJyb3IiLCJzdHJpbmdpZnkiLCJhYm9ydENvbnRyb2xsZXIiLCJBYm9ydENvbnRyb2xsZXIiLCJzaWduYWwiLCJyZXNwb25zZSIsIlByb21pc2UiLCJyYWNlIiwidGltZSIsInJlc29sdmUiLCJzZXRUaW1lb3V0IiwiZmV0Y2giLCJfZCIsInBvc3RNZXNzYWdlIiwiZXJyb3IiLCJlcnJvcl8xIiwibWVzc2FnZSIsImpzb24iLCJhYm9ydCIsInNldFJlZnJlc2hUb2tlbiIsImRlbGV0ZVJlZnJlc2hUb2tlbiIsIm9rIiwiZXJyb3JfZGVzY3JpcHRpb24iLCJlcnJvcl8yIiwicmVqZWN0IiwiZnVsZmlsbGVkIiwicmVqZWN0ZWQiLCJyZXN1bHQiLCJ0aGVuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztvRkE2Qk8sSUFBSUEsRUFBVyxXQVFsQixPQVBBQSxFQUFXQyxPQUFPQyxRQUFVLFNBQWtCQyxHQUMxQyxJQUFLLElBQUlDLEVBQUdDLEVBQUksRUFBR0MsRUFBSUMsVUFBVUMsT0FBUUgsRUFBSUMsRUFBR0QsSUFFNUMsSUFBSyxJQUFJSSxLQURUTCxFQUFJRyxVQUFVRixHQUNPSixPQUFPUyxVQUFVQyxlQUFlQyxLQUFLUixFQUFHSyxLQUFJTixFQUFFTSxHQUFLTCxFQUFFSyxJQUU5RSxPQUFPTixJQUVLVSxNQUFNQyxLQUFNUCxZQXVDekIsU0FBU1EsRUFBWUMsRUFBU0MsR0FDakMsSUFBc0dDLEVBQUdDLEVBQUdoQixFQUFHaUIsRUFBM0dDLEVBQUksQ0FBRUMsTUFBTyxFQUFHQyxLQUFNLFdBQWEsR0FBVyxFQUFQcEIsRUFBRSxHQUFRLE1BQU1BLEVBQUUsR0FBSSxPQUFPQSxFQUFFLElBQU9xQixLQUFNLEdBQUlDLElBQUssSUFDaEcsT0FBT0wsRUFBSSxDQUFFTSxLQUFNQyxFQUFLLEdBQUlDLE1BQVNELEVBQUssR0FBSUUsT0FBVUYsRUFBSyxJQUF3QixtQkFBWEcsU0FBMEJWLEVBQUVVLE9BQU9DLFVBQVksV0FBYSxPQUFPakIsT0FBVU0sRUFDdkosU0FBU08sRUFBS3JCLEdBQUssT0FBTyxTQUFVMEIsR0FBSyxPQUN6QyxTQUFjQyxHQUNWLEdBQUlmLEVBQUcsTUFBTSxJQUFJZ0IsVUFBVSxtQ0FDM0IsS0FBT2IsT0FDSCxHQUFJSCxFQUFJLEVBQUdDLElBQU1oQixFQUFZLEVBQVI4QixFQUFHLEdBQVNkLEVBQVUsT0FBSWMsRUFBRyxHQUFLZCxFQUFTLFNBQU9oQixFQUFJZ0IsRUFBVSxTQUFNaEIsRUFBRVMsS0FBS08sR0FBSSxHQUFLQSxFQUFFTyxTQUFXdkIsRUFBSUEsRUFBRVMsS0FBS08sRUFBR2MsRUFBRyxLQUFLRSxLQUFNLE9BQU9oQyxFQUUzSixPQURJZ0IsRUFBSSxFQUFHaEIsSUFBRzhCLEVBQUssQ0FBUyxFQUFSQSxFQUFHLEdBQVE5QixFQUFFaUMsUUFDekJILEVBQUcsSUFDUCxLQUFLLEVBQUcsS0FBSyxFQUFHOUIsRUFBSThCLEVBQUksTUFDeEIsS0FBSyxFQUFjLE9BQVhaLEVBQUVDLFFBQWdCLENBQUVjLE1BQU9ILEVBQUcsR0FBSUUsTUFBTSxHQUNoRCxLQUFLLEVBQUdkLEVBQUVDLFFBQVNILEVBQUljLEVBQUcsR0FBSUEsRUFBSyxDQUFDLEdBQUksU0FDeEMsS0FBSyxFQUFHQSxFQUFLWixFQUFFSSxJQUFJWSxNQUFPaEIsRUFBRUcsS0FBS2EsTUFBTyxTQUN4QyxRQUNJLEtBQU1sQyxFQUFJa0IsRUFBRUcsTUFBTXJCLEVBQUlBLEVBQUVLLE9BQVMsR0FBS0wsRUFBRUEsRUFBRUssT0FBUyxLQUFrQixJQUFWeUIsRUFBRyxJQUFzQixJQUFWQSxFQUFHLElBQVcsQ0FBRVosRUFBSSxFQUFHLFNBQ2pHLEdBQWMsSUFBVlksRUFBRyxNQUFjOUIsR0FBTThCLEVBQUcsR0FBSzlCLEVBQUUsSUFBTThCLEVBQUcsR0FBSzlCLEVBQUUsSUFBTSxDQUFFa0IsRUFBRUMsTUFBUVcsRUFBRyxHQUFJLE1BQzlFLEdBQWMsSUFBVkEsRUFBRyxJQUFZWixFQUFFQyxNQUFRbkIsRUFBRSxHQUFJLENBQUVrQixFQUFFQyxNQUFRbkIsRUFBRSxHQUFJQSxFQUFJOEIsRUFBSSxNQUM3RCxHQUFJOUIsR0FBS2tCLEVBQUVDLE1BQVFuQixFQUFFLEdBQUksQ0FBRWtCLEVBQUVDLE1BQVFuQixFQUFFLEdBQUlrQixFQUFFSSxJQUFJYSxLQUFLTCxHQUFLLE1BQ3ZEOUIsRUFBRSxJQUFJa0IsRUFBRUksSUFBSVksTUFDaEJoQixFQUFFRyxLQUFLYSxNQUFPLFNBRXRCSixFQUFLaEIsRUFBS0wsS0FBS0ksRUFBU0ssR0FDMUIsTUFBT2tCLEdBQUtOLEVBQUssQ0FBQyxFQUFHTSxHQUFJcEIsRUFBSSxVQUFlRCxFQUFJZixFQUFJLEVBQ3RELEdBQVksRUFBUjhCLEVBQUcsR0FBUSxNQUFNQSxFQUFHLEdBQUksTUFBTyxDQUFFRyxNQUFPSCxFQUFHLEdBQUtBLEVBQUcsUUFBSyxFQUFRRSxNQUFNLEdBckI5QkssQ0FBSyxDQUFDbEMsRUFBRzBCLE1DM0N0RCxJQ2pDSFMsRUFBd0MsR0FFdENDLEVBQVcsU0FBQ0MsRUFBa0JDLEdBQWtCLE9BQUdELE1BQVlDLEdBMEduRUMsaUJBQWlCLFdBekZJLFNBQU9DLE9GNkNKOUIsRUFBUytCLEVBQVlDLEVBQUdDLEVFNUNoREMsU0FBUUMsWUFBU0MsU0FBTUMsYUFBVUMsaUJBQ3pCQyxvQkYyQ2dCdkMsU0FBUytCLFNBQWVFLHVGRXJDeENOLEdBQUZhLEVBQXNCSixHQUFRLGFBQWxCUiwyQkFLaEIsMkJBRk0zQixFQUFPd0MsS0FBS0MsTUFBTUosRUFBYXJDLE9BRTNCMEMsZUFBcUMsa0JBQXBCMUMsRUFBSzJDLFdBQWdDLENBRzlELEtBRk1DLEVBN0JZLFNBQUNsQixFQUFrQkMsR0FDekMsT0FBQUgsRUFBY0MsRUFBU0MsRUFBVUMsSUE0QlJrQixDQUFnQm5CLEVBQVVDLElBRzdDLE1BQU0sSUFBSW1CLE1ERmhCLCtDQ0tJVCxFQUFhckMsS0FBT3dDLEtBQUtPLGlCQUNwQi9DLElBQ0gwQyxjQUFlRSxLQUlmSSxTQUUyQixtQkFBcEJDLGtCQUNURCxFQUFrQixJQUFJQyxnQkFDdEJaLEVBQWFhLE9BQVNGLEVBQWdCRSxRQUdwQ0MsMEJBR1MsZ0NBQU1DLFFBQVFDLEtBQUssRUF2Q3RCQyxFQXdDRHBCLEVBdkNYLElBQUlrQixTQUFRLFNBQUFHLEdBQVcsT0FBQUMsV0FBV0QsRUFBU0QsT0F3Q3JDRyxNQUFNckIsT0FBZUMscUJBRnZCYyxFQUFXTyxzQkFVWCxrQkFKQXBCLEVBQUtxQixZQUFZLENBQ2ZDLE1BQU9DLEVBQU1DLHFCQU1qQixPQUFLWCxLQVdRQSxFQUFTWSxTQVRoQmYsR0FBaUJBLEVBQWdCZ0IsUUFFckMxQixFQUFLcUIsWUFBWSxDQUNmQyxNQUFPLHNEQU1YRyxFQUFPTCxVQUVFaEIsZUExRVcsU0FDdEJFLEVBQ0FsQixFQUNBQyxHQUNJSCxFQUFjQyxFQUFTQyxFQUFVQyxJQUFVaUIsRUF1RTNDcUIsQ0FBZ0JGLEVBQUtyQixjQUFlaEIsRUFBVUMsVUFDdkNvQyxFQUFLckIsZUF0RVMsU0FBQ2hCLEVBQWtCQyxVQUNyQ0gsRUFBY0MsRUFBU0MsRUFBVUMsSUF1RXBDdUMsQ0FBbUJ4QyxFQUFVQyxHQUcvQlcsRUFBS3FCLFlBQVksQ0FDZlEsR0FBSWhCLEVBQVNnQixHQUNiSix3Q0FHRnpCLEVBQUtxQixZQUFZLENBQ2ZRLElBQUksRUFDSkosS0FBTSxDQUNKSyxrQkFBbUJDLEVBQU1QLGtDQWhGcEIsSUFBQ1IsTUZpREgsS0FEb0N2QixZQUN6QkEsRUFBSXFCLFdBQVUsU0FBVUcsRUFBU2UsR0FDL0MsU0FBU0MsRUFBVXBELEdBQVMsSUFBTUksRUFBS1MsRUFBVXZCLEtBQUtVLElBQVcsTUFBT0csR0FBS2dELEVBQU9oRCxJQUNwRixTQUFTa0QsRUFBU3JELEdBQVMsSUFBTUksRUFBS1MsRUFBaUIsTUFBRWIsSUFBVyxNQUFPRyxHQUFLZ0QsRUFBT2hELElBQ3ZGLFNBQVNDLEVBQUtrRCxHQUFVQSxFQUFPdkQsS0FBT3FDLEVBQVFrQixFQUFPdEQsT0FBUyxJQUFJWSxHQUFFLFNBQVV3QixHQUFXQSxFQUFRa0IsRUFBT3RELFVBQVd1RCxLQUFLSCxFQUFXQyxHQUNuSWpELEdBQU1TLEVBQVlBLEVBQVVwQyxNQUFNRyxFQUFTK0IsR0FBYyxLQUFLckIifQ==",mo=!1,function(e){return vo=vo||ho(yo,bo,mo),new Worker(vo,e)}),Co={},Fo=new Zr,Uo={memory:function(){return (new io).enclosedCache},localstorage:function(){return new no}},So=function(e){return Uo[e]},Zo=function(){return !/Trident.*rv:11\.0/.test(navigator.userAgent)},Vo=function(){function e(e){var t,n;if(this.options=e,"undefined"!=typeof window&&function(){if(!Wr())throw new Error("For security reasons, `window.crypto` is required to run `auth0-spa-js`.");if(void 0===kr())throw new Error("\n      auth0-spa-js must run on a secure origin. See https://github.com/auth0/auth0-spa-js/blob/master/FAQ.md#why-do-i-get-auth0-spa-js-must-run-on-a-secure-origin for more information.\n    ")}(),this.cacheLocation=e.cacheLocation||"memory",this.cookieStorage=!1===e.legacySameSiteCookie?fo:Io,this.sessionCheckExpiryDays=e.sessionCheckExpiryDays||1,!So(this.cacheLocation))throw new Error('Invalid cache location "'+this.cacheLocation+'"');var r,o,c=e.useCookiesForTransactions?this.cookieStorage:po;this.cache=So(this.cacheLocation)(),this.scope=this.options.scope,this.transactionManager=new ro(c),this.domainUrl="https://"+this.options.domain,this.tokenIssuer=(r=this.options.issuer,o=this.domainUrl,r?r.startsWith("https://")?r:"https://"+r+"/":o+"/"),this.defaultScope=Pr("openid",void 0!==(null===(n=null===(t=this.options)||void 0===t?void 0:t.advancedOptions)||void 0===n?void 0:n.defaultScope)?this.options.advancedOptions.defaultScope:"openid profile email"),this.options.useRefreshTokens&&(this.scope=Pr(this.scope,"offline_access")),"undefined"!=typeof window&&window.Worker&&this.options.useRefreshTokens&&"memory"===this.cacheLocation&&Zo()&&(this.worker=new Bo),this.customOptions=function(e){return e.advancedOptions,e.audience,e.auth0Client,e.authorizeTimeoutInSeconds,e.cacheLocation,e.client_id,e.domain,e.issuer,e.leeway,e.max_age,e.redirect_uri,e.scope,e.useRefreshTokens,i(e,["advancedOptions","audience","auth0Client","authorizeTimeoutInSeconds","cacheLocation","client_id","domain","issuer","leeway","max_age","redirect_uri","scope","useRefreshTokens"])}(e);}return e.prototype._url=function(e){var t=encodeURIComponent(btoa(JSON.stringify(this.options.auth0Client||Xr)));return ""+this.domainUrl+e+"&auth0Client="+t},e.prototype._getParams=function(e,t,r,o,c){var s=this.options,a=(s.domain,s.leeway,s.useRefreshTokens,s.useCookiesForTransactions,s.auth0Client,s.cacheLocation,s.advancedOptions,i(s,["domain","leeway","useRefreshTokens","useCookiesForTransactions","auth0Client","cacheLocation","advancedOptions"]));return n(n(n({},a),e),{scope:Pr(this.defaultScope,this.scope,e.scope),response_type:"code",response_mode:"query",state:t,nonce:r,redirect_uri:c||this.options.redirect_uri,code_challenge:o,code_challenge_method:"S256"})},e.prototype._authorizeUrl=function(e){return this._url("/authorize?"+Er(e))},e.prototype._verifyIdToken=function(e,t,n){return so({iss:this.tokenIssuer,aud:this.options.client_id,id_token:e,nonce:t,organizationId:n,leeway:this.options.leeway,max_age:this._parseNumber(this.options.max_age)})},e.prototype._parseNumber=function(e){return "string"!=typeof e?e:parseInt(e,10)||void 0},e.prototype.buildAuthorizeUrl=function(e){return void 0===e&&(e={}),r(this,void 0,void 0,(function(){var t,r,c,s,a,u,l,d,g,f,I,p;return o(this,(function(o){switch(o.label){case 0:return t=e.redirect_uri,r=e.appState,c=i(e,["redirect_uri","appState"]),s=Lr(Hr()),a=Lr(Hr()),u=Hr(),[4,Tr(u)];case 1:return l=o.sent(),d=Nr(l),g=e.fragment?"#"+e.fragment:"",f=this._getParams(c,s,a,d,t),I=this._authorizeUrl(f),p=e.organization||this.options.organization,this.transactionManager.create(n({nonce:a,code_verifier:u,appState:r,scope:f.scope,audience:f.audience||"default",redirect_uri:f.redirect_uri},p&&{organizationId:p})),[2,I+g]}}))}))},e.prototype.loginWithPopup=function(e,t){return void 0===e&&(e={}),void 0===t&&(t={}),r(this,void 0,void 0,(function(){var r,c,s,a,u,l,d,g,f,I,p,h,y;return o(this,(function(o){switch(o.label){case 0:return r=i(e,[]),c=Lr(Hr()),s=Lr(Hr()),a=Hr(),[4,Tr(a)];case 1:return u=o.sent(),l=Nr(u),d=this._getParams(r,c,s,l,this.options.redirect_uri||window.location.origin),g=this._authorizeUrl(n(n({},d),{response_mode:"web_message"})),[4,Jr(g,n(n({},t),{timeoutInSeconds:t.timeoutInSeconds||this.options.authorizeTimeoutInSeconds||60}))];case 2:if(f=o.sent(),c!==f.state)throw new Error("Invalid state");return [4,Mr({audience:d.audience,scope:d.scope,baseUrl:this.domainUrl,client_id:this.options.client_id,code_verifier:a,code:f.code,grant_type:"authorization_code",redirect_uri:d.redirect_uri,auth0Client:this.options.auth0Client},this.worker)];case 3:return I=o.sent(),p=e.organization||this.options.organization,h=this._verifyIdToken(I.id_token,s,p),y=n(n({},I),{decodedToken:h,scope:d.scope,audience:d.audience||"default",client_id:this.options.client_id}),this.cache.save(y),this.cookieStorage.save("auth0.is.authenticated",!0,{daysUntilExpire:this.sessionCheckExpiryDays}),[2]}}))}))},e.prototype.getUser=function(e){return void 0===e&&(e={}),r(this,void 0,void 0,(function(){var t,n,i;return o(this,(function(r){return t=e.audience||this.options.audience||"default",n=Pr(this.defaultScope,this.scope,e.scope),[2,(i=this.cache.get(new qr({client_id:this.options.client_id,audience:t,scope:n})))&&i.decodedToken&&i.decodedToken.user]}))}))},e.prototype.getIdTokenClaims=function(e){return void 0===e&&(e={}),r(this,void 0,void 0,(function(){var t,n,i;return o(this,(function(r){return t=e.audience||this.options.audience||"default",n=Pr(this.defaultScope,this.scope,e.scope),[2,(i=this.cache.get(new qr({client_id:this.options.client_id,audience:t,scope:n})))&&i.decodedToken&&i.decodedToken.claims]}))}))},e.prototype.loginWithRedirect=function(e){return void 0===e&&(e={}),r(this,void 0,void 0,(function(){var t;return o(this,(function(n){switch(n.label){case 0:return [4,this.buildAuthorizeUrl(e)];case 1:return t=n.sent(),window.location.assign(t),[2]}}))}))},e.prototype.handleRedirectCallback=function(e){return void 0===e&&(e=window.location.href),r(this,void 0,void 0,(function(){var t,i,r,c,s,a,u,l,d,g,f;return o(this,(function(o){switch(o.label){case 0:if(0===(t=e.split("?").slice(1)).length)throw new Error("There are no query params available for parsing.");if(i=function(e){e.indexOf("#")>-1&&(e=e.substr(0,e.indexOf("#")));var t=e.split("&"),i={};return t.forEach((function(e){var t=e.split("="),n=t[0],r=t[1];i[n]=decodeURIComponent(r);})),n(n({},i),{expires_in:parseInt(i.expires_in)})}(t.join("")),r=i.state,c=i.code,s=i.error,a=i.error_description,!(u=this.transactionManager.get())||!u.code_verifier)throw new Error("Invalid state");if(this.transactionManager.remove(),s)throw new xr(s,a,r,u.appState);return l={audience:u.audience,scope:u.scope,baseUrl:this.domainUrl,client_id:this.options.client_id,code_verifier:u.code_verifier,grant_type:"authorization_code",code:c,auth0Client:this.options.auth0Client},void 0!==u.redirect_uri&&(l.redirect_uri=u.redirect_uri),[4,Mr(l,this.worker)];case 1:return d=o.sent(),g=this._verifyIdToken(d.id_token,u.nonce,u.organizationId),f=n(n({},d),{decodedToken:g,audience:u.audience,scope:u.scope,client_id:this.options.client_id}),this.cache.save(f),this.cookieStorage.save("auth0.is.authenticated",!0,{daysUntilExpire:this.sessionCheckExpiryDays}),[2,{appState:u.appState}]}}))}))},e.prototype.checkSession=function(e){return r(this,void 0,void 0,(function(){var t;return o(this,(function(n){switch(n.label){case 0:if(!this.cookieStorage.get("auth0.is.authenticated"))return [2];n.label=1;case 1:return n.trys.push([1,3,,4]),[4,this.getTokenSilently(e)];case 2:return n.sent(),[3,4];case 3:if(t=n.sent(),!Gr.includes(t.error))throw t;return [3,4];case 4:return [2]}}))}))},e.prototype.getTokenSilently=function(e){return void 0===e&&(e={}),r(this,void 0,void 0,(function(){var t,r,c,s=this;return o(this,(function(o){return t=n(n({audience:this.options.audience,ignoreCache:!1},e),{scope:Pr(this.defaultScope,this.scope,e.scope)}),r=t.ignoreCache,c=i(t,["ignoreCache"]),[2,(a=function(){return s._getTokenSilently(n({ignoreCache:r},c))},u=this.options.client_id+"::"+c.audience+"::"+c.scope,l=Co[u],l||(l=a().finally((function(){delete Co[u],l=null;})),Co[u]=l),l)];var a,u,l;}))}))},e.prototype._getTokenSilently=function(e){return void 0===e&&(e={}),r(this,void 0,void 0,(function(){var t,c,s,a,u,l,d=this;return o(this,(function(g){switch(g.label){case 0:return t=e.ignoreCache,c=i(e,["ignoreCache"]),s=function(){var e=d.cache.get(new qr({scope:c.scope,audience:c.audience||"default",client_id:d.options.client_id}),60);return e&&e.access_token},!t&&(a=s())?[2,a]:[4,(f=function(){return Fo.acquireLock("auth0.lock.getTokenSilently",5e3)},I=10,void 0===I&&(I=3),r(void 0,void 0,void 0,(function(){var e;return o(this,(function(t){switch(t.label){case 0:e=0,t.label=1;case 1:return e<I?[4,f()]:[3,4];case 2:if(t.sent())return [2,!0];t.label=3;case 3:return e++,[3,1];case 4:return [2,!1]}}))})))];case 1:if(!g.sent())return [3,10];g.label=2;case 2:return g.trys.push([2,,7,9]),!t&&(a=s())?[2,a]:this.options.useRefreshTokens?[4,this._getTokenUsingRefreshToken(c)]:[3,4];case 3:return l=g.sent(),[3,6];case 4:return [4,this._getTokenFromIFrame(c)];case 5:l=g.sent(),g.label=6;case 6:return u=l,this.cache.save(n({client_id:this.options.client_id},u)),this.cookieStorage.save("auth0.is.authenticated",!0,{daysUntilExpire:this.sessionCheckExpiryDays}),[2,u.access_token];case 7:return [4,Fo.releaseLock("auth0.lock.getTokenSilently")];case 8:return g.sent(),[7];case 9:return [3,11];case 10:throw new Ar;case 11:return [2]}var f,I;}))}))},e.prototype.getTokenWithPopup=function(e,t){return void 0===e&&(e={}),void 0===t&&(t={}),r(this,void 0,void 0,(function(){return o(this,(function(i){switch(i.label){case 0:return e.audience=e.audience||this.options.audience,e.scope=Pr(this.defaultScope,this.scope,e.scope),t=n(n({},Vr),t),[4,this.loginWithPopup(e,t)];case 1:return i.sent(),[2,this.cache.get(new qr({scope:e.scope,audience:e.audience||"default",client_id:this.options.client_id})).access_token]}}))}))},e.prototype.isAuthenticated=function(){return r(this,void 0,void 0,(function(){return o(this,(function(e){switch(e.label){case 0:return [4,this.getUser()];case 1:return [2,!!e.sent()]}}))}))},e.prototype.buildLogoutUrl=function(e){void 0===e&&(e={}),null!==e.client_id?e.client_id=e.client_id||this.options.client_id:delete e.client_id;var t=e.federated,n=i(e,["federated"]),r=t?"&federated":"";return this._url("/v2/logout?"+Er(n))+r},e.prototype.logout=function(e){void 0===e&&(e={});var t=e.localOnly,n=i(e,["localOnly"]);if(t&&n.federated)throw new Error("It is invalid to set both the `federated` and `localOnly` options to `true`");if(this.cache.clear(),this.cookieStorage.remove("auth0.is.authenticated"),!t){var r=this.buildLogoutUrl(n);window.location.assign(r);}},e.prototype._getTokenFromIFrame=function(e){return r(this,void 0,void 0,(function(){var t,r,c,s,a,u,l,d,g,f,I,p,h,y,b;return o(this,(function(o){switch(o.label){case 0:return t=Lr(Hr()),r=Lr(Hr()),c=Hr(),[4,Tr(c)];case 1:s=o.sent(),a=Nr(s),u=this._getParams(e,t,r,a,e.redirect_uri||this.options.redirect_uri||window.location.origin),l=this._authorizeUrl(n(n({},u),{prompt:"none",response_mode:"web_message"})),d=e.timeoutInSeconds||this.options.authorizeTimeoutInSeconds,o.label=2;case 2:return o.trys.push([2,5,,6]),[4,Qr(l,this.domainUrl,d)];case 3:if(g=o.sent(),t!==g.state)throw new Error("Invalid state");return f=e.scope,I=e.audience,e.redirect_uri,e.ignoreCache,e.timeoutInSeconds,p=i(e,["scope","audience","redirect_uri","ignoreCache","timeoutInSeconds"]),[4,Mr(n(n(n({},this.customOptions),p),{scope:f,audience:I,baseUrl:this.domainUrl,client_id:this.options.client_id,code_verifier:c,code:g.code,grant_type:"authorization_code",redirect_uri:u.redirect_uri,auth0Client:this.options.auth0Client}),this.worker)];case 4:return h=o.sent(),y=this._verifyIdToken(h.id_token,r),[2,n(n({},h),{decodedToken:y,scope:u.scope,audience:u.audience||"default"})];case 5:throw "login_required"===(b=o.sent()).error&&this.logout({localOnly:!0}),b;case 6:return [2]}}))}))},e.prototype._getTokenUsingRefreshToken=function(e){return r(this,void 0,void 0,(function(){var t,r,c,s,a,u,l,d,g;return o(this,(function(o){switch(o.label){case 0:return e.scope=Pr(this.defaultScope,this.options.scope,e.scope),(t=this.cache.get(new qr({scope:e.scope,audience:e.audience||"default",client_id:this.options.client_id})))&&t.refresh_token||this.worker?[3,2]:[4,this._getTokenFromIFrame(e)];case 1:return [2,o.sent()];case 2:r=e.redirect_uri||this.options.redirect_uri||window.location.origin,s=e.scope,a=e.audience,e.ignoreCache,e.timeoutInSeconds,u=i(e,["scope","audience","ignoreCache","timeoutInSeconds"]),l="number"==typeof e.timeoutInSeconds?1e3*e.timeoutInSeconds:null,o.label=3;case 3:return o.trys.push([3,5,,8]),[4,Mr(n(n(n(n(n({},this.customOptions),u),{audience:a,scope:s,baseUrl:this.domainUrl,client_id:this.options.client_id,grant_type:"refresh_token",refresh_token:t&&t.refresh_token,redirect_uri:r}),l&&{timeout:l}),{auth0Client:this.options.auth0Client}),this.worker)];case 4:return c=o.sent(),[3,8];case 5:return "The web worker is missing the refresh token"===(d=o.sent()).message||d.message&&d.message.indexOf("invalid refresh token")>-1?[4,this._getTokenFromIFrame(e)]:[3,7];case 6:return [2,o.sent()];case 7:throw d;case 8:return g=this._verifyIdToken(c.id_token),[2,n(n({},c),{decodedToken:g,scope:e.scope,audience:e.audience||"default"})]}}))}))},e}();function Xo(e){return r(this,void 0,void 0,(function(){var t;return o(this,(function(n){switch(n.label){case 0:return [4,(t=new Vo(e)).checkSession()];case 1:return n.sent(),[2,t]}}))}))}

    const loc = window.location;
    let auth0 = null;
    let isAuthenticated = false;
    let callback;
    const onLoggedIn = (cb) => {
        callback = cb;
    };
    const configureClient = async () => {
        const response = await fetch("/auth_config.json");
        const config = await response.json();
        auth0 = await Xo({
            domain: config.domain,
            client_id: config.clientId,
            audience: config.audience,
        });
    };
    window.onload = async () => {
        if (loc.host !== "dasifor.xyz") {
            Fetcher.getInstance();
            callback();
            return;
        }
        await configureClient();
        isAuthenticated = await auth0.isAuthenticated();
        if (isAuthenticated) {
            callback();
            return;
        }
        const query = window.location.search;
        if (query.includes("code=") && query.includes("state=")) {
            await auth0.handleRedirectCallback();
            window.history.replaceState({}, document.title, "/");
            const token = await auth0.getTokenSilently();
            callback();
            Fetcher.getInstance(token);
        }
    };
    const isLoggedIn = async () => {
        if (!auth0) {
            console.log("No auth0 object, configuring.");
            configureClient();
        }
        return await auth0.isAuthenticated();
    };
    const login = async () => {
        await auth0.loginWithRedirect({
            redirect_uri: "https://dasifor.xyz"
        });
    };
    const logout = () => {
        Fetcher.destroy();
        auth0.logout({
            returnTo: "https://dasifor.xyz"
        });
    };

    /* src/components/Navigator.svelte generated by Svelte v3.32.1 */
    const file$7 = "src/components/Navigator.svelte";

    // (15:3) {:else}
    function create_else_block$4(ctx) {
    	let li;
    	let a;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			li = element("li");
    			a = element("a");
    			a.textContent = "Logga in";
    			attr_dev(a, "href", "/login");
    			attr_dev(a, "class", "svelte-1hkku9o");
    			add_location(a, file$7, 15, 8, 454);
    			add_location(li, file$7, 15, 4, 450);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, a);

    			if (!mounted) {
    				dispose = listen_dev(a, "click", /*click_handler_1*/ ctx[2], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$4.name,
    		type: "else",
    		source: "(15:3) {:else}",
    		ctx
    	});

    	return block;
    }

    // (13:3) {#if loggedIn}
    function create_if_block$4(ctx) {
    	let li;
    	let a;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			li = element("li");
    			a = element("a");
    			a.textContent = "Logga ut";
    			attr_dev(a, "href", "/logout");
    			attr_dev(a, "class", "svelte-1hkku9o");
    			add_location(a, file$7, 13, 8, 373);
    			add_location(li, file$7, 13, 4, 369);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, a);

    			if (!mounted) {
    				dispose = listen_dev(a, "click", /*click_handler*/ ctx[1], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(13:3) {#if loggedIn}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let nav;
    	let div;
    	let ul0;
    	let li0;
    	let a0;
    	let t1;
    	let li1;
    	let a1;
    	let t3;
    	let li2;
    	let a2;
    	let t5;
    	let ul1;

    	function select_block_type(ctx, dirty) {
    		if (/*loggedIn*/ ctx[0]) return create_if_block$4;
    		return create_else_block$4;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			nav = element("nav");
    			div = element("div");
    			ul0 = element("ul");
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
    			t5 = space();
    			ul1 = element("ul");
    			if_block.c();
    			attr_dev(a0, "href", "/");
    			attr_dev(a0, "class", "svelte-1hkku9o");
    			add_location(a0, file$7, 7, 7, 191);
    			add_location(li0, file$7, 7, 3, 187);
    			attr_dev(a1, "href", "/new");
    			attr_dev(a1, "class", "svelte-1hkku9o");
    			add_location(a1, file$7, 8, 7, 223);
    			add_location(li1, file$7, 8, 3, 219);
    			attr_dev(a2, "href", "/edit");
    			attr_dev(a2, "class", "svelte-1hkku9o");
    			add_location(a2, file$7, 9, 7, 264);
    			add_location(li2, file$7, 9, 3, 260);
    			attr_dev(ul0, "id", "nav-mobile");
    			attr_dev(ul0, "class", "left");
    			add_location(ul0, file$7, 6, 2, 150);
    			attr_dev(ul1, "id", "nav-mobile");
    			attr_dev(ul1, "class", "right");
    			add_location(ul1, file$7, 11, 2, 312);
    			attr_dev(div, "class", "nav-wrapper");
    			add_location(div, file$7, 5, 1, 122);
    			attr_dev(nav, "class", "indigo darken-3");
    			add_location(nav, file$7, 4, 0, 91);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, nav, anchor);
    			append_dev(nav, div);
    			append_dev(div, ul0);
    			append_dev(ul0, li0);
    			append_dev(li0, a0);
    			append_dev(ul0, t1);
    			append_dev(ul0, li1);
    			append_dev(li1, a1);
    			append_dev(ul0, t3);
    			append_dev(ul0, li2);
    			append_dev(li2, a2);
    			append_dev(div, t5);
    			append_dev(div, ul1);
    			if_block.m(ul1, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(ul1, null);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(nav);
    			if_block.d();
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

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Navigator", slots, []);
    	let { loggedIn } = $$props;
    	const writable_props = ["loggedIn"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Navigator> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => logout();
    	const click_handler_1 = () => login();

    	$$self.$$set = $$props => {
    		if ("loggedIn" in $$props) $$invalidate(0, loggedIn = $$props.loggedIn);
    	};

    	$$self.$capture_state = () => ({ login, logout, loggedIn });

    	$$self.$inject_state = $$props => {
    		if ("loggedIn" in $$props) $$invalidate(0, loggedIn = $$props.loggedIn);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [loggedIn, click_handler, click_handler_1];
    }

    class Navigator extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, { loggedIn: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Navigator",
    			options,
    			id: create_fragment$a.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*loggedIn*/ ctx[0] === undefined && !("loggedIn" in props)) {
    			console.warn("<Navigator> was created without expected prop 'loggedIn'");
    		}
    	}

    	get loggedIn() {
    		throw new Error("<Navigator>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set loggedIn(value) {
    		throw new Error("<Navigator>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/misc/NotLoggedIn.svelte generated by Svelte v3.32.1 */

    const file$8 = "src/components/misc/NotLoggedIn.svelte";

    function create_fragment$b(ctx) {
    	let p;
    	let t0;
    	let a;
    	let t2;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t0 = text("Logga in uppe till höger eller besök ");
    			a = element("a");
    			a.textContent = "den öppna versionen";
    			t2 = text(".");
    			attr_dev(a, "href", "https://budget.dasifor.xyz");
    			add_location(a, file$8, 4, 38, 77);
    			attr_dev(p, "class", "center svelte-1vbsoe2");
    			add_location(p, file$8, 3, 0, 20);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t0);
    			append_dev(p, a);
    			append_dev(p, t2);
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
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("NotLoggedIn", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<NotLoggedIn> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class NotLoggedIn extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NotLoggedIn",
    			options,
    			id: create_fragment$b.name
    		});
    	}
    }

    /* src/components/misc/Login.svelte generated by Svelte v3.32.1 */

    function create_fragment$c(ctx) {
    	const block = {
    		c: noop,
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Login", slots, []);

    	isLoggedIn().then(loggedIn => {
    		if (loggedIn) {
    			logout();
    		} else {
    			login();
    		}
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Login> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ isLoggedIn, login, logout });
    	return [];
    }

    class Login extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Login",
    			options,
    			id: create_fragment$c.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.32.1 */

    // (35:0) {:else}
    function create_else_block$5(ctx) {
    	let notloggedin;
    	let current;
    	notloggedin = new NotLoggedIn({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(notloggedin.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(notloggedin, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(notloggedin.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(notloggedin.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(notloggedin, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$5.name,
    		type: "else",
    		source: "(35:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (33:0) {#if loggedIn}
    function create_if_block$5(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	var switch_value = /*page*/ ctx[0];

    	function switch_props(ctx) {
    		return { $$inline: true };
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
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
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(33:0) {#if loggedIn}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$d(ctx) {
    	let navigator;
    	let t;
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;

    	navigator = new Navigator({
    			props: { loggedIn: /*loggedIn*/ ctx[1] },
    			$$inline: true
    		});

    	const if_block_creators = [create_if_block$5, create_else_block$5];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*loggedIn*/ ctx[1]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			create_component(navigator.$$.fragment);
    			t = space();
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(navigator, target, anchor);
    			insert_dev(target, t, anchor);
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const navigator_changes = {};
    			if (dirty & /*loggedIn*/ 2) navigator_changes.loggedIn = /*loggedIn*/ ctx[1];
    			navigator.$set(navigator_changes);
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
    			transition_in(navigator.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(navigator.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(navigator, detaching);
    			if (detaching) detach_dev(t);
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	let page$1 = null;

    	page("/", () => {
    		$$invalidate(0, page$1 = ViewBudget);
    	});

    	page("/new", () => {
    		$$invalidate(0, page$1 = NewBudget);
    	});

    	page("/edit", () => {
    		$$invalidate(0, page$1 = EditBudget);
    	});

    	page("/login", () => {
    		$$invalidate(0, page$1 = Login);
    	});

    	page("/logout", () => {
    		$$invalidate(0, page$1 = Login);
    	});

    	page.start();
    	let loggedIn = false;

    	onLoggedIn(() => {
    		$$invalidate(1, loggedIn = true);
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		EditBudget,
    		ViewBudget,
    		NewBudget,
    		Navigator,
    		NotLoggedIn,
    		Login,
    		onLoggedIn,
    		router: page,
    		page: page$1,
    		loggedIn
    	});

    	$$self.$inject_state = $$props => {
    		if ("page" in $$props) $$invalidate(0, page$1 = $$props.page);
    		if ("loggedIn" in $$props) $$invalidate(1, loggedIn = $$props.loggedIn);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [page$1, loggedIn];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$d.name
    		});
    	}
    }

    const app = new App({
        target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
