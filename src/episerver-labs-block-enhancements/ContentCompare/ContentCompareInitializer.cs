using EPiServer.Framework;
using EPiServer.Framework.Initialization;
using EPiServer.ServiceLocation;
using EPiServer.Web;

namespace EPiServer.Labs.BlockEnhancements.ContentCompare
{
    [ModuleDependency(typeof(Web.InitializationModule))]
    public class ContentCompareInitializer : IConfigurableModule
    {
        public void ConfigureContainer(ServiceConfigurationContext context)
        {
            context.Services.Intercept<IContentAreaLoader>(
                (locator, defaultContentAreaLoader) => new ContentCompareContentAreaLoader(defaultContentAreaLoader));
        }
        public void Initialize(InitializationEngine context) { }
        public void Uninitialize(InitializationEngine context) { }
    }
}
