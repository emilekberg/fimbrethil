var fimbrethil = (function (exports) {
    'use strict';

    /**
     * Returns a subset of components per entity.
     * For instance if an archetype contains A,B,C,D and we query with components B,C
     * it should be true.
     */
    class Archetype {
        constructor(ctors) {
            this.entityComponentsHash = new Map();
            this.entities = [];
            this.components = {};
            this.hash = Archetype.calculateHash(ctors);
        }
        static calculateHash(components) {
            let hash = 0;
            for (let i = 0; i < components.length; i += 1) {
                // eslint-disable-next-line no-bitwise
                hash |= components[i].hash;
            }
            return hash;
        }
        static create(...components) {
            return {
                hash: this.calculateHash([...components]),
                constructors: components,
            };
        }
        get(id, value) {
            const entity = this.entityComponentsHash.get(id);
            let components = entity.get(value.hash);
            if (components !== undefined) {
                return components;
            }
            components = value.constructors.map((ctor) => this.components[id][ctor.hash]);
            entity.set(value.hash, components);
            return components;
        }
        getHash(id, hash) {
            return this.components[id][hash];
        }
        is(hash) {
            return this.hash === hash;
        }
        hasEntity(id) {
            return this.entityComponentsHash.has(id);
        }
        /**
         * Returns true if the hash bit masks match AND filter.
         * @param value the hash to validate against.
         */
        has(value) {
            // eslint-disable-next-line no-bitwise
            return this.hasHash(value.hash);
        }
        hasHash(hash) {
            return (hash & this.hash) === hash;
        }
        add(id, components) {
            if (this.hasEntity(id)) {
                throw new Error(`entity ${id} already registed in archtype`);
            }
            this.entities.push(id);
            this.entityComponentsHash.set(id, new Map());
            this.components[id] = components;
        }
        remove(id) {
            const index = this.entities.indexOf(id);
            if (index === -1) {
                return undefined;
            }
            // clear cache
            this.entityComponentsHash.delete(id);
            this.entities.splice(index, 1);
            const components = this.components[id];
            delete this.components[id];
            return components;
        }
    }

    class Component {
        constructor(entityId) {
            this.entityId = entityId;
        }
    }
    Component.hash = -1;

    let componentFactory = new Map();
    let bit = 1;
    function registerComponent(ctor) {
        // eslint-disable-next-line no-param-reassign
        ctor.hash = bit;
        bit *= 2;
        const Constructor = ctor;
        componentFactory.set(ctor.name, (id) => new Constructor(id));
    }
    function createComponent(componentName, id) {
        const ctor = componentFactory.get(componentName);
        if (!ctor) {
            throw new Error(`Component type ${componentName} not registered as a componetn! Cannot construct`);
        }
        const component = ctor(id);
        if (!component) {
            throw new Error(`error while creating component with name ${componentName}`);
        }
        return component;
    }

    class Children extends Component {
        constructor() {
            super(...arguments);
            this.children = {};
        }
    }
    registerComponent(Children);

    class Parent extends Component {
        constructor() {
            super(...arguments);
            this.entityId = -1;
        }
    }
    registerComponent(Parent);

    class Info extends Component {
        constructor() {
            super(...arguments);
            this.name = '';
        }
    }

    function GenericBuilder(getId, build) {
        const id = getId();
        const members = [];
        const opts = [];
        const children = {};
        const childBuilders = [];
        let childCounter = 0;
        const ret = {
            fromJson: (data) => {
                Object.keys(data).forEach((key) => {
                    members.push(key);
                    opts.push(data[key]);
                });
                return ret;
            },
            with: (data, options) => {
                members.push(data);
                opts.push(options);
                return ret;
            },
            withChild: (name, callback) => {
                const childBuilder = GenericBuilder(getId, build);
                childCounter += 1;
                childBuilder.with(Parent, {
                    entityId: id,
                });
                callback(childBuilder, id);
                children[name] = id + childCounter;
                childBuilders.push(childBuilder);
                return ret;
            },
            build: () => {
                if (childCounter > 0) {
                    ret.with(Children, {
                        children: children,
                    });
                }
                build(id, members, opts);
                childBuilders.forEach((b) => b.build());
                return id;
            },
        };
        return ret;
    }

    class World {
        constructor() {
            this.entities = new Set();
            this.entityArchetype = {};
            this.entityIdCounter = 0;
            this.systems = [];
            this.renderSystems = [];
            this.archetypes = [];
            this.onAddCallbacks = {};
            this.onRemoveCallbacks = {};
        }
        onComponentAdded(type, callback) {
            if (this.onAddCallbacks[type.hash] === undefined) {
                this.onAddCallbacks[type.hash] = [];
            }
            this.onAddCallbacks[type.hash].push(callback);
        }
        onComponentRemoved(type, callback) {
            if (this.onRemoveCallbacks[type.hash] === undefined) {
                this.onRemoveCallbacks[type.hash] = [];
            }
            this.onRemoveCallbacks[type.hash].push(callback);
        }
        add(systemFactory, options) {
            this.systems.push(systemFactory(this, options));
            return this;
        }
        addRenderer(systemFactory, options) {
            this.renderSystems.push(systemFactory(this, options));
            return this;
        }
        tick(timestep) {
            this.systems.forEach((system) => system(timestep));
        }
        render(deltaTime, interpolation) {
            this.renderSystems.forEach((system) => {
                system(deltaTime, interpolation);
            });
        }
        hasEntity(id) {
            return this.entities.has(id);
        }
        hasComponent(id, ctor) {
            const index = this.entityArchetype[id];
            if (index === undefined) {
                return false;
            }
            return this.archetypes[index].hasHash(ctor.hash);
        }
        getComponent(id, ctor) {
            const index = this.entityArchetype[id];
            if (index === undefined) {
                return undefined;
            }
            return this.archetypes[index].getHash(id, ctor.hash);
        }
        /**
         * Creates a new entity and returns a builder for it.
         * Once done, parses the component from the builder and adds to the correct archetype.
         */
        createEntity() {
            // eslint-disable-next-line no-plusplus
            const getId = () => ++this.entityIdCounter;
            return GenericBuilder(getId, (id, componentTypes, options) => {
                this.entities.add(id);
                // sort to make sure hashing is the same for different created components.
                const instances = {};
                const constructors = [];
                componentTypes.forEach((component, i) => {
                    const instance = this.addComponent(id, component, options[i], false);
                    const constructor = instance.constructor;
                    constructors.push(constructor);
                    instances[constructor.hash] = instance;
                });
                this.addEntityToArchetype(id, constructors, instances);
                Object.keys(instances).forEach((key) => {
                    this.callOnAdd(instances[key]);
                });
            });
        }
        removeEntity(id) {
            this.entities.delete(id);
            this.archetypes.forEach((archetype) => {
                archetype.remove(id);
            });
            delete this.entityArchetype[id];
        }
        callOnAdd(instance) {
            const hash = instance.constructor.hash;
            if (this.onAddCallbacks[hash]) {
                this.onAddCallbacks[hash].forEach((cb) => {
                    cb(instance);
                });
            }
        }
        addComponent(id, component, opts, parseArchetypes = true) {
            if (!this.entities.has(id)) {
                throw new Error(`entity with id ${id} is not created`);
            }
            const instance = this.getNewComponentInstance(component, id);
            Object.assign(instance, opts);
            if (parseArchetypes) {
                this.updateArchetype(id, instance);
                this.callOnAdd(instance);
            }
            return instance;
        }
        // eslint-disable-next-line class-methods-use-this
        getNewComponentInstance(component, id) {
            if (typeof component === 'string') {
                return createComponent(component, id);
            }
            const Constructor = component;
            return new Constructor(id);
        }
        removeComponent(id, component) {
            const components = this.removeEntityFromArchetype(id);
            if (!components) {
                return;
            }
            delete components[component.hash];
            const componentTypes = [
                ...Object.values(components),
            ].map((x) => x.constructor);
            this.addEntityToArchetype(id, componentTypes, components);
        }
        updateArchetype(id, component) {
            const components = this.removeEntityFromArchetype(id);
            if (!components) {
                return;
            }
            components[component.constructor.hash] = component;
            const componentTypes = [
                ...Object.values(components),
            ].map((x) => x.constructor);
            this.addEntityToArchetype(id, componentTypes, components);
        }
        addEntityToArchetype(id, componentTypes, components) {
            const hash = Archetype.calculateHash(componentTypes);
            let index = this.archetypes.findIndex((a) => a.is(hash));
            if (index === -1) {
                index = this.archetypes.push(new Archetype(componentTypes)) - 1;
            }
            this.entityArchetype[id] = index;
            this.archetypes[index].add(id, components);
        }
        removeEntityFromArchetype(id) {
            const index = this.archetypes.findIndex((a) => a.hasEntity(id));
            if (index === -1) {
                return undefined;
            }
            delete this.entityArchetype[id];
            return this.archetypes[index].remove(id);
        }
        query(cb, hash) {
            this.archetypes.forEach((archetype) => {
                if (!archetype.has(hash)) {
                    return;
                }
                archetype.entities.forEach((id) => {
                    const components = archetype.get(id, hash);
                    // eslint-disable-next-line
                    cb.apply(undefined, components);
                });
            });
        }
        fromEntityId(id, cb, hash) {
            const index = this.entityArchetype[id];
            if (index === undefined) {
                return;
            }
            const components = this.archetypes[index].get(id, hash);
            // eslint-disable-next-line
            cb.apply(undefined, components);
        }
    }

    exports.Archetype = Archetype;
    exports.Children = Children;
    exports.Component = Component;
    exports.GenericBuilder = GenericBuilder;
    exports.Info = Info;
    exports.Parent = Parent;
    exports.World = World;
    exports.createComponent = createComponent;
    exports.registerComponent = registerComponent;

    Object.defineProperty(exports, '__esModule', { value: true });

    return exports;

})({});
//# sourceMappingURL=index.js.map
