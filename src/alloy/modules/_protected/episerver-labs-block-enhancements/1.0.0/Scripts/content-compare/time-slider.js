define([
        "dojo/_base/declare",
        "dojo/on",
        "dojo/dom-geometry",
        "dojo/dom-class",
        "dijit/_CssStateMixin",
        "dijit/_Widget",
        "dijit/_TemplatedMixin",
        "dijit/_WidgetsInTemplateMixin",
        "dijit/layout/_LayoutWidget",
        "dojo/text!episerver-labs-block-enhancements/content-compare/time-slider.html",
        "xstyle/css!episerver-labs-block-enhancements/content-compare/time-slider.css"
    ],
    function (
        declare,
        on,
        domGeometry,
        domClass,
        _CssStateMixin,
        _Widget,
        _TemplatedMixin,
        _WidgetsInTemplateMixin,
        _LayoutWidget,
        template
    ) {
        var SliderPoint = declare([_Widget, _TemplatedMixin, _WidgetsInTemplateMixin, _CssStateMixin], {
            buildRendering: function () {
                this.inherited(arguments);
                this.set("position", this._position);
                this.set("bottom", this._top);
            },

            _setPositionAttr: function (value) {
                this._position = value || 0;
                if (this.domNode) {
                    this.domNode.style.left = this._position + "px";
                }
            },

            _setBottomAttr: function (value) {
                if (!value) {
                    return;
                }
                this._bottom = value;
                if (this.domNode) {
                    this.domNode.style.bottom = this._bottom + "px";
                }
            },

            _setValueAttr: function (value) {
                this._value = value;
            },

            _getValueAttr: function () {
                if (!this._value) {
                    return null;
                }
                return new Date(this._value.getTime());
            },

            _setMaxPositionAttr: function (value) {
                this._maxPosition = value;
            },

            addClass: function (value) {
                this.domNode.classList.add(value);
            }
        });

        var SliderHandle = declare([SliderPoint], {
            templateString: "<div class='slider-handle'></div>",

            buildRendering: function () {
                this.inherited(arguments);

                var that = this;

                this.own(on(this.domNode, "mousedown", function (e) {
                    e = e || window.event;
                    var start = 0, diff = 0;
                    if (e.pageX) start = e.pageX;
                    else if (e.clientX) start = e.clientX;

                    var updatedPosition;

                    function onMouseMove(e) {
                        console.log(that._position);
                        e = e || window.event;
                        var end = 0;
                        if (e.pageX) end = e.pageX;
                        else if (e.clientX) end = e.clientX;

                        diff = end - start;
                        var newPosition = that._position + diff;
                        if (newPosition < 0) {
                            newPosition = 0;
                        } else if (newPosition > (start + that._maxPosition)) {
                            newPosition = start + this._maxPosition;
                        }
                        updatedPosition = newPosition;
                        that.domNode.style.left = newPosition + "px";
                    }

                    function onMouseUp() {
                        if (typeof updatedPosition !== "undefined") {
                            that._position = updatedPosition;
                            that.onPositionChanged(updatedPosition);
                        }
                        document.body.removeEventListener("mousemove", onMouseMove);
                        document.body.removeEventListener("mouseup", onMouseUp);
                    }

                    document.body.addEventListener("mousemove", onMouseMove);
                    document.body.addEventListener("mouseup", onMouseUp);
                }));
            },

            // event
            onPositionChanged: function (position) {
            }
        });


        var SliderLabel = declare([SliderPoint], {
            templateString: "<div class='slider-label'></div>",

            _setColorStyleAttr: function (value) {
                this.domNode.style.backgroundColor = value;
            },

            _setIdAttr: function (value) {
                this._id = value;
            },

            _setTextAttr: function (value) {
                this.domNode.title = value;
            },

            _setGroupAttr: function (value) {
                this._group = value;
            },

            _setGroupIndexAttr: function (value) {
                this._groupIndex = value;
            },

            _setVisibleAttr: function (value) {
                this._visible = value;
                domClass.toggle(this.domNode, "dijitHidden", !value);
            }
        });

        return declare([_LayoutWidget, _TemplatedMixin, _WidgetsInTemplateMixin, _CssStateMixin], {
            _labels: null,

            templateString: template,

            buildRendering: function () {
                this.inherited(arguments);

                this._createHandles();

                this._labels = [];
            },

            _createHandles: function () {
                this.leftVersionHandle = new SliderHandle();
                this.leftVersionHandle.placeAt(this.handlesContainer);
                this.leftVersionHandle.addClass("left");
                this.leftVersionHandle.set("value", 0);
                this.own(on(this.leftVersionHandle, "positionChanged", function (position) {
                    var value = this._convertPositionToDate(position);
                    this.leftVersionHandle.set("value", value);
                    this.onLeftHandleChanged(value);
                }.bind(this)));

                this.rightVersionHandle = new SliderHandle();
                this.rightVersionHandle.placeAt(this.handlesContainer);
                this.rightVersionHandle.addClass("right");
                this.rightVersionHandle.set("value", 0);
                this.own(on(this.rightVersionHandle, "positionChanged", function (position) {
                    var value = this._convertPositionToDate(position);
                    this.rightVersionHandle.set("value", value);
                    this.onRightHandleChanged(value);
                }.bind(this)));
            },

            // event
            onLeftHandleChanged: function (date) {
            },

            // event
            onRightHandleChanged: function (date) {
            },


            // groups count
            _setGroupsCountAttr: function (value) {
                this._groupsCount = value;
            },

            // groupIndex - allows to vertically position label
            addLabel: function (id, group, text, value, type, color, groupIndex) {
                var sliderLabel = new SliderLabel();
                this._labels.push(sliderLabel);
                sliderLabel.placeAt(this.labelsContainer);

                sliderLabel.set("id", id);
                sliderLabel.set("group", group);
                sliderLabel.set("text", text + " (" + id + ")\n" + value);
                sliderLabel.set("colorStyle", color);
                sliderLabel.set("value", value);
                sliderLabel.set("groupIndex", groupIndex);
                sliderLabel.addClass(type);

                return sliderLabel;
            },

            clear: function () {
                this._labels.forEach(function (label) {
                    label.destroyRecursive(true);
                }.bind(this));
            },

            _convertDateToPoint: function (date) {
                if (date === 0) {
                    return 0;
                }

                // orignal values before transforming into scale
                var originalPoint = date.getTime();
                var originalMin = this._minDate.getTime();
                var originalMax = this._maxDate.getTime();

                var scaleMin = 0;
                var scaleMax = this._maxWidth;

                // rescale range
                var transofrmedPoint = ((originalPoint - originalMin) * (scaleMax - scaleMin)) / (originalMax - originalMin);

                transofrmedPoint += scaleMin;
                return Math.round(transofrmedPoint);
            },

            _convertPositionToDate: function (position) {
                if (position <= 0) {
                    return this._minDate;
                }

                if (position >= this._maxWidth) {
                    var maxDate = new Date(this._maxDate.getTime());
                    maxDate.setSeconds(this._maxDate.getSeconds() + 1);
                    return maxDate;
                }

                // orignal values before transforming into scale
                var originalMin = this._minDate.getTime();
                var originalMax = this._maxDate.getTime();

                var scaleMin = 0;
                var scaleMax = this._maxWidth;

                // rescale range
                var date = (position - scaleMin) / (scaleMax - scaleMin) * (originalMax - originalMin);
                date += Math.round(originalMin);

                var result = new Date(date);
                return result;
            },

            updateLeftHandleDate: function (value) {
                this.leftVersionHandle.set("value", value);
                this.leftVersionHandle.set("position", this._convertDateToPoint(this.leftVersionHandle._value));
            },

            updateRightHandleDate: function (value) {
                this.rightVersionHandle.set("value", value);
                this.rightVersionHandle.set("position", this._convertDateToPoint(this.rightVersionHandle._value));
            },

            _getLeftHandleValueAttr: function () {
                return this.leftVersionHandle.get("value");
            },

            _getRightHandleValueAttr: function () {
                return this.rightVersionHandle.get("value");
            },

            _setMinDateAttr: function (value) {
                this._minDate = value;
                this.leftVersionHandle.set("value", value);
            },

            _setMaxDateAttr: function (value) {
                this._maxDate = value;
                this.rightVersionHandle.set("value", value);
            },

            toggleGroupVisibility: function (group, isVisible) {
                this._labels.forEach(function (label) {
                    if (label._group !== group) {
                        return;
                    }
                    label.set("visible", isVisible);
                }, this);
            },

            layout: function () {
                var sliderScaleRectangle = domGeometry.getMarginBox(this.sliderScale);
                this._maxWidth = sliderScaleRectangle.w;
                this._maxHeight = sliderScaleRectangle.h;

                this.leftVersionHandle.set("maxPosition", this._maxWidth);
                this.leftVersionHandle.set("position", this._convertDateToPoint(this.leftVersionHandle._value));

                this.rightVersionHandle.set("maxPosition", this._maxWidth);
                this.rightVersionHandle.set("position", this._convertDateToPoint(this.rightVersionHandle._value));

                this._labels.forEach(function (label) {
                    label.set("maxPosition", this._maxWidth);
                    label.set("position", this._convertDateToPoint(label._value));
                    if (label._groupIndex && this._groupsCount) {
                        var offset = 20;
                        label.set("bottom", ((this._maxHeight - offset) * label._groupIndex / this._groupsCount) + offset);
                    }
                }, this);
            }
        });
    });
