define([
        "dojo/_base/declare",
        "dojo/on",
        "dijit/_CssStateMixin",
        "dijit/_Widget",
        "dijit/_TemplatedMixin",
        "dijit/_WidgetsInTemplateMixin",
        "epi-cms/core/ContentReference",
        "episerver-labs-block-enhancements/content-compare/label-color-resolver",
        "dojo/text!episerver-labs-block-enhancements/content-compare/version-selector-template.html",
        "epi/shell/widget/DateTimeSelectorDropDown",
        "episerver-labs-block-enhancements/content-compare/time-slider",
        "xstyle/css!episerver-labs-block-enhancements/content-compare/styles.css"
    ],
    function (
        declare,
        on,
        _CssStateMixin,
        _Widget,
        _TemplatedMixin,
        _WidgetsInTemplateMixin,
        ContentReference,
        labelColorResolver,
        template
    ) {

        return declare([_Widget, _TemplatedMixin, _WidgetsInTemplateMixin, _CssStateMixin], {
            region: "top",

            templateString: template,

            buildRendering: function () {
                this.inherited(arguments);

                this.own(this.fromDate.watch("value", function (property, oldValue, newValue) {
                    this.onFromDateChanged(newValue);
                }.bind(this)));

                this.own(this.toDate.watch("value", function (property, oldValue, newValue) {
                    this.onToDateChanged(newValue);
                }.bind(this)));

                this.own(on(this.timeSlider, "leftHandleChanged", function (date) {
                    this.onFromDateChanged(date);
                    //TODO: compare update from date datepicker
                }.bind(this)));

                this.own(on(this.timeSlider, "rightHandleChanged", function (date) {
                    this.onToDateChanged(date);
                    //TODO: compare update to date datepicker
                }.bind(this)));

            },

            // event
            onFromDateChanged: function (date) { },

            // event
            onToDateChanged: function (date) { },

            clear: function () {
                this.timeSlider.clear();
            },

            setContentVersions: function (versions) {
                versions.forEach(function (v) {
                    var group = new ContentReference(v.contentLink).id;
                    this.timeSlider.addLabel(v.contentLink, group, v.name, new Date(v.savedDate), "square", "#c0c0c0");
                }, this);
                this.timeSlider.layout();
            },

            setReferencedContents: function (contents) {
                // get all distinct contents
                var groups = [];
                contents.forEach(function (c) {
                    var group = new ContentReference(c.contentLink).id;
                    if (groups.indexOf(group) === -1) {
                        groups.push(group);
                    }
                });

                contents.forEach(function (c) {
                    var group = new ContentReference(c.contentLink).id;
                    var groupIndex = groups.indexOf(group);
                    var color = labelColorResolver(groupIndex);
                    this.timeSlider.addLabel(c.contentLink, group, c.name, new Date(c.savedDate), "circle", color);
                }, this);

                this.timeSlider.layout();
            },

            _setMinDateAttr: function (value) {
                this._minDate = value;
                this.timeSlider.set("minDate", value);
            },

            _setMaxDateAttr: function (value) {
                this._maxDate = value;
                this.timeSlider.set("maxDate", value);
            }
        });
    });


//TODO: compare Date pickers should have min and max dates

//TODO: compare bug after changing from handle, the handle is reset
