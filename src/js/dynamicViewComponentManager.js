/* global fluid, sjrk */

(function ($, fluid) {

    "use strict";

    fluid.defaults("sjrk.dynamicViewComponentManager.componentRegistry", {
        gradeNames: ["fluid.component"],
        members: {
            registeredComponents: {
                // key: component individual class
                // value: direct reference to the component
            }
        },
        events: {
            viewComponentRegisteredWithManager: null,
            viewComponentDeregisteredWithManager: null
        }
    });

    /* Registers a new view component with the dynamicViewComponentManager and
     * fires a given event upon successful completion
     * - "componentRegistry": the componentRegistry subcomponent
     * - "managedComponent": the new view component to register
     * - "completionEvent": the event to be fired upon successful completion
     */
    sjrk.dynamicViewComponentManager.componentRegistry.registerManagedViewComponent = function (componentRegistry, managedComponent, completionEvent) {
        var componentContainerIndividualClass = managedComponent.options.managedViewComponentRequiredConfig.containerIndividualClass;

        componentRegistry.registeredComponents[componentContainerIndividualClass] = managedComponent;

        completionEvent.fire(componentContainerIndividualClass);
    };

    /* De-registers a view component, specified by its CSS control selector, from the
     * dynamicViewComponentManager's managed view component registry
     * - "componentRegistry": the componentRegistry subcomponent
     * - "managedComponentIndividualClass": the CSS control class of the view component
     * - "completionEvent": the event to be fired upon successful completion
     */
    sjrk.dynamicViewComponentManager.componentRegistry.deregisterManagedViewComponent = function (componentRegistry, managedComponentIndividualClass, completionEvent) {

        fluid.remove_if(componentRegistry.registeredComponents, function (component, key) {
            return key === managedComponentIndividualClass;
        });

        completionEvent.fire();
    };

    fluid.defaults("sjrk.dynamicViewComponentManager.containerMarkupGenerator", {
        gradeNames: ["fluid.component"],
        // Match this to the managedViewComponents selector
        containerGlobalClass: "sjrk-dynamic-view-component",
        // Should use %guid in this
        containerIndividualClassTemplate: "sjrk-dynamic-view-component-%guid",
        containerMarkupTemplate: "<div class='%globalClass %individualClass'></div>",
        invokers: {
            getMarkup: {
                funcName: "sjrk.dynamicViewComponentManager.containerMarkupGenerator.getMarkup",
                args: ["{that}.options.containerGlobalClass", "{that}.options.containerIndividualClassTemplate", "{that}.options.containerMarkupTemplate", "{arguments}.0"]
            }
        }
    });

    /* Generates the HTML markup for the DOM element in which new view
     * components are held.
     * - "containerGlobalClass": a CSS selector which all of the view components will share
     * - "containerIndividualClassTemplate": a CSS selector unique to this particular view component
     * - "containerMarkupTemplate": a fluid.stringTemplate-style string using
     * containerGlobalClass and containerIndividualClass
     * - "guid": the guid associated with the view component
     */
    sjrk.dynamicViewComponentManager.containerMarkupGenerator.getMarkup = function (containerGlobalClass, containerIndividualClassTemplate, containerMarkupTemplate, guid) {

        var containerIndividualClass = fluid.stringTemplate(containerIndividualClassTemplate, {guid: guid});

        var markup = fluid.stringTemplate(containerMarkupTemplate, {
            globalClass: containerGlobalClass,
            individualClass: containerIndividualClass
        });

        return markup;
    };

    // used to create and keep track of dynamic view components
    fluid.defaults("sjrk.dynamicViewComponentManager", {
        gradeNames: ["fluid.viewComponent"],
        selectors: {
            managedViewComponents: ".sjrk-dynamic-view-component"
        },
        events: {
            // single-argument event - requires a specified "type" for the
            // viewComponent
            viewComponentContainerRequested: null,
            viewComponentContainerAppended: null,
            viewComponentCreated: null,
            viewComponentDestroyed: null,
            viewComponentContainerRemoved: null,
        },
        components: {
            componentRegistry: {
                type: "sjrk.dynamicViewComponentManager.componentRegistry",
                options: {
                    listeners: {
                        "{dynamicViewComponentManager}.events.viewComponentCreated": {
                            func: "sjrk.dynamicViewComponentManager.componentRegistry.registerManagedViewComponent",
                            args: ["{that}", "{arguments}.0", "{dynamicViewComponentManager}.componentRegistry.events.viewComponentRegisteredWithManager"],
                            namespace: "registerManagedViewComponent"
                        },
                        "{dynamicViewComponentManager}.events.viewComponentContainerRemoved": {
                            func: "sjrk.dynamicViewComponentManager.componentRegistry.deregisterManagedViewComponent",
                            args: ["{that}", "{arguments}.0", "{dynamicViewComponentManager}.componentRegistry.events.viewComponentDeregisteredWithManager"],
                            namespace: "deregisterManagedViewComponent"
                        }
                    }
                }
            },
            containerMarkupGenerator: {
                type: "sjrk.dynamicViewComponentManager.containerMarkupGenerator",
            }
        },
        dynamicComponents: {
            managedViewComponents: {
                type: "{arguments}.3",
                container: "{arguments}.0",
                createOnEvent: "viewComponentContainerAppended",
                options: {
                    managedViewComponentRequiredConfig: {
                        containerSelector: "{arguments}.0",
                        containerIndividualClass: "{arguments}.1",
                        guid: "{arguments}.2",
                        type: "{arguments}.3"
                    },
                    // An endpoint for storing additional configuration
                    // options by an implementing grade
                    additionalConfiguration: "{arguments}.4",
                    listeners: {
                        "onCreate.notifyManager": {
                            func: "{dynamicViewComponentManager}.events.viewComponentCreated",
                            args: ["{that}"]
                        },
                        "onDestroy.notifyManager": {
                            func: "{dynamicViewComponentManager}.events.viewComponentDestroyed",
                            args: ["{that}.options.managedViewComponentRequiredConfig.containerSelector", "{that}.options.managedViewComponentRequiredConfig.containerIndividualClass"]
                        }
                    }
                }
            }
        },
        listeners: {
            "viewComponentContainerRequested.addComponentContainer": {
                "funcName": "sjrk.dynamicViewComponentManager.addComponentContainer",
                "args": ["{that}", "{that}.events.viewComponentContainerAppended", "{arguments}.0", "{arguments}.1"]
            },
            "viewComponentDestroyed.removeComponentContainer": {
                "funcName": "sjrk.dynamicViewComponentManager.removeComponentContainer",
                "args": ["{that}", "{arguments}.0", "{arguments}.1", "{that}.events.viewComponentContainerRemoved"]
            }
        }
    });

    /* Removes the DOM element which contains the view component specified by
     * the CSS control selector
     * - "that": the dynamicViewComponentManager itself
     * - "componentContainerSelector": the CSS selector of the DOM container
     * - "componentContainerIndividualClass": the CSS selector of the view component
     * - "completionEvent": the event to be fired upon successful completion
     */
    sjrk.dynamicViewComponentManager.removeComponentContainer = function (that, componentContainerSelector, componentContainerIndividualClass, completionEvent) {
        var removedComponentContainer = that.container.find(componentContainerSelector);

        removedComponentContainer.remove();

        completionEvent.fire(componentContainerIndividualClass);
    };

    /* Adds a DOM container element to hold a new view component.
     * Each new container is given a unique ID.
     * - "that": the dynamicViewComponentManager itself
     * - "completionEvent": the event to be fired upon successful completion
     * - "type": the fully-qualified grade name of the viewComponent
     * - "additionalConfiguration": used to specify additional configuration keys
     *    on the newly-created view component
     */
    sjrk.dynamicViewComponentManager.addComponentContainer = function (that, completionEvent, type, additionalConfiguration) {

        var guid = fluid.allocateGuid();

        var containerMarkup = that.containerMarkupGenerator.getMarkup(guid);

        var containerIndividualClass = fluid.stringTemplate(that.containerMarkupGenerator.options.containerIndividualClassTemplate, {guid: guid});

        var containerSelector = "." + containerIndividualClass;

        that.container.append(containerMarkup);

        completionEvent.fire(containerSelector, containerIndividualClass, guid, type, additionalConfiguration);
    };

})(jQuery, fluid);
