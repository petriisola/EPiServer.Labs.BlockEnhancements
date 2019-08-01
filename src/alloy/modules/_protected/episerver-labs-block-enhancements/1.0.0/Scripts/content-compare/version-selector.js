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
        "episerver-labs-block-enhancements/content-compare/content-filter",
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
        function compare(a, b) {
            a = a.name.toUpperCase();
            b = b.name.toUpperCase();

            if (a.last_nom < b.last_nom) {
                return -1;
            }
            if (a.last_nom > b.last_nom) {
                return 1;
            }
            return 0;
        }

        return declare([_Widget, _TemplatedMixin, _WidgetsInTemplateMixin, _CssStateMixin], {
            region: "top",

            templateString: template,

            buildRendering: function () {
                this.inherited(arguments);

                this.own(this.fromDate.watch("value", function (property, oldValue, newValue) {
                    this._updateFromDate(newValue, "dateTimePicker");
                }.bind(this)));

                this.own(this.toDate.watch("value", function (property, oldValue, newValue) {
                    this._updateToDate(newValue, "dateTimePicker");
                }.bind(this)));

                this.own(on(this.timeSlider, "leftHandleChanged", function (date) {
                    this._updateFromDate(date, "handle");
                }.bind(this)));

                this.own(on(this.timeSlider, "rightHandleChanged", function (date) {
                    this._updateToDate(date, "handle");
                }.bind(this)));

                this.own(on(this.contentFilter, "contentFilterChanged", function (contentLink, isSelected) {
                    this.timeSlider.toggleGroupVisibility(contentLink, isSelected);
                }.bind(this)));
            },

            _updateFromDate: function (value, trigger) {
                var lastDateChanged = (!this._lastFromDate && value) || this._lastFromDate.getTime() !== value.getTime();
                if (!lastDateChanged) {
                    return;
                }
                this._lastFromDate = value;
                if (trigger !== "handle") {
                    // dateTimePicker store only minutes and seconds, but handle contains also seconds and milliseconds
                    // to compare those dates we have to clear those values
                    var dateCopy = new Date(value.getTime());
                    dateCopy.setSeconds(0);
                    dateCopy.setMilliseconds(0);

                    var handleDate = this.timeSlider.get("leftHandleValue");
                    handleDate.setSeconds(0);
                    handleDate.setMilliseconds(0);
                    if (handleDate.getTime() !== dateCopy.getTime()) {
                        this.timeSlider.updateLeftHandleDate(value);
                        this.onFromDateChanged(value);
                    }
                }
                if (trigger !== "dateTimePicker") {
                    this.fromDate.set("value", value);
                    this.onFromDateChanged(value);
                }
            },

            _updateToDate: function (value, trigger) {
                var lastToDateChanged = (!this._lastToDate && value) || this._lastToDate.getTime() !== value.getTime();
                if (!lastToDateChanged) {
                    return;
                }
                this._lastToDate = value;

                if (trigger !== "handle") {
                    // dateTimePicker store only minutes and seconds, but handle contains also seconds and milliseconds
                    // to compare those dates we have to clear those values
                    var dateCopy = new Date(value.getTime());
                    dateCopy.setSeconds(0);
                    dateCopy.setMilliseconds(0);

                    var handleDate = this.timeSlider.get("rightHandleValue");
                    handleDate.setSeconds(0);
                    handleDate.setMilliseconds(0);
                    if (handleDate.getTime() !== dateCopy.getTime()) {
                        this.timeSlider.updateRightHandleDate(value);
                        this.onToDateChanged(value);
                    }
                }
                if (trigger !== "dateTimePicker") {
                    this.toDate.set("value", value);
                    this.onToDateChanged(value);
                }
            },

            // event
            onFromDateChanged: function (date) { },

            // event
            onToDateChanged: function (date) { },

            clear: function () {
                this.timeSlider.clear();
                this.contentFilter.clear();
            },

            setContentVersions: function (versions) {
                versions.forEach(function (v) {
                    var group = new ContentReference(v.contentLink).id;
                    this.timeSlider.addLabel(v.contentLink, group, v.name, new Date(v.savedDate), "square", "#c0c0c0", 0);
                }, this);
                this.timeSlider.layout();
            },

            setReferencedContents: function (contents) {
                // get all distinct contents
                var groups = [];
                var groupFilters = [];
                contents.forEach(function (c) {
                    var group = new ContentReference(c.contentLink).id;
                    if (groups.indexOf(group) === -1) {
                        var color = labelColorResolver(groups.length);
                        groupFilters.push({
                            id: group, name: c.name, color
                        });
                        groups.push(group);
                    }
                });

                groupFilters.sort(compare);
                groupFilters.forEach(function (g) {
                    this.contentFilter.addFilter(g.id, g.name, g.color);
                }, this);

                this.timeSlider.set("groupsCount", groups.length);

                contents.forEach(function (c) {
                    var group = new ContentReference(c.contentLink).id;
                    var groupIndex = groups.indexOf(group);
                    var color = labelColorResolver(groupIndex);
                    this.timeSlider.addLabel(c.contentLink, group, c.name, new Date(c.savedDate), "circle", color, groupIndex + 1);
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
