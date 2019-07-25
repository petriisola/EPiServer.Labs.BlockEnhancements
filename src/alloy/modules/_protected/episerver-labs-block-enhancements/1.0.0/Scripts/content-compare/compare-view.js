define([
        "dojo/_base/declare",
        "epi-cms/compare/views/SideBySideCompareView",
        "episerver-labs-block-enhancements/content-compare/date-formatter"
    ],
    function (
        declare,
        SideBySideCompareView,
        dateFormatter
    ) {
        return declare([SideBySideCompareView], {
            _setRightVersionUrlAttr: function (url) {
                if (url) {
                    this._rightIframe.load(url + "&maxContentDate=" + dateFormatter(this.model.toDate));
                }
            }
        });
    });
