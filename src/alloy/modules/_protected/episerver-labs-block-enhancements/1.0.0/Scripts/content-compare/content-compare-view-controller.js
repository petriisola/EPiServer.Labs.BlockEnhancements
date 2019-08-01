define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/dom-class",
    "dojo/on",
    "dojo/topic",
    "dojo/when",
    "epi/dependency",
        "epi-cms/core/ContentReference",
    "epi-cms/compare/views/CompareView",
    "epi-cms/compare/CompareToolbar",
    "episerver-labs-block-enhancements/content-compare/version-selector",
        "episerver-labs-block-enhancements/content-compare/date-formatter"
    ],

    function (
        declare,
        lang,
        domClass,
        on,
        topic,
        when,
        dependency,
        ContentReference,
        CompareView,
        CompareToolbar,
        VersionSelector,
        dateFormatter
    ) {
        return declare([CompareView], {
            buildRendering: function () {
                this.inherited(arguments);

                this._comparestore = dependency.resolve("epi.storeregistry").get("episerver.labs.contentcompare");
                this._contentVersionStore = dependency.resolve("epi.storeregistry").get("epi.cms.contentversion");

                // hide compare mode toolbar and load custom version
                var toolbar = this.mainLayoutContainer.getChildren().filter(function (x) {
                    return x instanceof CompareToolbar;
                })[0];

                domClass.add(toolbar.domNode, "dijitHidden");

                this.versionSelector = new VersionSelector();
                this.mainLayoutContainer.addChild(this.versionSelector);
                this.own(this.versionSelector);

                this.compareModel._rightVersionUrlSetter = function (value) {
                    this.rightVersionUrl = value;

                    if (value && value !== "about:blank") {
                        this.rightVersionUrl = value + "&dasdasda=fsdfsdf";
                    }
                },

                    this.own(
                        on(this.versionSelector, "fromDateChanged", this._changeLeftVersionDate.bind(this)),
                        on(this.versionSelector, "toDateChanged", this._changeRightVersionDate.bind(this))
                    );

                /*
  TODO: compare When view is not contentcompare then hide time slider and don't load all versions
  topic.subscribe("/epi/shell/action/changeview", lang.hitch(this, "viewComponentChangeRequested")),
                      //"contentcompare"
  
                      //"/epi/shell/action/changeview/updatestate"*/
            },

            contentContextChanged: function (context, callerData, request) {
                //TODO: compare Language selector

                //TODO: compare Handle one version and no blocks

                var contentLink = new ContentReference(context.id).id;
                if (contentLink === this._lastId) {
                    return;
                }
                this._lastId = contentLink;

                this.versionSelector.clear();
                this._contentVersionStore.query({ contentLink: context.id, language: "en" }).then(function (versions) {

                    //TODO: compare Load all references

                    //TODO: compare Min an Max values for version selector
                    this._comparestore.executeMethod("GetAllReferencedContents", null,
                        { contentLink: context.id }).then(function (contents) {
                            // all content is used to get min and max version date
                            var allContents = contents.concat(versions).map(function (x) {
                                return new Date(x.savedDate).getTime();
                            });

                            var minDate = new Date(Math.min.apply(null, allContents));
                            var maxDate = new Date(Math.max.apply(null, allContents));

                            this.versionSelector.set("minDate", minDate);
                            this.versionSelector.set("maxDate", maxDate);

                            this.versionSelector.setContentVersions(versions);
                            this.versionSelector.setReferencedContents(contents);
                        }.bind(this));
                }.bind(this));
            },

            _changeLeftVersionDate: function (date) {
                var that = this;

                this._changeDate(date, function (contentVersion) {
                    var lastDateChanged = (!that.compareModel.fromDate && date) || that.compareModel.fromDate.getTime() !== date.getTime();
                    that.compareModel.fromDate = date;
                    var lastModelUri = that.compareModel.leftVersionUri;
                    that.compareModel.set("leftVersion", contentVersion);

                    // if the version didn't change, then 'watch' is not called and URL is not changed
                    if (lastDateChanged && lastModelUri === that.compareModel.leftVersionUri) {
                        topic.publish("/epi/shell/context/request", { uri: that.compareModel.leftVersionUri }, { sender: this });
                    }
                });
            },

            _changeRightVersionDate: function (date) {
                var that = this;

                this._changeDate(date, function (contentVersion) {
                    var lastDateChanged = (!that.compareModel.toDate && date) || that.compareModel.toDate.getTime() !== date.getTime();
                    that.compareModel.toDate = date;
                    if (lastDateChanged && contentVersion.contentLink === (that.compareModel.rightVersion || {}).contentLink) {
                        that.compareModel.set("rightVersion", null);
                    }
                    that.compareModel.set("rightVersion", contentVersion);
                });
            },

            _changeDate: function (date, afterVersionGetCallback) {
                //TODO: compare Lock dropdown until new version is loaded

                var that = this;

                when(that.getCurrentContent()).then(function (currentContent) {
                    if (!currentContent || !currentContent.contentLink) {
                        return;
                    }

                    // get content link to the version version by date
                    that._comparestore.executeMethod("GetContentVersionByDate", null,
                        { contentLink: currentContent.contentLink, date: date }).then(function (contentLink) {

                            // load content version
                            when(that._contentVersionStore.get(contentLink)).then(function (contentVersion) {
                                afterVersionGetCallback(contentVersion);
                            });
                        });
                });
            },

            _changeUrl: function (url, forceReload) {
                this._previewQueryParameters =
                    lang.mixin(this._previewQueryParameters, { maxContentDate: dateFormatter(this.compareModel.fromDate) });

                return this.inherited(arguments);
            },

            setView: function () {
                this.versionSelector.container.resize();
                return this.inherited(arguments);
            }
        });
    });
