﻿using EPiServer.Core;
using EPiServer.ServiceLocation;
using EPiServer.Shell;

namespace EPiServer.Labs.BlockEnhancements.ContentCompare
{
    [ServiceConfiguration(typeof(EPiServer.Shell.ViewConfiguration))]
    public class ContentCompareViewConfiguration : ViewConfiguration<IContentData>
    {
        public ContentCompareViewConfiguration()
        {
            this.Key = "contentcompare";
            //this.ControllerType = "epi-cms/compare/views/CompareView";
            this.ControllerType = "episerver-labs-block-enhancements/content-compare/content-compare-view-controller";
            this.ViewType = "episerver-labs-block-enhancements/content-compare/compare-view";
            this.IconClass = "epi-iconCompare";
            this.HideFromViewMenu = true;
        }
    }
}
