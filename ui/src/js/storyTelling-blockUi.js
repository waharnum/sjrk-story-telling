/*
Copyright 2018 OCAD University
Licensed under the New BSD license. You may not use this file except in compliance with this licence.
You may obtain a copy of the BSD License at
https://raw.githubusercontent.com/fluid-project/sjrk-story-telling/master/LICENSE.txt
*/

/* global fluid */

"use strict";

(function ($, fluid) {

    // the "base" grade for all interfaces which render/represent an individual
    // block, regardless of type.
    fluid.defaults("sjrk.storyTelling.blockUi", {
        gradeNames: ["fluid.viewComponent"],
        components: {
            // loads the localized messages and template for the block
            templateManager: {
                type: "sjrk.storyTelling.templateManager",
                container: "{blockUi}.container",
                options: {
                    model: {
                        dynamicValues: "{block}.model"
                    },
                    templateConfig: {
                        messagesPath: "%resourcePrefix/src/messages/storyBlockMessages.json"
                    }
                }
            },
            // the data, the block itself
            block: {
                type: "sjrk.storyTelling.block"
            }
        }
    });

})(jQuery, fluid);
