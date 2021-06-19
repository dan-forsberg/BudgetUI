
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop$1() { }
    function is_promise(value) {
        return value && typeof value === 'object' && typeof value.then === 'function';
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
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
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function action_destroyer(action_result) {
        return action_result && is_function$1(action_result.destroy) ? action_result.destroy : noop$1;
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
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element$1(name) {
        return document.createElement(name);
    }
    function text$1(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text$1(' ');
    }
    function empty() {
        return text$1('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr$1(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function to_number(value) {
        return value === '' ? null : +value;
    }
    function children$1(element) {
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

    let current_component$1;
    function set_current_component$1(component) {
        current_component$1 = component;
    }
    function get_current_component() {
        if (!current_component$1)
            throw new Error('Function called outside component initialization');
        return current_component$1;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
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
    function add_flush_callback(fn) {
        flush_callbacks$1.push(fn);
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
            set_current_component$1(null);
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
            run_all$1(outros.c);
        }
        outros = outros.p;
    }
    function transition_in$1(block, local) {
        if (block && block.i) {
            outroing$1.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing$1.has(block))
                return;
            outroing$1.add(block);
            outros.c.push(() => {
                outroing$1.delete(block);
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
                transition_in$1(block, 1);
                block.m(info.mount(), info.anchor);
                needs_flush = true;
            }
            info.block = block;
            if (info.blocks)
                info.blocks[index] = block;
            if (needs_flush) {
                flush$1();
            }
        }
        if (is_promise(promise)) {
            const current_component = get_current_component();
            promise.then(value => {
                set_current_component$1(current_component);
                update(info.then, 1, info.value, value);
                set_current_component$1(null);
            }, error => {
                set_current_component$1(current_component);
                update(info.catch, 2, info.error, error);
                set_current_component$1(null);
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
    function update_await_block_branch(info, ctx, dirty) {
        const child_ctx = ctx.slice();
        const { resolved } = info;
        if (info.current === info.then) {
            child_ctx[info.value] = resolved;
        }
        if (info.current === info.catch) {
            child_ctx[info.error] = resolved;
        }
        info.block.p(child_ctx, dirty);
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
            transition_in$1(block, 1);
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
    function mount_component$1(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
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
        }
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
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : options.context || []),
            // everything else
            callbacks: blank_object$1(),
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
            mount_component$1(component, options.target, options.anchor, options.customElement);
            flush$1();
        }
        set_current_component$1(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
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
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.38.2' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append$1(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert$1(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach$1(node);
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
        attr$1(node, attribute, value);
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
    class SvelteComponentDev extends SvelteComponent$1 {
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

    /* src/components/read/ViewCategory.svelte generated by Svelte v3.38.2 */
    const file$8 = "src/components/read/ViewCategory.svelte";

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    // (26:0) {:else}
    function create_else_block$5(ctx) {
    	let p0;
    	let t1;
    	let p1;
    	let t2;
    	let t3;

    	const block = {
    		c: function create() {
    			p0 = element$1("p");
    			p0.textContent = "No data?";
    			t1 = space();
    			p1 = element$1("p");
    			t2 = text$1("category = ");
    			t3 = text$1(/*category*/ ctx[1]);
    			add_location(p0, file$8, 26, 1, 594);
    			add_location(p1, file$8, 27, 1, 611);
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
    		id: create_else_block$5.name,
    		type: "else",
    		source: "(26:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (8:0) {#if entries !== undefined}
    function create_if_block$5(ctx) {
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
    	validate_each_keys(ctx, each_value, get_each_context$4, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$4(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$4(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			h3 = element$1("h3");
    			t0 = text$1(/*category*/ ctx[1]);
    			t1 = space();
    			table = element$1("table");
    			tr0 = element$1("tr");
    			th0 = element$1("th");
    			th0.textContent = "Beskrivning";
    			t3 = space();
    			th1 = element$1("th");
    			th1.textContent = "Belopp";
    			t5 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t6 = space();
    			tr1 = element$1("tr");
    			td0 = element$1("td");
    			td0.textContent = "Totalt";
    			t8 = space();
    			td1 = element$1("td");

    			td1.textContent = `${/*total*/ ctx[3] < 0
			? /*total*/ ctx[3]
			: "+" + /*total*/ ctx[3]}`;

    			attr_dev(h3, "class", "entries-header");
    			add_location(h3, file$8, 8, 1, 211);
    			add_location(th0, file$8, 11, 3, 273);
    			attr_dev(th1, "class", "right");
    			add_location(th1, file$8, 12, 3, 297);
    			attr_dev(tr0, "class", "svelte-13a5tvb");
    			add_location(tr0, file$8, 10, 2, 265);
    			add_location(td0, file$8, 21, 3, 491);
    			attr_dev(td1, "class", "right");
    			add_location(td1, file$8, 22, 3, 510);
    			attr_dev(tr1, "class", "svelte-13a5tvb");
    			add_location(tr1, file$8, 20, 2, 483);
    			attr_dev(table, "class", "svelte-13a5tvb");
    			add_location(table, file$8, 9, 1, 255);
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
    				validate_each_keys(ctx, each_value, get_each_context$4, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, table, destroy_block, create_each_block$4, t6, get_each_context$4);
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
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(8:0) {#if entries !== undefined}",
    		ctx
    	});

    	return block;
    }

    // (15:2) {#each sortedEntries as entry (entry.id)}
    function create_each_block$4(key_1, ctx) {
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
    			tr = element$1("tr");
    			td0 = element$1("td");
    			t0 = text$1(t0_value);
    			t1 = space();
    			td1 = element$1("td");
    			t2 = text$1(t2_value);
    			add_location(td0, file$8, 16, 4, 391);
    			attr_dev(td1, "class", "right");
    			add_location(td1, file$8, 17, 4, 424);
    			attr_dev(tr, "class", "svelte-13a5tvb");
    			add_location(tr, file$8, 15, 3, 382);
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
    		id: create_each_block$4.name,
    		type: "each",
    		source: "(15:2) {#each sortedEntries as entry (entry.id)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$d(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*entries*/ ctx[0] !== undefined) return create_if_block$5;
    		return create_else_block$5;
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
    		i: noop$1,
    		o: noop$1,
    		d: function destroy(detaching) {
    			if_block.d(detaching);
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
    		init$1(this, options, instance$d, create_fragment$d, safe_not_equal$1, { entries: 0, category: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ViewCategory",
    			options,
    			id: create_fragment$d.name
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

    /* src/components/edit/InPlaceEdit.svelte generated by Svelte v3.38.2 */
    const file$7 = "src/components/edit/InPlaceEdit.svelte";

    // (42:0) {:else}
    function create_else_block$4(ctx) {
    	let td;
    	let t;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			td = element$1("td");
    			t = text$1(/*value*/ ctx[0]);
    			add_location(td, file$7, 42, 1, 561);
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
    		id: create_else_block$4.name,
    		type: "else",
    		source: "(42:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (40:0) {#if editing}
    function create_if_block$4(ctx) {
    	let input;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			input = element$1("input");
    			input.required = /*required*/ ctx[1];
    			attr_dev(input, "class", "svelte-ml8vq6");
    			add_location(input, file$7, 40, 1, 493);
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
    			run_all$1(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(40:0) {#if editing}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$c(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*editing*/ ctx[2]) return create_if_block$4;
    		return create_else_block$4;
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
    		i: noop$1,
    		o: noop$1,
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
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

    function focus(element) {
    	element.focus();
    }

    function instance$c($$self, $$props, $$invalidate) {
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
    		init$1(this, options, instance$c, create_fragment$c, safe_not_equal$1, { value: 0, required: 1, onSubmit: 5 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "InPlaceEdit",
    			options,
    			id: create_fragment$c.name
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

    function noop() { }
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

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_data(text, data) {
        data = '' + data;
        if (text.data !== data)
            text.data = data;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
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
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
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
        const prop_values = options.props || {};
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
        $set() {
            // overridden by instance, if it has props
        }
    }

    /* src/toast.svelte generated by Svelte v3.20.1 */

    function add_css() {
    	var style = element("style");
    	style.id = "svelte-3qemlt-style";
    	style.textContent = ".toast-container.svelte-3qemlt{position:fixed;z-index:999}.top.svelte-3qemlt{top:15px}.bottom.svelte-3qemlt{bottom:15px}.left.svelte-3qemlt{left:15px}.right.svelte-3qemlt{right:15px}.center.svelte-3qemlt{left:50%;transform:translateX(-50%);-webkit-transform:translateX(-50%)}.toast.svelte-3qemlt{height:38px;line-height:38px;padding:0 20px;box-shadow:0 1px 3px rgba(0, 0, 0, .12), 0 1px 2px rgba(0, 0, 0, .24);color:#FFF;-webkit-transition:opacity 0.2s, -webkit-transform 0.2s;transition:opacity 0.2s, transform 0.2s, -webkit-transform 0.2s;-webkit-transform:translateY(35px);transform:translateY(35px);opacity:0;max-width:200px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.info.svelte-3qemlt{background-color:#0091EA}.success.svelte-3qemlt{background-color:#4CAF50}.error.svelte-3qemlt{background-color:#F44336}.default.svelte-3qemlt{background-color:#353535}.anim.svelte-3qemlt{opacity:1;-webkit-transform:translateY(0);transform:translateY(0)}";
    	append(document.head, style);
    }

    function create_fragment$b(ctx) {
    	let div1;
    	let div0;
    	let t;
    	let div0_class_value;
    	let div1_class_value;

    	return {
    		c() {
    			div1 = element("div");
    			div0 = element("div");
    			t = text(/*msg*/ ctx[0]);
    			attr(div0, "class", div0_class_value = "toast " + /*type*/ ctx[1] + " svelte-3qemlt");
    			attr(div1, "class", div1_class_value = "toast-container " + /*_position*/ ctx[2] + " svelte-3qemlt");
    		},
    		m(target, anchor) {
    			insert(target, div1, anchor);
    			append(div1, div0);
    			append(div0, t);
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*msg*/ 1) set_data(t, /*msg*/ ctx[0]);

    			if (dirty & /*type*/ 2 && div0_class_value !== (div0_class_value = "toast " + /*type*/ ctx[1] + " svelte-3qemlt")) {
    				attr(div0, "class", div0_class_value);
    			}

    			if (dirty & /*_position*/ 4 && div1_class_value !== (div1_class_value = "toast-container " + /*_position*/ ctx[2] + " svelte-3qemlt")) {
    				attr(div1, "class", div1_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(div1);
    		}
    	};
    }

    function instance$b($$self, $$props, $$invalidate) {
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

    class Toast extends SvelteComponent {
    	constructor(options) {
    		super();
    		if (!document.getElementById("svelte-3qemlt-style")) add_css();
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, { msg: 0, type: 1, position: 3 });
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

    /* src/components/edit/EditCategory.svelte generated by Svelte v3.38.2 */
    const file$6 = "src/components/edit/EditCategory.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[11] = list[i];
    	return child_ctx;
    }

    // (71:0) {:else}
    function create_else_block$3(ctx) {
    	let p0;
    	let t1;
    	let p1;
    	let t2;
    	let t3;

    	const block = {
    		c: function create() {
    			p0 = element$1("p");
    			p0.textContent = "No data?";
    			t1 = space();
    			p1 = element$1("p");
    			t2 = text$1("category = ");
    			t3 = text$1(/*category*/ ctx[1]);
    			add_location(p0, file$6, 71, 1, 1678);
    			add_location(p1, file$6, 72, 1, 1695);
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
    		i: noop$1,
    		o: noop$1,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(p1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$3.name,
    		type: "else",
    		source: "(71:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (48:0) {#if entries !== undefined}
    function create_if_block$3(ctx) {
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
    	validate_each_keys(ctx, each_value, get_each_context$3, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$3(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$3(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			h3 = element$1("h3");
    			t0 = text$1(/*category*/ ctx[1]);
    			t1 = space();
    			table = element$1("table");
    			tr0 = element$1("tr");
    			th0 = element$1("th");
    			th0.textContent = "Beskrivning";
    			t3 = space();
    			th1 = element$1("th");
    			th1.textContent = "Belopp";
    			t5 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t6 = space();
    			tr1 = element$1("tr");
    			td0 = element$1("td");
    			td0.textContent = "Totalt";
    			t8 = space();
    			td1 = element$1("td");

    			td1.textContent = `${/*total*/ ctx[3] <= -1
			? /*total*/ ctx[3]
			: "+" + /*total*/ ctx[3]}`;

    			t10 = space();
    			button = element$1("button");
    			button.textContent = "Uppdatera";
    			attr_dev(h3, "class", "entries-header");
    			add_location(h3, file$6, 48, 1, 1096);
    			add_location(th0, file$6, 51, 3, 1158);
    			attr_dev(th1, "class", "right");
    			add_location(th1, file$6, 52, 3, 1182);
    			attr_dev(tr0, "class", "svelte-13a5tvb");
    			add_location(tr0, file$6, 50, 2, 1150);
    			add_location(td0, file$6, 65, 3, 1519);
    			attr_dev(td1, "class", "right");
    			add_location(td1, file$6, 66, 3, 1538);
    			attr_dev(tr1, "class", "svelte-13a5tvb");
    			add_location(tr1, file$6, 64, 2, 1511);
    			attr_dev(table, "class", "svelte-13a5tvb");
    			add_location(table, file$6, 49, 1, 1140);
    			add_location(button, file$6, 69, 1, 1616);
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
    				validate_each_keys(ctx, each_value, get_each_context$3, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, table, outro_and_destroy_block, create_each_block$3, t6, get_each_context$3);
    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in$1(each_blocks[i]);
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
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(48:0) {#if entries !== undefined}",
    		ctx
    	});

    	return block;
    }

    // (55:2) {#each sortedEntries as entry (entry.id)}
    function create_each_block$3(key_1, ctx) {
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
    			tr = element$1("tr");
    			create_component(inplaceedit0.$$.fragment);
    			t = space();
    			create_component(inplaceedit1.$$.fragment);
    			attr_dev(tr, "class", "svelte-13a5tvb");
    			add_location(tr, file$6, 55, 3, 1267);
    			this.first = tr;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			mount_component$1(inplaceedit0, tr, null);
    			append_dev(tr, t);
    			mount_component$1(inplaceedit1, tr, null);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in$1(inplaceedit0.$$.fragment, local);
    			transition_in$1(inplaceedit1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(inplaceedit0.$$.fragment, local);
    			transition_out(inplaceedit1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			destroy_component$1(inplaceedit0);
    			destroy_component$1(inplaceedit1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(55:2) {#each sortedEntries as entry (entry.id)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$3, create_else_block$3];
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

    				transition_in$1(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in$1(if_block);
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
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
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
    		init$1(this, options, instance$a, create_fragment$a, safe_not_equal$1, { entries: 0, category: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "EditCategory",
    			options,
    			id: create_fragment$a.name
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

    /* src/components/Budget.svelte generated by Svelte v3.38.2 */
    const file$5 = "src/components/Budget.svelte";

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
    			div = element$1("div");
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			t = space();
    			attr_dev(div, "class", "category svelte-13c2izy");
    			add_location(div, file$5, 27, 1, 888);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (switch_instance) {
    				mount_component$1(switch_instance, div, null);
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
    						destroy_component$1(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));
    					create_component(switch_instance.$$.fragment);
    					transition_in$1(switch_instance.$$.fragment, 1);
    					mount_component$1(switch_instance, div, t);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in$1(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (switch_instance) destroy_component$1(switch_instance);
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

    function create_fragment$9(ctx) {
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
    						transition_in$1(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						transition_in$1(each_blocks[i], 1);
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
    				transition_in$1(each_blocks[i]);
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
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
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
    		init$1(this, options, instance$9, create_fragment$9, safe_not_equal$1, { readOnly: 3, data: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Budget",
    			options,
    			id: create_fragment$9.name
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

    /* src/components/SelectBudget.svelte generated by Svelte v3.38.2 */
    const file$4 = "src/components/SelectBudget.svelte";

    // (1:0) <script lang="ts">import entry from "../controllers/entry"; import Budget from "./Budget.svelte"; export let readOnly; let dateString = new Date().toISOString().slice(0, 10); let data; $: {     data = entry.getSpecificEntries({ date: new Date(dateString) }
    function create_catch_block(ctx) {
    	const block = {
    		c: noop$1,
    		m: noop$1,
    		p: noop$1,
    		i: noop$1,
    		o: noop$1,
    		d: noop$1
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
    			div = element$1("div");
    			h2 = element$1("h2");
    			t0 = text$1("Budget ");
    			input = element$1("input");
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
    			mount_component$1(budget, div, null);
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
    			transition_in$1(budget.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(budget.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component$1(budget);
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
    			p = element$1("p");
    			p.textContent = "Hämtar budgetar";
    			add_location(p, file$4, 12, 2, 318);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		p: noop$1,
    		i: noop$1,
    		o: noop$1,
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

    function create_fragment$8(ctx) {
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
    			div = element$1("div");
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
    				update_await_block_branch(info, ctx, dirty);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in$1(info.block);
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
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
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
    		init$1(this, options, instance$8, create_fragment$8, safe_not_equal$1, { readOnly: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SelectBudget",
    			options,
    			id: create_fragment$8.name
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

    /* src/components/edit/EditBudget.svelte generated by Svelte v3.38.2 */

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
    			mount_component$1(selectbudget, target, anchor);
    			current = true;
    		},
    		p: noop$1,
    		i: function intro(local) {
    			if (current) return;
    			transition_in$1(selectbudget.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(selectbudget.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component$1(selectbudget, detaching);
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

    const readOnly$1 = false;

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("EditBudget", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<EditBudget> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ SelectBudget, readOnly: readOnly$1 });
    	return [];
    }

    class EditBudget extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$1(this, options, instance$7, create_fragment$7, safe_not_equal$1, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "EditBudget",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src/components/read/ViewBudget.svelte generated by Svelte v3.38.2 */

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
    			mount_component$1(selectbudget, target, anchor);
    			current = true;
    		},
    		p: noop$1,
    		i: function intro(local) {
    			if (current) return;
    			transition_in$1(selectbudget.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(selectbudget.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component$1(selectbudget, detaching);
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

    const readOnly = true;

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ViewBudget", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ViewBudget> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ SelectBudget, readOnly });
    	return [];
    }

    class ViewBudget extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$1(this, options, instance$6, create_fragment$6, safe_not_equal$1, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ViewBudget",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop$1) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal$1(value, new_value)) {
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
        function subscribe(run, invalidate = noop$1) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop$1;
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

    /* src/components/create/NewCategory.svelte generated by Svelte v3.38.2 */
    const file$3 = "src/components/create/NewCategory.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[12] = list[i];
    	child_ctx[13] = list;
    	child_ctx[14] = i;
    	return child_ctx;
    }

    // (91:1) {#each entries as entry}
    function create_each_block$1(ctx) {
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
    			div = element$1("div");
    			input0 = element$1("input");
    			t = space();
    			input1 = element$1("input");
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "placeholder", "Beskrivning");
    			attr_dev(input0, "class", "description svelte-1wif1oa");
    			add_location(input0, file$3, 92, 3, 2241);
    			attr_dev(input1, "type", "number");
    			attr_dev(input1, "placeholder", "Belopp");
    			attr_dev(input1, "class", "amount svelte-1wif1oa");
    			add_location(input1, file$3, 97, 3, 2359);
    			attr_dev(div, "class", "entry-container svelte-1wif1oa");
    			add_location(div, file$3, 91, 2, 2208);
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
    			run_all$1(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(91:1) {#each entries as entry}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
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
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			h4 = element$1("h4");
    			t0 = text$1(/*category*/ ctx[1]);
    			t1 = space();
    			form = element$1("form");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			div = element$1("div");
    			input0 = element$1("input");
    			t3 = space();
    			input1 = element$1("input");
    			add_location(h4, file$3, 88, 0, 2105);
    			input0.disabled = true;
    			attr_dev(input0, "type", "text");
    			input0.value = "Totalt";
    			attr_dev(input0, "class", "description svelte-1wif1oa");
    			add_location(input0, file$3, 101, 2, 2496);
    			input1.disabled = true;
    			attr_dev(input1, "type", "number");
    			attr_dev(input1, "class", "amount svelte-1wif1oa");
    			add_location(input1, file$3, 102, 2, 2564);
    			attr_dev(div, "class", "entry-container svelte-1wif1oa");
    			add_location(div, file$3, 100, 1, 2464);
    			add_location(form, file$3, 89, 0, 2125);
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
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
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
    		i: noop$1,
    		o: noop$1,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h4);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(form);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all$1(dispose);
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
    			amount: "-",
    			date: new Date()
    		};

    		$$invalidate(0, entries = [...entries, newEntry]);
    	};

    	onMount(() => {
    		updateTable();
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
    		init$1(this, options, instance$5, create_fragment$5, safe_not_equal$1, { entries: 0, category: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NewCategory",
    			options,
    			id: create_fragment$5.name
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

    /* src/components/create/NewBudget.svelte generated by Svelte v3.38.2 */

    const { console: console_1 } = globals;
    const file$2 = "src/components/create/NewBudget.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	child_ctx[9] = list;
    	child_ctx[10] = i;
    	return child_ctx;
    }

    // (60:1) {:else}
    function create_else_block$2(ctx) {
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
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div0 = element$1("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t0 = space();
    			div1 = element$1("div");
    			label = element$1("label");
    			label.textContent = "Vilken månad gäller budgeten?";
    			t2 = space();
    			input = element$1("input");
    			t3 = space();
    			br = element$1("br");
    			t4 = space();
    			button = element$1("button");
    			button.textContent = "Skicka";
    			attr_dev(div0, "class", "budget-container svelte-mz7exr");
    			add_location(div0, file$2, 60, 2, 1589);
    			attr_dev(label, "for", "date");
    			add_location(label, file$2, 69, 3, 1809);
    			attr_dev(input, "id", "date");
    			attr_dev(input, "class", "input-date svelte-mz7exr");
    			attr_dev(input, "type", "text");
    			add_location(input, file$2, 70, 3, 1868);
    			add_location(br, file$2, 71, 3, 1946);
    			attr_dev(button, "class", "btn waves-effect waves-light indigo");
    			add_location(button, file$2, 72, 3, 1956);
    			attr_dev(div1, "class", "center");
    			add_location(div1, file$2, 68, 2, 1785);
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
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in$1(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in$1(each_blocks[i], 1);
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
    				transition_in$1(each_blocks[i]);
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
    			run_all$1(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(60:1) {:else}",
    		ctx
    	});

    	return block;
    }

    // (58:1) {#if data === undefined}
    function create_if_block$2(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element$1("p");
    			p.textContent = "Hämtar standard raderna...";
    			add_location(p, file$2, 58, 2, 1544);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		p: noop$1,
    		i: noop$1,
    		o: noop$1,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(58:1) {#if data === undefined}",
    		ctx
    	});

    	return block;
    }

    // (62:3) {#each data.categories as category}
    function create_each_block(ctx) {
    	let div;
    	let newcategory;
    	let updating_entries;
    	let t;
    	let current;

    	function newcategory_entries_binding(value) {
    		/*newcategory_entries_binding*/ ctx[4](value, /*category*/ ctx[8]);
    	}

    	let newcategory_props = { category: /*category*/ ctx[8] };

    	if (/*seperated*/ ctx[1][/*category*/ ctx[8]] !== void 0) {
    		newcategory_props.entries = /*seperated*/ ctx[1][/*category*/ ctx[8]];
    	}

    	newcategory = new NewCategory({ props: newcategory_props, $$inline: true });
    	binding_callbacks$1.push(() => bind(newcategory, "entries", newcategory_entries_binding));

    	const block = {
    		c: function create() {
    			div = element$1("div");
    			create_component(newcategory.$$.fragment);
    			t = space();
    			attr_dev(div, "class", "budget svelte-mz7exr");
    			add_location(div, file$2, 62, 4, 1663);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component$1(newcategory, div, null);
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
    			transition_in$1(newcategory.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(newcategory.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component$1(newcategory);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(62:3) {#each data.categories as category}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let div;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	const if_block_creators = [create_if_block$2, create_else_block$2];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*data*/ ctx[2] === undefined) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			div = element$1("div");
    			if_block.c();
    			attr_dev(div, "id", "new-budget-wrapper");
    			attr_dev(div, "class", "svelte-mz7exr");
    			add_location(div, file$2, 56, 0, 1486);
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

    				transition_in$1(if_block, 1);
    				if_block.m(div, null);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in$1(if_block);
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
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
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
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<NewBudget> was created with unknown prop '${key}'`);
    	});

    	function newcategory_entries_binding(value, category) {
    		if ($$self.$$.not_equal(seperated[category], value)) {
    			seperated[category] = value;
    			$$invalidate(1, seperated);
    		}
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
    		init$1(this, options, instance$4, create_fragment$4, safe_not_equal$1, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NewBudget",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    var e=function(t,n){return (e=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t;}||function(e,t){for(var n in t)Object.prototype.hasOwnProperty.call(t,n)&&(e[n]=t[n]);})(t,n)};function t(t,n){if("function"!=typeof n&&null!==n)throw new TypeError("Class extends value "+String(n)+" is not a constructor or null");function r(){this.constructor=t;}e(t,n),t.prototype=null===n?Object.create(n):(r.prototype=n.prototype,new r);}var n=function(){return (n=Object.assign||function(e){for(var t,n=1,r=arguments.length;n<r;n++)for(var o in t=arguments[n])Object.prototype.hasOwnProperty.call(t,o)&&(e[o]=t[o]);return e}).apply(this,arguments)};function r(e,t){var n={};for(var r in e)Object.prototype.hasOwnProperty.call(e,r)&&t.indexOf(r)<0&&(n[r]=e[r]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var o=0;for(r=Object.getOwnPropertySymbols(e);o<r.length;o++)t.indexOf(r[o])<0&&Object.prototype.propertyIsEnumerable.call(e,r[o])&&(n[r[o]]=e[r[o]]);}return n}function o(e,t,n,r){return new(n||(n=Promise))((function(o,i){function a(e){try{s(r.next(e));}catch(e){i(e);}}function c(e){try{s(r.throw(e));}catch(e){i(e);}}function s(e){var t;e.done?o(e.value):(t=e.value,t instanceof n?t:new n((function(e){e(t);}))).then(a,c);}s((r=r.apply(e,t||[])).next());}))}function i(e,t){var n,r,o,i,a={label:0,sent:function(){if(1&o[0])throw o[1];return o[1]},trys:[],ops:[]};return i={next:c(0),throw:c(1),return:c(2)},"function"==typeof Symbol&&(i[Symbol.iterator]=function(){return this}),i;function c(i){return function(c){return function(i){if(n)throw new TypeError("Generator is already executing.");for(;a;)try{if(n=1,r&&(o=2&i[0]?r.return:i[0]?r.throw||((o=r.return)&&o.call(r),0):r.next)&&!(o=o.call(r,i[1])).done)return o;switch(r=0,o&&(i=[2&i[0],o.value]),i[0]){case 0:case 1:o=i;break;case 4:return a.label++,{value:i[1],done:!1};case 5:a.label++,r=i[1],i=[0];continue;case 7:i=a.ops.pop(),a.trys.pop();continue;default:if(!(o=a.trys,(o=o.length>0&&o[o.length-1])||6!==i[0]&&2!==i[0])){a=0;continue}if(3===i[0]&&(!o||i[1]>o[0]&&i[1]<o[3])){a.label=i[1];break}if(6===i[0]&&a.label<o[1]){a.label=o[1],o=i;break}if(o&&a.label<o[2]){a.label=o[2],a.ops.push(i);break}o[2]&&a.ops.pop(),a.trys.pop();continue}i=t.call(e,a);}catch(e){i=[6,e],r=0;}finally{n=o=0;}if(5&i[0])throw i[1];return {value:i[0]?i[1]:void 0,done:!0}}([i,c])}}}var a="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{};function c(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}function s(e,t){return e(t={exports:{}},t.exports),t.exports}var u=function(e){return e&&e.Math==Math&&e},l=u("object"==typeof globalThis&&globalThis)||u("object"==typeof window&&window)||u("object"==typeof self&&self)||u("object"==typeof a&&a)||function(){return this}()||Function("return this")(),f=function(e){try{return !!e()}catch(e){return !0}},d=!f((function(){return 7!=Object.defineProperty({},1,{get:function(){return 7}})[1]})),p={}.propertyIsEnumerable,h=Object.getOwnPropertyDescriptor,y={f:h&&!p.call({1:2},1)?function(e){var t=h(this,e);return !!t&&t.enumerable}:p},v=function(e,t){return {enumerable:!(1&e),configurable:!(2&e),writable:!(4&e),value:t}},m={}.toString,g=function(e){return m.call(e).slice(8,-1)},b="".split,w=f((function(){return !Object("z").propertyIsEnumerable(0)}))?function(e){return "String"==g(e)?b.call(e,""):Object(e)}:Object,S=function(e){if(null==e)throw TypeError("Can't call method on "+e);return e},_=function(e){return w(S(e))},k=function(e){return "object"==typeof e?null!==e:"function"==typeof e},I=function(e,t){if(!k(e))return e;var n,r;if(t&&"function"==typeof(n=e.toString)&&!k(r=n.call(e)))return r;if("function"==typeof(n=e.valueOf)&&!k(r=n.call(e)))return r;if(!t&&"function"==typeof(n=e.toString)&&!k(r=n.call(e)))return r;throw TypeError("Can't convert object to primitive value")},T=function(e){return Object(S(e))},O={}.hasOwnProperty,E=function(e,t){return O.call(T(e),t)},x=l.document,R=k(x)&&k(x.createElement),L=function(e){return R?x.createElement(e):{}},C=!d&&!f((function(){return 7!=Object.defineProperty(L("div"),"a",{get:function(){return 7}}).a})),j=Object.getOwnPropertyDescriptor,U={f:d?j:function(e,t){if(e=_(e),t=I(t,!0),C)try{return j(e,t)}catch(e){}if(E(e,t))return v(!y.f.call(e,t),e[t])}},A=function(e){if(!k(e))throw TypeError(String(e)+" is not an object");return e},P=Object.defineProperty,F={f:d?P:function(e,t,n){if(A(e),t=I(t,!0),A(n),C)try{return P(e,t,n)}catch(e){}if("get"in n||"set"in n)throw TypeError("Accessors not supported");return "value"in n&&(e[t]=n.value),e}},K=d?function(e,t,n){return F.f(e,t,v(1,n))}:function(e,t,n){return e[t]=n,e},W=function(e,t){try{K(l,e,t);}catch(n){l[e]=t;}return t},z=l["__core-js_shared__"]||W("__core-js_shared__",{}),V=Function.toString;"function"!=typeof z.inspectSource&&(z.inspectSource=function(e){return V.call(e)});var Z,X,N,G=z.inspectSource,J=l.WeakMap,D="function"==typeof J&&/native code/.test(G(J)),Y=s((function(e){(e.exports=function(e,t){return z[e]||(z[e]=void 0!==t?t:{})})("versions",[]).push({version:"3.11.0",mode:"global",copyright:"© 2021 Denis Pushkarev (zloirock.ru)"});})),B=0,M=Math.random(),q=function(e){return "Symbol("+String(void 0===e?"":e)+")_"+(++B+M).toString(36)},H=Y("keys"),Q=function(e){return H[e]||(H[e]=q(e))},$={},ee=l.WeakMap;if(D){var te=z.state||(z.state=new ee),ne=te.get,re=te.has,oe=te.set;Z=function(e,t){if(re.call(te,e))throw new TypeError("Object already initialized");return t.facade=e,oe.call(te,e,t),t},X=function(e){return ne.call(te,e)||{}},N=function(e){return re.call(te,e)};}else {var ie=Q("state");$[ie]=!0,Z=function(e,t){if(E(e,ie))throw new TypeError("Object already initialized");return t.facade=e,K(e,ie,t),t},X=function(e){return E(e,ie)?e[ie]:{}},N=function(e){return E(e,ie)};}var ae,ce,se={set:Z,get:X,has:N,enforce:function(e){return N(e)?X(e):Z(e,{})},getterFor:function(e){return function(t){var n;if(!k(t)||(n=X(t)).type!==e)throw TypeError("Incompatible receiver, "+e+" required");return n}}},ue=s((function(e){var t=se.get,n=se.enforce,r=String(String).split("String");(e.exports=function(e,t,o,i){var a,c=!!i&&!!i.unsafe,s=!!i&&!!i.enumerable,u=!!i&&!!i.noTargetGet;"function"==typeof o&&("string"!=typeof t||E(o,"name")||K(o,"name",t),(a=n(o)).source||(a.source=r.join("string"==typeof t?t:""))),e!==l?(c?!u&&e[t]&&(s=!0):delete e[t],s?e[t]=o:K(e,t,o)):s?e[t]=o:W(t,o);})(Function.prototype,"toString",(function(){return "function"==typeof this&&t(this).source||G(this)}));})),le=l,fe=function(e){return "function"==typeof e?e:void 0},de=function(e,t){return arguments.length<2?fe(le[e])||fe(l[e]):le[e]&&le[e][t]||l[e]&&l[e][t]},pe=Math.ceil,he=Math.floor,ye=function(e){return isNaN(e=+e)?0:(e>0?he:pe)(e)},ve=Math.min,me=function(e){return e>0?ve(ye(e),9007199254740991):0},ge=Math.max,be=Math.min,we=function(e){return function(t,n,r){var o,i=_(t),a=me(i.length),c=function(e,t){var n=ye(e);return n<0?ge(n+t,0):be(n,t)}(r,a);if(e&&n!=n){for(;a>c;)if((o=i[c++])!=o)return !0}else for(;a>c;c++)if((e||c in i)&&i[c]===n)return e||c||0;return !e&&-1}},Se={includes:we(!0),indexOf:we(!1)},_e=Se.indexOf,ke=function(e,t){var n,r=_(e),o=0,i=[];for(n in r)!E($,n)&&E(r,n)&&i.push(n);for(;t.length>o;)E(r,n=t[o++])&&(~_e(i,n)||i.push(n));return i},Ie=["constructor","hasOwnProperty","isPrototypeOf","propertyIsEnumerable","toLocaleString","toString","valueOf"],Te=Ie.concat("length","prototype"),Oe={f:Object.getOwnPropertyNames||function(e){return ke(e,Te)}},Ee={f:Object.getOwnPropertySymbols},xe=de("Reflect","ownKeys")||function(e){var t=Oe.f(A(e)),n=Ee.f;return n?t.concat(n(e)):t},Re=function(e,t){for(var n=xe(t),r=F.f,o=U.f,i=0;i<n.length;i++){var a=n[i];E(e,a)||r(e,a,o(t,a));}},Le=/#|\.prototype\./,Ce=function(e,t){var n=Ue[je(e)];return n==Pe||n!=Ae&&("function"==typeof t?f(t):!!t)},je=Ce.normalize=function(e){return String(e).replace(Le,".").toLowerCase()},Ue=Ce.data={},Ae=Ce.NATIVE="N",Pe=Ce.POLYFILL="P",Fe=Ce,Ke=U.f,We=function(e,t){var n,r,o,i,a,c=e.target,s=e.global,u=e.stat;if(n=s?l:u?l[c]||W(c,{}):(l[c]||{}).prototype)for(r in t){if(i=t[r],o=e.noTargetGet?(a=Ke(n,r))&&a.value:n[r],!Fe(s?r:c+(u?".":"#")+r,e.forced)&&void 0!==o){if(typeof i==typeof o)continue;Re(i,o);}(e.sham||o&&o.sham)&&K(i,"sham",!0),ue(n,r,i,e);}},ze="process"==g(l.process),Ve=de("navigator","userAgent")||"",Ze=l.process,Xe=Ze&&Ze.versions,Ne=Xe&&Xe.v8;Ne?ce=(ae=Ne.split("."))[0]+ae[1]:Ve&&(!(ae=Ve.match(/Edge\/(\d+)/))||ae[1]>=74)&&(ae=Ve.match(/Chrome\/(\d+)/))&&(ce=ae[1]);var Ge,Je=ce&&+ce,De=!!Object.getOwnPropertySymbols&&!f((function(){return !Symbol.sham&&(ze?38===Je:Je>37&&Je<41)})),Ye=De&&!Symbol.sham&&"symbol"==typeof Symbol.iterator,Be=Y("wks"),Me=l.Symbol,qe=Ye?Me:Me&&Me.withoutSetter||q,He=function(e){return E(Be,e)&&(De||"string"==typeof Be[e])||(De&&E(Me,e)?Be[e]=Me[e]:Be[e]=qe("Symbol."+e)),Be[e]},Qe=He("match"),$e=function(e){if(function(e){var t;return k(e)&&(void 0!==(t=e[Qe])?!!t:"RegExp"==g(e))}(e))throw TypeError("The method doesn't accept regular expressions");return e},et=He("match"),tt=function(e){var t=/./;try{"/./"[e](t);}catch(n){try{return t[et]=!1,"/./"[e](t)}catch(e){}}return !1},nt=U.f,rt="".startsWith,ot=Math.min,it=tt("startsWith"),at=!(it||(Ge=nt(String.prototype,"startsWith"),!Ge||Ge.writable));We({target:"String",proto:!0,forced:!at&&!it},{startsWith:function(e){var t=String(S(this));$e(e);var n=me(ot(arguments.length>1?arguments[1]:void 0,t.length)),r=String(e);return rt?rt.call(t,r,n):t.slice(n,n+r.length)===r}});var ct=function(e){if("function"!=typeof e)throw TypeError(String(e)+" is not a function");return e},st=function(e,t,n){if(ct(e),void 0===t)return e;switch(n){case 0:return function(){return e.call(t)};case 1:return function(n){return e.call(t,n)};case 2:return function(n,r){return e.call(t,n,r)};case 3:return function(n,r,o){return e.call(t,n,r,o)}}return function(){return e.apply(t,arguments)}},ut=Function.call,lt=function(e,t,n){return st(ut,l[e].prototype[t],n)};lt("String","startsWith");var ft=Array.isArray||function(e){return "Array"==g(e)},dt=function(e,t,n){var r=I(t);r in e?F.f(e,r,v(0,n)):e[r]=n;},pt=He("species"),ht=function(e,t){var n;return ft(e)&&("function"!=typeof(n=e.constructor)||n!==Array&&!ft(n.prototype)?k(n)&&null===(n=n[pt])&&(n=void 0):n=void 0),new(void 0===n?Array:n)(0===t?0:t)},yt=He("species"),vt=He("isConcatSpreadable"),mt=Je>=51||!f((function(){var e=[];return e[vt]=!1,e.concat()[0]!==e})),gt=function(e){return Je>=51||!f((function(){var t=[];return (t.constructor={})[yt]=function(){return {foo:1}},1!==t[e](Boolean).foo}))}("concat"),bt=function(e){if(!k(e))return !1;var t=e[vt];return void 0!==t?!!t:ft(e)};We({target:"Array",proto:!0,forced:!mt||!gt},{concat:function(e){var t,n,r,o,i,a=T(this),c=ht(a,0),s=0;for(t=-1,r=arguments.length;t<r;t++)if(bt(i=-1===t?a:arguments[t])){if(s+(o=me(i.length))>9007199254740991)throw TypeError("Maximum allowed index exceeded");for(n=0;n<o;n++,s++)n in i&&dt(c,s,i[n]);}else {if(s>=9007199254740991)throw TypeError("Maximum allowed index exceeded");dt(c,s++,i);}return c.length=s,c}});var wt={};wt[He("toStringTag")]="z";var St="[object z]"===String(wt),_t=He("toStringTag"),kt="Arguments"==g(function(){return arguments}()),It=St?g:function(e){var t,n,r;return void 0===e?"Undefined":null===e?"Null":"string"==typeof(n=function(e,t){try{return e[t]}catch(e){}}(t=Object(e),_t))?n:kt?g(t):"Object"==(r=g(t))&&"function"==typeof t.callee?"Arguments":r},Tt=St?{}.toString:function(){return "[object "+It(this)+"]"};St||ue(Object.prototype,"toString",Tt,{unsafe:!0});var Ot,Et=Object.keys||function(e){return ke(e,Ie)},xt=d?Object.defineProperties:function(e,t){A(e);for(var n,r=Et(t),o=r.length,i=0;o>i;)F.f(e,n=r[i++],t[n]);return e},Rt=de("document","documentElement"),Lt=Q("IE_PROTO"),Ct=function(){},jt=function(e){return "<script>"+e+"<\/script>"},Ut=function(){try{Ot=document.domain&&new ActiveXObject("htmlfile");}catch(e){}var e,t;Ut=Ot?function(e){e.write(jt("")),e.close();var t=e.parentWindow.Object;return e=null,t}(Ot):((t=L("iframe")).style.display="none",Rt.appendChild(t),t.src=String("javascript:"),(e=t.contentWindow.document).open(),e.write(jt("document.F=Object")),e.close(),e.F);for(var n=Ie.length;n--;)delete Ut.prototype[Ie[n]];return Ut()};$[Lt]=!0;var At=Object.create||function(e,t){var n;return null!==e?(Ct.prototype=A(e),n=new Ct,Ct.prototype=null,n[Lt]=e):n=Ut(),void 0===t?n:xt(n,t)},Pt=Oe.f,Ft={}.toString,Kt="object"==typeof window&&window&&Object.getOwnPropertyNames?Object.getOwnPropertyNames(window):[],Wt={f:function(e){return Kt&&"[object Window]"==Ft.call(e)?function(e){try{return Pt(e)}catch(e){return Kt.slice()}}(e):Pt(_(e))}},zt={f:He},Vt=F.f,Zt=function(e){var t=le.Symbol||(le.Symbol={});E(t,e)||Vt(t,e,{value:zt.f(e)});},Xt=F.f,Nt=He("toStringTag"),Gt=function(e,t,n){e&&!E(e=n?e:e.prototype,Nt)&&Xt(e,Nt,{configurable:!0,value:t});},Jt=[].push,Dt=function(e){var t=1==e,n=2==e,r=3==e,o=4==e,i=6==e,a=7==e,c=5==e||i;return function(s,u,l,f){for(var d,p,h=T(s),y=w(h),v=st(u,l,3),m=me(y.length),g=0,b=f||ht,S=t?b(s,m):n||a?b(s,0):void 0;m>g;g++)if((c||g in y)&&(p=v(d=y[g],g,h),e))if(t)S[g]=p;else if(p)switch(e){case 3:return !0;case 5:return d;case 6:return g;case 2:Jt.call(S,d);}else switch(e){case 4:return !1;case 7:Jt.call(S,d);}return i?-1:r||o?o:S}},Yt={forEach:Dt(0),map:Dt(1),filter:Dt(2),some:Dt(3),every:Dt(4),find:Dt(5),findIndex:Dt(6),filterOut:Dt(7)}.forEach,Bt=Q("hidden"),Mt=He("toPrimitive"),qt=se.set,Ht=se.getterFor("Symbol"),Qt=Object.prototype,$t=l.Symbol,en=de("JSON","stringify"),tn=U.f,nn=F.f,rn=Wt.f,on=y.f,an=Y("symbols"),cn=Y("op-symbols"),sn=Y("string-to-symbol-registry"),un=Y("symbol-to-string-registry"),ln=Y("wks"),fn=l.QObject,dn=!fn||!fn.prototype||!fn.prototype.findChild,pn=d&&f((function(){return 7!=At(nn({},"a",{get:function(){return nn(this,"a",{value:7}).a}})).a}))?function(e,t,n){var r=tn(Qt,t);r&&delete Qt[t],nn(e,t,n),r&&e!==Qt&&nn(Qt,t,r);}:nn,hn=function(e,t){var n=an[e]=At($t.prototype);return qt(n,{type:"Symbol",tag:e,description:t}),d||(n.description=t),n},yn=Ye?function(e){return "symbol"==typeof e}:function(e){return Object(e)instanceof $t},vn=function(e,t,n){e===Qt&&vn(cn,t,n),A(e);var r=I(t,!0);return A(n),E(an,r)?(n.enumerable?(E(e,Bt)&&e[Bt][r]&&(e[Bt][r]=!1),n=At(n,{enumerable:v(0,!1)})):(E(e,Bt)||nn(e,Bt,v(1,{})),e[Bt][r]=!0),pn(e,r,n)):nn(e,r,n)},mn=function(e,t){A(e);var n=_(t),r=Et(n).concat(Sn(n));return Yt(r,(function(t){d&&!gn.call(n,t)||vn(e,t,n[t]);})),e},gn=function(e){var t=I(e,!0),n=on.call(this,t);return !(this===Qt&&E(an,t)&&!E(cn,t))&&(!(n||!E(this,t)||!E(an,t)||E(this,Bt)&&this[Bt][t])||n)},bn=function(e,t){var n=_(e),r=I(t,!0);if(n!==Qt||!E(an,r)||E(cn,r)){var o=tn(n,r);return !o||!E(an,r)||E(n,Bt)&&n[Bt][r]||(o.enumerable=!0),o}},wn=function(e){var t=rn(_(e)),n=[];return Yt(t,(function(e){E(an,e)||E($,e)||n.push(e);})),n},Sn=function(e){var t=e===Qt,n=rn(t?cn:_(e)),r=[];return Yt(n,(function(e){!E(an,e)||t&&!E(Qt,e)||r.push(an[e]);})),r};if(De||(ue(($t=function(){if(this instanceof $t)throw TypeError("Symbol is not a constructor");var e=arguments.length&&void 0!==arguments[0]?String(arguments[0]):void 0,t=q(e),n=function(e){this===Qt&&n.call(cn,e),E(this,Bt)&&E(this[Bt],t)&&(this[Bt][t]=!1),pn(this,t,v(1,e));};return d&&dn&&pn(Qt,t,{configurable:!0,set:n}),hn(t,e)}).prototype,"toString",(function(){return Ht(this).tag})),ue($t,"withoutSetter",(function(e){return hn(q(e),e)})),y.f=gn,F.f=vn,U.f=bn,Oe.f=Wt.f=wn,Ee.f=Sn,zt.f=function(e){return hn(He(e),e)},d&&(nn($t.prototype,"description",{configurable:!0,get:function(){return Ht(this).description}}),ue(Qt,"propertyIsEnumerable",gn,{unsafe:!0}))),We({global:!0,wrap:!0,forced:!De,sham:!De},{Symbol:$t}),Yt(Et(ln),(function(e){Zt(e);})),We({target:"Symbol",stat:!0,forced:!De},{for:function(e){var t=String(e);if(E(sn,t))return sn[t];var n=$t(t);return sn[t]=n,un[n]=t,n},keyFor:function(e){if(!yn(e))throw TypeError(e+" is not a symbol");if(E(un,e))return un[e]},useSetter:function(){dn=!0;},useSimple:function(){dn=!1;}}),We({target:"Object",stat:!0,forced:!De,sham:!d},{create:function(e,t){return void 0===t?At(e):mn(At(e),t)},defineProperty:vn,defineProperties:mn,getOwnPropertyDescriptor:bn}),We({target:"Object",stat:!0,forced:!De},{getOwnPropertyNames:wn,getOwnPropertySymbols:Sn}),We({target:"Object",stat:!0,forced:f((function(){Ee.f(1);}))},{getOwnPropertySymbols:function(e){return Ee.f(T(e))}}),en){var _n=!De||f((function(){var e=$t();return "[null]"!=en([e])||"{}"!=en({a:e})||"{}"!=en(Object(e))}));We({target:"JSON",stat:!0,forced:_n},{stringify:function(e,t,n){for(var r,o=[e],i=1;arguments.length>i;)o.push(arguments[i++]);if(r=t,(k(t)||void 0!==e)&&!yn(e))return ft(t)||(t=function(e,t){if("function"==typeof r&&(t=r.call(this,e,t)),!yn(t))return t}),o[1]=t,en.apply(null,o)}});}$t.prototype[Mt]||K($t.prototype,Mt,$t.prototype.valueOf),Gt($t,"Symbol"),$[Bt]=!0,Zt("asyncIterator");var kn=F.f,In=l.Symbol;if(d&&"function"==typeof In&&(!("description"in In.prototype)||void 0!==In().description)){var Tn={},On=function(){var e=arguments.length<1||void 0===arguments[0]?void 0:String(arguments[0]),t=this instanceof On?new In(e):void 0===e?In():In(e);return ""===e&&(Tn[t]=!0),t};Re(On,In);var En=On.prototype=In.prototype;En.constructor=On;var xn=En.toString,Rn="Symbol(test)"==String(In("test")),Ln=/^Symbol\((.*)\)[^)]+$/;kn(En,"description",{configurable:!0,get:function(){var e=k(this)?this.valueOf():this,t=xn.call(e);if(E(Tn,e))return "";var n=Rn?t.slice(7,-1):t.replace(Ln,"$1");return ""===n?void 0:n}}),We({global:!0,forced:!0},{Symbol:On});}Zt("hasInstance"),Zt("isConcatSpreadable"),Zt("iterator"),Zt("match"),Zt("matchAll"),Zt("replace"),Zt("search"),Zt("species"),Zt("split"),Zt("toPrimitive"),Zt("toStringTag"),Zt("unscopables"),Gt(l.JSON,"JSON",!0),Gt(Math,"Math",!0),We({global:!0},{Reflect:{}}),Gt(l.Reflect,"Reflect",!0),le.Symbol;var Cn,jn,Un,An=function(e){return function(t,n){var r,o,i=String(S(t)),a=ye(n),c=i.length;return a<0||a>=c?e?"":void 0:(r=i.charCodeAt(a))<55296||r>56319||a+1===c||(o=i.charCodeAt(a+1))<56320||o>57343?e?i.charAt(a):r:e?i.slice(a,a+2):o-56320+(r-55296<<10)+65536}},Pn={codeAt:An(!1),charAt:An(!0)},Fn=!f((function(){function e(){}return e.prototype.constructor=null,Object.getPrototypeOf(new e)!==e.prototype})),Kn=Q("IE_PROTO"),Wn=Object.prototype,zn=Fn?Object.getPrototypeOf:function(e){return e=T(e),E(e,Kn)?e[Kn]:"function"==typeof e.constructor&&e instanceof e.constructor?e.constructor.prototype:e instanceof Object?Wn:null},Vn=He("iterator"),Zn=!1;[].keys&&("next"in(Un=[].keys())?(jn=zn(zn(Un)))!==Object.prototype&&(Cn=jn):Zn=!0),(null==Cn||f((function(){var e={};return Cn[Vn].call(e)!==e})))&&(Cn={}),E(Cn,Vn)||K(Cn,Vn,(function(){return this}));var Xn={IteratorPrototype:Cn,BUGGY_SAFARI_ITERATORS:Zn},Nn={},Gn=Xn.IteratorPrototype,Jn=function(){return this},Dn=Object.setPrototypeOf||("__proto__"in{}?function(){var e,t=!1,n={};try{(e=Object.getOwnPropertyDescriptor(Object.prototype,"__proto__").set).call(n,[]),t=n instanceof Array;}catch(e){}return function(n,r){return A(n),function(e){if(!k(e)&&null!==e)throw TypeError("Can't set "+String(e)+" as a prototype")}(r),t?e.call(n,r):n.__proto__=r,n}}():void 0),Yn=Xn.IteratorPrototype,Bn=Xn.BUGGY_SAFARI_ITERATORS,Mn=He("iterator"),qn=function(){return this},Hn=function(e,t,n,r,o,i,a){!function(e,t,n){var r=t+" Iterator";e.prototype=At(Gn,{next:v(1,n)}),Gt(e,r,!1),Nn[r]=Jn;}(n,t,r);var c,s,u,l=function(e){if(e===o&&y)return y;if(!Bn&&e in p)return p[e];switch(e){case"keys":case"values":case"entries":return function(){return new n(this,e)}}return function(){return new n(this)}},f=t+" Iterator",d=!1,p=e.prototype,h=p[Mn]||p["@@iterator"]||o&&p[o],y=!Bn&&h||l(o),m="Array"==t&&p.entries||h;if(m&&(c=zn(m.call(new e)),Yn!==Object.prototype&&c.next&&(zn(c)!==Yn&&(Dn?Dn(c,Yn):"function"!=typeof c[Mn]&&K(c,Mn,qn)),Gt(c,f,!0))),"values"==o&&h&&"values"!==h.name&&(d=!0,y=function(){return h.call(this)}),p[Mn]!==y&&K(p,Mn,y),Nn[t]=y,o)if(s={values:l("values"),keys:i?y:l("keys"),entries:l("entries")},a)for(u in s)(Bn||d||!(u in p))&&ue(p,u,s[u]);else We({target:t,proto:!0,forced:Bn||d},s);return s},Qn=Pn.charAt,$n=se.set,er=se.getterFor("String Iterator");Hn(String,"String",(function(e){$n(this,{type:"String Iterator",string:String(e),index:0});}),(function(){var e,t=er(this),n=t.string,r=t.index;return r>=n.length?{value:void 0,done:!0}:(e=Qn(n,r),t.index+=e.length,{value:e,done:!1})}));var tr=function(e){var t=e.return;if(void 0!==t)return A(t.call(e)).value},nr=function(e,t,n,r){try{return r?t(A(n)[0],n[1]):t(n)}catch(t){throw tr(e),t}},rr=He("iterator"),or=Array.prototype,ir=function(e){return void 0!==e&&(Nn.Array===e||or[rr]===e)},ar=He("iterator"),cr=function(e){if(null!=e)return e[ar]||e["@@iterator"]||Nn[It(e)]},sr=He("iterator"),ur=!1;try{var lr=0,fr={next:function(){return {done:!!lr++}},return:function(){ur=!0;}};fr[sr]=function(){return this},Array.from(fr,(function(){throw 2}));}catch(e){}var dr=function(e,t){if(!t&&!ur)return !1;var n=!1;try{var r={};r[sr]=function(){return {next:function(){return {done:n=!0}}}},e(r);}catch(e){}return n},pr=!dr((function(e){Array.from(e);}));We({target:"Array",stat:!0,forced:pr},{from:function(e){var t,n,r,o,i,a,c=T(e),s="function"==typeof this?this:Array,u=arguments.length,l=u>1?arguments[1]:void 0,f=void 0!==l,d=cr(c),p=0;if(f&&(l=st(l,u>2?arguments[2]:void 0,2)),null==d||s==Array&&ir(d))for(n=new s(t=me(c.length));t>p;p++)a=f?l(c[p],p):c[p],dt(n,p,a);else for(i=(o=d.call(c)).next,n=new s;!(r=i.call(o)).done;p++)a=f?nr(o,l,[r.value,p],!0):r.value,dt(n,p,a);return n.length=p,n}}),le.Array.from;var hr,yr="undefined"!=typeof ArrayBuffer&&"undefined"!=typeof DataView,vr=F.f,mr=l.Int8Array,gr=mr&&mr.prototype,br=l.Uint8ClampedArray,wr=br&&br.prototype,Sr=mr&&zn(mr),_r=gr&&zn(gr),kr=Object.prototype,Ir=kr.isPrototypeOf,Tr=He("toStringTag"),Or=q("TYPED_ARRAY_TAG"),Er=yr&&!!Dn&&"Opera"!==It(l.opera),xr={Int8Array:1,Uint8Array:1,Uint8ClampedArray:1,Int16Array:2,Uint16Array:2,Int32Array:4,Uint32Array:4,Float32Array:4,Float64Array:8},Rr={BigInt64Array:8,BigUint64Array:8},Lr=function(e){if(!k(e))return !1;var t=It(e);return E(xr,t)||E(Rr,t)};for(hr in xr)l[hr]||(Er=!1);if((!Er||"function"!=typeof Sr||Sr===Function.prototype)&&(Sr=function(){throw TypeError("Incorrect invocation")},Er))for(hr in xr)l[hr]&&Dn(l[hr],Sr);if((!Er||!_r||_r===kr)&&(_r=Sr.prototype,Er))for(hr in xr)l[hr]&&Dn(l[hr].prototype,_r);if(Er&&zn(wr)!==_r&&Dn(wr,_r),d&&!E(_r,Tr))for(hr in vr(_r,Tr,{get:function(){return k(this)?this[Or]:void 0}}),xr)l[hr]&&K(l[hr],Or,hr);var Cr=function(e){if(Lr(e))return e;throw TypeError("Target is not a typed array")},jr=function(e){if(Dn){if(Ir.call(Sr,e))return e}else for(var t in xr)if(E(xr,hr)){var n=l[t];if(n&&(e===n||Ir.call(n,e)))return e}throw TypeError("Target is not a typed array constructor")},Ur=function(e,t,n){if(d){if(n)for(var r in xr){var o=l[r];o&&E(o.prototype,e)&&delete o.prototype[e];}_r[e]&&!n||ue(_r,e,n?t:Er&&gr[e]||t);}},Ar=He("species"),Pr=Cr,Fr=jr,Kr=[].slice;Ur("slice",(function(e,t){for(var n=Kr.call(Pr(this),e,t),r=function(e,t){var n,r=A(e).constructor;return void 0===r||null==(n=A(r)[Ar])?t:ct(n)}(this,this.constructor),o=0,i=n.length,a=new(Fr(r))(i);i>o;)a[o]=n[o++];return a}),f((function(){new Int8Array(1).slice();})));var Wr=He("unscopables"),zr=Array.prototype;null==zr[Wr]&&F.f(zr,Wr,{configurable:!0,value:At(null)});var Vr=function(e){zr[Wr][e]=!0;},Zr=Se.includes;We({target:"Array",proto:!0},{includes:function(e){return Zr(this,e,arguments.length>1?arguments[1]:void 0)}}),Vr("includes"),lt("Array","includes"),We({target:"String",proto:!0,forced:!tt("includes")},{includes:function(e){return !!~String(S(this)).indexOf($e(e),arguments.length>1?arguments[1]:void 0)}}),lt("String","includes");var Xr=!f((function(){return Object.isExtensible(Object.preventExtensions({}))})),Nr=s((function(e){var t=F.f,n=q("meta"),r=0,o=Object.isExtensible||function(){return !0},i=function(e){t(e,n,{value:{objectID:"O"+ ++r,weakData:{}}});},a=e.exports={REQUIRED:!1,fastKey:function(e,t){if(!k(e))return "symbol"==typeof e?e:("string"==typeof e?"S":"P")+e;if(!E(e,n)){if(!o(e))return "F";if(!t)return "E";i(e);}return e[n].objectID},getWeakData:function(e,t){if(!E(e,n)){if(!o(e))return !0;if(!t)return !1;i(e);}return e[n].weakData},onFreeze:function(e){return Xr&&a.REQUIRED&&o(e)&&!E(e,n)&&i(e),e}};$[n]=!0;}));Nr.REQUIRED,Nr.fastKey,Nr.getWeakData,Nr.onFreeze;var Gr=function(e,t){this.stopped=e,this.result=t;},Jr=function(e,t,n){var r,o,i,a,c,s,u,l=n&&n.that,f=!(!n||!n.AS_ENTRIES),d=!(!n||!n.IS_ITERATOR),p=!(!n||!n.INTERRUPTED),h=st(t,l,1+f+p),y=function(e){return r&&tr(r),new Gr(!0,e)},v=function(e){return f?(A(e),p?h(e[0],e[1],y):h(e[0],e[1])):p?h(e,y):h(e)};if(d)r=e;else {if("function"!=typeof(o=cr(e)))throw TypeError("Target is not iterable");if(ir(o)){for(i=0,a=me(e.length);a>i;i++)if((c=v(e[i]))&&c instanceof Gr)return c;return new Gr(!1)}r=o.call(e);}for(s=r.next;!(u=s.call(r)).done;){try{c=v(u.value);}catch(e){throw tr(r),e}if("object"==typeof c&&c&&c instanceof Gr)return c}return new Gr(!1)},Dr=function(e,t,n){if(!(e instanceof t))throw TypeError("Incorrect "+(n?n+" ":"")+"invocation");return e},Yr=function(e,t,n){for(var r in t)ue(e,r,t[r],n);return e},Br=He("species"),Mr=F.f,qr=Nr.fastKey,Hr=se.set,Qr=se.getterFor;!function(e,t,n){var r=-1!==e.indexOf("Map"),o=-1!==e.indexOf("Weak"),i=r?"set":"add",a=l[e],c=a&&a.prototype,s=a,u={},d=function(e){var t=c[e];ue(c,e,"add"==e?function(e){return t.call(this,0===e?0:e),this}:"delete"==e?function(e){return !(o&&!k(e))&&t.call(this,0===e?0:e)}:"get"==e?function(e){return o&&!k(e)?void 0:t.call(this,0===e?0:e)}:"has"==e?function(e){return !(o&&!k(e))&&t.call(this,0===e?0:e)}:function(e,n){return t.call(this,0===e?0:e,n),this});};if(Fe(e,"function"!=typeof a||!(o||c.forEach&&!f((function(){(new a).entries().next();})))))s=n.getConstructor(t,e,r,i),Nr.REQUIRED=!0;else if(Fe(e,!0)){var p=new s,h=p[i](o?{}:-0,1)!=p,y=f((function(){p.has(1);})),v=dr((function(e){new a(e);})),m=!o&&f((function(){for(var e=new a,t=5;t--;)e[i](t,t);return !e.has(-0)}));v||((s=t((function(t,n){Dr(t,s,e);var o=function(e,t,n){var r,o;return Dn&&"function"==typeof(r=t.constructor)&&r!==n&&k(o=r.prototype)&&o!==n.prototype&&Dn(e,o),e}(new a,t,s);return null!=n&&Jr(n,o[i],{that:o,AS_ENTRIES:r}),o}))).prototype=c,c.constructor=s),(y||m)&&(d("delete"),d("has"),r&&d("get")),(m||h)&&d(i),o&&c.clear&&delete c.clear;}u[e]=s,We({global:!0,forced:s!=a},u),Gt(s,e),o||n.setStrong(s,e,r);}("Set",(function(e){return function(){return e(this,arguments.length?arguments[0]:void 0)}}),{getConstructor:function(e,t,n,r){var o=e((function(e,i){Dr(e,o,t),Hr(e,{type:t,index:At(null),first:void 0,last:void 0,size:0}),d||(e.size=0),null!=i&&Jr(i,e[r],{that:e,AS_ENTRIES:n});})),i=Qr(t),a=function(e,t,n){var r,o,a=i(e),s=c(e,t);return s?s.value=n:(a.last=s={index:o=qr(t,!0),key:t,value:n,previous:r=a.last,next:void 0,removed:!1},a.first||(a.first=s),r&&(r.next=s),d?a.size++:e.size++,"F"!==o&&(a.index[o]=s)),e},c=function(e,t){var n,r=i(e),o=qr(t);if("F"!==o)return r.index[o];for(n=r.first;n;n=n.next)if(n.key==t)return n};return Yr(o.prototype,{clear:function(){for(var e=i(this),t=e.index,n=e.first;n;)n.removed=!0,n.previous&&(n.previous=n.previous.next=void 0),delete t[n.index],n=n.next;e.first=e.last=void 0,d?e.size=0:this.size=0;},delete:function(e){var t=this,n=i(t),r=c(t,e);if(r){var o=r.next,a=r.previous;delete n.index[r.index],r.removed=!0,a&&(a.next=o),o&&(o.previous=a),n.first==r&&(n.first=o),n.last==r&&(n.last=a),d?n.size--:t.size--;}return !!r},forEach:function(e){for(var t,n=i(this),r=st(e,arguments.length>1?arguments[1]:void 0,3);t=t?t.next:n.first;)for(r(t.value,t.key,this);t&&t.removed;)t=t.previous;},has:function(e){return !!c(this,e)}}),Yr(o.prototype,n?{get:function(e){var t=c(this,e);return t&&t.value},set:function(e,t){return a(this,0===e?0:e,t)}}:{add:function(e){return a(this,e=0===e?0:e,e)}}),d&&Mr(o.prototype,"size",{get:function(){return i(this).size}}),o},setStrong:function(e,t,n){var r=t+" Iterator",o=Qr(t),i=Qr(r);Hn(e,t,(function(e,t){Hr(this,{type:r,target:e,state:o(e),kind:t,last:void 0});}),(function(){for(var e=i(this),t=e.kind,n=e.last;n&&n.removed;)n=n.previous;return e.target&&(e.last=n=n?n.next:e.state.first)?"keys"==t?{value:n.key,done:!1}:"values"==t?{value:n.value,done:!1}:{value:[n.key,n.value],done:!1}:(e.target=void 0,{value:void 0,done:!0})}),n?"entries":"values",!n,!0),function(e){var t=de(e),n=F.f;d&&t&&!t[Br]&&n(t,Br,{configurable:!0,get:function(){return this}});}(t);}});var $r={CSSRuleList:0,CSSStyleDeclaration:0,CSSValueList:0,ClientRectList:0,DOMRectList:0,DOMStringList:0,DOMTokenList:1,DataTransferItemList:0,FileList:0,HTMLAllCollection:0,HTMLCollection:0,HTMLFormElement:0,HTMLSelectElement:0,MediaList:0,MimeTypeArray:0,NamedNodeMap:0,NodeList:1,PaintRequestList:0,Plugin:0,PluginArray:0,SVGLengthList:0,SVGNumberList:0,SVGPathSegList:0,SVGPointList:0,SVGStringList:0,SVGTransformList:0,SourceBufferList:0,StyleSheetList:0,TextTrackCueList:0,TextTrackList:0,TouchList:0},eo=se.set,to=se.getterFor("Array Iterator"),no=Hn(Array,"Array",(function(e,t){eo(this,{type:"Array Iterator",target:_(e),index:0,kind:t});}),(function(){var e=to(this),t=e.target,n=e.kind,r=e.index++;return !t||r>=t.length?(e.target=void 0,{value:void 0,done:!0}):"keys"==n?{value:r,done:!1}:"values"==n?{value:t[r],done:!1}:{value:[r,t[r]],done:!1}}),"values");Nn.Arguments=Nn.Array,Vr("keys"),Vr("values"),Vr("entries");var ro=He("iterator"),oo=He("toStringTag"),io=no.values;for(var ao in $r){var co=l[ao],so=co&&co.prototype;if(so){if(so[ro]!==io)try{K(so,ro,io);}catch(e){so[ro]=io;}if(so[oo]||K(so,oo,ao),$r[ao])for(var uo in no)if(so[uo]!==no[uo])try{K(so,uo,no[uo]);}catch(e){so[uo]=no[uo];}}}function lo(e){var t=this.constructor;return this.then((function(n){return t.resolve(e()).then((function(){return n}))}),(function(n){return t.resolve(e()).then((function(){return t.reject(n)}))}))}function fo(e){return new this((function(t,n){if(!e||void 0===e.length)return n(new TypeError(typeof e+" "+e+" is not iterable(cannot read property Symbol(Symbol.iterator))"));var r=Array.prototype.slice.call(e);if(0===r.length)return t([]);var o=r.length;function i(e,n){if(n&&("object"==typeof n||"function"==typeof n)){var a=n.then;if("function"==typeof a)return void a.call(n,(function(t){i(e,t);}),(function(n){r[e]={status:"rejected",reason:n},0==--o&&t(r);}))}r[e]={status:"fulfilled",value:n},0==--o&&t(r);}for(var a=0;a<r.length;a++)i(a,r[a]);}))}le.Set;var po=setTimeout;function ho(e){return Boolean(e&&void 0!==e.length)}function yo(){}function vo(e){if(!(this instanceof vo))throw new TypeError("Promises must be constructed via new");if("function"!=typeof e)throw new TypeError("not a function");this._state=0,this._handled=!1,this._value=void 0,this._deferreds=[],_o(e,this);}function mo(e,t){for(;3===e._state;)e=e._value;0!==e._state?(e._handled=!0,vo._immediateFn((function(){var n=1===e._state?t.onFulfilled:t.onRejected;if(null!==n){var r;try{r=n(e._value);}catch(e){return void bo(t.promise,e)}go(t.promise,r);}else (1===e._state?go:bo)(t.promise,e._value);}))):e._deferreds.push(t);}function go(e,t){try{if(t===e)throw new TypeError("A promise cannot be resolved with itself.");if(t&&("object"==typeof t||"function"==typeof t)){var n=t.then;if(t instanceof vo)return e._state=3,e._value=t,void wo(e);if("function"==typeof n)return void _o((r=n,o=t,function(){r.apply(o,arguments);}),e)}e._state=1,e._value=t,wo(e);}catch(t){bo(e,t);}var r,o;}function bo(e,t){e._state=2,e._value=t,wo(e);}function wo(e){2===e._state&&0===e._deferreds.length&&vo._immediateFn((function(){e._handled||vo._unhandledRejectionFn(e._value);}));for(var t=0,n=e._deferreds.length;t<n;t++)mo(e,e._deferreds[t]);e._deferreds=null;}function So(e,t,n){this.onFulfilled="function"==typeof e?e:null,this.onRejected="function"==typeof t?t:null,this.promise=n;}function _o(e,t){var n=!1;try{e((function(e){n||(n=!0,go(t,e));}),(function(e){n||(n=!0,bo(t,e));}));}catch(e){if(n)return;n=!0,bo(t,e);}}vo.prototype.catch=function(e){return this.then(null,e)},vo.prototype.then=function(e,t){var n=new this.constructor(yo);return mo(this,new So(e,t,n)),n},vo.prototype.finally=lo,vo.all=function(e){return new vo((function(t,n){if(!ho(e))return n(new TypeError("Promise.all accepts an array"));var r=Array.prototype.slice.call(e);if(0===r.length)return t([]);var o=r.length;function i(e,a){try{if(a&&("object"==typeof a||"function"==typeof a)){var c=a.then;if("function"==typeof c)return void c.call(a,(function(t){i(e,t);}),n)}r[e]=a,0==--o&&t(r);}catch(e){n(e);}}for(var a=0;a<r.length;a++)i(a,r[a]);}))},vo.allSettled=fo,vo.resolve=function(e){return e&&"object"==typeof e&&e.constructor===vo?e:new vo((function(t){t(e);}))},vo.reject=function(e){return new vo((function(t,n){n(e);}))},vo.race=function(e){return new vo((function(t,n){if(!ho(e))return n(new TypeError("Promise.race accepts an array"));for(var r=0,o=e.length;r<o;r++)vo.resolve(e[r]).then(t,n);}))},vo._immediateFn="function"==typeof setImmediate&&function(e){setImmediate(e);}||function(e){po(e,0);},vo._unhandledRejectionFn=function(e){"undefined"!=typeof console&&console&&console.warn("Possible Unhandled Promise Rejection:",e);};var ko=function(){if("undefined"!=typeof self)return self;if("undefined"!=typeof window)return window;if("undefined"!=typeof global)return global;throw new Error("unable to locate global object")}();"function"!=typeof ko.Promise?ko.Promise=vo:ko.Promise.prototype.finally?ko.Promise.allSettled||(ko.Promise.allSettled=fo):ko.Promise.prototype.finally=lo,function(e){function t(){}function n(e,t){if(e=void 0===e?"utf-8":e,t=void 0===t?{fatal:!1}:t,-1===o.indexOf(e.toLowerCase()))throw new RangeError("Failed to construct 'TextDecoder': The encoding label provided ('"+e+"') is invalid.");if(t.fatal)throw Error("Failed to construct 'TextDecoder': the 'fatal' option is unsupported.")}function r(e){for(var t=0,n=Math.min(65536,e.length+1),r=new Uint16Array(n),o=[],i=0;;){var a=t<e.length;if(!a||i>=n-1){if(o.push(String.fromCharCode.apply(null,r.subarray(0,i))),!a)return o.join("");e=e.subarray(t),i=t=0;}if(0==(128&(a=e[t++])))r[i++]=a;else if(192==(224&a)){var c=63&e[t++];r[i++]=(31&a)<<6|c;}else if(224==(240&a)){c=63&e[t++];var s=63&e[t++];r[i++]=(31&a)<<12|c<<6|s;}else if(240==(248&a)){65535<(a=(7&a)<<18|(c=63&e[t++])<<12|(s=63&e[t++])<<6|63&e[t++])&&(a-=65536,r[i++]=a>>>10&1023|55296,a=56320|1023&a),r[i++]=a;}}}if(e.TextEncoder&&e.TextDecoder)return !1;var o=["utf-8","utf8","unicode-1-1-utf-8"];Object.defineProperty(t.prototype,"encoding",{value:"utf-8"}),t.prototype.encode=function(e,t){if((t=void 0===t?{stream:!1}:t).stream)throw Error("Failed to encode: the 'stream' option is unsupported.");t=0;for(var n=e.length,r=0,o=Math.max(32,n+(n>>>1)+7),i=new Uint8Array(o>>>3<<3);t<n;){var a=e.charCodeAt(t++);if(55296<=a&&56319>=a){if(t<n){var c=e.charCodeAt(t);56320==(64512&c)&&(++t,a=((1023&a)<<10)+(1023&c)+65536);}if(55296<=a&&56319>=a)continue}if(r+4>i.length&&(o+=8,o=(o*=1+t/e.length*2)>>>3<<3,(c=new Uint8Array(o)).set(i),i=c),0==(4294967168&a))i[r++]=a;else {if(0==(4294965248&a))i[r++]=a>>>6&31|192;else if(0==(4294901760&a))i[r++]=a>>>12&15|224,i[r++]=a>>>6&63|128;else {if(0!=(4292870144&a))continue;i[r++]=a>>>18&7|240,i[r++]=a>>>12&63|128,i[r++]=a>>>6&63|128;}i[r++]=63&a|128;}}return i.slice?i.slice(0,r):i.subarray(0,r)},Object.defineProperty(n.prototype,"encoding",{value:"utf-8"}),Object.defineProperty(n.prototype,"fatal",{value:!1}),Object.defineProperty(n.prototype,"ignoreBOM",{value:!1});var i=r;"function"==typeof Buffer&&Buffer.from?i=function(e){return Buffer.from(e.buffer,e.byteOffset,e.byteLength).toString("utf-8")}:"function"==typeof Blob&&"function"==typeof URL&&"function"==typeof URL.createObjectURL&&(i=function(e){var t=URL.createObjectURL(new Blob([e],{type:"text/plain;charset=UTF-8"}));try{var n=new XMLHttpRequest;return n.open("GET",t,!1),n.send(),n.responseText}catch(t){return r(e)}finally{URL.revokeObjectURL(t);}}),n.prototype.decode=function(e,t){if((t=void 0===t?{stream:!1}:t).stream)throw Error("Failed to decode: the 'stream' option is unsupported.");return e=e instanceof Uint8Array?e:e.buffer instanceof ArrayBuffer?new Uint8Array(e.buffer):new Uint8Array(e),i(e)},e.TextEncoder=t,e.TextDecoder=n;}("undefined"!=typeof window?window:a),function(){function e(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function t(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r);}}function n(e,n,r){return n&&t(e.prototype,n),r&&t(e,r),e}function r(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&i(e,t);}function o(e){return (o=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}function i(e,t){return (i=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,t)}function c(){if("undefined"==typeof Reflect||!Reflect.construct)return !1;if(Reflect.construct.sham)return !1;if("function"==typeof Proxy)return !0;try{return Date.prototype.toString.call(Reflect.construct(Date,[],(function(){}))),!0}catch(e){return !1}}function s(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}function u(e,t){return !t||"object"!=typeof t&&"function"!=typeof t?s(e):t}function l(e){var t=c();return function(){var n,r=o(e);if(t){var i=o(this).constructor;n=Reflect.construct(r,arguments,i);}else n=r.apply(this,arguments);return u(this,n)}}function f(e,t){for(;!Object.prototype.hasOwnProperty.call(e,t)&&null!==(e=o(e)););return e}function d(e,t,n){return (d="undefined"!=typeof Reflect&&Reflect.get?Reflect.get:function(e,t,n){var r=f(e,t);if(r){var o=Object.getOwnPropertyDescriptor(r,t);return o.get?o.get.call(n):o.value}})(e,t,n||e)}var p=function(){function t(){e(this,t),Object.defineProperty(this,"listeners",{value:{},writable:!0,configurable:!0});}return n(t,[{key:"addEventListener",value:function(e,t,n){e in this.listeners||(this.listeners[e]=[]),this.listeners[e].push({callback:t,options:n});}},{key:"removeEventListener",value:function(e,t){if(e in this.listeners)for(var n=this.listeners[e],r=0,o=n.length;r<o;r++)if(n[r].callback===t)return void n.splice(r,1)}},{key:"dispatchEvent",value:function(e){if(e.type in this.listeners){for(var t=this.listeners[e.type].slice(),n=0,r=t.length;n<r;n++){var o=t[n];try{o.callback.call(this,e);}catch(e){Promise.resolve().then((function(){throw e}));}o.options&&o.options.once&&this.removeEventListener(e.type,o.callback);}return !e.defaultPrevented}}}]),t}(),h=function(t){r(a,t);var i=l(a);function a(){var t;return e(this,a),(t=i.call(this)).listeners||p.call(s(t)),Object.defineProperty(s(t),"aborted",{value:!1,writable:!0,configurable:!0}),Object.defineProperty(s(t),"onabort",{value:null,writable:!0,configurable:!0}),t}return n(a,[{key:"toString",value:function(){return "[object AbortSignal]"}},{key:"dispatchEvent",value:function(e){"abort"===e.type&&(this.aborted=!0,"function"==typeof this.onabort&&this.onabort.call(this,e)),d(o(a.prototype),"dispatchEvent",this).call(this,e);}}]),a}(p),y=function(){function t(){e(this,t),Object.defineProperty(this,"signal",{value:new h,writable:!0,configurable:!0});}return n(t,[{key:"abort",value:function(){var e;try{e=new Event("abort");}catch(t){"undefined"!=typeof document?document.createEvent?(e=document.createEvent("Event")).initEvent("abort",!1,!1):(e=document.createEventObject()).type="abort":e={type:"abort",bubbles:!1,cancelable:!1};}this.signal.dispatchEvent(e);}},{key:"toString",value:function(){return "[object AbortController]"}}]),t}();function v(e){return e.__FORCE_INSTALL_ABORTCONTROLLER_POLYFILL?(console.log("__FORCE_INSTALL_ABORTCONTROLLER_POLYFILL=true is set, will force install polyfill"),!0):"function"==typeof e.Request&&!e.Request.prototype.hasOwnProperty("signal")||!e.AbortController}"undefined"!=typeof Symbol&&Symbol.toStringTag&&(y.prototype[Symbol.toStringTag]="AbortController",h.prototype[Symbol.toStringTag]="AbortSignal"),function(e){v(e)&&(e.AbortController=y,e.AbortSignal=h);}("undefined"!=typeof self?self:a);}();var Io=s((function(e,t){Object.defineProperty(t,"__esModule",{value:!0});var n=function(){function e(){var e=this;this.locked=new Map,this.addToLocked=function(t,n){var r=e.locked.get(t);void 0===r?void 0===n?e.locked.set(t,[]):e.locked.set(t,[n]):void 0!==n&&(r.unshift(n),e.locked.set(t,r));},this.isLocked=function(t){return e.locked.has(t)},this.lock=function(t){return new Promise((function(n,r){e.isLocked(t)?e.addToLocked(t,n):(e.addToLocked(t),n());}))},this.unlock=function(t){var n=e.locked.get(t);if(void 0!==n&&0!==n.length){var r=n.pop();e.locked.set(t,n),void 0!==r&&setTimeout(r,0);}else e.locked.delete(t);};}return e.getInstance=function(){return void 0===e.instance&&(e.instance=new e),e.instance},e}();t.default=function(){return n.getInstance()};}));c(Io);var To=c(s((function(e,t){var n=a&&a.__awaiter||function(e,t,n,r){return new(n||(n=Promise))((function(o,i){function a(e){try{s(r.next(e));}catch(e){i(e);}}function c(e){try{s(r.throw(e));}catch(e){i(e);}}function s(e){e.done?o(e.value):new n((function(t){t(e.value);})).then(a,c);}s((r=r.apply(e,t||[])).next());}))},r=a&&a.__generator||function(e,t){var n,r,o,i,a={label:0,sent:function(){if(1&o[0])throw o[1];return o[1]},trys:[],ops:[]};return i={next:c(0),throw:c(1),return:c(2)},"function"==typeof Symbol&&(i[Symbol.iterator]=function(){return this}),i;function c(i){return function(c){return function(i){if(n)throw new TypeError("Generator is already executing.");for(;a;)try{if(n=1,r&&(o=2&i[0]?r.return:i[0]?r.throw||((o=r.return)&&o.call(r),0):r.next)&&!(o=o.call(r,i[1])).done)return o;switch(r=0,o&&(i=[2&i[0],o.value]),i[0]){case 0:case 1:o=i;break;case 4:return a.label++,{value:i[1],done:!1};case 5:a.label++,r=i[1],i=[0];continue;case 7:i=a.ops.pop(),a.trys.pop();continue;default:if(!(o=a.trys,(o=o.length>0&&o[o.length-1])||6!==i[0]&&2!==i[0])){a=0;continue}if(3===i[0]&&(!o||i[1]>o[0]&&i[1]<o[3])){a.label=i[1];break}if(6===i[0]&&a.label<o[1]){a.label=o[1],o=i;break}if(o&&a.label<o[2]){a.label=o[2],a.ops.push(i);break}o[2]&&a.ops.pop(),a.trys.pop();continue}i=t.call(e,a);}catch(e){i=[6,e],r=0;}finally{n=o=0;}if(5&i[0])throw i[1];return {value:i[0]?i[1]:void 0,done:!0}}([i,c])}}};Object.defineProperty(t,"__esModule",{value:!0});var o="browser-tabs-lock-key";function i(e){return new Promise((function(t){return setTimeout(t,e)}))}function c(e){for(var t="0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz",n="",r=0;r<e;r++){n+=t[Math.floor(Math.random()*t.length)];}return n}var s=function(){function e(){this.acquiredIatSet=new Set,this.id=Date.now().toString()+c(15),this.acquireLock=this.acquireLock.bind(this),this.releaseLock=this.releaseLock.bind(this),this.releaseLock__private__=this.releaseLock__private__.bind(this),this.waitForSomethingToChange=this.waitForSomethingToChange.bind(this),this.refreshLockWhileAcquired=this.refreshLockWhileAcquired.bind(this),void 0===e.waiters&&(e.waiters=[]);}return e.prototype.acquireLock=function(t,a){return void 0===a&&(a=5e3),n(this,void 0,void 0,(function(){var n,s,u,l,f,d;return r(this,(function(r){switch(r.label){case 0:n=Date.now()+c(4),s=Date.now()+a,u=o+"-"+t,l=window.localStorage,r.label=1;case 1:return Date.now()<s?[4,i(30)]:[3,8];case 2:return r.sent(),null!==l.getItem(u)?[3,5]:(f=this.id+"-"+t+"-"+n,[4,i(Math.floor(25*Math.random()))]);case 3:return r.sent(),l.setItem(u,JSON.stringify({id:this.id,iat:n,timeoutKey:f,timeAcquired:Date.now(),timeRefreshed:Date.now()})),[4,i(30)];case 4:return r.sent(),null!==(d=l.getItem(u))&&(d=JSON.parse(d)).id===this.id&&d.iat===n?(this.acquiredIatSet.add(n),this.refreshLockWhileAcquired(u,n),[2,!0]):[3,7];case 5:return e.lockCorrector(),[4,this.waitForSomethingToChange(s)];case 6:r.sent(),r.label=7;case 7:return n=Date.now()+c(4),[3,1];case 8:return [2,!1]}}))}))},e.prototype.refreshLockWhileAcquired=function(e,t){return n(this,void 0,void 0,(function(){var o=this;return r(this,(function(i){return setTimeout((function(){return n(o,void 0,void 0,(function(){var n,o;return r(this,(function(r){switch(r.label){case 0:return [4,Io.default().lock(t)];case 1:return r.sent(),this.acquiredIatSet.has(t)?(n=window.localStorage,null===(o=n.getItem(e))?(Io.default().unlock(t),[2]):((o=JSON.parse(o)).timeRefreshed=Date.now(),n.setItem(e,JSON.stringify(o)),Io.default().unlock(t),this.refreshLockWhileAcquired(e,t),[2])):(Io.default().unlock(t),[2])}}))}))}),1e3),[2]}))}))},e.prototype.waitForSomethingToChange=function(t){return n(this,void 0,void 0,(function(){return r(this,(function(n){switch(n.label){case 0:return [4,new Promise((function(n){var r=!1,o=Date.now(),i=!1;function a(){if(i||(window.removeEventListener("storage",a),e.removeFromWaiting(a),clearTimeout(c),i=!0),!r){r=!0;var t=50-(Date.now()-o);t>0?setTimeout(n,t):n();}}window.addEventListener("storage",a),e.addToWaiting(a);var c=setTimeout(a,Math.max(0,t-Date.now()));}))];case 1:return n.sent(),[2]}}))}))},e.addToWaiting=function(t){this.removeFromWaiting(t),void 0!==e.waiters&&e.waiters.push(t);},e.removeFromWaiting=function(t){void 0!==e.waiters&&(e.waiters=e.waiters.filter((function(e){return e!==t})));},e.notifyWaiters=function(){void 0!==e.waiters&&e.waiters.slice().forEach((function(e){return e()}));},e.prototype.releaseLock=function(e){return n(this,void 0,void 0,(function(){return r(this,(function(t){switch(t.label){case 0:return [4,this.releaseLock__private__(e)];case 1:return [2,t.sent()]}}))}))},e.prototype.releaseLock__private__=function(t){return n(this,void 0,void 0,(function(){var n,i,a;return r(this,(function(r){switch(r.label){case 0:return n=window.localStorage,i=o+"-"+t,null===(a=n.getItem(i))?[2]:(a=JSON.parse(a)).id!==this.id?[3,2]:[4,Io.default().lock(a.iat)];case 1:r.sent(),this.acquiredIatSet.delete(a.iat),n.removeItem(i),Io.default().unlock(a.iat),e.notifyWaiters(),r.label=2;case 2:return [2]}}))}))},e.lockCorrector=function(){for(var t=Date.now()-5e3,n=window.localStorage,r=Object.keys(n),i=!1,a=0;a<r.length;a++){var c=r[a];if(c.includes(o)){var s=n.getItem(c);null!==s&&(void 0===(s=JSON.parse(s)).timeRefreshed&&s.timeAcquired<t||void 0!==s.timeRefreshed&&s.timeRefreshed<t)&&(n.removeItem(c),i=!0);}}i&&e.notifyWaiters();},e.waiters=void 0,e}();t.default=s;}))),Oo={timeoutInSeconds:60},Eo=["login_required","consent_required","interaction_required","account_selection_required","access_denied"],xo={name:"auth0-spa-js",version:"1.15.0"},Ro=function(e){function n(t,r){var o=e.call(this,r)||this;return o.error=t,o.error_description=r,Object.setPrototypeOf(o,n.prototype),o}return t(n,e),n.fromPayload=function(e){return new n(e.error,e.error_description)},n}(Error),Lo=function(e){function n(t,r,o,i){void 0===i&&(i=null);var a=e.call(this,t,r)||this;return a.state=o,a.appState=i,Object.setPrototypeOf(a,n.prototype),a}return t(n,e),n}(Ro),Co=function(e){function n(){var t=e.call(this,"timeout","Timeout")||this;return Object.setPrototypeOf(t,n.prototype),t}return t(n,e),n}(Ro),jo=function(e){function n(t){var r=e.call(this)||this;return r.popup=t,Object.setPrototypeOf(r,n.prototype),r}return t(n,e),n}(Co),Uo=function(e){function n(t){var r=e.call(this,"cancelled","Popup closed")||this;return r.popup=t,Object.setPrototypeOf(r,n.prototype),r}return t(n,e),n}(Ro),Ao=function(e){return new Promise((function(t,n){var r,o=setInterval((function(){e.popup&&e.popup.closed&&(clearInterval(o),clearTimeout(i),window.removeEventListener("message",r,!1),n(new Uo(e.popup)));}),1e3),i=setTimeout((function(){clearInterval(o),n(new jo(e.popup)),window.removeEventListener("message",r,!1);}),1e3*(e.timeoutInSeconds||60));r=function(a){if(a.data&&"authorization_response"===a.data.type){if(clearTimeout(i),clearInterval(o),window.removeEventListener("message",r,!1),e.popup.close(),a.data.response.error)return n(Ro.fromPayload(a.data.response));t(a.data.response);}},window.addEventListener("message",r);}))},Po=function(){return window.crypto||window.msCrypto},Fo=function(){var e=Po();return e.subtle||e.webkitSubtle},Ko=function(){var e="0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_~.",t="";return Array.from(Po().getRandomValues(new Uint8Array(43))).forEach((function(n){return t+=e[n%e.length]})),t},Wo=function(e){return btoa(e)},zo=function(e){return Object.keys(e).filter((function(t){return void 0!==e[t]})).map((function(t){return encodeURIComponent(t)+"="+encodeURIComponent(e[t])})).join("&")},Vo=function(e){return o(void 0,void 0,void 0,(function(){var t;return i(this,(function(n){switch(n.label){case 0:return t=Fo().digest({name:"SHA-256"},(new TextEncoder).encode(e)),window.msCrypto?[2,new Promise((function(e,n){t.oncomplete=function(t){e(t.target.result);},t.onerror=function(e){n(e.error);},t.onabort=function(){n("The digest operation was aborted");};}))]:[4,t];case 1:return [2,n.sent()]}}))}))},Zo=function(e){return function(e){return decodeURIComponent(atob(e).split("").map((function(e){return "%"+("00"+e.charCodeAt(0).toString(16)).slice(-2)})).join(""))}(e.replace(/_/g,"/").replace(/-/g,"+"))},Xo=function(e){var t=new Uint8Array(e);return function(e){var t={"+":"-","/":"_","=":""};return e.replace(/[+/=]/g,(function(e){return t[e]}))}(window.btoa(String.fromCharCode.apply(String,Array.from(t))))};var No=function(e,t){return o(void 0,void 0,void 0,(function(){var n,r;return i(this,(function(o){switch(o.label){case 0:return [4,(i=e,a=t,a=a||{},new Promise((function(e,t){var n=new XMLHttpRequest,r=[],o=[],c={},s=function(){return {ok:2==(n.status/100|0),statusText:n.statusText,status:n.status,url:n.responseURL,text:function(){return Promise.resolve(n.responseText)},json:function(){return Promise.resolve(n.responseText).then(JSON.parse)},blob:function(){return Promise.resolve(new Blob([n.response]))},clone:s,headers:{keys:function(){return r},entries:function(){return o},get:function(e){return c[e.toLowerCase()]},has:function(e){return e.toLowerCase()in c}}}};for(var u in n.open(a.method||"get",i,!0),n.onload=function(){n.getAllResponseHeaders().replace(/^(.*?):[^\S\n]*([\s\S]*?)$/gm,(function(e,t,n){r.push(t=t.toLowerCase()),o.push([t,n]),c[t]=c[t]?c[t]+","+n:n;})),e(s());},n.onerror=t,n.withCredentials="include"==a.credentials,a.headers)n.setRequestHeader(u,a.headers[u]);n.send(a.body||null);})))];case 1:return n=o.sent(),r={ok:n.ok},[4,n.json()];case 2:return [2,(r.json=o.sent(),r)]}var i,a;}))}))},Go=function(e,t,n){return o(void 0,void 0,void 0,(function(){var r,o;return i(this,(function(i){return r=new AbortController,t.signal=r.signal,[2,Promise.race([No(e,t),new Promise((function(e,t){o=setTimeout((function(){r.abort(),t(new Error("Timeout when executing 'fetch'"));}),n);}))]).finally((function(){clearTimeout(o);}))]}))}))},Jo=function(e,t,n,r,a,c){return o(void 0,void 0,void 0,(function(){return i(this,(function(o){return [2,(i={auth:{audience:t,scope:n},timeout:a,fetchUrl:e,fetchOptions:r},s=c,new Promise((function(e,t){var n=new MessageChannel;n.port1.onmessage=function(n){n.data.error?t(new Error(n.data.error)):e(n.data);},s.postMessage(i,[n.port2]);})))];var i,s;}))}))},Do=function(e,t,n,r,a,c){return void 0===c&&(c=1e4),o(void 0,void 0,void 0,(function(){return i(this,(function(o){return a?[2,Jo(e,t,n,r,c,a)]:[2,Go(e,r,c)]}))}))};function Yo(e,t,n,a,c,s){return o(this,void 0,void 0,(function(){var o,u,l,f,d,p,h,y;return i(this,(function(i){switch(i.label){case 0:o=null,l=0,i.label=1;case 1:if(!(l<3))return [3,6];i.label=2;case 2:return i.trys.push([2,4,,5]),[4,Do(e,n,a,c,s,t)];case 3:return u=i.sent(),o=null,[3,6];case 4:return f=i.sent(),o=f,[3,5];case 5:return l++,[3,1];case 6:if(o)throw o.message=o.message||"Failed to fetch",o;if(d=u.json,p=d.error,h=d.error_description,y=r(d,["error","error_description"]),!u.ok)throw new Ro(p||"request_error",h||"HTTP error. Unable to fetch "+e);return [2,y]}}))}))}function Bo(e,t){var n=e.baseUrl,a=e.timeout,c=e.audience,s=e.scope,u=e.auth0Client,l=r(e,["baseUrl","timeout","audience","scope","auth0Client"]);return o(this,void 0,void 0,(function(){return i(this,(function(e){switch(e.label){case 0:return [4,Yo(n+"/oauth/token",a,c||"default",s,{method:"POST",body:JSON.stringify(l),headers:{"Content-type":"application/json","Auth0-Client":btoa(JSON.stringify(u||xo))}},t)];case 1:return [2,e.sent()]}}))}))}var Mo=function(e){return Array.from(new Set(e))},qo=function(){for(var e=[],t=0;t<arguments.length;t++)e[t]=arguments[t];return Mo(e.join(" ").trim().split(/\s+/)).join(" ")},Ho=function(){function e(e,t){void 0===t&&(t=Qo),this.prefix=t,this.client_id=e.client_id,this.scope=e.scope,this.audience=e.audience;}return e.prototype.toKey=function(){return this.prefix+"::"+this.client_id+"::"+this.audience+"::"+this.scope},e.fromKey=function(t){var n=t.split("::"),r=n[0],o=n[1],i=n[2];return new e({client_id:o,scope:n[3],audience:i},r)},e}(),Qo="@@auth0spajs@@",$o=function(e){var t=Math.floor(Date.now()/1e3)+e.expires_in;return {body:e,expiresAt:Math.min(t,e.decodedToken.claims.exp)}},ei=function(e,t){var n=e.client_id,r=e.audience,o=e.scope;return t.filter((function(e){var t=Ho.fromKey(e),i=t.prefix,a=t.client_id,c=t.audience,s=t.scope,u=s&&s.split(" "),l=s&&o.split(" ").reduce((function(e,t){return e&&u.includes(t)}),!0);return i===Qo&&a===n&&c===r&&l}))[0]},ti=function(){function e(){}return e.prototype.save=function(e){var t=new Ho({client_id:e.client_id,scope:e.scope,audience:e.audience}),n=$o(e);window.localStorage.setItem(t.toKey(),JSON.stringify(n));},e.prototype.get=function(e,t){void 0===t&&(t=0);var n=this.readJson(e),r=Math.floor(Date.now()/1e3);if(n){if(!(n.expiresAt-t<r))return n.body;if(n.body.refresh_token){var o=this.stripData(n);return this.writeJson(e.toKey(),o),o.body}localStorage.removeItem(e.toKey());}},e.prototype.clear=function(){for(var e=localStorage.length-1;e>=0;e--)localStorage.key(e).startsWith(Qo)&&localStorage.removeItem(localStorage.key(e));},e.prototype.readJson=function(e){var t,n=ei(e,Object.keys(window.localStorage)),r=n&&window.localStorage.getItem(n);if(r&&(t=JSON.parse(r)))return t},e.prototype.writeJson=function(e,t){localStorage.setItem(e,JSON.stringify(t));},e.prototype.stripData=function(e){return {body:{refresh_token:e.body.refresh_token},expiresAt:e.expiresAt}},e}(),ni=function(){var e;this.enclosedCache=(e={},{save:function(t){var n=new Ho({client_id:t.client_id,scope:t.scope,audience:t.audience}),r=$o(t);e[n.toKey()]=r;},get:function(t,n){void 0===n&&(n=0);var r=ei(t,Object.keys(e)),o=e[r],i=Math.floor(Date.now()/1e3);if(o)return o.expiresAt-n<i?o.body.refresh_token?(o.body={refresh_token:o.body.refresh_token},o.body):void delete e[t.toKey()]:o.body},clear:function(){e={};}});},ri=function(){function e(e){this.storage=e,this.transaction=this.storage.get("a0.spajs.txs");}return e.prototype.create=function(e){this.transaction=e,this.storage.save("a0.spajs.txs",e,{daysUntilExpire:1});},e.prototype.get=function(){return this.transaction},e.prototype.remove=function(){delete this.transaction,this.storage.remove("a0.spajs.txs");},e}(),oi=function(e){return "number"==typeof e},ii=["iss","aud","exp","nbf","iat","jti","azp","nonce","auth_time","at_hash","c_hash","acr","amr","sub_jwk","cnf","sip_from_tag","sip_date","sip_callid","sip_cseq_num","sip_via_branch","orig","dest","mky","events","toe","txn","rph","sid","vot","vtm"],ai=function(e){if(!e.id_token)throw new Error("ID token is required but missing");var t=function(e){var t=e.split("."),n=t[0],r=t[1],o=t[2];if(3!==t.length||!n||!r||!o)throw new Error("ID token could not be decoded");var i=JSON.parse(Zo(r)),a={__raw:e},c={};return Object.keys(i).forEach((function(e){a[e]=i[e],ii.includes(e)||(c[e]=i[e]);})),{encoded:{header:n,payload:r,signature:o},header:JSON.parse(Zo(n)),claims:a,user:c}}(e.id_token);if(!t.claims.iss)throw new Error("Issuer (iss) claim must be a string present in the ID token");if(t.claims.iss!==e.iss)throw new Error('Issuer (iss) claim mismatch in the ID token; expected "'+e.iss+'", found "'+t.claims.iss+'"');if(!t.user.sub)throw new Error("Subject (sub) claim must be a string present in the ID token");if("RS256"!==t.header.alg)throw new Error('Signature algorithm of "'+t.header.alg+'" is not supported. Expected the ID token to be signed with "RS256".');if(!t.claims.aud||"string"!=typeof t.claims.aud&&!Array.isArray(t.claims.aud))throw new Error("Audience (aud) claim must be a string or array of strings present in the ID token");if(Array.isArray(t.claims.aud)){if(!t.claims.aud.includes(e.aud))throw new Error('Audience (aud) claim mismatch in the ID token; expected "'+e.aud+'" but was not one of "'+t.claims.aud.join(", ")+'"');if(t.claims.aud.length>1){if(!t.claims.azp)throw new Error("Authorized Party (azp) claim must be a string present in the ID token when Audience (aud) claim has multiple values");if(t.claims.azp!==e.aud)throw new Error('Authorized Party (azp) claim mismatch in the ID token; expected "'+e.aud+'", found "'+t.claims.azp+'"')}}else if(t.claims.aud!==e.aud)throw new Error('Audience (aud) claim mismatch in the ID token; expected "'+e.aud+'" but found "'+t.claims.aud+'"');if(e.nonce){if(!t.claims.nonce)throw new Error("Nonce (nonce) claim must be a string present in the ID token");if(t.claims.nonce!==e.nonce)throw new Error('Nonce (nonce) claim mismatch in the ID token; expected "'+e.nonce+'", found "'+t.claims.nonce+'"')}if(e.max_age&&!oi(t.claims.auth_time))throw new Error("Authentication Time (auth_time) claim must be a number present in the ID token when Max Age (max_age) is specified");if(!oi(t.claims.exp))throw new Error("Expiration Time (exp) claim must be a number present in the ID token");if(!oi(t.claims.iat))throw new Error("Issued At (iat) claim must be a number present in the ID token");var n=e.leeway||60,r=new Date(Date.now()),o=new Date(0),i=new Date(0),a=new Date(0);if(a.setUTCSeconds(parseInt(t.claims.auth_time)+e.max_age+n),o.setUTCSeconds(t.claims.exp+n),i.setUTCSeconds(t.claims.nbf-n),r>o)throw new Error("Expiration Time (exp) claim error in the ID token; current time ("+r+") is after expiration time ("+o+")");if(oi(t.claims.nbf)&&r<i)throw new Error("Not Before time (nbf) claim in the ID token indicates that this token can't be used just yet. Currrent time ("+r+") is before "+i);if(oi(t.claims.auth_time)&&r>a)throw new Error("Authentication Time (auth_time) claim in the ID token indicates that too much time has passed since the last end-user authentication. Currrent time ("+r+") is after last auth at "+a);if(e.organizationId){if(!t.claims.org_id)throw new Error("Organization ID (org_id) claim must be a string present in the ID token");if(e.organizationId!==t.claims.org_id)throw new Error('Organization ID (org_id) claim mismatch in the ID token; expected "'+e.organizationId+'", found "'+t.claims.org_id+'"')}return t},ci=s((function(e,t){var n=a&&a.__assign||function(){return (n=Object.assign||function(e){for(var t,n=1,r=arguments.length;n<r;n++)for(var o in t=arguments[n])Object.prototype.hasOwnProperty.call(t,o)&&(e[o]=t[o]);return e}).apply(this,arguments)};function r(e,t){if(!t)return "";var n="; "+e;return !0===t?n:n+"="+t}function o(e,t,n){return encodeURIComponent(e).replace(/%(23|24|26|2B|5E|60|7C)/g,decodeURIComponent).replace(/\(/g,"%28").replace(/\)/g,"%29")+"="+encodeURIComponent(t).replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g,decodeURIComponent)+function(e){if("number"==typeof e.expires){var t=new Date;t.setMilliseconds(t.getMilliseconds()+864e5*e.expires),e.expires=t;}return r("Expires",e.expires?e.expires.toUTCString():"")+r("Domain",e.domain)+r("Path",e.path)+r("Secure",e.secure)+r("SameSite",e.sameSite)}(n)}function i(e){for(var t={},n=e?e.split("; "):[],r=/(%[\dA-F]{2})+/gi,o=0;o<n.length;o++){var i=n[o].split("="),a=i.slice(1).join("=");'"'===a.charAt(0)&&(a=a.slice(1,-1));try{t[i[0].replace(r,decodeURIComponent)]=a.replace(r,decodeURIComponent);}catch(e){}}return t}function c(){return i(document.cookie)}function s(e,t,r){document.cookie=o(e,t,n({path:"/"},r));}t.__esModule=!0,t.encode=o,t.parse=i,t.getAll=c,t.get=function(e){return c()[e]},t.set=s,t.remove=function(e,t){s(e,"",n(n({},t),{expires:-1}));};}));c(ci),ci.encode,ci.parse,ci.getAll;var si=ci.get,ui=ci.set,li=ci.remove,fi={get:function(e){var t=si(e);if(void 0!==t)return JSON.parse(t)},save:function(e,t,n){var r={};"https:"===window.location.protocol&&(r={secure:!0,sameSite:"none"}),r.expires=n.daysUntilExpire,ui(e,JSON.stringify(t),r);},remove:function(e){li(e);}},di={get:function(e){var t=fi.get(e);return t||fi.get("_legacy_"+e)},save:function(e,t,n){var r={};"https:"===window.location.protocol&&(r={secure:!0}),r.expires=n.daysUntilExpire,ui("_legacy_"+e,JSON.stringify(t),r),fi.save(e,t,n);},remove:function(e){fi.remove(e),fi.remove("_legacy_"+e);}},pi={get:function(e){if("undefined"!=typeof sessionStorage){var t=sessionStorage.getItem(e);if(void 0!==t)return JSON.parse(t)}},save:function(e,t){sessionStorage.setItem(e,JSON.stringify(t));},remove:function(e){sessionStorage.removeItem(e);}};function hi(e,t,n){var r=void 0===t?null:t,o=function(e,t){var n=atob(e);if(t){for(var r=new Uint8Array(n.length),o=0,i=n.length;o<i;++o)r[o]=n.charCodeAt(o);return String.fromCharCode.apply(null,new Uint16Array(r.buffer))}return n}(e,void 0!==n&&n),i=o.indexOf("\n",10)+1,a=o.substring(i)+(r?"//# sourceMappingURL="+r:""),c=new Blob([a],{type:"application/javascript"});return URL.createObjectURL(c)}var yi,vi,mi,gi,bi=(yi="Lyogcm9sbHVwLXBsdWdpbi13ZWItd29ya2VyLWxvYWRlciAqLwohZnVuY3Rpb24oKXsidXNlIHN0cmljdCI7Ci8qISAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKgogICAgQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uCgogICAgUGVybWlzc2lvbiB0byB1c2UsIGNvcHksIG1vZGlmeSwgYW5kL29yIGRpc3RyaWJ1dGUgdGhpcyBzb2Z0d2FyZSBmb3IgYW55CiAgICBwdXJwb3NlIHdpdGggb3Igd2l0aG91dCBmZWUgaXMgaGVyZWJ5IGdyYW50ZWQuCgogICAgVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEICJBUyBJUyIgQU5EIFRIRSBBVVRIT1IgRElTQ0xBSU1TIEFMTCBXQVJSQU5USUVTIFdJVEgKICAgIFJFR0FSRCBUTyBUSElTIFNPRlRXQVJFIElOQ0xVRElORyBBTEwgSU1QTElFRCBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWQogICAgQU5EIEZJVE5FU1MuIElOIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1IgQkUgTElBQkxFIEZPUiBBTlkgU1BFQ0lBTCwgRElSRUNULAogICAgSU5ESVJFQ1QsIE9SIENPTlNFUVVFTlRJQUwgREFNQUdFUyBPUiBBTlkgREFNQUdFUyBXSEFUU09FVkVSIFJFU1VMVElORyBGUk9NCiAgICBMT1NTIE9GIFVTRSwgREFUQSBPUiBQUk9GSVRTLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgTkVHTElHRU5DRSBPUgogICAgT1RIRVIgVE9SVElPVVMgQUNUSU9OLCBBUklTSU5HIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFVTRSBPUgogICAgUEVSRk9STUFOQ0UgT0YgVEhJUyBTT0ZUV0FSRS4KICAgICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqICovdmFyIGU9ZnVuY3Rpb24oKXtyZXR1cm4oZT1PYmplY3QuYXNzaWdufHxmdW5jdGlvbihlKXtmb3IodmFyIHQscj0xLG49YXJndW1lbnRzLmxlbmd0aDtyPG47cisrKWZvcih2YXIgbyBpbiB0PWFyZ3VtZW50c1tyXSlPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwodCxvKSYmKGVbb109dFtvXSk7cmV0dXJuIGV9KS5hcHBseSh0aGlzLGFyZ3VtZW50cyl9O2Z1bmN0aW9uIHQoZSx0LHIsbil7cmV0dXJuIG5ldyhyfHwocj1Qcm9taXNlKSkoKGZ1bmN0aW9uKG8scyl7ZnVuY3Rpb24gYShlKXt0cnl7dShuLm5leHQoZSkpfWNhdGNoKGUpe3MoZSl9fWZ1bmN0aW9uIGkoZSl7dHJ5e3Uobi50aHJvdyhlKSl9Y2F0Y2goZSl7cyhlKX19ZnVuY3Rpb24gdShlKXt2YXIgdDtlLmRvbmU/byhlLnZhbHVlKToodD1lLnZhbHVlLHQgaW5zdGFuY2VvZiByP3Q6bmV3IHIoKGZ1bmN0aW9uKGUpe2UodCl9KSkpLnRoZW4oYSxpKX11KChuPW4uYXBwbHkoZSx0fHxbXSkpLm5leHQoKSl9KSl9ZnVuY3Rpb24gcihlLHQpe3ZhciByLG4sbyxzLGE9e2xhYmVsOjAsc2VudDpmdW5jdGlvbigpe2lmKDEmb1swXSl0aHJvdyBvWzFdO3JldHVybiBvWzFdfSx0cnlzOltdLG9wczpbXX07cmV0dXJuIHM9e25leHQ6aSgwKSx0aHJvdzppKDEpLHJldHVybjppKDIpfSwiZnVuY3Rpb24iPT10eXBlb2YgU3ltYm9sJiYoc1tTeW1ib2wuaXRlcmF0b3JdPWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXN9KSxzO2Z1bmN0aW9uIGkocyl7cmV0dXJuIGZ1bmN0aW9uKGkpe3JldHVybiBmdW5jdGlvbihzKXtpZihyKXRocm93IG5ldyBUeXBlRXJyb3IoIkdlbmVyYXRvciBpcyBhbHJlYWR5IGV4ZWN1dGluZy4iKTtmb3IoO2E7KXRyeXtpZihyPTEsbiYmKG89MiZzWzBdP24ucmV0dXJuOnNbMF0/bi50aHJvd3x8KChvPW4ucmV0dXJuKSYmby5jYWxsKG4pLDApOm4ubmV4dCkmJiEobz1vLmNhbGwobixzWzFdKSkuZG9uZSlyZXR1cm4gbztzd2l0Y2gobj0wLG8mJihzPVsyJnNbMF0sby52YWx1ZV0pLHNbMF0pe2Nhc2UgMDpjYXNlIDE6bz1zO2JyZWFrO2Nhc2UgNDpyZXR1cm4gYS5sYWJlbCsrLHt2YWx1ZTpzWzFdLGRvbmU6ITF9O2Nhc2UgNTphLmxhYmVsKyssbj1zWzFdLHM9WzBdO2NvbnRpbnVlO2Nhc2UgNzpzPWEub3BzLnBvcCgpLGEudHJ5cy5wb3AoKTtjb250aW51ZTtkZWZhdWx0OmlmKCEobz1hLnRyeXMsKG89by5sZW5ndGg+MCYmb1tvLmxlbmd0aC0xXSl8fDYhPT1zWzBdJiYyIT09c1swXSkpe2E9MDtjb250aW51ZX1pZigzPT09c1swXSYmKCFvfHxzWzFdPm9bMF0mJnNbMV08b1szXSkpe2EubGFiZWw9c1sxXTticmVha31pZig2PT09c1swXSYmYS5sYWJlbDxvWzFdKXthLmxhYmVsPW9bMV0sbz1zO2JyZWFrfWlmKG8mJmEubGFiZWw8b1syXSl7YS5sYWJlbD1vWzJdLGEub3BzLnB1c2gocyk7YnJlYWt9b1syXSYmYS5vcHMucG9wKCksYS50cnlzLnBvcCgpO2NvbnRpbnVlfXM9dC5jYWxsKGUsYSl9Y2F0Y2goZSl7cz1bNixlXSxuPTB9ZmluYWxseXtyPW89MH1pZig1JnNbMF0pdGhyb3cgc1sxXTtyZXR1cm57dmFsdWU6c1swXT9zWzFdOnZvaWQgMCxkb25lOiEwfX0oW3MsaV0pfX19dmFyIG49e30sbz1mdW5jdGlvbihlLHQpe3JldHVybiBlKyJ8Iit0fTthZGRFdmVudExpc3RlbmVyKCJtZXNzYWdlIiwoZnVuY3Rpb24ocyl7dmFyIGE9cy5kYXRhLGk9YS50aW1lb3V0LHU9YS5hdXRoLGM9YS5mZXRjaFVybCxmPWEuZmV0Y2hPcHRpb25zLGw9cy5wb3J0c1swXTtyZXR1cm4gdCh2b2lkIDAsdm9pZCAwLHZvaWQgMCwoZnVuY3Rpb24oKXt2YXIgdCxzLGEsaCxwLGIseSxkLHYsdztyZXR1cm4gcih0aGlzLChmdW5jdGlvbihyKXtzd2l0Y2goci5sYWJlbCl7Y2FzZSAwOmE9KHM9dXx8e30pLmF1ZGllbmNlLGg9cy5zY29wZSxyLmxhYmVsPTE7Y2FzZSAxOmlmKHIudHJ5cy5wdXNoKFsxLDcsLDhdKSwhKHA9SlNPTi5wYXJzZShmLmJvZHkpKS5yZWZyZXNoX3Rva2VuJiYicmVmcmVzaF90b2tlbiI9PT1wLmdyYW50X3R5cGUpe2lmKCEoYj1mdW5jdGlvbihlLHQpe3JldHVybiBuW28oZSx0KV19KGEsaCkpKXRocm93IG5ldyBFcnJvcigiVGhlIHdlYiB3b3JrZXIgaXMgbWlzc2luZyB0aGUgcmVmcmVzaCB0b2tlbiIpO2YuYm9keT1KU09OLnN0cmluZ2lmeShlKGUoe30scCkse3JlZnJlc2hfdG9rZW46Yn0pKX15PXZvaWQgMCwiZnVuY3Rpb24iPT10eXBlb2YgQWJvcnRDb250cm9sbGVyJiYoeT1uZXcgQWJvcnRDb250cm9sbGVyLGYuc2lnbmFsPXkuc2lnbmFsKSxkPXZvaWQgMCxyLmxhYmVsPTI7Y2FzZSAyOnJldHVybiByLnRyeXMucHVzaChbMiw0LCw1XSksWzQsUHJvbWlzZS5yYWNlKFsoZz1pLG5ldyBQcm9taXNlKChmdW5jdGlvbihlKXtyZXR1cm4gc2V0VGltZW91dChlLGcpfSkpKSxmZXRjaChjLGUoe30sZikpXSldO2Nhc2UgMzpyZXR1cm4gZD1yLnNlbnQoKSxbMyw1XTtjYXNlIDQ6cmV0dXJuIHY9ci5zZW50KCksbC5wb3N0TWVzc2FnZSh7ZXJyb3I6di5tZXNzYWdlfSksWzJdO2Nhc2UgNTpyZXR1cm4gZD9bNCxkLmpzb24oKV06KHkmJnkuYWJvcnQoKSxsLnBvc3RNZXNzYWdlKHtlcnJvcjoiVGltZW91dCB3aGVuIGV4ZWN1dGluZyAnZmV0Y2gnIn0pLFsyXSk7Y2FzZSA2OnJldHVybih0PXIuc2VudCgpKS5yZWZyZXNoX3Rva2VuPyhmdW5jdGlvbihlLHQscil7bltvKHQscildPWV9KHQucmVmcmVzaF90b2tlbixhLGgpLGRlbGV0ZSB0LnJlZnJlc2hfdG9rZW4pOmZ1bmN0aW9uKGUsdCl7ZGVsZXRlIG5bbyhlLHQpXX0oYSxoKSxsLnBvc3RNZXNzYWdlKHtvazpkLm9rLGpzb246dH0pLFszLDhdO2Nhc2UgNzpyZXR1cm4gdz1yLnNlbnQoKSxsLnBvc3RNZXNzYWdlKHtvazohMSxqc29uOntlcnJvcl9kZXNjcmlwdGlvbjp3Lm1lc3NhZ2V9fSksWzMsOF07Y2FzZSA4OnJldHVyblsyXX12YXIgZ30pKX0pKX0pKX0oKTsKCg==",vi=null,mi=!1,function(e){return gi=gi||hi(yi,vi,mi),new Worker(gi,e)}),wi={},Si=new To,_i={memory:function(){return (new ni).enclosedCache},localstorage:function(){return new ti}},ki=function(e){return _i[e]},Ii=function(){return !/Trident.*rv:11\.0/.test(navigator.userAgent)},Ti=function(){function e(e){var t,n;if(this.options=e,"undefined"!=typeof window&&function(){if(!Po())throw new Error("For security reasons, `window.crypto` is required to run `auth0-spa-js`.");if(void 0===Fo())throw new Error("\n      auth0-spa-js must run on a secure origin. See https://github.com/auth0/auth0-spa-js/blob/master/FAQ.md#why-do-i-get-auth0-spa-js-must-run-on-a-secure-origin for more information.\n    ")}(),this.cacheLocation=e.cacheLocation||"memory",this.cookieStorage=!1===e.legacySameSiteCookie?fi:di,this.sessionCheckExpiryDays=e.sessionCheckExpiryDays||1,!ki(this.cacheLocation))throw new Error('Invalid cache location "'+this.cacheLocation+'"');var o,i,a=e.useCookiesForTransactions?this.cookieStorage:pi;this.cache=ki(this.cacheLocation)(),this.scope=this.options.scope,this.transactionManager=new ri(a),this.domainUrl="https://"+this.options.domain,this.tokenIssuer=(o=this.options.issuer,i=this.domainUrl,o?o.startsWith("https://")?o:"https://"+o+"/":i+"/"),this.defaultScope=qo("openid",void 0!==(null===(n=null===(t=this.options)||void 0===t?void 0:t.advancedOptions)||void 0===n?void 0:n.defaultScope)?this.options.advancedOptions.defaultScope:"openid profile email"),this.options.useRefreshTokens&&(this.scope=qo(this.scope,"offline_access")),"undefined"!=typeof window&&window.Worker&&this.options.useRefreshTokens&&"memory"===this.cacheLocation&&Ii()&&(this.worker=new bi),this.customOptions=function(e){return e.advancedOptions,e.audience,e.auth0Client,e.authorizeTimeoutInSeconds,e.cacheLocation,e.client_id,e.domain,e.issuer,e.leeway,e.max_age,e.redirect_uri,e.scope,e.useRefreshTokens,r(e,["advancedOptions","audience","auth0Client","authorizeTimeoutInSeconds","cacheLocation","client_id","domain","issuer","leeway","max_age","redirect_uri","scope","useRefreshTokens"])}(e);}return e.prototype._url=function(e){var t=encodeURIComponent(btoa(JSON.stringify(this.options.auth0Client||xo)));return ""+this.domainUrl+e+"&auth0Client="+t},e.prototype._getParams=function(e,t,o,i,a){var c=this.options;c.domain,c.leeway,c.useRefreshTokens,c.useCookiesForTransactions,c.auth0Client,c.cacheLocation,c.advancedOptions;var s=r(c,["domain","leeway","useRefreshTokens","useCookiesForTransactions","auth0Client","cacheLocation","advancedOptions"]);return n(n(n({},s),e),{scope:qo(this.defaultScope,this.scope,e.scope),response_type:"code",response_mode:"query",state:t,nonce:o,redirect_uri:a||this.options.redirect_uri,code_challenge:i,code_challenge_method:"S256"})},e.prototype._authorizeUrl=function(e){return this._url("/authorize?"+zo(e))},e.prototype._verifyIdToken=function(e,t,n){return ai({iss:this.tokenIssuer,aud:this.options.client_id,id_token:e,nonce:t,organizationId:n,leeway:this.options.leeway,max_age:this._parseNumber(this.options.max_age)})},e.prototype._parseNumber=function(e){return "string"!=typeof e?e:parseInt(e,10)||void 0},e.prototype.buildAuthorizeUrl=function(e){return void 0===e&&(e={}),o(this,void 0,void 0,(function(){var t,o,a,c,s,u,l,f,d,p,h,y;return i(this,(function(i){switch(i.label){case 0:return t=e.redirect_uri,o=e.appState,a=r(e,["redirect_uri","appState"]),c=Wo(Ko()),s=Wo(Ko()),u=Ko(),[4,Vo(u)];case 1:return l=i.sent(),f=Xo(l),d=e.fragment?"#"+e.fragment:"",p=this._getParams(a,c,s,f,t),h=this._authorizeUrl(p),y=e.organization||this.options.organization,this.transactionManager.create(n({nonce:s,code_verifier:u,appState:o,scope:p.scope,audience:p.audience||"default",redirect_uri:p.redirect_uri},y&&{organizationId:y})),[2,h+d]}}))}))},e.prototype.loginWithPopup=function(e,t){return o(this,void 0,void 0,(function(){var o,a,c,s,u,l,f,d,p,h,y,v,m;return i(this,(function(i){switch(i.label){case 0:return e=e||{},(t=t||{}).popup||(t.popup=function(e){var t=window.screenX+(window.innerWidth-400)/2,n=window.screenY+(window.innerHeight-600)/2;return window.open(e,"auth0:authorize:popup","left="+t+",top="+n+",width=400,height=600,resizable,scrollbars=yes,status=1")}("")),o=r(e,[]),a=Wo(Ko()),c=Wo(Ko()),s=Ko(),[4,Vo(s)];case 1:return u=i.sent(),l=Xo(u),f=this._getParams(o,a,c,l,this.options.redirect_uri||window.location.origin),d=this._authorizeUrl(n(n({},f),{response_mode:"web_message"})),t.popup.location.href=d,[4,Ao(n(n({},t),{timeoutInSeconds:t.timeoutInSeconds||this.options.authorizeTimeoutInSeconds||60}))];case 2:if(p=i.sent(),a!==p.state)throw new Error("Invalid state");return [4,Bo({audience:f.audience,scope:f.scope,baseUrl:this.domainUrl,client_id:this.options.client_id,code_verifier:s,code:p.code,grant_type:"authorization_code",redirect_uri:f.redirect_uri,auth0Client:this.options.auth0Client},this.worker)];case 3:return h=i.sent(),y=e.organization||this.options.organization,v=this._verifyIdToken(h.id_token,c,y),m=n(n({},h),{decodedToken:v,scope:f.scope,audience:f.audience||"default",client_id:this.options.client_id}),this.cache.save(m),this.cookieStorage.save("auth0.is.authenticated",!0,{daysUntilExpire:this.sessionCheckExpiryDays}),[2]}}))}))},e.prototype.getUser=function(e){return void 0===e&&(e={}),o(this,void 0,void 0,(function(){var t,n,r;return i(this,(function(o){return t=e.audience||this.options.audience||"default",n=qo(this.defaultScope,this.scope,e.scope),[2,(r=this.cache.get(new Ho({client_id:this.options.client_id,audience:t,scope:n})))&&r.decodedToken&&r.decodedToken.user]}))}))},e.prototype.getIdTokenClaims=function(e){return void 0===e&&(e={}),o(this,void 0,void 0,(function(){var t,n,r;return i(this,(function(o){return t=e.audience||this.options.audience||"default",n=qo(this.defaultScope,this.scope,e.scope),[2,(r=this.cache.get(new Ho({client_id:this.options.client_id,audience:t,scope:n})))&&r.decodedToken&&r.decodedToken.claims]}))}))},e.prototype.loginWithRedirect=function(e){return void 0===e&&(e={}),o(this,void 0,void 0,(function(){var t,n,o;return i(this,(function(i){switch(i.label){case 0:return t=e.redirectMethod,n=r(e,["redirectMethod"]),[4,this.buildAuthorizeUrl(n)];case 1:return o=i.sent(),window.location[t||"assign"](o),[2]}}))}))},e.prototype.handleRedirectCallback=function(e){return void 0===e&&(e=window.location.href),o(this,void 0,void 0,(function(){var t,r,o,a,c,s,u,l,f,d,p;return i(this,(function(i){switch(i.label){case 0:if(0===(t=e.split("?").slice(1)).length)throw new Error("There are no query params available for parsing.");if(r=function(e){e.indexOf("#")>-1&&(e=e.substr(0,e.indexOf("#")));var t=e.split("&"),r={};return t.forEach((function(e){var t=e.split("="),n=t[0],o=t[1];r[n]=decodeURIComponent(o);})),n(n({},r),{expires_in:parseInt(r.expires_in)})}(t.join("")),o=r.state,a=r.code,c=r.error,s=r.error_description,!(u=this.transactionManager.get())||!u.code_verifier)throw new Error("Invalid state");if(this.transactionManager.remove(),c)throw new Lo(c,s,o,u.appState);return l={audience:u.audience,scope:u.scope,baseUrl:this.domainUrl,client_id:this.options.client_id,code_verifier:u.code_verifier,grant_type:"authorization_code",code:a,auth0Client:this.options.auth0Client},void 0!==u.redirect_uri&&(l.redirect_uri=u.redirect_uri),[4,Bo(l,this.worker)];case 1:return f=i.sent(),d=this._verifyIdToken(f.id_token,u.nonce,u.organizationId),p=n(n({},f),{decodedToken:d,audience:u.audience,scope:u.scope,client_id:this.options.client_id}),this.cache.save(p),this.cookieStorage.save("auth0.is.authenticated",!0,{daysUntilExpire:this.sessionCheckExpiryDays}),[2,{appState:u.appState}]}}))}))},e.prototype.checkSession=function(e){return o(this,void 0,void 0,(function(){var t;return i(this,(function(n){switch(n.label){case 0:if(!this.cookieStorage.get("auth0.is.authenticated"))return [2];n.label=1;case 1:return n.trys.push([1,3,,4]),[4,this.getTokenSilently(e)];case 2:return n.sent(),[3,4];case 3:if(t=n.sent(),!Eo.includes(t.error))throw t;return [3,4];case 4:return [2]}}))}))},e.prototype.getTokenSilently=function(e){return void 0===e&&(e={}),o(this,void 0,void 0,(function(){var t,o,a,c=this;return i(this,(function(i){return t=n(n({audience:this.options.audience,ignoreCache:!1},e),{scope:qo(this.defaultScope,this.scope,e.scope)}),o=t.ignoreCache,a=r(t,["ignoreCache"]),[2,(s=function(){return c._getTokenSilently(n({ignoreCache:o},a))},u=this.options.client_id+"::"+a.audience+"::"+a.scope,l=wi[u],l||(l=s().finally((function(){delete wi[u],l=null;})),wi[u]=l),l)];var s,u,l;}))}))},e.prototype._getTokenSilently=function(e){return void 0===e&&(e={}),o(this,void 0,void 0,(function(){var t,a,c,s,u,l,f=this;return i(this,(function(d){switch(d.label){case 0:return t=e.ignoreCache,a=r(e,["ignoreCache"]),c=function(){var e=f.cache.get(new Ho({scope:a.scope,audience:a.audience||"default",client_id:f.options.client_id}),60);return e&&e.access_token},!t&&(s=c())?[2,s]:[4,(p=function(){return Si.acquireLock("auth0.lock.getTokenSilently",5e3)},h=10,void 0===h&&(h=3),o(void 0,void 0,void 0,(function(){var e;return i(this,(function(t){switch(t.label){case 0:e=0,t.label=1;case 1:return e<h?[4,p()]:[3,4];case 2:if(t.sent())return [2,!0];t.label=3;case 3:return e++,[3,1];case 4:return [2,!1]}}))})))];case 1:if(!d.sent())return [3,10];d.label=2;case 2:return d.trys.push([2,,7,9]),!t&&(s=c())?[2,s]:this.options.useRefreshTokens?[4,this._getTokenUsingRefreshToken(a)]:[3,4];case 3:return l=d.sent(),[3,6];case 4:return [4,this._getTokenFromIFrame(a)];case 5:l=d.sent(),d.label=6;case 6:return u=l,this.cache.save(n({client_id:this.options.client_id},u)),this.cookieStorage.save("auth0.is.authenticated",!0,{daysUntilExpire:this.sessionCheckExpiryDays}),[2,u.access_token];case 7:return [4,Si.releaseLock("auth0.lock.getTokenSilently")];case 8:return d.sent(),[7];case 9:return [3,11];case 10:throw new Co;case 11:return [2]}var p,h;}))}))},e.prototype.getTokenWithPopup=function(e,t){return void 0===e&&(e={}),void 0===t&&(t={}),o(this,void 0,void 0,(function(){return i(this,(function(r){switch(r.label){case 0:return e.audience=e.audience||this.options.audience,e.scope=qo(this.defaultScope,this.scope,e.scope),t=n(n({},Oo),t),[4,this.loginWithPopup(e,t)];case 1:return r.sent(),[2,this.cache.get(new Ho({scope:e.scope,audience:e.audience||"default",client_id:this.options.client_id})).access_token]}}))}))},e.prototype.isAuthenticated=function(){return o(this,void 0,void 0,(function(){return i(this,(function(e){switch(e.label){case 0:return [4,this.getUser()];case 1:return [2,!!e.sent()]}}))}))},e.prototype.buildLogoutUrl=function(e){void 0===e&&(e={}),null!==e.client_id?e.client_id=e.client_id||this.options.client_id:delete e.client_id;var t=e.federated,n=r(e,["federated"]),o=t?"&federated":"";return this._url("/v2/logout?"+zo(n))+o},e.prototype.logout=function(e){void 0===e&&(e={});var t=e.localOnly,n=r(e,["localOnly"]);if(t&&n.federated)throw new Error("It is invalid to set both the `federated` and `localOnly` options to `true`");if(this.cache.clear(),this.cookieStorage.remove("auth0.is.authenticated"),!t){var o=this.buildLogoutUrl(n);window.location.assign(o);}},e.prototype._getTokenFromIFrame=function(e){return o(this,void 0,void 0,(function(){var t,o,a,c,s,u,l,f,d,p,h,y,v,m,g;return i(this,(function(i){switch(i.label){case 0:return t=Wo(Ko()),o=Wo(Ko()),a=Ko(),[4,Vo(a)];case 1:c=i.sent(),s=Xo(c),u=this._getParams(e,t,o,s,e.redirect_uri||this.options.redirect_uri||window.location.origin),l=this._authorizeUrl(n(n({},u),{prompt:"none",response_mode:"web_message"})),f=e.timeoutInSeconds||this.options.authorizeTimeoutInSeconds,i.label=2;case 2:return i.trys.push([2,5,,6]),[4,(b=l,w=this.domainUrl,S=f,void 0===S&&(S=60),new Promise((function(e,t){var n=window.document.createElement("iframe");n.setAttribute("width","0"),n.setAttribute("height","0"),n.style.display="none";var r,o=function(){window.document.body.contains(n)&&(window.document.body.removeChild(n),window.removeEventListener("message",r,!1));},i=setTimeout((function(){t(new Co),o();}),1e3*S);r=function(n){if(n.origin==w&&n.data&&"authorization_response"===n.data.type){var a=n.source;a&&a.close(),n.data.response.error?t(Ro.fromPayload(n.data.response)):e(n.data.response),clearTimeout(i),window.removeEventListener("message",r,!1),setTimeout(o,2e3);}},window.addEventListener("message",r,!1),window.document.body.appendChild(n),n.setAttribute("src",b);})))];case 3:if(d=i.sent(),t!==d.state)throw new Error("Invalid state");return p=e.scope,h=e.audience,e.redirect_uri,e.ignoreCache,e.timeoutInSeconds,y=r(e,["scope","audience","redirect_uri","ignoreCache","timeoutInSeconds"]),[4,Bo(n(n(n({},this.customOptions),y),{scope:p,audience:h,baseUrl:this.domainUrl,client_id:this.options.client_id,code_verifier:a,code:d.code,grant_type:"authorization_code",redirect_uri:u.redirect_uri,auth0Client:this.options.auth0Client}),this.worker)];case 4:return v=i.sent(),m=this._verifyIdToken(v.id_token,o),[2,n(n({},v),{decodedToken:m,scope:u.scope,audience:u.audience||"default"})];case 5:throw "login_required"===(g=i.sent()).error&&this.logout({localOnly:!0}),g;case 6:return [2]}var b,w,S;}))}))},e.prototype._getTokenUsingRefreshToken=function(e){return o(this,void 0,void 0,(function(){var t,o,a,c,s,u,l,f,d;return i(this,(function(i){switch(i.label){case 0:return e.scope=qo(this.defaultScope,this.options.scope,e.scope),(t=this.cache.get(new Ho({scope:e.scope,audience:e.audience||"default",client_id:this.options.client_id})))&&t.refresh_token||this.worker?[3,2]:[4,this._getTokenFromIFrame(e)];case 1:return [2,i.sent()];case 2:o=e.redirect_uri||this.options.redirect_uri||window.location.origin,c=e.scope,s=e.audience,e.ignoreCache,e.timeoutInSeconds,u=r(e,["scope","audience","ignoreCache","timeoutInSeconds"]),l="number"==typeof e.timeoutInSeconds?1e3*e.timeoutInSeconds:null,i.label=3;case 3:return i.trys.push([3,5,,8]),[4,Bo(n(n(n(n(n({},this.customOptions),u),{audience:s,scope:c,baseUrl:this.domainUrl,client_id:this.options.client_id,grant_type:"refresh_token",refresh_token:t&&t.refresh_token,redirect_uri:o}),l&&{timeout:l}),{auth0Client:this.options.auth0Client}),this.worker)];case 4:return a=i.sent(),[3,8];case 5:return "The web worker is missing the refresh token"===(f=i.sent()).message||f.message&&f.message.indexOf("invalid refresh token")>-1?[4,this._getTokenFromIFrame(e)]:[3,7];case 6:return [2,i.sent()];case 7:throw f;case 8:return d=this._verifyIdToken(a.id_token),[2,n(n({},a),{decodedToken:d,scope:e.scope,audience:e.audience||"default"})]}}))}))},e}();function Ei(e){return o(this,void 0,void 0,(function(){var t;return i(this,(function(n){switch(n.label){case 0:return [4,(t=new Ti(e)).checkSession()];case 1:return n.sent(),[2,t]}}))}))}

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
        auth0 = await Ei({
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

    /* src/components/Navigator.svelte generated by Svelte v3.38.2 */
    const file$1 = "src/components/Navigator.svelte";

    // (15:3) {:else}
    function create_else_block$1(ctx) {
    	let li;
    	let a;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			li = element$1("li");
    			a = element$1("a");
    			a.textContent = "Logga in";
    			attr_dev(a, "href", "/login");
    			attr_dev(a, "class", "svelte-1hkku9o");
    			add_location(a, file$1, 15, 8, 453);
    			add_location(li, file$1, 15, 4, 449);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, a);

    			if (!mounted) {
    				dispose = listen_dev(a, "click", /*click_handler_1*/ ctx[2], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop$1,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(15:3) {:else}",
    		ctx
    	});

    	return block;
    }

    // (13:3) {#if loggedIn}
    function create_if_block$1(ctx) {
    	let li;
    	let a;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			li = element$1("li");
    			a = element$1("a");
    			a.textContent = "Logga ut";
    			attr_dev(a, "href", "/login");
    			attr_dev(a, "class", "svelte-1hkku9o");
    			add_location(a, file$1, 13, 8, 373);
    			add_location(li, file$1, 13, 4, 369);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, a);

    			if (!mounted) {
    				dispose = listen_dev(a, "click", /*click_handler*/ ctx[1], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop$1,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(13:3) {#if loggedIn}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
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
    		if (/*loggedIn*/ ctx[0]) return create_if_block$1;
    		return create_else_block$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			nav = element$1("nav");
    			div = element$1("div");
    			ul0 = element$1("ul");
    			li0 = element$1("li");
    			a0 = element$1("a");
    			a0.textContent = "Hem";
    			t1 = space();
    			li1 = element$1("li");
    			a1 = element$1("a");
    			a1.textContent = "Ny budget";
    			t3 = space();
    			li2 = element$1("li");
    			a2 = element$1("a");
    			a2.textContent = "Ändra budget";
    			t5 = space();
    			ul1 = element$1("ul");
    			if_block.c();
    			attr_dev(a0, "href", "/");
    			attr_dev(a0, "class", "svelte-1hkku9o");
    			add_location(a0, file$1, 7, 7, 191);
    			add_location(li0, file$1, 7, 3, 187);
    			attr_dev(a1, "href", "/new");
    			attr_dev(a1, "class", "svelte-1hkku9o");
    			add_location(a1, file$1, 8, 7, 223);
    			add_location(li1, file$1, 8, 3, 219);
    			attr_dev(a2, "href", "/edit");
    			attr_dev(a2, "class", "svelte-1hkku9o");
    			add_location(a2, file$1, 9, 7, 264);
    			add_location(li2, file$1, 9, 3, 260);
    			attr_dev(ul0, "id", "nav-mobile");
    			attr_dev(ul0, "class", "left");
    			add_location(ul0, file$1, 6, 2, 150);
    			attr_dev(ul1, "id", "nav-mobile");
    			attr_dev(ul1, "class", "right");
    			add_location(ul1, file$1, 11, 2, 312);
    			attr_dev(div, "class", "nav-wrapper");
    			add_location(div, file$1, 5, 1, 122);
    			attr_dev(nav, "class", "indigo darken-3");
    			add_location(nav, file$1, 4, 0, 91);
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
    		i: noop$1,
    		o: noop$1,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(nav);
    			if_block.d();
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
    		init$1(this, options, instance$3, create_fragment$3, safe_not_equal$1, { loggedIn: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Navigator",
    			options,
    			id: create_fragment$3.name
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

    /* src/components/misc/NotLoggedIn.svelte generated by Svelte v3.38.2 */

    const file = "src/components/misc/NotLoggedIn.svelte";

    function create_fragment$2(ctx) {
    	let p;
    	let t0;
    	let a;
    	let t2;

    	const block = {
    		c: function create() {
    			p = element$1("p");
    			t0 = text$1("Logga in uppe till höger eller besök ");
    			a = element$1("a");
    			a.textContent = "den öppna versionen";
    			t2 = text$1(".");
    			attr_dev(a, "href", "https://budget.dasifor.xyz");
    			add_location(a, file, 4, 38, 77);
    			attr_dev(p, "class", "center svelte-1vbsoe2");
    			add_location(p, file, 3, 0, 20);
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
    		p: noop$1,
    		i: noop$1,
    		o: noop$1,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props) {
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
    		init$1(this, options, instance$2, create_fragment$2, safe_not_equal$1, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NotLoggedIn",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/components/misc/Login.svelte generated by Svelte v3.38.2 */

    function create_fragment$1(ctx) {
    	const block = {
    		c: noop$1,
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: noop$1,
    		p: noop$1,
    		i: noop$1,
    		o: noop$1,
    		d: noop$1
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

    function instance$1($$self, $$props, $$invalidate) {
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
    		init$1(this, options, instance$1, create_fragment$1, safe_not_equal$1, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Login",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.38.2 */

    // (38:0) {:else}
    function create_else_block(ctx) {
    	let notloggedin;
    	let current;
    	notloggedin = new NotLoggedIn({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(notloggedin.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component$1(notloggedin, target, anchor);
    			current = true;
    		},
    		p: noop$1,
    		i: function intro(local) {
    			if (current) return;
    			transition_in$1(notloggedin.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(notloggedin.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component$1(notloggedin, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(38:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (36:0) {#if loggedIn}
    function create_if_block(ctx) {
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
    				mount_component$1(switch_instance, target, anchor);
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
    						destroy_component$1(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in$1(switch_instance.$$.fragment, 1);
    					mount_component$1(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in$1(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component$1(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(36:0) {#if loggedIn}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
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

    	const if_block_creators = [create_if_block, create_else_block];
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
    			mount_component$1(navigator, target, anchor);
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

    				transition_in$1(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in$1(navigator.$$.fragment, local);
    			transition_in$1(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(navigator.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component$1(navigator, detaching);
    			if (detaching) detach_dev(t);
    			if_blocks[current_block_type_index].d(detaching);
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
    	let loggedIn;

    	isLoggedIn().then(isLoggedIn => {
    		$$invalidate(1, loggedIn = isLoggedIn);
    	});

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
    		isLoggedIn,
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
    		init$1(this, options, instance, create_fragment, safe_not_equal$1, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
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
