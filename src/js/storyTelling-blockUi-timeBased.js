/*
Copyright 2018 OCAD University
Licensed under the New BSD license. You may not use this file except in compliance with this licence.
You may obtain a copy of the BSD License at
https://raw.githubusercontent.com/fluid-project/sjrk-story-telling/master/LICENSE.txt
*/

/* global fluid, sjrk */

(function ($, fluid) {

    "use strict";

    // the grade for any blockUi that has time-based media
    fluid.defaults("sjrk.storyTelling.blockUi.timeBased", {
        gradeNames: ["sjrk.storyTelling.blockUi"],
        selectors: {
            mediaPlayer: ".sjrkc-st-block-media-preview"
        },
        events: {
            onTemplateReady: "{that}.templateManager.events.onTemplateRendered",
            onMediaPlayerStop: null,
            onMediaReady: null,
            onMediaDurationChange: null,
            onMediaPlay: null,
            onMediaEnded: null
        },
        invokers: {
            updateMediaPlayer: {
                "funcName": "sjrk.storyTelling.blockUi.timeBased.updateMediaPlayer",
                "args": ["{that}.dom.mediaPlayer", "{arguments}.0"]
            },
            stopMediaPlayer: {
                func: "{that}.events.onMediaPlayerStop.fire",
                args: ["{that}"]
            },
            playMediaPlayer: {
                "funcName": "sjrk.storyTelling.blockUi.timeBased.playMediaPlayer",
                "args": ["{that}.dom.mediaPlayer"]
            }
        },
        listeners: {
            "onTemplateReady.updateMediaPlayerUrl": {
                func: "{that}.updateMediaPlayer",
                args: ["{that}.block.model.mediaUrl"]
            },
            "onTemplateReady.bindOnMediaReady": {
                "this": "{that}.dom.mediaPlayer.0",
                method: "addEventListener",
                args: ["canplay", "{that}.events.onMediaReady.fire"]
            },
            "onTemplateReady.bindOnMediaDurationChange": {
                "this": "{that}.dom.mediaPlayer.0",
                method: "addEventListener",
                args: ["durationchange", "{that}.events.onMediaDurationChange.fire"]
            },
            "onTemplateReady.bindOnMediaEnded": {
                "this": "{that}.dom.mediaPlayer.0",
                method: "addEventListener",
                args: ["ended", "{that}.events.onMediaEnded.fire"]
            },
            "onTemplateReady.bindOnMediaPlay": {
                "this": "{that}.dom.mediaPlayer.0",
                method: "addEventListener",
                args: ["play", "{that}.events.onMediaPlay.fire"]
            },
            "onMediaPlayerStop.pauseMediaPlayer": {
                "this": "{that}.dom.mediaPlayer.0",
                method: "pause"
            },
            "onMediaPlayerStop.resetTime": {
                funcName: "sjrk.storyTelling.blockUi.timeBased.resetMediaPlayerTime",
                args: ["{that}.dom.mediaPlayer.0"],
                priority: "after:pauseMediaPlayer"
            }
        },
        block: {
            type: "sjrk.storyTelling.block.timeBased"
        }
    });

    // /* Attaches infusion component events to HTML audio/video events
    //  * - "component": the time-based block UI component
    //  * - "mediaPlayer": the jQueryable containing the HTML video or audio element
    //  */
    // sjrk.storyTelling.blockUi.timeBased.mediaReadinessListener = function (component, mediaPlayer) {
    //     // It is possible that the media has loaded before these handlers can be attached
    //     // therefore we check the current state of the player. If it's ready the event fires.
    //     if (mediaPlayer[0].readyState > 3) { // 3 === HAVE_CURRENT_DATA value
    //         component.events.onMediaReady.fire();
    //     }
    // };

    /* Updates the HTML preview of a media player associated with a given block.
     * If a media player was playing, it will be stopped before loading.
     * - "component": the time-based block UI component
     * - "mediaPlayer": the jQueryable containing the HTML video or audio element
     * - "mediaUrl": the URL of the media source file
     */
    sjrk.storyTelling.blockUi.timeBased.updateMediaPlayer = function (mediaPlayer, mediaUrl) {
        // TODO: This should be refactored. Probably we should have a selector registered
        // for the source element of the mediaPlayer.
        // Alternatively, we could go with something simpler based on directly using the
        // src attribute of the video element.
        var source = mediaPlayer.find("source");
        if (source.length < 1) {
            source = $("<source></source>").appendTo(mediaPlayer);
        }

        source.attr("src", mediaUrl);
        mediaPlayer[0].load();
    };

    /* Pauses and rewinds a given media player
     * If a media player was playing, it will be stopped before loading.
     * - "mediaPlayer": the jQueryable containing the HTML video or audio element
     */
    sjrk.storyTelling.blockUi.timeBased.resetMediaPlayerTime = function (mediaPlayer) {
        mediaPlayer.currentTime = 0;
    };

    /* Plays a given media player, though this will not work properly unless
     * triggered by user action, in accordance with the requirements laid out,
     * in the case of Chrome, here: https://goo.gl/xX8pDD
     * - "mediaPlayer": the jQueryable containing the HTML video or audio element
     */
    sjrk.storyTelling.blockUi.timeBased.playMediaPlayer = function (mediaPlayer) {
        var promise = mediaPlayer[0].play();

        if (promise) {
            promise.then(function () {
                console.log("playing!");
            }, function (error) {
                console.log("error:", error, "message:", error.message);
            });
        }
    };

})(jQuery, fluid);
